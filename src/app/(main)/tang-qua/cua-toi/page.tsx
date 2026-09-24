import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";
import { Empty, PageHeader, Badge, Card, LinkButton } from "@/components/ui";
import { GIFT_LABEL } from "@/lib/constants";
import { formatCredit, one } from "@/lib/utils";

export default async function MyGiftsPage() {
  const { user, supabase } = await getSessionUser();
  const { data, error } = await supabase
    .from("gift_posts")
    .select("*, gift_categories(name)")
    .eq("user_id", user!.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });
  return (
    <div>
      <PageHeader
        kicker="Tặng quà"
        title="Món đồ của tôi"
        action={<LinkButton href="/tang-qua/moi">Đăng món đồ</LinkButton>}
      />
      {error ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Chạy <code>supabase/gifts.sql</code> trên Supabase.</p>
      ) : null}
      <div className="mb-4 flex gap-3 text-sm">
        <Link href="/tang-qua" className="text-muted hover:text-ink">
          Cộng đồng
        </Link>
        <Link href="/tang-qua/cua-toi" className="font-semibold text-terracotta">
          Quà của tôi
        </Link>
      </div>
      {!data?.length && !error ? <Empty title="Bạn chưa đăng món nào" hint="Tặng lại đồ không còn dùng để lấy Time Credit." /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {(data || []).map((g) => (
          <Card key={g.id}>
            <div className="flex justify-between gap-2">
              <Badge>{one(g.gift_categories)?.name || "Tặng quà"}</Badge>
              <Badge tone="muted">{GIFT_LABEL[g.status]}</Badge>
            </div>
            <h3 className="mt-2 text-xl font-bold">{g.title}</h3>
            <p className="mt-1 text-sm text-muted">{formatCredit(g.time_credit)} TC · {g.area || "Thỏa thuận"}</p>
            <Link href={`/tang-qua/${g.id}`} className="mt-3 inline-block text-sm font-semibold text-terracotta">
              Quản lý tin
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
