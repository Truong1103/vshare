import { getSessionUser } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/ui";
import { ListingFields } from "@/components/listing-fields";
import { createRequest } from "@/lib/actions/app";
import { formAction } from "@/lib/utils";

export default async function NewRequestPage() {
  const { supabase } = await getSessionUser();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div>
      <PageHeader kicker="Nhận lại" title="Đăng yêu cầu cần hỗ trợ" />
      <Card>
        <p className="mb-4 text-sm text-muted">Time Credit = số giờ hỗ trợ. Ví dụ 30 phút = 0,5 TC; 2 giờ = 2 TC.</p>
        <form action={formAction(createRequest)}>
          <ListingFields kind="request" categories={categories || []} />
        </form>
      </Card>
    </div>
  );
}
