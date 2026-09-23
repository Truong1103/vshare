"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/actions/auth";
import { Field, inputClass } from "@/components/ui";
import { FormAlert, SubmitButton } from "@/components/forms";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPage() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  return (
    <AuthShell title="Quên mật khẩu" subtitle="Chúng tôi sẽ gửi liên kết đặt lại nếu email tồn tại.">
      <form
        className="grid gap-4"
        action={async (fd) => {
          const res = await forgotPassword(fd);
          if (res?.error) setError(res.error);
          else setOk("Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.");
        }}
      >
        <FormAlert error={error} ok={ok} />
        <Field label="Email">
          <input name="email" type="email" required className={inputClass()} />
        </Field>
        <SubmitButton>Gửi liên kết</SubmitButton>
      </form>
    </AuthShell>
  );
}
