import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { ChatRoom } from "@/components/chat-room";
import { one } from "@/lib/utils";
import type { Profile } from "@/types";

export default async function ChatDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile, supabase } = await getSessionUser();
  const { data: tx } = await supabase
    .from("transactions")
    .select("*, requester:profiles!transactions_requester_id_fkey(*), helper:profiles!transactions_helper_id_fkey(*)")
    .eq("conversation_id", id)
    .maybeSingle();
  if (!tx || (user!.id !== tx.requester_id && user!.id !== tx.helper_id)) notFound();
  const other = one(user!.id === tx.requester_id ? tx.helper : tx.requester) as Profile | null;
  if (!other) notFound();
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .neq("sender_id", user!.id)
    .is("read_at", null);

  return <ChatRoom conversationId={id} me={profile as Profile} other={other} initial={messages || []} />;
}
