import Link from "next/link";
import { Logo, HeroDashboard } from "@/components/brand";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy p-10 text-white md:flex md:flex-col">
        <Logo light />
        <div className="relative z-10 my-auto max-w-lg">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">Cộng đồng Time Credit</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight">
            Tập trung kỹ năng. Làm chủ thời gian.
          </h2>
          <p className="mt-4 text-white/70">
            1 giờ hỗ trợ = 1 Time Credit. Cho đi hôm nay, nhận lại khi bạn cần.
          </p>
          <div className="mt-10">
            <HeroDashboard />
          </div>
        </div>
        <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-terracotta/20 blur-3xl" />
      </div>
      <div className="grain grid place-items-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
          <p className="mt-8 text-center text-xs text-muted">
            <Link href="/" className="font-semibold text-terracotta">
              ← Về trang chủ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
