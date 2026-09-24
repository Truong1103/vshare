import { getSessionUser } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function AdminContact() {
  const { supabase } = await getSessionUser();
  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(80);
  return (
    <div>
      <PageHeader kicker="Admin" title="Liên hệ" />
      <div className="grid gap-3">
        {(data || []).map((m) => (
          <Card key={m.id}>
            <p className="font-bold">{m.name}</p>
            <p className="text-sm text-terracotta">{m.email}</p>
            <p className="mt-2 text-sm">{m.body}</p>
            <p className="mt-2 text-xs text-muted">{formatDate(m.created_at)}</p>
          </Card>
        ))}
        {!data?.length ? <p className="text-sm text-muted">Chưa có tin nhắn. Hãy chạy supabase/rewards.sql nếu bảng chưa tạo.</p> : null}
      </div>
    </div>
  );
}
