-- Tặng quà cộng đồng. Chạy trên Supabase SQL Editor (dự án đã có schema).

do $$ begin
  create type public.gift_status as enum ('open', 'claimed', 'completed', 'cancelled', 'hidden', 'deleted');
exception when duplicate_object then null; end $$;

create table if not exists public.gift_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order integer not null default 0
);

insert into public.gift_categories (slug, name, sort_order) values
  ('gia-dung', 'Đồ gia dụng', 1),
  ('dien-tu', 'Điện tử', 2),
  ('sach-vo', 'Sách / tài liệu', 3),
  ('quan-ao', 'Quần áo / phụ kiện', 4),
  ('tre-em', 'Đồ trẻ em', 5),
  ('noi-that', 'Nội thất nhỏ', 6),
  ('van-phong', 'Văn phòng phẩm', 7),
  ('khac-tang', 'Khác', 99)
on conflict (slug) do nothing;

create table if not exists public.gift_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid references public.gift_categories (id) on delete set null,
  title text not null,
  description text not null,
  extra_info text,
  area text,
  time_credit numeric(12,2) not null check (time_credit > 0),
  image_urls text[] not null default '{}',
  video_url text,
  status public.gift_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions
  add column if not exists gift_id uuid references public.gift_posts (id) on delete set null;

create index if not exists idx_gift_posts_status on public.gift_posts (status, created_at desc);
create index if not exists idx_gift_posts_user on public.gift_posts (user_id);
create index if not exists idx_tx_gift on public.transactions (gift_id);

drop trigger if exists trg_gift_updated on public.gift_posts;
create trigger trg_gift_updated before update on public.gift_posts
for each row execute function public.set_updated_at();

