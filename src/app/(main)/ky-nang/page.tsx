import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";
import { Empty, PageHeader, Badge, Card, LinkButton } from "@/components/ui";
import { LISTING_LABEL, MODE_LABEL } from "@/lib/constants";
import { one } from "@/lib/utils";

export default async function SkillsPage() {
  const { user, supabase } = await getSessionUser();
  const { data } = await supabase
    .from("skill_posts")
    .select("*, categories(name)")
    .eq("user_id", user!.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });
  return (
    <div>
      <PageHeader
        kicker="Cho đi"
        title="Kỹ năng của tôi"
        action={<LinkButton href="/ky-nang/moi">Đăng kỹ năng</LinkButton>}
      />
      {!data?.length ? <Empty title="Bạn chưa đăng kỹ năng" hint="Hãy chia sẻ điều bạn làm tốt." /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {(data || []).map((s) => (
          <Card key={s.id}>
            <div className="flex justify-between">
              <Badge>{one(s.categories)?.name}</Badge>
              <Badge tone="muted">{LISTING_LABEL[s.status]}</Badge>
            </div>
            <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
            <p className="line-clamp-3 text-sm text-muted">{s.description}</p>
            <p className="mt-2 text-xs text-muted">
              {s.area} · {MODE_LABEL[s.mode]}
            </p>
            <Link href={`/ky-nang/${s.id}`} className="mt-3 inline-block text-sm font-semibold text-terracotta">
              Chi tiết
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
