import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, PageHeader } from "@/components/ui";
import { adminSetRedemption } from "@/lib/actions/app";
import { formatCredit, formatDate, one } from "@/lib/utils";

export default async function AdminRewards() {
  const { supabase } = await getSessionUser();
  const { data } = await supabase
    .from("reward_redemptions")
    .select("*, profiles(full_name, email), rewards(title, slug)")
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <div>
      <PageHeader kicker="Admin" title="Đổi quà Time Credit" />
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
            {(data || []).map((r) => {
              const person = one(r.profiles);
              const gift = one(r.rewards);
              return (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-5 py-3">
                    <p className="font-medium">{person?.full_name}</p>
                    <p className="text-xs text-muted">{person?.email}</p>
                  </td>
                  <td className="px-5 py-3">{gift?.title}</td>
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
