"use client";

import { useState, useTransition } from "react";
import { signInWithGoogle } from "@/lib/actions/auth";
import { Button } from "@/components/ui";
import { FormAlert } from "@/components/forms";
import { GoogleIcon } from "@/components/google-icon";

export function GoogleAuthButton({ label }: { label: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-3">
      <div className="my-1 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted">
        <span className="h-px flex-1 bg-line" />
        hoặc
        <span className="h-px flex-1 bg-line" />
      </div>
      <FormAlert error={error} />
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await signInWithGoogle();
            if (res?.error) setError(res.error);
          })
        }
      >
        <GoogleIcon />
        {pending ? "Đang chuyển tới Google..." : label}
      </Button>
    </div>
  );
}
