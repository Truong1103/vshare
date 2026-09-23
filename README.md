# Vshare

Nền tảng cộng đồng trao đổi thời gian và kỹ năng bằng **Time Credit**.

> 1 giờ hỗ trợ = 1 Time Credit. Time Credit là điểm nội bộ, không phải tiền, không nạp/rút.

Thông điệp: **Ai cũng có thể cho đi và ai cũng có thể nhận lại.**

## Công nghệ

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase Auth, PostgreSQL, RLS, Storage, Realtime

## Cài đặt

```bash
cd vshare
copy .env.example .env.local
npm install
```

Điền `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Trong [Supabase](https://supabase.com):

1. Mở SQL Editor, chạy toàn bộ file `supabase/schema.sql`.
2. Authentication → Providers: bật Email. Tắt “Confirm email” nếu muốn đăng nhập ngay lúc demo.
3. (Tuỳ chọn) bật Google OAuth và thêm Redirect URL: `http://localhost:3000/auth/callback`.
4. Authentication → URL Configuration: Site URL = `http://localhost:3000`.
5. Đặt admin cho tài khoản đầu tiên:

```sql
update public.profiles set role = 'admin' where email = 'ban@email.com';
```

Chạy app:

```bash
npm run dev
```

Mở http://localhost:3000

## Luồng chính

1. Đăng ký / đăng nhập (nhận 2 Time Credit chào mừng).
2. Cập nhật hồ sơ, đăng kỹ năng.
3. Người khác đăng yêu cầu → bạn **Nhận hỗ trợ**.
4. Chat thống nhất công việc.
5. Cả hai **Xác nhận hoàn thành** → hệ thống cộng/trừ Time Credit một lần, chống số dư âm.
6. Đánh giá đối phương.
7. Dùng Time Credit cho yêu cầu khác.

Cộng/trừ điểm chỉ chạy trong hàm PostgreSQL `confirm_transaction` (không cho sửa số dư từ frontend).

## Tài khoản demo

Tạo 2 user trên trang đăng ký. User A đăng yêu cầu 1 giờ. User B nhận hỗ trợ. Cả hai xác nhận. B nhận +1 TC, A bị trừ 1 TC.

## Phạm vi MVP

Có: auth, Google login, profile, kỹ năng, yêu cầu, tìm/lọc, kết nối, chat realtime, thông báo, ví Time Credit, xác nhận giao dịch, review, admin, báo cáo, RLS.

Chưa làm (đúng spec): thanh toán tiền thật, QR, tặng đồ đổi điểm, app mobile.