create or replace function public.request_gift(p_gift_id uuid, p_note text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.gift_posts;
  conv_id uuid;
  tx_id uuid;
  requester uuid := auth.uid();
begin
  if requester is null then raise exception 'UNAUTHENTICATED'; end if;
  if exists (select 1 from public.profiles where id = requester and is_banned) then
    raise exception 'BANNED';
  end if;

  select * into g from public.gift_posts where id = p_gift_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if g.status <> 'open' then raise exception 'GIFT_NOT_OPEN'; end if;
  if g.user_id = requester then raise exception 'CANNOT_REQUEST_SELF'; end if;

  if exists (
    select 1 from public.transactions
    where gift_id = p_gift_id and requester_id = requester
      and status in ('pending', 'accepted', 'in_progress')
  ) then
    raise exception 'ALREADY_REQUESTED';
  end if;

  if (select time_credit from public.profiles where id = requester) < g.time_credit then
    raise exception 'INSUFFICIENT_CREDIT';
  end if;

  insert into public.conversations default values returning id into conv_id;

  insert into public.transactions (
    gift_id, requester_id, helper_id, conversation_id, hours, amount, status
  ) values (
    g.id, requester, g.user_id, conv_id, 1, g.time_credit, 'pending'
  ) returning id into tx_id;

  perform public.notify(g.user_id, 'connection', 'Có người muốn nhận quà',
    coalesce(nullif(trim(p_note), ''), 'Một thành viên muốn nhận món đồ bạn đang tặng.'),
    '/tang-qua/' || g.id);
  perform public.notify(requester, 'connection', 'Đã gửi yêu cầu nhận quà',
    'Chờ người tặng xác nhận. Time Credit chỉ trừ khi hai bên hoàn tất.',
    '/giao-dich/' || tx_id);

  return tx_id;
end;
$$;

create or replace function public.helper_accept_transaction(p_tx uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tx public.transactions;
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
  select * into tx from public.transactions where id = p_tx for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if tx.helper_id <> auth.uid() then raise exception 'FORBIDDEN'; end if;
  if tx.status <> 'pending' then raise exception 'INVALID_STATUS'; end if;
  update public.transactions set status = 'accepted' where id = p_tx;

  if tx.gift_id is not null then
    update public.gift_posts set status = 'claimed' where id = tx.gift_id and status = 'open';
    update public.transactions
    set status = 'cancelled', cancelled_at = now()
    where gift_id = tx.gift_id
      and id <> p_tx
      and status = 'pending';
  end if;

  perform public.notify(tx.requester_id, 'transaction', 'Yêu cầu đã được nhận',
    'Đối phương đã đồng ý. Hãy chat để thống nhất nhận/giao.', '/giao-dich/' || p_tx);
end;
$$;

create or replace function public.cancel_transaction(p_tx uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tx public.transactions;
begin
  select * into tx from public.transactions where id = p_tx for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if auth.uid() not in (tx.requester_id, tx.helper_id) and not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;
  if tx.status in ('completed', 'cancelled') then raise exception 'INVALID_STATUS'; end if;

  update public.transactions
  set status = 'cancelled', cancelled_at = now()
  where id = p_tx;

  if tx.request_id is not null then
    update public.help_requests set status = 'open' where id = tx.request_id and status = 'matched';
  end if;

  if tx.gift_id is not null then
    if not exists (
      select 1 from public.transactions
      where gift_id = tx.gift_id
        and id <> p_tx
        and status in ('accepted', 'in_progress', 'completed')
    ) then
      update public.gift_posts set status = 'open' where id = tx.gift_id and status = 'claimed';
    end if;
  end if;

  perform public.notify(tx.requester_id, 'transaction', 'Giao dịch đã hủy',
    'Giao dịch đã được hủy.', '/giao-dich/' || p_tx);
  perform public.notify(tx.helper_id, 'transaction', 'Giao dịch đã hủy',
    'Giao dịch đã được hủy.', '/giao-dich/' || p_tx);
end;
$$;

create or replace function public.confirm_transaction(p_tx uuid)
returns public.tx_status
language plpgsql
security definer
set search_path = public
as $$
declare
  tx public.transactions;
  uid uuid := auth.uid();
  requester_balance numeric;
  spend_note text;
  earn_note text;
begin
  if uid is null then raise exception 'UNAUTHENTICATED'; end if;

  select * into tx from public.transactions where id = p_tx for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if uid not in (tx.requester_id, tx.helper_id) then raise exception 'FORBIDDEN'; end if;
  if tx.status in ('cancelled') then raise exception 'CANCELLED'; end if;
  if tx.status = 'completed' then return 'completed'; end if;
  if tx.status = 'pending' then raise exception 'NOT_ACCEPTED'; end if;

  if uid = tx.requester_id then
    if tx.requester_confirmed_at is not null then return tx.status; end if;
    update public.transactions set requester_confirmed_at = now(), status = 'in_progress'
    where id = p_tx;
    perform public.notify(tx.helper_id, 'transaction', 'Đối phương đã xác nhận hoàn thành',
      'Hãy xác nhận phía bạn để chuyển Time Credit.', '/giao-dich/' || p_tx);
  else
    if tx.helper_confirmed_at is not null then return tx.status; end if;
    update public.transactions set helper_confirmed_at = now(), status = 'in_progress'
    where id = p_tx;
    perform public.notify(tx.requester_id, 'transaction', 'Đối phương đã xác nhận hoàn thành',
      'Hãy xác nhận phía bạn để chuyển Time Credit.', '/giao-dich/' || p_tx);
  end if;

  select * into tx from public.transactions where id = p_tx for update;

  if tx.requester_confirmed_at is not null and tx.helper_confirmed_at is not null then
    select time_credit into requester_balance from public.profiles where id = tx.requester_id for update;
    perform 1 from public.profiles where id = tx.helper_id for update;

    if requester_balance < tx.amount then
      raise exception 'INSUFFICIENT_CREDIT';
    end if;

    update public.profiles set time_credit = time_credit - tx.amount where id = tx.requester_id;
    update public.profiles set time_credit = time_credit + tx.amount where id = tx.helper_id;

    if tx.gift_id is not null then
      spend_note := 'Dùng Time Credit để nhận quà cộng đồng';
      earn_note := 'Nhận Time Credit khi tặng đồ dùng';
    else
      spend_note := 'Sử dụng Time Credit cho giao dịch hỗ trợ';
      earn_note := 'Nhận Time Credit sau khi hoàn thành hỗ trợ';
    end if;

    insert into public.ledger (user_id, amount, type, transaction_id, note)
    values
      (tx.requester_id, -tx.amount, 'spend', tx.id, spend_note),
      (tx.helper_id, tx.amount, 'earn', tx.id, earn_note);

    update public.transactions
    set status = 'completed', completed_at = now()
    where id = p_tx;

    if tx.request_id is not null then
      update public.help_requests set status = 'completed' where id = tx.request_id;
    end if;
    if tx.gift_id is not null then
      update public.gift_posts set status = 'completed' where id = tx.gift_id;
    end if;

    perform public.notify(tx.requester_id, 'credit', 'Đã trừ Time Credit',
      'Giao dịch hoàn thành. -' || tx.amount::text || ' Time Credit.', '/vi');
    perform public.notify(tx.helper_id, 'credit', 'Đã cộng Time Credit',
      'Giao dịch hoàn thành. +' || tx.amount::text || ' Time Credit.', '/vi');
    perform public.notify(tx.requester_id, 'transaction', 'Giao dịch hoàn thành',
      'Bạn có thể đánh giá đối phương.', '/giao-dich/' || p_tx);
    perform public.notify(tx.helper_id, 'transaction', 'Giao dịch hoàn thành',
      'Bạn có thể đánh giá đối phương.', '/giao-dich/' || p_tx);

    return 'completed';
  end if;

  return 'in_progress';
end;
$$;

create or replace function public.close_gift(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
  if not exists (
    select 1 from public.gift_posts where id = p_id and user_id = auth.uid()
  ) and not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;
  if exists (
    select 1 from public.transactions
    where gift_id = p_id and status in ('accepted', 'in_progress')
  ) then
    raise exception 'GIFT_IN_PROGRESS';
  end if;
  update public.gift_posts set status = 'completed' where id = p_id;
  update public.transactions
  set status = 'cancelled', cancelled_at = now()
  where gift_id = p_id and status = 'pending';
end;
$$;

create or replace function public.admin_set_listing(
  p_kind text,
  p_id uuid,
  p_status text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_kind = 'skill' then
    update public.skill_posts set status = p_status::public.listing_status where id = p_id;
  elsif p_kind = 'request' then
    update public.help_requests set status = p_status::public.request_status where id = p_id;
  elsif p_kind = 'gift' then
    update public.gift_posts set status = p_status::public.gift_status where id = p_id;
  else
    raise exception 'INVALID_KIND';
  end if;
end;
$$;

alter table public.gift_posts enable row level security;
alter table public.gift_categories enable row level security;

drop policy if exists gift_cat_select on public.gift_categories;
create policy gift_cat_select on public.gift_categories for select using (true);

drop policy if exists gifts_select on public.gift_posts;
create policy gifts_select on public.gift_posts for select
using (status in ('open', 'claimed', 'completed') or user_id = auth.uid() or public.is_admin());

drop policy if exists gifts_insert on public.gift_posts;
create policy gifts_insert on public.gift_posts for insert
with check (auth.uid() = user_id and exists (select 1 from profiles where id = auth.uid() and not is_banned));

drop policy if exists gifts_update on public.gift_posts;
create policy gifts_update on public.gift_posts for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

grant execute on function public.request_gift(uuid, text) to authenticated;
grant execute on function public.close_gift(uuid) to authenticated;
grant execute on function public.helper_accept_transaction(uuid) to authenticated;
grant execute on function public.cancel_transaction(uuid) to authenticated;
grant execute on function public.confirm_transaction(uuid) to authenticated;
grant execute on function public.admin_set_listing(text, uuid, text) to authenticated;

insert into storage.buckets (id, name, public)
values ('gifts', 'gifts', true)
on conflict (id) do nothing;

drop policy if exists gifts_public_read on storage.objects;
create policy gifts_public_read on storage.objects for select
using (bucket_id = 'gifts');

drop policy if exists gifts_own_write on storage.objects;
create policy gifts_own_write on storage.objects for insert
with check (bucket_id = 'gifts' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists gifts_own_update on storage.objects;
create policy gifts_own_update on storage.objects for update
using (bucket_id = 'gifts' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists gifts_own_delete on storage.objects;
create policy gifts_own_delete on storage.objects for delete
using (bucket_id = 'gifts' and auth.uid()::text = (storage.foldername(name))[1]);
