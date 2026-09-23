"use client";

import { useFormStatus } from "react-dom";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang xử lý..." : children}
    </Button>
  );
}

export function ConfirmForm({
  action,
  label,
  confirm,
  variant = "primary",
}: {
  action: () => Promise<{ error?: string } | void>;
  label: string;
  confirm: string;
  variant?: "primary" | "danger" | "sage" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <Button type="button" variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl">
            <p className="text-2xl font-extrabold">Xác nhận</p>
            <p className="mt-2 text-sm text-muted">{confirm}</p>
            {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Đóng
              </Button>
              <Button
                type="button"
                variant={variant === "danger" ? "danger" : "primary"}
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await action();
                    if (res && "error" in res && res.error) setError(res.error);
                    else setOpen(false);
                  })
                }
              >
                {pending ? "Đang xử lý..." : "Đồng ý"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function FormAlert({ error, ok }: { error?: string | null; ok?: string | null }) {
  if (error) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>;
  if (ok) return <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{ok}</p>;
  return null;
}

export function ClientForm({
  action,
  children,
  success,
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
  children: React.ReactNode;
  success?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  return (
    <form
      className="grid gap-4"
      action={async (fd) => {
        setError(null);
        setOk(null);
        const res = await action(fd);
        if (res?.error) setError(res.error);
        else setOk(success || "Đã lưu.");
      }}
    >
      <FormAlert error={error} ok={ok} />
      {children}
    </form>
  );
}
