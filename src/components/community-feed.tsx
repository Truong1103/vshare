import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Handshake, MapPin, Sparkles } from "lucide-react";
import { Avatar, Badge, Stars } from "@/components/ui";
import { MODE_LABEL } from "@/lib/constants";
import { formatCredit, one } from "@/lib/utils";

type FeedItem = {
  id: string;
  title: string;
  description?: string | null;
  area?: string | null;
  mode?: string | null;
  created_at?: string | null;
  time_credit?: number | string | null;
  categories?: { name: string } | { name: string }[] | null;
  profiles?: { full_name?: string | null; avatar_url?: string | null; rating_avg?: number | null } | { full_name?: string | null; avatar_url?: string | null; rating_avg?: number | null }[] | null;
};

function timeAgo(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString("vi-VN");
}

function excerpt(text?: string | null, n = 110) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
}

function FeedCard({
  href,
  item,
  accent,
  meta,
}: {
  href: string;
  item: FeedItem;
  accent: "skill" | "request";
  meta: ReactNode;
}) {
  const owner = one(item.profiles);
  const cat = one(item.categories);
  const featured = accent === "skill" && !!item.description;
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-[0_10px_40px_rgba(11,31,51,0.05)] transition hover:-translate-y-0.5 hover:border-terracotta/40 hover:shadow-[0_18px_50px_rgba(11,31,51,0.1)]"
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${accent === "skill" ? "bg-terracotta" : "bg-sage"}`} />
      <div className="flex items-start justify-between gap-3">
        <Badge tone={accent === "request" ? "sage" : "default"}>{cat?.name || (accent === "skill" ? "Kỹ năng" : "Yêu cầu")}</Badge>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{MODE_LABEL[item.mode || ""] || item.mode}</span>
      </div>
      <h4 className={`mt-3 font-extrabold leading-snug text-ink group-hover:text-terracotta ${featured ? "text-xl" : "text-lg"}`}>
        {item.title}
      </h4>
      {excerpt(item.description) ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{excerpt(item.description)}</p> : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={owner?.full_name} src={owner?.avatar_url} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{owner?.full_name || "Thành viên VShare"}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.area || "Toàn quốc"}
              {timeAgo(item.created_at) ? ` · ${timeAgo(item.created_at)}` : ""}
            </p>
            {owner?.rating_avg ? (
              <p className="text-[11px] leading-none">
                <Stars value={Number(owner.rating_avg)} />
              </p>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">{meta}</div>
      </div>
    </Link>
  );
}

function Column({
  kicker,
  title,
  count,
  href,
  icon: Icon,
  empty,
  children,
}: {
  kicker: string;
  title: string;
  count: number;
  href: string;
  icon: typeof Handshake;
  empty: { title: string; hint: string; cta: string };
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-[28px] border border-line bg-white/80 p-5 shadow-[0_20px_60px_rgba(11,31,51,0.06)] backdrop-blur md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="kicker">{kicker}</p>
          <h3 className="mt-2 flex items-center gap-2 text-2xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-terracotta/10 text-terracotta">
              <Icon className="h-4 w-4" />
            </span>
            {title}
          </h3>
        </div>
        <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink">{count} tin</span>
      </div>
      <div className="grid flex-1 gap-3">{children}</div>
      {!count ? (
        <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-line bg-paper/70 px-6 py-12 text-center">
          <p className="font-bold">{empty.title}</p>
          <p className="mt-1 text-sm text-muted">{empty.hint}</p>
          <Link href="/dang-ky" className="mt-4 inline-flex text-sm font-semibold text-terracotta">
            {empty.cta}
          </Link>
        </div>
      ) : null}
      <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-terracotta">
        Xem tất cả <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function CommunityFeed({
  skills,
  requests,
  skillCount,
  requestCount,
}: {
  skills: FeedItem[];
  requests: FeedItem[];
  skillCount: number;
  requestCount: number;
}) {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_280px_at_10%_0%,rgba(15,143,138,0.12),transparent_55%),radial-gradient(700px_260px_at_90%_20%,rgba(21,101,192,0.1),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-terracotta" />
              </span>
              Trực tiếp từ cộng đồng
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Đang diễn ra trong cộng đồng</h2>
            <p className="mt-2 max-w-xl text-muted">
              Kỹ năng vừa đăng và yêu cầu đang mở — như bảng tin việc làm, nhưng đổi bằng Time Credit, không bằng tiền.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold">{skillCount} kỹ năng đang cho đi</span>
            <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold">{requestCount} người cần hỗ trợ</span>
          </div>
        </div>

        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-2">
          <Column
            kicker="Cho đi"
            title="Kỹ năng đang cho đi"
            count={skillCount}
            href="/tim-kiem?tab=skills"
            icon={Sparkles}
            empty={{ title: "Chưa có kỹ năng", hint: "Hãy là người cho đi đầu tiên.", cta: "Đăng ký và chia sẻ kỹ năng" }}
          >
            {skills.map((s) => (
              <FeedCard
                key={s.id}
                href={`/ky-nang/${s.id}`}
                item={s}
                accent="skill"
                meta={<Handshake className="h-4 w-4 text-terracotta opacity-70" />}
              />
            ))}
          </Column>

          <Column
            kicker="Nhận lại"
            title="Người đang cần hỗ trợ"
            count={requestCount}
            href="/tim-kiem?tab=requests"
            icon={Clock3}
            empty={{ title: "Chưa có yêu cầu", hint: "Khi có người cần giúp, tin sẽ hiện ở đây.", cta: "Tạo hồ sơ để nhận hỗ trợ" }}
          >
            {requests.map((r) => (
              <FeedCard
                key={r.id}
                href={`/yeu-cau/${r.id}`}
                item={r}
                accent="request"
                meta={
                  <p className="text-sm font-extrabold text-sage">
                    {formatCredit(r.time_credit)} <span className="text-[11px] font-bold uppercase tracking-wide">TC</span>
                  </p>
                }
              />
            ))}
          </Column>
        </div>
      </div>
    </section>
  );
}
