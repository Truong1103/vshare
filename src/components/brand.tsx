import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-terracotta to-sage text-sm font-extrabold text-white shadow-lg shadow-terracotta/25">
        V
      </span>
      <span className={cn("text-lg font-extrabold tracking-tight", light ? "text-white" : "text-ink")}>
        V<span className="text-terracotta">Share</span>
      </span>
    </Link>
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
    <div
      className={cn(
        "grid h-12 w-12 place-items-center rounded-2xl bg-terracotta/10 text-terracotta",
        className
      )}
    >
      {children}
    </div>
  );
}

export function HeroDashboard() {
  return (
    <div className="relative">
      <div className="absolute -left-6 -top-6 h-24 w-24 rounded-3xl bg-terracotta/15 blur-2xl" />
      <div className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full bg-sage/15 blur-2xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-navy p-4 shadow-2xl shadow-navy/30">
        <div className="mb-4 flex items-center justify-between text-white/70">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            vshare.vn/dashboard
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Nội bộ</span>
          </div>
          <span className="text-[10px]">Time Credit</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { l: "Số dư", v: "12,4", s: "+2.0 TC" },
            { l: "Giao dịch", v: "38", s: "5 đang mở" },
            { l: "Kỹ năng", v: "7", s: "đang kết nối" },
          ].map((c) => (
            <div key={c.l} className="rounded-2xl bg-white/5 p-3 text-white">
              <p className="text-[11px] text-white/55">{c.l}</p>
              <p className="mt-1 text-2xl font-extrabold">{c.v}</p>
              <p className="text-[11px] text-emerald-300">{c.s}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold text-muted">Hoạt động theo tuần</p>
          <div className="mt-3 flex h-28 items-end gap-2">
            {[40, 65, 48, 80, 55, 92, 70].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-sage to-terracotta" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-3 flex gap-2 text-[10px] text-muted">
            <span className="rounded-full bg-paper-2 px-2 py-1">Dạy học</span>
            <span className="rounded-full bg-paper-2 px-2 py-1">Sửa chữa</span>
            <span className="rounded-full bg-paper-2 px-2 py-1">Lắng nghe</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlowDiagram() {
  const nodes = ["Cho đi kỹ năng", "Xác nhận", "Time Credit", "Nhận hỗ trợ"];
  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {nodes.map((n, i) => (
          <div key={n} className="flex items-center gap-3">
            <div className="rounded-2xl border border-line bg-paper px-4 py-3 text-center text-sm font-semibold">
              {n}
            </div>
            {i < nodes.length - 1 ? <span className="hidden text-terracotta md:inline">→</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
