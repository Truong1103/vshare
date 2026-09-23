import { getSessionUser } from "@/lib/supabase/server";
import { Card, Empty, PageHeader, Badge, StatCard } from "@/components/ui";
import { LEDGER_LABEL } from "@/lib/constants";
import { formatCredit, formatDate } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

export default async function WalletPage() {
  const { user, profile, supabase } = await getSessionUser();
  const { data: rows } = await supabase
    .from("ledger")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });
  const earned = (rows || []).filter((r) => Number(r.amount) > 0).reduce((s, r) => s + Number(r.amount), 0);
  const spent = (rows || []).filter((r) => Number(r.amount) < 0).reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
  return (
    <div>
      <PageHeader kicker="Ví nội bộ" title="Time Credit" />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Số dư hiện tại" value={formatCredit(profile!.time_credit)} icon={<Wallet className="h-4 w-4 text-terracotta" />} />
        <StatCard label="Đã nhận" value={formatCredit(earned)} hint="Từ hỗ trợ và thưởng" icon={<ArrowUpRight className="h-4 w-4 text-sage" />} />
        <StatCard label="Đã sử dụng" value={formatCredit(spent)} hint="Cho các yêu cầu hỗ trợ" icon={<ArrowDownRight className="h-4 w-4 text-terracotta" />} />
      </div>
      <p className="mt-4 rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
        Time Credit không phải tiền mặt và không thể rút. Điểm đến từ hỗ trợ cộng đồng hoặc thưởng hệ thống.
      </p>
      <div className="mt-6 space-y-3">
        {(rows || []).map((row) => (
          <Card key={row.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{LEDGER_LABEL[row.type]}</p>
              <p className="text-sm text-muted">{row.note} · {formatDate(row.created_at)}</p>
            </div>
            <Badge tone={Number(row.amount) >= 0 ? "sage" : "default"}>
              {Number(row.amount) >= 0 ? "+" : ""}
              {formatCredit(row.amount)}
            </Badge>
          </Card>
        ))}
        {!rows?.length ? <Empty title="Chưa có lịch sử Time Credit" /> : null}
      </div>
    </div>
  );
}
