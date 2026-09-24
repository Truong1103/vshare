import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell";
import { getSessionUser } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, supabase } = await getSessionUser();
  if (!user || !profile) redirect("/dang-nhap");
  if (profile.is_banned) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-3xl font-extrabold">Tài khoản đã bị khóa</h1>
          <p className="mt-2 text-muted">Liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.</p>
        </div>
      </div>
    );
  }
  let unread = 0;
  let unreadChats = 0;
  try {
    const [{ count }, { count: chatCount }] = await Promise.all([
      supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null),
      supabase.from("messages").select("id", { count: "exact", head: true }).neq("sender_id", user.id).is("read_at", null),
    ]);
    unread = count || 0;
    unreadChats = chatCount || 0;
  } catch {
    /* bảng chưa có hoặc RLS — vẫn vào app */
  }
  return (
    <AppShell profile={profile} unread={unread} unreadChats={unreadChats}>
      {children}
    </AppShell>
  );
}
