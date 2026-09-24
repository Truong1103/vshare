import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

export function Logo({ className }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label={BRAND.fullName}>
      <Image
        src="/logo_daidien.png"
        alt={BRAND.fullName}
        width={320}
        height={100}
        className="h-12 w-auto rounded-lg object-contain sm:h-14 md:h-[3.75rem]"
        priority
      />
    </Link>
  );
}

export function CroppedBanner({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-line shadow-xl">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-[center_20%]"
        priority={priority}
        sizes="(min-width: 768px) 50vw, 100vw"
      />
    </div>
  );
}

export function FullBanner({
  src,
  alt,
  priority,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[28px] border border-line bg-white shadow-lg", className)}>
      <Image
        src={src}
        alt={alt}
        width={1920}
        height={1080}
        className="h-auto w-full object-contain"
        priority={priority}
        sizes="(min-width: 1152px) 1152px, 100vw"
      />
    </div>
  );
}

export function IconBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid h-12 w-12 place-items-center rounded-2xl bg-terracotta/10 text-terracotta", className)}>
      {children}
    </div>
  );
}

export function FlowDiagram() {
  const nodes = ["Cho đi thời gian", "Tích lũy tín chỉ", "Đổi nhận trợ giúp", "Lan tỏa cộng đồng"];
  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {nodes.map((n, i) => (
          <div key={n} className="flex items-center gap-3">
            <div className="rounded-2xl border border-line bg-paper px-4 py-3 text-center text-sm font-semibold">{n}</div>
            {i < nodes.length - 1 ? <span className="hidden text-terracotta md:inline">→</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
