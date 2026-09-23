import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, PageHeader } from "@/components/ui";
import { TX_LABEL } from "@/lib/constants";
import { formatCredit, formatDate, one } from "@/lib/utils";
import Link from "next/link";

export default async function AdminTx() {
  const { supabase } = await getSessionUser();
  const { data } = await supabase
    .from("transactions")
    .select("*, requester:profiles!transactions_requester_id_fkey(full_name), helper:profiles!transactions_helper_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = data || [];
  return (
    <div>
      <PageHeader kicker="Admin" title="Giao dịch Time Credit" />
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Người cần</th>
              <th className="px-5 py-3 font-semibold">Người hỗ trợ</th>
              <th className="px-5 py-3 font-semibold">Điểm</th>
              <th className="px-5 py-3 font-semibold">Trạng thái</th>
              <th className="px-5 py-3 font-semibold">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr key={tx.id} className="border-t border-line">
                <td className="px-5 py-3">{one(tx.requester)?.full_name}</td>
                <td className="px-5 py-3">{one(tx.helper)?.full_name}</td>
                <td className="px-5 py-3 font-semibold">{formatCredit(tx.amount)} TC</td>
                <td className="px-5 py-3">
                  <Badge>{TX_LABEL[tx.status]}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/giao-dich/${tx.id}`} className="text-terracotta">
                    {formatDate(tx.created_at)}
                  </Link>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">
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
