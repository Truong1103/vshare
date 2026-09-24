import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, Empty, PageHeader } from "@/components/ui";
import { TX_LABEL } from "@/lib/constants";
import { formatCredit, formatDate, one } from "@/lib/utils";

export default async function TransactionsPage() {
  const { user, supabase } = await getSessionUser();
  const { data } = await supabase
    .from("transactions")
    .select("*, requester:profiles!transactions_requester_id_fkey(full_name), helper:profiles!transactions_helper_id_fkey(full_name)")
    .or(`requester_id.eq.${user!.id},helper_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });
  return (
    <div>
      <PageHeader kicker="Kết nối" title="Giao dịch của tôi" />
      {!data?.length ? <Empty title="Chưa có giao dịch" hint="Nhận một yêu cầu hoặc gửi kết nối từ tin kỹ năng." /> : null}
      <div className="grid gap-3">
        {(data || []).map((tx) => {
          const other = one(tx.requester_id === user!.id ? tx.helper : tx.requester);
          return (
            <Link key={tx.id} href={`/giao-dich/${tx.id}`}>
              <Card className="flex items-center justify-between gap-4 hover:border-terracotta/40">
                <div>
                  <p className="font-medium">{other?.full_name}</p>
                  <p className="text-sm text-muted">
                    {tx.gift_id
                      ? tx.requester_id === user!.id
                        ? "Bạn nhận quà"
                        : "Bạn tặng đồ"
                      : tx.requester_id === user!.id
                        ? "Bạn đang nhận hỗ trợ"
                        : "Bạn đang hỗ trợ"}{" "}
                    · {formatCredit(tx.amount)} TC · {formatDate(tx.created_at)}
                  </p>
                </div>
                <Badge>{TX_LABEL[tx.status]}</Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
