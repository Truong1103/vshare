import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/shell";
import { getSessionUser } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { hasSupabaseEnv } from "@/lib/env";
import { FullBanner } from "@/components/brand";
import { FloatingBubbles } from "@/components/floating-bubbles";
import { HeartHandshake, Landmark, Target, Users } from "lucide-react";

export default async function AboutPage() {
  let user: { id: string } | null = null;
  if (hasSupabaseEnv()) {
    const ctx = await getSessionUser();
    user = ctx.user;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <FloatingBubbles />
      <div className="relative z-10">
      <PublicHeader authed={!!user} />
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <FullBanner src="/banner1.png" alt="Giới thiệu VShare – Ngân hàng Thời gian" priority />
        <div className="mt-8">
          <p className="kicker">Giới thiệu dự án</p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">{BRAND.fullName}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-14">
        <section className="max-w-3xl">
          <p className="text-xl font-semibold text-terracotta">{BRAND.slogan}</p>
          <p className="mt-4 leading-7 text-muted">
            {BRAND.field}. Mô hình vận hành là {BRAND.model}: người tham gia đóng góp thời gian và kỹ năng để tích lũy tín chỉ thời gian (Time Credit), rồi dùng tín chỉ đó nhận lại sự trợ giúp từ thành viên khác.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <Landmark className="h-6 w-6 text-terracotta" />
            <h2 className="mt-3 text-lg font-bold">Bối cảnh</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Sinh viên, người trẻ, người cao tuổi có kiến thức hoặc thời gian rảnh nhưng thiếu nền tảng để chia sẻ. Nhiều người cần trợ giúp lại vướng rào cản chi phí.
            </p>
          </Card>
          <Card>
            <HeartHandshake className="h-6 w-6 text-terracotta" />
            <h2 className="mt-3 text-lg font-bold">Giải pháp</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              VShare tạo sàn trao đổi công bằng, phi tiền tệ — nơi thời gian và sự hỗ trợ của mỗi cá nhân đều có giá trị ngang nhau.
            </p>
          </Card>
          <Card>
            <Users className="h-6 w-6 text-terracotta" />
            <h2 className="mt-3 text-lg font-bold">Thí điểm</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Giai đoạn này chỉ triển khai thử nghiệm tại Hà Nội và Nghệ An, gồm cả hỗ trợ trực tuyến và gặp mặt trực tiếp.
            </p>
          </Card>
        </section>

        <section>
          <p className="kicker">Mục tiêu</p>
          <h2 className="mt-3 text-3xl font-extrabold">Xã hội · Nền tảng · Phát triển</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <Target className="h-5 w-5 text-sage" />
              <h3 className="mt-3 font-bold">Mục tiêu xã hội</h3>
              <p className="mt-2 text-sm text-muted">Thúc đẩy văn hóa chia sẻ, bình đẳng và tương trợ lẫn nhau.</p>
            </Card>
            <Card>
              <Target className="h-5 w-5 text-sage" />
              <h3 className="mt-3 font-bold">Mục tiêu nền tảng</h3>
              <p className="mt-2 text-sm text-muted">
                Hệ sinh thái kết nối tri thức và kỹ năng (gia sư, thiết kế, kỹ thuật, truyền thông, chăm sóc xã hội) minh bạch, tiện lợi.
              </p>
            </Card>
            <Card>
              <Target className="h-5 w-5 text-sage" />
              <h3 className="mt-3 font-bold">Mục tiêu phát triển</h3>
              <p className="mt-2 text-sm text-muted">
                Tối ưu quản lý Time Credit, mở rộng liên kết trường học, câu lạc bộ và tổ chức xã hội.
              </p>
            </Card>
          </div>
        </section>

        <section>
          <p className="kicker">Video</p>
          <h2 className="mt-3 text-3xl font-extrabold">Nghe câu chuyện VShare</h2>
          <div className="mt-6 overflow-hidden rounded-[28px] border border-line bg-black">
            <video className="aspect-video w-full" controls poster="/banner2.png" preload="metadata">
              <source src="/video_gioithieuduan.mp4" type="video/mp4" />
            </video>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dang-ky" className="rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white">
            Tham gia cộng đồng
          </Link>
          <Link href="/lien-he" className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold">
            Liên hệ
          </Link>
        </div>
      </div>
      <PublicFooter />
      </div>
    </div>
  );
}
