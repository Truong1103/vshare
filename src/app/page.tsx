import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/shell";
import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card } from "@/components/ui";
import { MODE_LABEL } from "@/lib/constants";
import { formatCredit } from "@/lib/utils";
import { hasSupabaseEnv } from "@/lib/env";
import { FlowDiagram, HeroDashboard, IconBox } from "@/components/brand";
import {
  ArrowRight,
  Clock,
  Handshake,
  HeartHandshake,
  MessagesSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

const FEATURES = [
  { icon: Sparkles, title: "Đăng kỹ năng", body: "Chia sẻ điều bạn làm tốt: dạy học, sửa chữa, thiết kế, lắng nghe." },
  { icon: Search, title: "Tìm & lọc", body: "Tìm người hỗ trợ hoặc nhu cầu theo danh mục, khu vực, online/offline." },
  { icon: Handshake, title: "Kết nối hai bên", body: "Nhận hỗ trợ, thống nhất thời gian và nội dung công việc." },
  { icon: MessagesSquare, title: "Chat nội bộ", body: "Trao đổi realtime ngay trên nền tảng, không cần ứng dụng khác." },
  { icon: Wallet, title: "Time Credit minh bạch", body: "Cộng/trừ tự động khi cả hai xác nhận, có lịch sử đầy đủ." },
  { icon: ShieldCheck, title: "Uy tín cộng đồng", body: "Đánh giá 1–5 sao sau giao dịch, hồ sơ công khai, báo cáo nội dung." },
];

const PROBLEMS = [
  { title: "Rào cản tài chính", body: "Nhiều người cần hỗ trợ nhưng không phải lúc nào cũng chi trả bằng tiền." },
  { title: "Kỹ năng bị lãng phí", body: "Thời gian rảnh, kinh nghiệm sống và nghề nghiệp chưa được kết nối." },
  { title: "Cho đi một chiều", body: "Người nhận mãi là người nhận. VShare hướng tới trao đổi hai chiều." },
];

const STEPS = [
  { n: "01", title: "Tạo hồ sơ", body: "Đăng ký, thêm kỹ năng và khu vực hoạt động." },
  { n: "02", title: "Cho đi hoặc đăng nhu cầu", body: "Đăng kỹ năng, hoặc tạo yêu cầu khi cần hỗ trợ." },
  { n: "03", title: "Kết nối & chat", body: "Hai bên thống nhất thời gian, địa điểm, nội dung." },
  { n: "04", title: "Xác nhận hoàn thành", body: "Cả hai bấm xác nhận. Time Credit được chuyển đúng một lần." },
  { n: "05", title: "Đánh giá & tích lũy", body: "Xây uy tín, dùng điểm để nhận lại sự hỗ trợ." },
];

export default async function HomePage() {
  let user: { id: string } | null = null;
  let skills: any[] = [];
  let requests: any[] = [];
  let categories: any[] = [];

  if (hasSupabaseEnv()) {
    const ctx = await getSessionUser();
    user = ctx.user;
    const results = await Promise.all([
      ctx.supabase
        .from("skill_posts")
        .select("id, title, area, mode, categories(name), profiles(full_name)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6),
      ctx.supabase
        .from("help_requests")
        .select("id, title, time_credit, area, mode, categories(name)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(6),
      ctx.supabase.from("categories").select("*").order("sort_order"),
    ]);
    skills = results[0].data || [];
    requests = results[1].data || [];
    categories = results[2].data || [];
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader authed={!!user} />

      <section className="grain grid-bg relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="kicker">Nền tảng cộng đồng · Time Credit</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.12] md:text-6xl">
              Tập trung kỹ năng cộng đồng,{" "}
              <span className="text-terracotta">làm chủ thời gian</span> của bạn
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
              VShare kết nối người có kỹ năng với người đang cần hỗ trợ. 1 giờ hỗ trợ = 1 Time Credit — không dùng tiền mặt, không nạp rút.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dang-ky" className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-6 py-3 font-semibold text-white shadow-lg shadow-terracotta/25">
                Dùng thử ngay <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/tim-kiem" className="inline-flex items-center rounded-xl border border-line bg-white px-6 py-3 font-semibold">
                Xem tính năng
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium text-ink/70">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-terracotta" /> Điểm nội bộ, minh bạch</span>
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-sage" /> Ai cũng cho đi & nhận lại</span>
            </div>
          </div>
          <HeroDashboard />
        </div>
      </section>

      <section className="border-y border-line bg-paper py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-4">
          {[
            { v: "1h = 1 TC", l: "Quy tắc cốt lõi" },
            { v: "2 TC", l: "Thưởng chào mừng" },
            { v: "2 chiều", l: "Cho đi và nhận lại" },
            { v: "0 đồng", l: "Không thanh toán tiền" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-extrabold text-ink">{s.v}</p>
              <p className="mt-1 text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="giai-phap" className="mx-auto max-w-6xl px-4 py-20">
        <p className="kicker">Tổng quan giải pháp</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold md:text-4xl">Toàn cảnh VShare: từ kỹ năng rời rạc đến sự hỗ trợ đúng lúc</h2>
        <p className="mt-3 max-w-2xl text-muted">Nhanh hơn, công bằng hơn, không cần tiền mặt.</p>
        <div className="mt-10">
          <FlowDiagram />
        </div>
      </section>

      <section className="bg-paper py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="kicker">Giá trị cốt lõi</p>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Vì sao cộng đồng chọn VShare</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PROBLEMS.map((p) => (
              <Card key={p.title} className="p-7">
                <IconBox><HeartHandshake className="h-6 w-6" /></IconBox>
                <h3 className="mt-4 text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{p.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="cach-tham-gia" className="mx-auto max-w-6xl px-4 py-20">
        <p className="kicker">Quy trình</p>
        <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">VShare hoạt động như thế nào?</h2>
        <p className="mt-3 text-muted">Từ hồ sơ đến Time Credit, chỉ trong năm bước.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm font-extrabold text-terracotta">{s.n}</p>
              <h3 className="mt-2 font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tinh-nang" className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-terracotta">Tính năng</p>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Tính năng nổi bật</h2>
          <p className="mt-3 max-w-2xl text-white/65">Đầy đủ công cụ để cho đi kỹ năng, nhận hỗ trợ và quản lý Time Credit.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <f.icon className="h-6 w-6 text-terracotta" />
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{f.body}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-terracotta/30 to-sage/20 p-5 md:col-span-2">
              <Clock className="h-6 w-6" />
              <h3 className="mt-4 text-xl font-bold">1 giờ hỗ trợ = 1 Time Credit</h3>
              <p className="mt-2 text-sm text-white/75">30 phút = 0,5 TC. Hệ thống khóa số dư âm và không cho hoàn thành trùng một giao dịch.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="kicker">Bạn có thể cho đi gì?</p>
        <h2 className="mt-3 text-3xl font-extrabold">Các kỹ năng phổ biến</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {(categories.length ? categories : [{ id: "x", name: "Dạy học" }, { id: "y", name: "Sửa máy tính" }, { id: "z", name: "Lắng nghe" }]).map((c) => (
            <Badge key={c.id}>{c.name}</Badge>
          ))}
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-bold">Kỹ năng gần đây</h3>
            <div className="mt-4 grid gap-3">
              {(skills || []).map((s) => (
                <Card key={s.id}>
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {s.profiles?.full_name} · {s.categories?.name} · {MODE_LABEL[s.mode]}
                  </p>
                </Card>
              ))}
              {!skills?.length ? <p className="text-sm text-muted">Chưa có tin. Hãy là người đăng đầu tiên.</p> : null}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold">Yêu cầu hỗ trợ gần đây</h3>
            <div className="mt-4 grid gap-3">
              {(requests || []).map((r) => (
                <Card key={r.id}>
                  <p className="font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatCredit(r.time_credit)} TC · {r.area} · {MODE_LABEL[r.mode]}
                  </p>
                </Card>
              ))}
              {!requests?.length ? <p className="text-sm text-muted">Chưa có yêu cầu hỗ trợ.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Khám phá VShare ngay hôm nay</h2>
          <p className="mt-3 text-muted">Đăng ký, nhận 2 Time Credit chào mừng, và bắt đầu cho đi.</p>
          <Link href="/dang-ky" className="mt-6 inline-flex rounded-xl bg-terracotta px-6 py-3 font-semibold text-white">
            Bắt đầu miễn phí
          </Link>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
