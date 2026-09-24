import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { GiftFields } from "@/components/gift-fields";
import { deleteGift, updateGift } from "@/lib/actions/app";
import { formAction } from "@/lib/utils";
import { ConfirmForm } from "@/components/forms";

export default async function EditGift({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, supabase } = await getSessionUser();
  const [{ data: gift }, { data: categories }] = await Promise.all([
    supabase.from("gift_posts").select("*").eq("id", id).eq("user_id", user!.id).maybeSingle(),
    supabase.from("gift_categories").select("*").order("sort_order"),
  ]);
  if (!gift) notFound();
  return (
    <div>
      <PageHeader title="Sửa tin tặng quà" />
      <Card>
        <form action={formAction(updateGift.bind(null, id))}>
          <GiftFields categories={categories || []} defaults={gift} />
        </form>
        <div className="mt-6">
          <ConfirmForm variant="danger" label="Xóa tin" confirm="Tin sẽ được ẩn khỏi cộng đồng." action={deleteGift.bind(null, id)} />
        </div>
      </Card>
    </div>
  );
}
