-- Chạy file này trên Supabase SQL Editor (dự án đã có schema).
-- Thêm đổi quà Time Credit, liên hệ admin, danh mục kỹ năng mở rộng.

insert into public.categories (slug, name, description, sort_order) values
  ('gia-su', 'Gia sư / ôn tập', 'Kèm bài, ôn thi, ngoại ngữ', 2),
  ('ngoai-ngu', 'Ngoại ngữ', 'Tiếng Anh và ngôn ngữ khác', 2),
  ('truyen-thong', 'Truyền thông', 'Nội dung, sự kiện cộng đồng', 13),
  ('cham-soc', 'Chăm sóc xã hội', 'Hỗ trợ người cao tuổi, trẻ em, hàng xóm', 14),
  ('the-thao', 'Thể thao & sức khỏe', 'Luyện tập, đồng hành vận động', 15),
  ('hanh-chinh', 'Hỗ trợ hành chính', 'Giấy tờ, hướng dẫn thủ tục', 16)
on conflict (slug) do nothing;

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  cost numeric(12,2) not null check (cost > 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  reward_id uuid not null references public.rewards (id) on delete restrict,
  cost numeric(12,2) not null,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists rewards_select on public.rewards;
create policy rewards_select on public.rewards for select using (is_active or public.is_admin());

drop policy if exists rewards_admin on public.rewards;
create policy rewards_admin on public.rewards for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists redemptions_select on public.reward_redemptions;
create policy redemptions_select on public.reward_redemptions for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists contact_admin on public.contact_messages;
create policy contact_admin on public.contact_messages for select using (public.is_admin());

insert into public.rewards (slug, title, description, cost, stock) values
  ('so-tay', 'Sổ tay Ngân hàng Thời gian', 'Ghi chép giờ cho đi và nhận lại — quà tri ân thành viên thí điểm.', 2, 40),
  ('tui-vai', 'Túi vải cộng đồng VShare', 'Quà phi tiền tệ, nhắc mỗi người đều có kỹ năng để chia sẻ.', 3, 30),
  ('workshop-hn', 'Vé workshop kỹ năng tại Hà Nội', 'Buổi học nhóm do thành viên tổ chức — đổi bằng Time Credit.', 5, 20),
  ('workshop-na', 'Vé workshop cộng đồng tại Nghệ An', 'Kết nối địa phương, lan tỏa mô hình timebank.', 5, 20),
  ('lang-nghe', 'Phiên lắng nghe chuyên sâu 1 giờ', 'Đổi tín chỉ để được một thành viên đồng hành trò chuyện.', 4, 25),
  ('cay-xanh', 'Góp cây xanh vì cộng đồng', 'Ghi nhận một cây nhân danh bạn — cho đi không vì tiền.', 6, 15)
on conflict (slug) do nothing;

create or replace function public.redeem_reward(p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rw public.rewards;
  rid uuid;
  bal numeric;
begin
  if uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if exists (select 1 from public.profiles where id = uid and is_banned) then
    raise exception 'BANNED';
  end if;
  select * into rw from public.rewards where slug = p_slug and is_active for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if rw.stock < 1 then raise exception 'REWARD_OUT_OF_STOCK'; end if;
  select time_credit into bal from public.profiles where id = uid for update;
  if bal < rw.cost then raise exception 'INSUFFICIENT_CREDIT'; end if;

  update public.profiles set time_credit = time_credit - rw.cost where id = uid;
  update public.rewards set stock = stock - 1 where id = rw.id;
  insert into public.ledger (user_id, amount, type, note)
  values (uid, -rw.cost, 'spend', 'Đổi quà: ' || rw.title);
  insert into public.reward_redemptions (user_id, reward_id, cost, status)
  values (uid, rw.id, rw.cost, 'pending')
  returning id into rid;
  return rid;
end;
$$;

create or replace function public.submit_contact(p_name text, p_email text, p_body text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  adm record;
begin
  if length(trim(p_name)) < 2 or length(trim(p_email)) < 5 or length(trim(p_body)) < 8 then
    raise exception 'INVALID_CONTACT';
  end if;
  insert into public.contact_messages (name, email, body)
  values (trim(p_name), trim(p_email), trim(p_body));
  for adm in select id from public.profiles where role = 'admin' loop
    insert into public.notifications (user_id, type, title, body, link)
    values (adm.id, 'contact', 'Liên hệ mới từ ' || trim(p_name), left(trim(p_body), 140), '/admin/lien-he');
  end loop;
end;
$$;

create or replace function public.admin_set_redemption(p_id uuid, p_status text, p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  update public.reward_redemptions set status = p_status, admin_note = p_note where id = p_id;
end;
$$;

grant execute on function public.redeem_reward(text) to authenticated;
grant execute on function public.submit_contact(text, text, text) to anon, authenticated;
grant execute on function public.admin_set_redemption(uuid, text, text) to authenticated;
