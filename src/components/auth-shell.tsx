import Link from "next/link";
import { Logo, FullBanner } from "@/components/brand";
import { BRAND } from "@/lib/brand";
import { FloatingBubbles } from "@/components/floating-bubbles";

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
    <div className="relative grid min-h-screen overflow-hidden md:grid-cols-2">
      <FloatingBubbles />
      <div className="relative z-10 hidden flex-col overflow-y-auto bg-navy p-10 text-white md:flex">
        <Logo light />
        <div className="my-auto max-w-lg">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">{BRAND.model}</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight">{BRAND.slogan}</h2>
          <p className="mt-4 text-white/70">
            1 giờ hỗ trợ = 1 Time Credit. Thời gian của mỗi người đều có giá trị ngang nhau — không dùng tiền mặt.
          </p>
          <FullBanner src="/banner2.png" alt="VShare" className="mt-10 border-white/15" />
        </div>
      </div>
      <div className="relative z-10 grain grid place-items-center px-4 py-12">
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
