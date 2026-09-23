"use client";

import { useState } from "react";
import { updatePassword } from "@/lib/actions/auth";
import { Field, inputClass } from "@/components/ui";
import { FormAlert, SubmitButton } from "@/components/forms";
import { AuthShell } from "@/components/auth-shell";

export default function ResetPage() {
  const [error, setError] = useState<string | null>(null);
  return (
    <AuthShell title="Đặt lại mật khẩu" subtitle="Chọn mật khẩu mới, tối thiểu 8 ký tự.">
      <form
        className="grid gap-4"
        action={async (fd) => {
          const res = await updatePassword(fd);
          if (res?.error) setError(res.error);
        }}
      >
        <FormAlert error={error} />
        <Field label="Mật khẩu mới">
          <input name="password" type="password" minLength={8} required className={inputClass()} />
        </Field>
        <SubmitButton>Cập nhật mật khẩu</SubmitButton>
      </form>
    </AuthShell>
  );
}
