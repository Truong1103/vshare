import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/ui";
import { GiftFields } from "@/components/gift-fields";
import { createGift } from "@/lib/actions/app";
import { formAction } from "@/lib/utils";

export default async function NewGiftPage() {
  const { user, supabase } = await getSessionUser();
  if (!user) redirect("/dang-nhap");
  const { data: categories } = await supabase.from("gift_categories").select("*").order("sort_order");
  return (
    <div>
      <PageHeader kicker="Tặng quà" title="Đăng món đồ muốn tặng" />
      <Card>
        <p className="mb-4 text-sm text-muted">
          Tối đa 4 ảnh và 1 video. Số Time Credit là mức bạn muốn nhận khi tặng — người nhận phải đủ số dư, tín chỉ chỉ chuyển khi hai bên xác nhận đã giao nhận.
        </p>
        <form action={formAction(createGift)}>
          <GiftFields categories={categories || []} />
        </form>
      </Card>
    </div>
  );
}
