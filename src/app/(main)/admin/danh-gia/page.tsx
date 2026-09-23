import { getSessionUser } from "@/lib/supabase/server";
import { Card, PageHeader, Stars } from "@/components/ui";
import { adminHideReview } from "@/lib/actions/app";
import { ConfirmForm } from "@/components/forms";
import { one } from "@/lib/utils";

export default async function AdminReviews() {
  const { supabase } = await getSessionUser();
  const { data } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(full_name), reviewee:profiles!reviews_reviewee_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(80);
  return (
    <div>
      <PageHeader title="Đánh giá" />
      <div className="grid gap-3">
        {(data || []).map((r) => (
          <Card key={r.id} className="flex items-start justify-between gap-3">
            <div>
              <Stars value={r.rating} />
              <p className="text-sm">{r.comment}</p>
              <p className="text-xs text-muted">
                {one(r.reviewer)?.full_name} → {one(r.reviewee)?.full_name}
              </p>
            </div>
            <ConfirmForm variant="danger" label="Xóa" confirm="Xóa đánh giá vi phạm." action={adminHideReview.bind(null, r.id)} />
          </Card>
        ))}
      </div>
    </div>
  );
}
