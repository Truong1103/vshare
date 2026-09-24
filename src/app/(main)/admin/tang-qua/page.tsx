import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, PageHeader } from "@/components/ui";
import { adminSetListing } from "@/lib/actions/app";
import { GIFT_LABEL } from "@/lib/constants";
import { ConfirmForm } from "@/components/forms";
import { formatCredit, one } from "@/lib/utils";
import Link from "next/link";

export default async function AdminGifts() {
  const { supabase } = await getSessionUser();
  const { data, error } = await supabase
    .from("gift_posts")
    .select("*, profiles(full_name), gift_categories(name)")
    .order("created_at", { ascending: false })
    .limit(80);
  return (
    <div>
      <PageHeader title="Tin tặng quà" />
      {error ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Chạy <code>supabase/gifts.sql</code>.</p>
      ) : null}
      <div className="grid gap-3">
        {(data || []).map((g) => (
          <Card key={g.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/tang-qua/${g.id}`} className="font-medium hover:text-terracotta">
                  {g.title}
                </Link>
                <p className="text-xs text-muted">
                  {one(g.profiles)?.full_name} · {one(g.gift_categories)?.name} · {formatCredit(g.time_credit)} TC
                </p>
                <Badge tone="muted">{GIFT_LABEL[g.status]}</Badge>
              </div>
              <div className="flex gap-2">
                <ConfirmForm label="Ẩn" confirm="Ẩn tin tặng quà." action={adminSetListing.bind(null, "gift", g.id, "hidden")} />
                <ConfirmForm variant="danger" label="Xóa" confirm="Đánh dấu đã xóa." action={adminSetListing.bind(null, "gift", g.id, "deleted")} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
