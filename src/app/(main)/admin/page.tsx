import { getSessionUser } from "@/lib/supabase/server";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { formatCredit, formatDate } from "@/lib/utils";
import { TX_LABEL } from "@/lib/constants";
import { BarChart, DonutChart } from "@/components/charts";
import Link from "next/link";

function lastNDays(n: number) {
  const days: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }
  return days;
}

export default async function AdminHome() {
  const { supabase } = await getSessionUser();
  const [{ data: users }, { data: skills }, { data: requests }, { data: txs }, { data: reports }, { data: reviews }] =
    await Promise.all([
      supabase.from("profiles").select("id, is_banned, created_at, full_name, email, time_credit").order("created_at", { ascending: false }),
      supabase.from("skill_posts").select("id, status, created_at, title").neq("status", "deleted"),
      supabase.from("help_requests").select("id, status, created_at, title"),
      supabase.from("transactions").select("id, status, amount, created_at").order("created_at", { ascending: false }),
      supabase.from("reports").select("id, status, created_at"),
      supabase.from("reviews").select("id, rating"),
    ]);

  const userRows = users || [];
  const skillRows = skills || [];
  const requestRows = requests || [];
  const txRows = txs || [];
  const reportRows = reports || [];
  const reviewRows = reviews || [];

  const activeUsers = userRows.filter((u) => !u.is_banned).length;
  const completed = txRows.filter((t) => t.status === "completed");
  const circulated = completed.reduce((s, t) => s + Number(t.amount), 0);
  const days = lastNDays(7);
  const txByDay = days.map((d) => txRows.filter((t) => String(t.created_at).slice(0, 10) === d.key).length);
  const userByDay = days.map((d) => userRows.filter((u) => String(u.created_at).slice(0, 10) === d.key).length);

  const txDonut = [
    { label: "Hoàn thành", value: txRows.filter((t) => t.status === "completed").length, color: "#0f8f8a" },
    { label: "Đang chạy", value: txRows.filter((t) => ["pending", "accepted", "in_progress"].includes(t.status)).length, color: "#1565c0" },
    { label: "Đã hủy", value: txRows.filter((t) => t.status === "cancelled").length, color: "#94a3b8" },
  ];
  const reportDonut = [
    { label: "Chưa xử lý", value: reportRows.filter((r) => r.status === "open").length, color: "#f59e0b" },
    { label: "Đang xem", value: reportRows.filter((r) => r.status === "reviewing").length, color: "#1565c0" },
    { label: "Đã xử lý", value: reportRows.filter((r) => r.status === "resolved").length, color: "#0f8f8a" },
    { label: "Bỏ qua", value: reportRows.filter((r) => r.status === "dismissed").length, color: "#94a3b8" },
  ];
  const avgRating =
    reviewRows.length > 0 ? Math.round((reviewRows.reduce((s, r) => s + Number(r.rating), 0) / reviewRows.length) * 10) / 10 : 0;

  return (
    <div>
      <PageHeader kicker="Admin" title="Báo cáo vận hành" />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Người dùng" value={userRows.length} hint={`${activeUsers} đang hoạt động`} />
        <StatCard label="Giao dịch" value={txRows.length} hint={`${completed.length} hoàn thành`} />
        <StatCard label="Time Credit lưu chuyển" value={formatCredit(circulated)} hint="Tổng điểm đã chuyển" />
        <StatCard label="Tin kỹ năng" value={skillRows.length} hint={`${skillRows.filter((s) => s.status === "active").length} đang hiện`} />
        <StatCard label="Yêu cầu hỗ trợ" value={requestRows.length} hint={`${requestRows.filter((r) => r.status === "open").length} đang mở`} />
        <StatCard label="Điểm đánh giá TB" value={avgRating || "—"} hint={`${reviewRows.length} lượt đánh giá`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-bold">Giao dịch 7 ngày gần đây</p>
          <p className="mb-4 text-xs text-muted">Số giao dịch tạo mới mỗi ngày</p>
          <BarChart labels={days.map((d) => d.label)} values={txByDay} />
        </Card>
        <Card>
          <p className="text-sm font-bold">Người dùng mới 7 ngày</p>
          <p className="mb-4 text-xs text-muted">Tài khoản đăng ký mỗi ngày</p>
          <BarChart labels={days.map((d) => d.label)} values={userByDay} color="#1565c0" />
        </Card>
        <Card>
          <p className="mb-4 text-sm font-bold">Cơ cấu giao dịch</p>
          <DonutChart items={txDonut} />
        </Card>
        <Card>
          <p className="mb-4 text-sm font-bold">Trạng thái báo cáo vi phạm</p>
          <DonutChart items={reportDonut} />
        </Card>
      </div>

      <Card className="mt-6 overflow-x-auto p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <p className="font-bold">Giao dịch gần nhất</p>
          <Link href="/admin/giao-dich" className="text-sm font-semibold text-terracotta">
            Xem tất cả
          </Link>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Mã</th>
              <th className="px-5 py-3 font-semibold">Trạng thái</th>
              <th className="px-5 py-3 font-semibold">Time Credit</th>
              <th className="px-5 py-3 font-semibold">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {txRows.slice(0, 8).map((tx) => (
              <tr key={tx.id} className="border-t border-line">
                <td className="px-5 py-3 font-mono text-xs">{tx.id.slice(0, 8)}</td>
                <td className="px-5 py-3">{TX_LABEL[tx.status] || tx.status}</td>
                <td className="px-5 py-3 font-semibold">{formatCredit(tx.amount)}</td>
                <td className="px-5 py-3 text-muted">{formatDate(tx.created_at)}</td>
              </tr>
            ))}
            {!txRows.length ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted">
                  Chưa có giao dịch.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
