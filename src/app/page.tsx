import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/shell";
import { getSessionUser } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { MODE_LABEL } from "@/lib/constants";
import { formatCredit, one } from "@/lib/utils";
import { hasSupabaseEnv } from "@/lib/env";
import { FlowDiagram, CroppedBanner, IconBox } from "@/components/brand";
import { FloatingBubbles } from "@/components/floating-bubbles";
import { BRAND, SKILL_GROUPS, GIFT_CATALOG } from "@/lib/brand";
import {
  ArrowRight,
  Gift,
  HeartHandshake,
  MapPin,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const VALUES = [
  {
    icon: Scale,
    title: "Bình đẳng thời gian",
    body: "Một giờ của sinh viên, người trẻ hay người cao tuổi đều đổi thành 1 Time Credit. Không định giá bằng tiền.",
  },
  {
    icon: HeartHandshake,
    title: "Tương trợ hai chiều",
    body: "Ai cũng có thể cho đi và ai cũng được nhận lại. Người nhận hôm nay có thể là người cho đi ngày mai.",
  },
  {
    icon: Users,
    title: "Kết nối tri thức cộng đồng",
    body: "Gia sư, thiết kế, kỹ thuật, truyền thông, chăm sóc xã hội — hệ sinh thái kỹ năng minh bạch, tiện lợi.",
  },
];

const STEPS = [
  { n: "01", title: "Đăng ký & chia sẻ", body: "Tạo hồ sơ, đăng kỹ năng hoặc quỹ thời gian rảnh cho cộng đồng." },
  { n: "02", title: "Tích lũy tín chỉ", body: "Mỗi giờ hỗ trợ người khác = 1 Time Credit vào tài khoản." },
  { n: "03", title: "Đổi nhận trợ giúp", body: "Dùng tín chỉ để nhận hướng dẫn, hỗ trợ hoặc dịch vụ từ thành viên khác." },
  { n: "04", title: "Lan tỏa nhân văn", body: "Đánh giá uy tín, đổi quà cộng đồng, kết nối trường học và CLB." },
];

export default async function HomePage() {
  let user: { id: string } | null = null;
  let skills: any[] = [];
  let requests: any[] = [];

  if (hasSupabaseEnv()) {
    const ctx = await getSessionUser();
    user = ctx.user;
    const results = await Promise.all([
      ctx.supabase
        .from("skill_posts")
        .select("id, title, area, mode, categories(name), profiles(full_name)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4),
      ctx.supabase
        .from("help_requests")
        .select("id, title, time_credit, area, mode, categories(name)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);
    skills = results[0].data || [];
    requests = results[1].data || [];
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <FloatingBubbles />
      <div className="relative z-10">
      <PublicHeader authed={!!user} />

      <section className="grain relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <p className="kicker">{BRAND.model}</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.12] md:text-5xl">
              {BRAND.fullName}
            </h1>
            <p className="mt-4 text-xl font-semibold text-terracotta">{BRAND.slogan}</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Nền tảng trao đổi công bằng, phi tiền tệ. Bạn đóng góp thời gian và kỹ năng để tích lũy Time Credit, rồi dùng tín chỉ đó nhận lại sự trợ giúp từ cộng đồng. Thí điểm tại <strong>Hà Nội</strong> và <strong>Nghệ An</strong>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dang-ky" className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-6 py-3 font-semibold text-white shadow-lg shadow-terracotta/25">
                Tham gia ngay <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/gioi-thieu" className="inline-flex items-center rounded-xl border border-line bg-white px-6 py-3 font-semibold">
                Giới thiệu dự án
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-ink/70">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-terracotta" /> 1 giờ = 1 Time Credit
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sage" /> Hà Nội · Nghệ An
              </span>
            </div>
          </div>
          <CroppedBanner src="/banner1.png" alt="Cộng đồng VShare chia sẻ kỹ năng" priority />
        </div>
      </section>

      <section className="border-y border-line bg-paper py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-4">
          {[
            { v: "1h = 1 TC", l: "Quy tắc cốt lõi" },
            { v: "Phi tiền tệ", l: "Không nạp, không rút" },
            { v: "2 địa phương", l: "Thí điểm HN & Nghệ An" },
            { v: "2 chiều", l: "Cho đi và nhận lại" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-extrabold text-ink">{s.v}</p>
              <p className="mt-1 text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="kicker">Giá trị nhân văn</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-extrabold md:text-4xl">Thời gian của bạn có giá trị — dù bạn là ai</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Nhiều người có kỹ năng và thời gian rảnh nhưng thiếu nơi kết nối; nhiều người cần trợ giúp nhưng vướng rào cản chi phí. VShare san đều giá trị đó.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {VALUES.map((p) => (
            <Card key={p.title} className="p-7">
              <IconBox>
                <p.icon className="h-6 w-6" />
              </IconBox>
              <h3 className="mt-4 text-xl font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{p.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="kicker">Câu chuyện dự án</p>
          <h2 className="mt-3 text-3xl font-extrabold">Video giới thiệu VShare</h2>
          <p className="mt-2 max-w-2xl text-muted">Xem cách Ngân hàng Thời gian vận hành: cho đi kỹ năng, tích lũy tín chỉ, nhận lại sự hỗ trợ.</p>
          <div className="mt-8 overflow-hidden rounded-[28px] border border-line bg-black shadow-lg">
            <video className="aspect-video w-full" controls poster="/banner1.png" preload="metadata">
              <source src="/video_gioithieuduan.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="kicker">Cơ chế vận hành</p>
        <h2 className="mt-3 text-3xl font-extrabold">Từ cho đi đến nhận lại</h2>
        <div className="mt-8">
          <FlowDiagram />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm font-extrabold text-terracotta">{s.n}</p>
              <h3 className="mt-2 font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-terracotta">Nhóm kỹ năng</p>
          <h2 className="mt-3 text-3xl font-extrabold">Đa dạng kỹ năng, online và trực tiếp</h2>
          <p className="mt-3 max-w-2xl text-white/65">Mỗi nhóm đều có hình thức từ xa và gặp mặt tại Hà Nội / Nghệ An.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {SKILL_GROUPS.map((g) => (
              <Link key={g.id} href={`/tim-kiem?q=${encodeURIComponent(g.query)}&tab=all`} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10">
                <h3 className="font-bold">{g.name}</h3>
                <p className="mt-2 text-sm text-white/65">{g.blurb}</p>
                <p className="mt-3 text-xs text-terracotta">Online · {g.online[0]}</p>
                <p className="text-xs text-white/55">Trực tiếp · {g.offline[0]}</p>
              </Link>
            ))}
          </div>
          <Link href="/nhom-ky-nang" className="mt-8 inline-flex items-center gap-2 font-semibold text-terracotta">
            Xem toàn bộ nhóm kỹ năng <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="kicker">Đổi quà Time Credit</p>
            <h2 className="mt-3 text-3xl font-extrabold">Tín chỉ không phải tiền — vẫn có thể tri ân</h2>
            <p className="mt-3 text-muted">
              Dùng Time Credit đổi sổ tay, vé workshop, phiên lắng nghe hoặc góp cây xanh. Quà cộng đồng, không mua bán.
            </p>
            <div className="mt-6 grid gap-3">
              {GIFT_CATALOG.slice(0, 3).map((g) => (
                <div key={g.slug} className="flex items-center justify-between rounded-2xl border border-line bg-white/80 px-4 py-3">
                  <div>
                    <p className="font-semibold">{g.title}</p>
                    <p className="text-xs text-muted">{g.cost} TC</p>
                  </div>
                  <Gift className="h-4 w-4 text-terracotta" />
                </div>
              ))}
            </div>
            <Link href="/doi-qua" className="mt-6 inline-flex rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white">
              Xem danh mục đổi quà
            </Link>
          </div>
          <CroppedBanner src="/banner2.png" alt="Kết nối những con người tử tế" />
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold">Đang diễn ra trong cộng đồng</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold">Kỹ năng đang cho đi</h3>
              <div className="mt-4 grid gap-3">
                {skills.map((s) => (
                  <Card key={s.id}>
                    <p className="font-semibold">{s.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {one(s.profiles)?.full_name} · {one(s.categories)?.name} · {MODE_LABEL[s.mode]}
                    </p>
                  </Card>
                ))}
                {!skills.length ? <p className="text-sm text-muted">Chưa có tin. Hãy là người cho đi đầu tiên.</p> : null}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold">Người đang cần hỗ trợ</h3>
              <div className="mt-4 grid gap-3">
                {requests.map((r) => (
                  <Card key={r.id}>
                    <p className="font-semibold">{r.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {formatCredit(r.time_credit)} TC · {r.area} · {MODE_LABEL[r.mode]}
                    </p>
                  </Card>
                ))}
                {!requests.length ? <p className="text-sm text-muted">Chưa có yêu cầu hỗ trợ.</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-paper py-16">
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-terracotta" />
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">Bắt đầu cho đi một giờ hôm nay</h2>
          <p className="mt-3 text-muted">Nhận 2 Time Credit chào mừng. Thí điểm Hà Nội và Nghệ An.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/dang-ky" className="inline-flex rounded-xl bg-terracotta px-6 py-3 font-semibold text-white">
              Đăng ký thành viên
            </Link>
            <Link href="/lien-he" className="inline-flex rounded-xl border border-line bg-white px-6 py-3 font-semibold">
              Liên hệ ban điều hành
            </Link>
          </div>
        </div>
      </section>
      <PublicFooter />
      </div>
    </div>
  );
}
