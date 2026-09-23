import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, PageHeader } from "@/components/ui";
import { adminSetListing } from "@/lib/actions/app";
import { LISTING_LABEL } from "@/lib/constants";
import { ConfirmForm } from "@/components/forms";
import { one } from "@/lib/utils";

export default async function AdminSkills() {
  const { supabase } = await getSessionUser();
  const { data } = await supabase
    .from("skill_posts")
    .select("*, profiles(full_name), categories(name)")
    .order("created_at", { ascending: false })
    .limit(80);
  return (
    <div>
      <PageHeader title="Tin kỹ năng" />
      <div className="grid gap-3">
        {(data || []).map((s) => (
          <Card key={s.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-muted">
                  {one(s.profiles)?.full_name} · {one(s.categories)?.name}
                </p>
                <Badge tone="muted">{LISTING_LABEL[s.status]}</Badge>
              </div>
              <div className="flex gap-2">
                <ConfirmForm label="Ẩn" confirm="Ẩn tin này khỏi cộng đồng." action={adminSetListing.bind(null, "skill", s.id, "hidden")} />
                <ConfirmForm variant="danger" label="Xóa" confirm="Đánh dấu tin đã xóa." action={adminSetListing.bind(null, "skill", s.id, "deleted")} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
