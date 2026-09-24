-- Vshare database schema
-- Run this in Supabase SQL Editor (or via CLI) on a fresh project.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_status as enum ('active', 'hidden', 'closed', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.support_mode as enum ('online', 'offline', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum ('open', 'matched', 'completed', 'cancelled', 'hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tx_status as enum ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ledger_type as enum ('earn', 'spend', 'bonus', 'adjustment');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_target as enum ('user', 'skill', 'request', 'review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  phone text,
  bio text,
  area text,
  skills text[] not null default '{}',
  availability text,
  avatar_url text,
  role public.user_role not null default 'user',
  is_banned boolean not null default false,
  time_credit numeric(12,2) not null default 0 check (time_credit >= 0),
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order integer not null default 0
);

create table if not exists public.skill_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null,
  description text not null,
  area text,
  mode public.support_mode not null default 'both',
  availability text,
  status public.listing_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null,
  description text not null,
  area text,
  mode public.support_mode not null default 'both',
  duration_hours numeric(8,2) not null check (duration_hours > 0),
  time_credit numeric(12,2) not null check (time_credit > 0),
  desired_time text,
  status public.request_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.help_requests (id) on delete set null,
  skill_id uuid references public.skill_posts (id) on delete set null,
  requester_id uuid not null references public.profiles (id) on delete restrict,
  helper_id uuid not null references public.profiles (id) on delete restrict,
  conversation_id uuid unique references public.conversations (id) on delete set null,
  hours numeric(8,2) not null check (hours > 0),
  amount numeric(12,2) not null check (amount > 0),
  status public.tx_status not null default 'pending',
  requester_confirmed_at timestamptz,
  helper_confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tx_different_parties check (requester_id <> helper_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (transaction_id, reviewer_id),
  constraint review_not_self check (reviewer_id <> reviewee_id)
);

create table if not exists public.ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12,2) not null,
  type public.ledger_type not null,
  transaction_id uuid references public.transactions (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target not null,
  target_id uuid not null,
  reason text not null,
  status public.report_status not null default 'open',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_skill_posts_status on public.skill_posts (status, created_at desc);
create index if not exists idx_skill_posts_user on public.skill_posts (user_id);
create index if not exists idx_skill_posts_cat on public.skill_posts (category_id);
create index if not exists idx_help_requests_status on public.help_requests (status, created_at desc);
create index if not exists idx_help_requests_user on public.help_requests (user_id);
create index if not exists idx_tx_parties on public.transactions (requester_id, helper_id);
create index if not exists idx_tx_status on public.transactions (status);
create index if not exists idx_messages_conv on public.messages (conversation_id, created_at);
create index if not exists idx_notifications_user on public.notifications (user_id, created_at desc);
create index if not exists idx_ledger_user on public.ledger (user_id, created_at desc);
create index if not exists idx_reviews_reviewee on public.reviews (reviewee_id, created_at desc);

insert into public.categories (slug, name, description, sort_order) values
  ('dich-thuat', 'Dịch thuật', 'Dịch tài liệu, phiên dịch', 1),
  ('day-hoc', 'Dạy học', 'Gia sư, ôn tập, ngoại ngữ', 2),
  ('lap-trinh', 'Lập trình', 'Web, app, hỗ trợ kỹ thuật phần mềm', 3),
  ('thiet-ke', 'Thiết kế', 'Đồ họa, UI, nhận diện', 4),
  ('video', 'Chỉnh sửa video', 'Dựng phim, hiệu ứng', 5),
  ('nhiep-anh', 'Chụp ảnh', 'Chụp và xử lý ảnh', 6),
  ('sua-may-tinh', 'Sửa máy tính', 'Cài đặt, sửa chữa máy tính', 7),
  ('sua-dien', 'Sửa điện', 'Điện dân dụng, thiết bị', 8),
  ('sua-nuoc', 'Sửa nước', 'Ống nước, thiết bị vệ sinh', 9),
  ('thu-cong', 'Đồ thủ công', 'Làm đồ handmade', 10),
  ('lang-nghe', 'Lắng nghe / trò chuyện', 'Đồng hành, hỗ trợ tinh thần', 11),
  ('cong-nghe', 'Hỗ trợ công nghệ', 'Ứng dụng, thiết bị số', 12),
  ('khac', 'Khác', 'Kỹ năng khác', 99)
on conflict (slug) do nothing;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_skill_updated on public.skill_posts;
create trigger trg_skill_updated before update on public.skill_posts
for each row execute function public.set_updated_at();

drop trigger if exists trg_request_updated on public.help_requests;
create trigger trg_request_updated before update on public.help_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_tx_updated on public.transactions;
create trigger trg_tx_updated before update on public.transactions
for each row execute function public.set_updated_at();

create or replace function public.protect_profile_columns()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.time_credit := old.time_credit;
    new.role := old.role;
    new.is_banned := old.is_banned;
    new.rating_avg := old.rating_avg;
    new.rating_count := old.rating_count;
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile before update on public.profiles
for each row execute function public.protect_profile_columns();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, time_credit)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'thanh-vien'), '@', 1)),
    2
  );
  insert into public.ledger (user_id, amount, type, note)
  values (new.id, 2, 'bonus', 'Thưởng chào mừng thành viên mới');
  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.id,
    'system',
    'Chào mừng đến Vshare',
    'Bạn nhận 2 Time Credit khởi đầu. 1 giờ hỗ trợ = 1 Time Credit.',
    '/vi'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.refresh_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  target := coalesce(new.reviewee_id, old.reviewee_id);
  update public.profiles p
  set
    rating_avg = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where reviewee_id = target), 0),
    rating_count = (select count(*) from public.reviews where reviewee_id = target)
  where p.id = target;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_review_rating on public.reviews;
