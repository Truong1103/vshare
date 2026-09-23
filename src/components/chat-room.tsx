"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/lib/actions/app";
import type { Message, Profile } from "@/types";
import { Avatar } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { SubmitButton } from "@/components/forms";

export function ChatRoom({
  conversationId,
  me,
  other,
  initial,
}: {
  conversationId: string;
  me: Profile;
  other: Profile;
  initial: Message[];
}) {
  const [messages, setMessages] = useState(initial);
  const endRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
          if (incoming.sender_id !== me.id) {
            void supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", incoming.id)
              .then(() => router.refresh());
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, me.id, router, supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="grid h-[calc(100vh-10rem)] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-line bg-paper/60 px-5 py-4">
        <Avatar name={other.full_name} src={other.avatar_url} />
        <div>
          <p className="font-semibold">{other.full_name}</p>
          <p className="text-xs text-muted">Trao đổi thời gian, địa điểm và nội dung công việc</p>
        </div>
      </div>
      <div className="space-y-3 overflow-y-auto bg-[#f7fafc] p-5">
        {messages.map((m) => {
          const mine = m.sender_id === me.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-terracotta text-white" : "border border-line bg-white"}`}>
                <p>{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>{formatDate(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form
        ref={formRef}
        className="flex gap-2 border-t border-line bg-white p-3"
        action={async (fd) => {
          await sendMessage(conversationId, fd);
          formRef.current?.reset();
        }}
      >
        <input name="body" className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm" placeholder="Nhắn tin..." />
        <SubmitButton>Gửi</SubmitButton>
      </form>
    </div>
  );
}
