import { getSessionUser } from "@/lib/supabase/server";
import { Card, Empty, PageHeader } from "@/components/ui";
import { formAction, formatDate } from "@/lib/utils";
import Link from "next/link";
import { markNotificationsRead } from "@/lib/actions/app";
import { Button } from "@/components/ui";

export default async function NotificationsPage() {
  const { user, supabase } = await getSessionUser();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);
  return (
    <div>
      <PageHeader
        title="Thông báo"
        action={
          <form action={formAction(markNotificationsRead)}>
            <Button type="submit" variant="secondary">
              Đánh dấu đã đọc
            </Button>
          </form>
        }
      />
      {!data?.length ? <Empty title="Chưa có thông báo" /> : null}
      <div className="grid gap-3">
        {(data || []).map((n) => (
          <Link key={n.id} href={n.link || "/thong-bao"}>
            <Card className={n.read_at ? "opacity-70" : "border-terracotta/30"}>
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-muted">{n.body}</p>
              <p className="mt-1 text-xs text-muted">{formatDate(n.created_at)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