create trigger trg_review_rating after insert or delete on public.reviews
for each row execute function public.refresh_rating();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_banned = false
  );
$$;

create or replace function public.notify(
  p_user uuid,
  p_type text,
  p_title text,
  p_body text,
  p_link text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link)
  values (p_user, p_type, p_title, p_body, p_link);
end;
$$;

create or replace function public.accept_help_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.help_requests;
  conv_id uuid;
  tx_id uuid;
  helper uuid := auth.uid();
begin
  if helper is null then raise exception 'UNAUTHENTICATED'; end if;
  if exists (select 1 from public.profiles where id = helper and is_banned) then
    raise exception 'BANNED';
  end if;

  select * into req from public.help_requests where id = p_request_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if req.status <> 'open' then raise exception 'REQUEST_NOT_OPEN'; end if;
  if req.user_id = helper then raise exception 'CANNOT_HELP_SELF'; end if;

  if exists (
    select 1 from public.transactions
    where request_id = p_request_id and status in ('pending', 'accepted', 'in_progress')
  ) then
    raise exception 'ALREADY_MATCHED';
  end if;

  if (select time_credit from public.profiles where id = req.user_id) < req.time_credit then
    raise exception 'REQUESTER_INSUFFICIENT_CREDIT';
  end if;

  insert into public.conversations default values returning id into conv_id;

  insert into public.transactions (
    request_id, requester_id, helper_id, conversation_id, hours, amount, status
  ) values (
    req.id, req.user_id, helper, conv_id, req.duration_hours, req.time_credit, 'accepted'
  ) returning id into tx_id;

  update public.help_requests set status = 'matched' where id = req.id;

  perform public.notify(req.user_id, 'connection', 'Có người nhận hỗ trợ',
    'Một thành viên đã nhận yêu cầu của bạn.', '/giao-dich/' || tx_id);
  perform public.notify(helper, 'connection', 'Bạn đã nhận hỗ trợ',
    'Hãy chat để thống nhất thời gian và nội dung công việc.', '/giao-dich/' || tx_id);

  return tx_id;
end;
$$;

