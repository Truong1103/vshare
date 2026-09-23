import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { ListingFields } from "@/components/listing-fields";
import { deleteSkill, updateSkill } from "@/lib/actions/app";
import { formAction } from "@/lib/utils";
import { ConfirmForm } from "@/components/forms";

export default async function EditSkill({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, supabase } = await getSessionUser();
  const [{ data: skill }, { data: categories }] = await Promise.all([
    supabase.from("skill_posts").select("*").eq("id", id).eq("user_id", user!.id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (!skill) notFound();
  return (
    <div>
      <PageHeader title="Sửa tin kỹ năng" />
      <Card>
        <form action={formAction(updateSkill.bind(null, id))}>
          <ListingFields kind="skill" categories={categories || []} defaults={skill} />
        </form>
        <div className="mt-6">
          <ConfirmForm
            variant="danger"
            label="Xóa tin"
            confirm="Tin sẽ được ẩn khỏi cộng đồng."
            action={deleteSkill.bind(null, id)}
          />
        </div>
      </Card>
    </div>
  );
}
