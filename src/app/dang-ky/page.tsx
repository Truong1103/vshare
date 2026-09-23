"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Field, inputClass } from "@/components/ui";
import { FormAlert, SubmitButton } from "@/components/forms";
import { AuthShell } from "@/components/auth-shell";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  return (
    <AuthShell title="Tạo tài khoản" subtitle="Thành viên mới nhận 2 Time Credit chào mừng.">
      <form
        className="grid gap-4"
        action={async (fd) => {
          const res = await signUp(fd);
          if (res?.error) setError(res.error);
          else setOk("Đăng ký thành công. Kiểm tra email nếu cần xác thực, rồi đăng nhập.");
        }}
      >
        <FormAlert error={error} ok={ok} />
        <Field label="Họ tên">
          <input name="full_name" required className={inputClass()} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClass()} />
        </Field>
        <Field label="Mật khẩu (tối thiểu 8 ký tự)">
          <input name="password" type="password" minLength={8} required className={inputClass()} />
        </Field>
        <SubmitButton>Đăng ký</SubmitButton>
      </form>
      <GoogleAuthButton label="Tiếp tục với Google" />
      <p className="mt-4 text-sm text-muted">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-semibold text-terracotta">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}