create or replace function public.request_from_skill(p_skill_id uuid, p_hours numeric, p_note text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sk public.skill_posts;
  conv_id uuid;
  tx_id uuid;
  requester uuid := auth.uid();
  amount numeric;
begin
  if requester is null then raise exception 'UNAUTHENTICATED'; end if;
  if exists (select 1 from public.profiles where id = requester and is_banned) then
    raise exception 'BANNED';
  end if;
  if p_hours is null or p_hours <= 0 then raise exception 'INVALID_HOURS'; end if;

  amount := round(p_hours, 2);

  select * into sk from public.skill_posts where id = p_skill_id for update;
  if not found or sk.status <> 'active' then raise exception 'SKILL_UNAVAILABLE'; end if;
  if sk.user_id = requester then raise exception 'CANNOT_REQUEST_SELF'; end if;

  if (select time_credit from public.profiles where id = requester) < amount then
    raise exception 'INSUFFICIENT_CREDIT';
  end if;

  insert into public.conversations default values returning id into conv_id;

  insert into public.transactions (
    skill_id, requester_id, helper_id, conversation_id, hours, amount, status
  ) values (
    sk.id, requester, sk.user_id, conv_id, amount, amount, 'pending'
  ) returning id into tx_id;

  perform public.notify(sk.user_id, 'connection', 'Yêu cầu kết nối mới',
    coalesce(p_note, 'Có người muốn nhận hỗ trợ từ kỹ năng của bạn.'), '/giao-dich/' || tx_id);
  perform public.notify(requester, 'connection', 'Đã gửi yêu cầu hỗ trợ',
    'Chờ đối phương xác nhận nhận hỗ trợ.', '/giao-dich/' || tx_id);

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
  perform public.notify(tx.requester_id, 'transaction', 'Yêu cầu đã được nhận',
    'Đối phương đã đồng ý hỗ trợ bạn.', '/giao-dich/' || p_tx);
end;
$$;

create or replace function public.start_transaction(p_tx uuid)
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
  if auth.uid() not in (tx.requester_id, tx.helper_id) then raise exception 'FORBIDDEN'; end if;
  if tx.status <> 'accepted' then raise exception 'INVALID_STATUS'; end if;
  update public.transactions set status = 'in_progress' where id = p_tx;
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

  perform public.notify(tx.requester_id, 'transaction', 'Giao dịch đã hủy',
    'Giao dịch hỗ trợ đã được hủy.', '/giao-dich/' || p_tx);
  perform public.notify(tx.helper_id, 'transaction', 'Giao dịch đã hủy',
    'Giao dịch hỗ trợ đã được hủy.', '/giao-dich/' || p_tx);
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

    insert into public.ledger (user_id, amount, type, transaction_id, note)
    values
      (tx.requester_id, -tx.amount, 'spend', tx.id, 'Sử dụng Time Credit cho giao dịch hỗ trợ'),
      (tx.helper_id, tx.amount, 'earn', tx.id, 'Nhận Time Credit sau khi hoàn thành hỗ trợ');

    update public.transactions
    set status = 'completed', completed_at = now()
    where id = p_tx;

    if tx.request_id is not null then
      update public.help_requests set status = 'completed' where id = tx.request_id;
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

create or replace function public.submit_review(p_tx uuid, p_rating int, p_comment text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tx public.transactions;
  uid uuid := auth.uid();
  other uuid;
  rid uuid;
begin
  if uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_rating < 1 or p_rating > 5 then raise exception 'INVALID_RATING'; end if;

  select * into tx from public.transactions where id = p_tx;
  if not found then raise exception 'NOT_FOUND'; end if;
  if tx.status <> 'completed' then raise exception 'NOT_COMPLETED'; end if;
  if uid not in (tx.requester_id, tx.helper_id) then raise exception 'FORBIDDEN'; end if;

  other := case when uid = tx.requester_id then tx.helper_id else tx.requester_id end;

  insert into public.reviews (transaction_id, reviewer_id, reviewee_id, rating, comment)
  values (p_tx, uid, other, p_rating, p_comment)
  returning id into rid;

  perform public.notify(other, 'review', 'Bạn có đánh giá mới',
    'Một thành viên vừa đánh giá bạn sau giao dịch.', '/ho-so/' || other);

  return rid;
end;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.skill_posts enable row level security;
alter table public.help_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.transactions enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.ledger enable row level security;
alter table public.reports enable row level security;

-- Profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
using (auth.uid() = id and is_banned = false)
with check (auth.uid() = id);

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

-- Categories
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories for select using (true);

-- Skills
drop policy if exists skills_select on public.skill_posts;
create policy skills_select on public.skill_posts for select
using (status = 'active' or user_id = auth.uid() or public.is_admin());

drop policy if exists skills_insert on public.skill_posts;
create policy skills_insert on public.skill_posts for insert
with check (auth.uid() = user_id and exists (select 1 from profiles where id = auth.uid() and not is_banned));

drop policy if exists skills_update on public.skill_posts;
create policy skills_update on public.skill_posts for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists skills_delete on public.skill_posts;
create policy skills_delete on public.skill_posts for delete
using (user_id = auth.uid() or public.is_admin());

-- Requests
drop policy if exists requests_select on public.help_requests;
create policy requests_select on public.help_requests for select
using (status in ('open', 'matched', 'completed') or user_id = auth.uid() or public.is_admin());

drop policy if exists requests_insert on public.help_requests;
create policy requests_insert on public.help_requests for insert
with check (auth.uid() = user_id and exists (select 1 from profiles where id = auth.uid() and not is_banned));

drop policy if exists requests_update on public.help_requests;
create policy requests_update on public.help_requests for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists requests_delete on public.help_requests;
create policy requests_delete on public.help_requests for delete
using (user_id = auth.uid() or public.is_admin());

-- Transactions
drop policy if exists tx_select on public.transactions;
create policy tx_select on public.transactions for select
using (auth.uid() in (requester_id, helper_id) or public.is_admin());

-- Conversations / messages
drop policy if exists conv_select on public.conversations;
create policy conv_select on public.conversations for select
using (
  exists (
    select 1 from public.transactions t
    where t.conversation_id = conversations.id
      and (auth.uid() in (t.requester_id, t.helper_id) or public.is_admin())
  )
);

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select
using (
  exists (
    select 1 from public.transactions t
    where t.conversation_id = messages.conversation_id
      and (auth.uid() in (t.requester_id, t.helper_id) or public.is_admin())
  )
);

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.transactions t
    where t.conversation_id = messages.conversation_id
      and auth.uid() in (t.requester_id, t.helper_id)
      and t.status not in ('cancelled')
  )
);

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages for update
using (
  exists (
    select 1 from public.transactions t
    where t.conversation_id = messages.conversation_id
      and auth.uid() in (t.requester_id, t.helper_id)
  )
);

