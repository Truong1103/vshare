import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { ListingFields } from "@/components/listing-fields";
import { updateRequest } from "@/lib/actions/app";
import { formAction } from "@/lib/utils";

export default async function EditRequest({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, supabase } = await getSessionUser();
  const [{ data: req }, { data: categories }] = await Promise.all([
    supabase.from("help_requests").select("*").eq("id", id).eq("user_id", user!.id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (!req) notFound();
  return (
    <div>
      <PageHeader title="Sửa yêu cầu" />
      <Card>
        <form action={formAction(updateRequest.bind(null, id))}>
          <ListingFields kind="request" categories={categories || []} defaults={req} />
        </form>
      </Card>
    </div>
  );
}
