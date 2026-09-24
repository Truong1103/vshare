import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, PageHeader } from "@/components/ui";
import { adminSetRedemption } from "@/lib/actions/app";
import { formatCredit, formatDate } from "@/lib/utils";

export default async function AdminRewards() {
  const { supabase } = await getSessionUser();
  const { data, error } = await supabase
    .from("reward_redemptions")
    .select("id, cost, status, created_at, admin_note, user_id, reward_id")
    .order("created_at", { ascending: false })
    .limit(80);

  const rows = error ? [] : data || [];
  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  const rewardIds = [...new Set(rows.map((r) => r.reward_id).filter(Boolean))];
  const people = new Map<string, { full_name: string; email: string | null }>();
  const gifts = new Map<string, string>();
  if (userIds.length) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
    (profiles || []).forEach((p) => people.set(p.id, { full_name: p.full_name, email: p.email }));
  }
  if (rewardIds.length) {
    const { data: rewards } = await supabase.from("rewards").select("id, title").in("id", rewardIds);
    (rewards || []).forEach((g) => gifts.set(g.id, g.title));
  }

  return (
    <div>
      <PageHeader kicker="Admin" title="Đổi quà Time Credit" />
      {error ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Chưa có bảng đổi quà. Chạy <code>supabase/rewards.sql</code> trên Supabase.
        </p>
      ) : null}
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Thành viên</th>
              <th className="px-5 py-3 font-semibold">Quà</th>
              <th className="px-5 py-3 font-semibold">TC</th>
              <th className="px-5 py-3 font-semibold">Trạng thái</th>
              <th className="px-5 py-3 font-semibold">Xử lý</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const person = people.get(r.user_id);
              return (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-5 py-3">
                    <p className="font-medium">{person?.full_name || "—"}</p>
                    <p className="text-xs text-muted">{person?.email}</p>
                  </td>
                  <td className="px-5 py-3">{gifts.get(r.reward_id) || "Quà"}</td>
                  <td className="px-5 py-3">{formatCredit(r.cost)}</td>
                  <td className="px-5 py-3">
                    <Badge>{r.status}</Badge>
                    <p className="text-xs text-muted">{formatDate(r.created_at)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <form
                      action={async (fd) => {
                        "use server";
                        await adminSetRedemption(r.id, String(fd.get("status")), String(fd.get("note") || ""));
                      }}
                      className="grid gap-2"
                    >
                      <select name="status" defaultValue={r.status} className="rounded-lg border border-line px-2 py-1">
                        <option value="pending">Chờ giao</option>
                        <option value="fulfilled">Đã giao</option>
                        <option value="cancelled">Hủy</option>
                      </select>
                      <input name="note" defaultValue={r.admin_note || ""} placeholder="Ghi chú" className="rounded-lg border border-line px-2 py-1" />
                      <button className="rounded-lg bg-sage px-3 py-1 text-sm font-semibold text-white">Lưu</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
