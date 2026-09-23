import { getSessionUser } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/ui";
import { ListingFields } from "@/components/listing-fields";
import { createSkill } from "@/lib/actions/app";
import { formAction } from "@/lib/utils";

export default async function NewSkillPage() {
  const { supabase } = await getSessionUser();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div>
      <PageHeader kicker="Cho đi" title="Đăng kỹ năng có thể hỗ trợ" />
      <Card>
        <form action={formAction(createSkill)}>
          <ListingFields kind="skill" categories={categories || []} />
        </form>
      </Card>
    </div>
  );
}