-- Notifications
drop policy if exists notif_select on public.notifications;
create policy notif_select on public.notifications for select using (user_id = auth.uid());

drop policy if exists notif_update on public.notifications;
create policy notif_update on public.notifications for update
using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Reviews
drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews for select using (true);

-- Ledger
drop policy if exists ledger_select on public.ledger;
create policy ledger_select on public.ledger for select
using (user_id = auth.uid() or public.is_admin());

-- Reports
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert
with check (reporter_id = auth.uid());

drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports for select
using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists reports_admin on public.reports;
create policy reports_admin on public.reports for update
using (public.is_admin()) with check (public.is_admin());

grant execute on function public.accept_help_request(uuid) to authenticated;
grant execute on function public.request_from_skill(uuid, numeric, text) to authenticated;
grant execute on function public.helper_accept_transaction(uuid) to authenticated;
grant execute on function public.start_transaction(uuid) to authenticated;
grant execute on function public.cancel_transaction(uuid) to authenticated;
grant execute on function public.confirm_transaction(uuid) to authenticated;
create or replace function public.admin_set_user(
  p_user uuid,
  p_banned boolean,
  p_role public.user_role
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  update public.profiles set is_banned = p_banned, role = p_role where id = p_user;
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
  else
    raise exception 'INVALID_KIND';
  end if;
end;
$$;

create or replace function public.admin_hide_review(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  delete from public.reviews where id = p_id;
end;
$$;

grant execute on function public.submit_review(uuid, int, text) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_set_user(uuid, boolean, public.user_role) to authenticated;
grant execute on function public.admin_set_listing(text, uuid, text) to authenticated;
grant execute on function public.admin_hide_review(uuid) to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;

-- Storage (run after creating public bucket "avatars" in dashboard, or here:)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists avatars_own_write on storage.objects;
create policy avatars_own_write on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists avatars_own_update on storage.objects;
create policy avatars_own_update on storage.objects for update
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Đổi quà + liên hệ: chạy thêm supabase/rewards.sql trên dự án đã triển khai.
-- Tặng quà cộng đồng: chạy thêm supabase/gifts.sql.
