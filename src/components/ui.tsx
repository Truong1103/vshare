import { cn } from "@/lib/utils";
import Link from "next/link";
import { initials } from "@/lib/utils";
import { Inbox } from "lucide-react";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "sage";
}) {
  const styles = {
    primary:
      "bg-terracotta text-white hover:bg-terracotta-dark shadow-[0_10px_24px_rgba(15,143,138,0.28)]",
    sage: "bg-sage text-white hover:bg-sage-2",
    secondary: "bg-white text-ink border border-line hover:bg-paper",
    ghost: "bg-transparent text-ink hover:bg-paper-2",
    danger: "bg-danger text-white hover:opacity-90",
  }[variant];
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50",
        styles,
        className
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-card p-5 shadow-[0_8px_30px_rgba(11,31,51,0.04)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-semibold text-ink/80">{label}</span>
      {children}
    </label>
  );
}

export function inputClass(extra?: string) {
  return cn(
    "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none ring-terracotta/25 transition focus:border-terracotta focus:ring-4",
    extra
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "sage" | "warn" | "muted";
}) {
  const map = {
    default: "bg-terracotta/10 text-terracotta-dark",
    sage: "bg-sage/10 text-sage",
    warn: "bg-amber-100 text-amber-800",
    muted: "bg-paper-2 text-muted",
  }[tone];
  return (
    <span className={cn("inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold", map)}>
      {children}
    </span>
  );
}

export function Empty({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <Card className="py-14 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-paper-2 text-muted">
        <Inbox className="h-6 w-6" />
      </div>
      <p className="text-xl font-bold">{title}</p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </Card>
  );
}

export function Avatar({
  name,
  src,
  size = 40,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || "avatar"}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-white"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="grid place-items-center rounded-full bg-gradient-to-br from-terracotta to-sage text-xs font-bold text-white"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  const n = Math.round(value);
  return (
    <span className="text-gold" aria-label={`${value} sao`}>
      {"★★★★★".slice(0, n)}
      <span className="text-line">{"★★★★★".slice(n)}</span>
    </span>
  );
}

export function PageHeader({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker ? <p className="kicker mb-2">{kicker}</p> : null}
        <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "sage";
}) {
  const styles = {
    primary: "bg-terracotta text-white shadow-[0_10px_24px_rgba(15,143,138,0.25)]",
    secondary: "bg-white border border-line",
    sage: "bg-sage text-white",
  }[variant];
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold", styles)}
    >
      {children}
    </Link>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-terracotta/10" />
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </Card>
  );
}
