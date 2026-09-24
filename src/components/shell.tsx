import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { Avatar } from "@/components/ui";
import { Logo } from "@/components/brand";
import type { Profile } from "@/types";
import { formatCredit, formAction } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import {
  Bell,
  ClipboardList,
  Gift,
  Handshake,
  LayoutDashboard,
  Package,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";
import { ChatNavLink } from "@/components/chat-nav-link";

const NAV = [
  { href: "/bang-dieu-khien", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/tim-kiem", label: "Tìm kiếm", icon: Search },
  { href: "/ky-nang", label: "Kỹ năng", icon: Sparkles },
  { href: "/yeu-cau", label: "Yêu cầu", icon: ClipboardList },
  { href: "/tang-qua", label: "Tặng quà", icon: Package },
  { href: "/giao-dich", label: "Giao dịch", icon: Handshake },
  { href: "/doi-qua", label: "Đổi quà", icon: Gift },
];

export function AppShell({
  profile,
  unread,
  unreadChats,
  children,
}: {
  profile: Profile;
  unread: number;
  unreadChats: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grain">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-1 text-sm lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 font-medium text-ink/70 hover:bg-paper hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/vi"
              className="hidden items-center rounded-xl border border-line bg-paper px-3 py-1.5 text-sm font-semibold md:inline-flex"
            >
              <Wallet className="mr-1.5 h-4 w-4 text-terracotta" />
              {formatCredit(profile.time_credit)} TC
            </Link>
            <ChatNavLink userId={profile.id} initial={unreadChats} />
            <Link href="/thong-bao" className="relative rounded-xl p-2 hover:bg-paper">
              <Bell className="h-5 w-5" />
              {unread > 0 ? (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-terracotta px-1 text-[10px] text-white">
                  {unread}
                </span>
              ) : null}
            </Link>
            <Link href="/ho-so">
              <Avatar name={profile.full_name} src={profile.avatar_url} size={36} />
            </Link>
            {profile.role === "admin" ? (
              <Link
                href="/admin"
                className="hidden rounded-lg bg-navy px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide !text-white md:inline"
              >
                Admin
              </Link>
            ) : null}
            <form action={formAction(signOut)}>
              <button className="hidden text-sm font-medium text-muted hover:text-ink md:inline">Đăng xuất</button>
            </form>
          </div>
        </div>
        <div className="flex gap-2 overflow-auto border-t border-line px-4 py-2 text-sm lg:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg bg-paper px-3 py-1.5 font-medium text-ink/70">
              {item.label}
            </Link>
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

const PUBLIC_NAV = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/nhom-ky-nang", label: "Nhóm kỹ năng" },
  { href: "/tang-qua", label: "Tặng quà" },
  { href: "/doi-qua", label: "Đổi quà" },
  { href: "/lien-he", label: "Liên hệ" },
];

export function PublicHeader({ authed }: { authed?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-5 text-sm font-medium text-ink/70 lg:flex">
          {PUBLIC_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {authed ? (
            <Link href="/bang-dieu-khien" className="rounded-xl bg-terracotta px-4 py-2 font-semibold text-white">
              Vào ứng dụng
            </Link>
          ) : (
            <>
              <Link href="/dang-nhap" className="hidden rounded-xl px-3 py-2 font-semibold text-ink/80 sm:inline">
                Đăng nhập
              </Link>
              <Link href="/dang-ky" className="rounded-xl bg-terracotta px-4 py-2 font-semibold text-white shadow-lg shadow-terracotta/20">
                Tham gia
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2 overflow-auto border-t border-line px-4 py-2 text-sm lg:hidden">
        {PUBLIC_NAV.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg bg-paper px-3 py-1.5 font-medium text-ink/70">
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            {BRAND.fullName}. {BRAND.slogan}. Mô hình {BRAND.model} — thí điểm tại Hà Nội và Nghệ An.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold">Khám phá</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Link href="/gioi-thieu">Giới thiệu dự án</Link>
            <Link href="/nhom-ky-nang">Nhóm kỹ năng</Link>
            <Link href="/doi-qua">Đổi quà Time Credit</Link>
            <Link href="/lien-he">Liên hệ</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Nguyên tắc</p>
          <p className="mt-3 text-sm text-white/70">1 giờ hỗ trợ = 1 Time Credit. Không phải tiền mặt, không nạp/rút. Thời gian của ai cũng có giá trị ngang nhau.</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {BRAND.name}. Thí điểm Hà Nội & Nghệ An.
      </div>
    </footer>
  );
}
