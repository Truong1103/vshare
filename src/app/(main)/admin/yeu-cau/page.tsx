import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, PageHeader } from "@/components/ui";
import { adminSetListing } from "@/lib/actions/app";
import { REQUEST_LABEL } from "@/lib/constants";
import { ConfirmForm } from "@/components/forms";
import { one } from "@/lib/utils";

export default async function AdminRequests() {
  const { supabase } = await getSessionUser();
  const { data } = await supabase
    .from("help_requests")
    .select("*, profiles(full_name), categories(name)")
    .order("created_at", { ascending: false })
    .limit(80);
  return (
    <div>
      <PageHeader title="Yêu cầu hỗ trợ" />
      <div className="grid gap-3">
        {(data || []).map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted">
                  {one(r.profiles)?.full_name} · {r.time_credit} TC
                </p>
                <Badge>{REQUEST_LABEL[r.status]}</Badge>
              </div>
              <div className="flex gap-2">
                <ConfirmForm label="Ẩn" confirm="Ẩn yêu cầu này." action={adminSetListing.bind(null, "request", r.id, "hidden")} />
                <ConfirmForm variant="danger" label="Hủy" confirm="Hủy yêu cầu này." action={adminSetListing.bind(null, "request", r.id, "cancelled")} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
