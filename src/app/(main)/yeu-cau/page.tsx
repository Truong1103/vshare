import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";
import { Empty, PageHeader, Badge, Card, LinkButton } from "@/components/ui";
import { REQUEST_LABEL } from "@/lib/constants";
import { formatCredit } from "@/lib/utils";

export default async function RequestsPage() {
  const { user, supabase } = await getSessionUser();
  const { data } = await supabase
    .from("help_requests")
    .select("*, categories(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });
  return (
    <div>
      <PageHeader kicker="Nhận lại" title="Yêu cầu hỗ trợ của tôi" action={<LinkButton href="/yeu-cau/moi">Đăng yêu cầu</LinkButton>} />
      {!data?.length ? <Empty title="Chưa có yêu cầu" hint="Đăng nhu cầu khi bạn cần được hỗ trợ." /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {(data || []).map((r) => (
          <Card key={r.id}>
            <div className="flex justify-between">
              <Badge tone="sage">{formatCredit(r.time_credit)} TC</Badge>
              <Badge tone="muted">{REQUEST_LABEL[r.status]}</Badge>
            </div>
            <h3 className="mt-2 text-xl font-bold">{r.title}</h3>
            <p className="line-clamp-3 text-sm text-muted">{r.description}</p>
            <Link href={`/yeu-cau/${r.id}`} className="mt-3 inline-block text-sm font-semibold text-terracotta">
              Chi tiết
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
