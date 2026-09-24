import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, LinkButton, PageHeader, Stars, StatCard } from "@/components/ui";
import { formatCredit, formatDate, one } from "@/lib/utils";
import { TX_LABEL } from "@/lib/constants";
import { ArrowUpRight, Bell, Sparkles, Star, Wallet } from "lucide-react";

export default async function DashboardPage() {
  const { user, profile, supabase } = await getSessionUser();
  const uid = user!.id;
  const [{ data: skills }, { data: requests }, { data: txs }, { data: notifs }, giftsRes] = await Promise.all([
    supabase.from("skill_posts").select("*").eq("user_id", uid).neq("status", "deleted").order("created_at", { ascending: false }).limit(4),
    supabase.from("help_requests").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(4),
    supabase
      .from("transactions")
      .select("*, requester:profiles!transactions_requester_id_fkey(full_name), helper:profiles!transactions_helper_id_fkey(full_name)")
      .or(`requester_id.eq.${uid},helper_id.eq.${uid}`)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
    supabase.from("gift_posts").select("id, title, status").eq("user_id", uid).neq("status", "deleted").order("created_at", { ascending: false }).limit(4),
  ]);
  const myGifts = giftsRes.error ? [] : giftsRes.data || [];

  return (
    <div>
      <PageHeader kicker="Tổng quan" title={`Xin chào, ${profile!.full_name || "thành viên"}`} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Time Credit" value={formatCredit(profile!.time_credit)} hint="Số dư hiện tại" icon={<Wallet className="h-4 w-4 text-terracotta" />} />
        <StatCard
          label="Đánh giá"
          value={<Stars value={Number(profile!.rating_avg)} />}
          hint={`${profile!.rating_count} lượt`}
          icon={<Star className="h-4 w-4 text-gold" />}
        />
        <StatCard label="Kỹ năng đang đăng" value={skills?.length ?? 0} icon={<Sparkles className="h-4 w-4 text-sage" />} />
        <StatCard label="Giao dịch gần đây" value={txs?.length ?? 0} icon={<ArrowUpRight className="h-4 w-4 text-terracotta" />} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href="/ky-nang/moi">Đăng kỹ năng</LinkButton>
        <LinkButton href="/yeu-cau/moi" variant="sage">
          Đăng yêu cầu
        </LinkButton>
        <LinkButton href="/tang-qua/moi" variant="secondary">
          Tặng đồ
        </LinkButton>
        <LinkButton href="/tim-kiem" variant="secondary">
          Tìm hỗ trợ
        </LinkButton>
        <LinkButton href="/vi" variant="secondary">
          Ví Time Credit
        </LinkButton>
        <LinkButton href="/doi-qua" variant="secondary">
          Đổi quà
        </LinkButton>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Giao dịch</h2>
            <Link href="/giao-dich" className="text-sm font-semibold text-terracotta">
              Xem tất cả
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(txs || []).map((tx) => (
              <Link key={tx.id} href={`/giao-dich/${tx.id}`} className="block rounded-xl border border-line bg-paper p-3 hover:border-terracotta/40">
                <div className="flex justify-between gap-2">
                  <p className="text-sm font-medium">
                    {tx.requester_id === uid ? "Nhận hỗ trợ từ" : "Hỗ trợ"}{" "}
                    {tx.requester_id === uid ? one(tx.helper)?.full_name : one(tx.requester)?.full_name}
                  </p>
                  <Badge>{TX_LABEL[tx.status]}</Badge>
                </div>
                <p className="text-xs text-muted">{formatCredit(tx.amount)} TC · {formatDate(tx.created_at)}</p>
              </Link>
            ))}
            {!txs?.length ? <p className="text-sm text-muted">Chưa có giao dịch.</p> : null}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Thông báo mới</h2>
            <Bell className="h-4 w-4 text-muted" />
          </div>
          <div className="mt-4 space-y-3">
            {(notifs || []).map((n) => (
              <Link key={n.id} href={n.link || "/thong-bao"} className="block rounded-xl border border-line bg-paper p-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted">{n.body}</p>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Kỹ năng của bạn</h2>
          <div className="mt-4 space-y-2">
            {(skills || []).map((s) => (
              <Link key={s.id} href={`/ky-nang/${s.id}`} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2 text-sm hover:text-terracotta">
                {s.title}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ))}
            {!skills?.length ? <p className="text-sm text-muted">Chưa đăng kỹ năng.</p> : null}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Yêu cầu của bạn</h2>
          <div className="mt-4 space-y-2">
            {(requests || []).map((r) => (
              <Link key={r.id} href={`/yeu-cau/${r.id}`} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2 text-sm hover:text-terracotta">
                {r.title}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ))}
            {!requests?.length ? <p className="text-sm text-muted">Chưa có yêu cầu.</p> : null}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Tặng quà của bạn</h2>
            <Link href="/tang-qua/cua-toi" className="text-sm font-semibold text-terracotta">
              Quản lý
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {myGifts.map((g) => (
              <Link key={g.id} href={`/tang-qua/${g.id}`} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2 text-sm hover:text-terracotta">
                {g.title}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ))}
            {!myGifts.length ? <p className="text-sm text-muted">Chưa đăng món đồ tặng.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
