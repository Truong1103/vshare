import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { adminResolveReport } from "@/lib/actions/app";
import { REPORT_LABEL, REPORT_TARGET_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DonutChart } from "@/components/charts";

export default async function AdminReports() {
  const { supabase } = await getSessionUser();
  const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(120);
  const rows = data || [];
  const donut = [
    { label: "Chưa xử lý", value: rows.filter((r) => r.status === "open").length, color: "#f59e0b" },
    { label: "Đang xem", value: rows.filter((r) => r.status === "reviewing").length, color: "#1565c0" },
    { label: "Đã xử lý", value: rows.filter((r) => r.status === "resolved").length, color: "#0f8f8a" },
    { label: "Bỏ qua", value: rows.filter((r) => r.status === "dismissed").length, color: "#94a3b8" },
  ];

  return (
    <div>
      <PageHeader kicker="Admin" title="Báo cáo vi phạm" />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Tổng báo cáo" value={rows.length} />
        <StatCard label="Chưa xử lý" value={donut[0].value} />
        <StatCard label="Đã xử lý" value={donut[2].value} />
        <Card>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Tỷ lệ trạng thái</p>
          <DonutChart items={donut} />
        </Card>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Loại</th>
              <th className="px-5 py-3 font-semibold">Nội dung</th>
              <th className="px-5 py-3 font-semibold">Trạng thái</th>
              <th className="px-5 py-3 font-semibold">Thời gian</th>
              <th className="px-5 py-3 font-semibold">Xử lý</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="px-5 py-3">
                  {REPORT_TARGET_LABEL[r.target_type] || r.target_type}
                  <p className="font-mono text-[10px] text-muted">{String(r.target_id).slice(0, 8)}</p>
                </td>
                <td className="max-w-xs px-5 py-3">{r.reason}</td>
                <td className="px-5 py-3">
                  <Badge tone={r.status === "open" ? "warn" : r.status === "resolved" ? "sage" : "muted"}>
                    {REPORT_LABEL[r.status] || r.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-muted">{formatDate(r.created_at)}</td>
                <td className="px-5 py-3">
                  <form
                    action={async (fd) => {
                      "use server";
                      await adminResolveReport(r.id, String(fd.get("status")), String(fd.get("admin_note") || ""));
                    }}
                    className="grid gap-2"
                  >
                    <select name="status" defaultValue={r.status} className="rounded-lg border border-line px-2 py-1 text-sm">
                      <option value="open">Chưa xử lý</option>
                      <option value="reviewing">Đang xem</option>
                      <option value="resolved">Đã xử lý</option>
                      <option value="dismissed">Bỏ qua</option>
                    </select>
                    <input name="admin_note" placeholder="Ghi chú" defaultValue={r.admin_note || ""} className="rounded-lg border border-line px-2 py-1 text-sm" />
                    <button className="rounded-lg bg-sage px-3 py-1 text-sm font-semibold text-white">Cập nhật</button>
                  </form>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  Chưa có báo cáo.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
