import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";
import { Avatar, Card, Empty, PageHeader } from "@/components/ui";
import { formatDate, one } from "@/lib/utils";

export default async function ChatListPage() {
  const { user, supabase } = await getSessionUser();
  const { data: txs } = await supabase
    .from("transactions")
    .select("id, conversation_id, requester_id, helper_id, status, requester:profiles!transactions_requester_id_fkey(full_name, avatar_url), helper:profiles!transactions_helper_id_fkey(full_name, avatar_url)")
    .or(`requester_id.eq.${user!.id},helper_id.eq.${user!.id}`)
    .not("conversation_id", "is", null)
    .order("created_at", { ascending: false });

  const conversationIds = (txs || []).map((tx) => tx.conversation_id).filter(Boolean) as string[];
  const { data: unreadRows } = conversationIds.length
    ? await supabase.from("messages").select("conversation_id").in("conversation_id", conversationIds).neq("sender_id", user!.id).is("read_at", null)
    : { data: [] as { conversation_id: string }[] };
  const unreadMap = new Map<string, number>();
  (unreadRows || []).forEach((row) => {
    unreadMap.set(row.conversation_id, (unreadMap.get(row.conversation_id) || 0) + 1);
  });

  const items = await Promise.all(
    (txs || []).map(async (tx) => {
      const { data: last } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", tx.conversation_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return { tx, last, unread: unreadMap.get(tx.conversation_id) || 0 };
    })
  );

  return (
    <div>
      <PageHeader kicker="Trao đổi" title="Tin nhắn" />
      {!items.length ? <Empty title="Chưa có cuộc trò chuyện" hint="Kết nối một giao dịch để mở chat." /> : null}
      <div className="grid gap-3">
        {items.map(({ tx, last, unread }) => {
          const other = one(tx.requester_id === user!.id ? tx.helper : tx.requester);
          return (
            <Link key={tx.id} href={`/chat/${tx.conversation_id}`}>
              <Card className="flex items-center gap-4 hover:border-terracotta/40">
                <Avatar name={other?.full_name} src={other?.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className={unread ? "font-bold" : "font-medium"}>{other?.full_name}</p>
                  <p className={`truncate text-sm ${unread ? "font-medium text-ink" : "text-muted"}`}>
                    {last?.body || "Chưa có tin nhắn"}
                  </p>
                </div>
                <div className="grid shrink-0 justify-items-end gap-2">
                  <p className="text-xs text-muted">{last ? formatDate(last.created_at) : ""}</p>
                  {unread > 0 ? (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1.5 text-[11px] font-bold text-white">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
