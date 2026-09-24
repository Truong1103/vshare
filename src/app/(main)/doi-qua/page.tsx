import { getSessionUser } from "@/lib/supabase/server";
import { Card, Empty, PageHeader, Badge } from "@/components/ui";
import { redeemReward } from "@/lib/actions/app";
import { ConfirmForm } from "@/components/forms";
import { GIFT_CATALOG } from "@/lib/brand";
import { formatCredit, formatDate } from "@/lib/utils";
import { Gift } from "lucide-react";
import Link from "next/link";
import { FullBanner } from "@/components/brand";
import { FloatingBubbles } from "@/components/floating-bubbles";

type GiftItem = { slug: string; title: string; description: string; cost: number; stock: number };
type Redemption = { id: string; cost: number; status: string; created_at: string; title: string };

export default async function RewardsPage() {
  const { user, profile, supabase } = await getSessionUser();
  let catalog: GiftItem[] = GIFT_CATALOG.map((g) => ({ ...g }));
  let live = false;
  let mine: Redemption[] = [];

  const rewardsRes = await supabase.from("rewards").select("slug, title, description, cost, stock").eq("is_active", true).order("cost");
  if (!rewardsRes.error && rewardsRes.data?.length) {
    live = true;
    catalog = rewardsRes.data.map((r) => ({
      slug: String(r.slug),
      title: String(r.title),
      description: String(r.description || ""),
      cost: Number(r.cost),
      stock: Number(r.stock),
    }));
  }

  if (live && user) {
    const redRes = await supabase
      .from("reward_redemptions")
      .select("id, cost, status, created_at, reward_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!redRes.error && redRes.data?.length) {
      const ids = redRes.data.map((r) => r.reward_id).filter(Boolean);
      const titles = new Map<string, string>();
      if (ids.length) {
        const titleRes = await supabase.from("rewards").select("id, title").in("id", ids);
        (titleRes.data || []).forEach((row) => titles.set(row.id, row.title));
      }
      mine = redRes.data.map((r) => ({
        id: r.id,
        cost: Number(r.cost),
        status: String(r.status),
        created_at: r.created_at,
        title: titles.get(r.reward_id) || "Quà Time Credit",
      }));
    }
  }

  return (
    <div className="relative overflow-hidden">
      <FloatingBubbles />
      <div className="relative z-10">
        <FullBanner src="/banner2.png" alt="Đổi quà Time Credit VShare" className="mb-8" />
        <PageHeader
          kicker="Đổi quà"
          title="Danh mục đổi Time Credit"
          action={
            <p className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold">
              Số dư {formatCredit(profile?.time_credit)} TC
            </p>
          }
        />
        <p className="mb-6 max-w-2xl text-sm text-muted">
          Time Credit không phải tiền mặt. Bạn đổi tín chỉ lấy quà tri ân cộng đồng — sổ tay, workshop Hà Nội / Nghệ An, lắng nghe, góp cây xanh.
        </p>
        {!live ? (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Danh mục đang xem trước. Chạy file <code>supabase/rewards.sql</code> trên Supabase để đổi quà thật.
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {catalog.map((g) => (
            <Card key={g.slug} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <Gift className="h-8 w-8 text-terracotta" />
                <Badge>{formatCredit(g.cost)} TC</Badge>
              </div>
              <h2 className="mt-3 text-xl font-bold">{g.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted">{g.description}</p>
              <p className="mt-3 text-xs text-muted">Còn {g.stock} suất</p>
              <div className="mt-4">
                {!live || g.stock < 1 ? (
                  <p className="text-sm text-muted">{g.stock < 1 ? "Tạm hết" : "Chưa mở đổi"}</p>
                ) : (
                  <ConfirmForm
                    label="Đổi quà"
                    confirm={`Dùng ${g.cost} Time Credit để đổi “${g.title}”? Số dư không hoàn lại.`}
                    action={() => redeemReward(g.slug)}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-10">
          <h2 className="text-lg font-bold">Lượt đổi của bạn</h2>
          <div className="mt-3 space-y-2">
            {mine.map((r) => (
              <Card key={r.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted">{formatDate(r.created_at)}</p>
                </div>
                <Badge tone={r.status === "fulfilled" ? "sage" : "muted"}>{r.status}</Badge>
              </Card>
            ))}
            {!mine.length ? <Empty title="Chưa đổi quà nào" hint="Cho đi thời gian, tích lũy tín chỉ, rồi quay lại đây." /> : null}
          </div>
        </div>
        <p className="mt-6 text-sm">
          <Link href="/vi" className="font-semibold text-terracotta">
            Xem ví Time Credit
          </Link>
        </p>
      </div>
    </div>
  );
}
