"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function formatCount(n: number) {
  if (n > 99) return "99+";
  return String(n);
}

export function ChatNavLink({ userId, initial }: { userId: string; initial: number }) {
  const pathname = usePathname();
  const [count, setCount] = useState(initial);
  const supabase = useMemo(() => createClient(), []);

  const refresh = useCallback(async () => {
    const { count: next } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .neq("sender_id", userId)
      .is("read_at", null);
    setCount(next || 0);
  }, [supabase, userId]);

  useEffect(() => {
    setCount(initial);
  }, [initial]);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const channel = supabase
      .channel(`unread-messages:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const row = payload.new as { sender_id?: string; read_at?: string | null };
        if (row.sender_id && row.sender_id !== userId && !row.read_at) {
          void refresh();
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => {
        void refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh, supabase, userId]);

  return (
    <Link href="/chat" className="relative rounded-xl p-2 hover:bg-paper" aria-label="Tin nhắn">
      <MessageCircle className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
          {formatCount(count)}
        </span>
      ) : null}
    </Link>
  );
}
