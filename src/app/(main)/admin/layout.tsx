import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import Link from "next/link";
import {
  BarChart3,
  Flag,
  Gift,
  Handshake,
  Mail,
  Sparkles,
  Star,
  Users,
  ClipboardList,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Thống kê", icon: BarChart3 },
  { href: "/admin/nguoi-dung", label: "Người dùng", icon: Users },
  { href: "/admin/ky-nang", label: "Kỹ năng", icon: Sparkles },
  { href: "/admin/yeu-cau", label: "Yêu cầu", icon: ClipboardList },
  { href: "/admin/giao-dich", label: "Giao dịch", icon: Handshake },
  { href: "/admin/doi-qua", label: "Đổi quà", icon: Gift },
  { href: "/admin/lien-he", label: "Liên hệ", icon: Mail },
  { href: "/admin/danh-gia", label: "Đánh giá", icon: Star },
  { href: "/admin/bao-cao", label: "Báo cáo", icon: Flag },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getSessionUser();
  if (!profile || profile.role !== "admin") redirect("/bang-dieu-khien");
  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border border-line bg-navy p-4 text-white">
        <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.18em] !text-white">Admin</p>
        <nav className="grid gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium !text-white/90 hover:bg-white/10 hover:!text-white"
            >
              <l.icon className="h-4 w-4 text-terracotta" />
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
