"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { Field, inputClass } from "@/components/ui";
import { FormAlert, SubmitButton } from "@/components/forms";
import { AuthShell } from "@/components/auth-shell";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  return (
    <AuthShell title="Đăng nhập" subtitle="Tiếp tục trao đổi thời gian cùng cộng đồng.">
      <form
        className="grid gap-4"
        action={async (fd) => {
          const res = await signIn(fd);
          if (res?.error) setError(res.error);
        }}
      >
        <FormAlert error={error} />
        <input type="hidden" name="next" value="/bang-dieu-khien" />
        <Field label="Email">
          <input name="email" type="email" required className={inputClass()} />
        </Field>
        <Field label="Mật khẩu">
          <input name="password" type="password" required className={inputClass()} />
        </Field>
        <SubmitButton>Đăng nhập</SubmitButton>
      </form>
      <GoogleAuthButton label="Đăng nhập với Google" />
      <div className="mt-4 flex justify-between text-sm text-muted">
        <Link href="/quen-mat-khau">Quên mật khẩu</Link>
        <Link href="/dang-ky" className="font-semibold text-terracotta">
          Tạo tài khoản
        </Link>
      </div>
    </AuthShell>
  );
}
