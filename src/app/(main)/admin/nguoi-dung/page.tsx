import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, PageHeader } from "@/components/ui";
import { adminSetUser } from "@/lib/actions/app";
import { formatCredit, formAction, sanitizeSearch } from "@/lib/utils";

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = sanitizeSearch(sp.q || "");
  const { supabase } = await getSessionUser();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data } = await query.limit(80);
  const rows = data || [];

  return (
    <div>
      <PageHeader kicker="Admin" title="Người dùng" />
      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm tên hoặc email"
          className="w-full rounded-2xl border border-line px-4 py-2 text-sm"
        />
      </form>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Người dùng</th>
              <th className="px-5 py-3 font-semibold">Số dư</th>
              <th className="px-5 py-3 font-semibold">Vai trò</th>
              <th className="px-5 py-3 font-semibold">Trạng thái</th>
              <th className="px-5 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-5 py-3">
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </td>
                <td className="px-5 py-3 font-semibold">{formatCredit(u.time_credit)} TC</td>
                <td className="px-5 py-3">{u.role}</td>
                <td className="px-5 py-3">
                  {u.is_banned ? <Badge tone="warn">Đã khóa</Badge> : <Badge tone="sage">Hoạt động</Badge>}
                </td>
                <td className="px-5 py-3">
                  <form action={formAction(adminSetUser)} className="flex flex-wrap gap-2">
                    <input type="hidden" name="user_id" value={u.id} />
                    <select name="role" defaultValue={u.role} className="rounded-lg border border-line px-2 py-1 text-sm">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <select name="is_banned" defaultValue={String(u.is_banned)} className="rounded-lg border border-line px-2 py-1 text-sm">
                      <option value="false">Mở khóa</option>
                      <option value="true">Khóa</option>
                    </select>
                    <button className="rounded-lg bg-sage px-3 py-1 text-sm font-semibold text-white">Lưu</button>
                  </form>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
                  Không có người dùng.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
