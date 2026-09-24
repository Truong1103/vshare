import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, LinkButton, PageHeader, Avatar } from "@/components/ui";
import { GIFT_LABEL, TX_LABEL } from "@/lib/constants";
import { closeGift, deleteGift, helperAccept, requestGift } from "@/lib/actions/app";
import { ConfirmForm, ClientForm, SubmitButton } from "@/components/forms";
import { Field, inputClass } from "@/components/ui";
import { formatCredit, formatDate, one } from "@/lib/utils";

export default async function GiftDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile, supabase } = await getSessionUser();
  const { data: gift } = await supabase
    .from("gift_posts")
    .select("*, gift_categories(name), profiles(*)")
    .eq("id", id)
    .maybeSingle();
  if (!gift || gift.status === "deleted") notFound();

  const mine = gift.user_id === user?.id;
  const owner = one(gift.profiles);
  const cat = one(gift.gift_categories);
  const images: string[] = gift.image_urls || [];

  let claims: Array<{
    id: string;
    status: string;
    amount: number;
    created_at: string;
    requester_id: string;
    requester?: { full_name?: string | null; avatar_url?: string | null } | { full_name?: string | null; avatar_url?: string | null }[];
  }> = [];
  let myTx: { id: string; status: string } | null = null;
  if (mine) {
    const { data } = await supabase
      .from("transactions")
      .select("id, status, amount, created_at, requester_id, requester:profiles!transactions_requester_id_fkey(full_name, avatar_url)")
      .eq("gift_id", id)
      .order("created_at", { ascending: false });
    claims = data || [];
  } else if (user) {
    const { data } = await supabase
      .from("transactions")
      .select("id, status")
      .eq("gift_id", id)
      .eq("requester_id", user.id)
      .in("status", ["pending", "accepted", "in_progress"]);
    myTx = data?.[0] || null;
  }
  const canRequest = !!user && !mine && gift.status === "open" && !myTx;
  const enough = Number(profile?.time_credit || 0) >= Number(gift.time_credit);

  return (
    <div>
      <PageHeader
        kicker={cat?.name || "Tặng quà"}
        title={gift.title}
        action={mine ? <LinkButton href={`/tang-qua/${id}/sua`} variant="secondary">Sửa tin</LinkButton> : null}
      />
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {images.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {images.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt={gift.title} className="aspect-[4/3] w-full rounded-2xl border border-line object-cover" />
              ))}
            </div>
          ) : null}
          {gift.video_url ? (
            <video src={gift.video_url} controls className="w-full rounded-2xl bg-black" />
          ) : null}
          <Card>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="sage">{formatCredit(gift.time_credit)} Time Credit</Badge>
              <Badge>{GIFT_LABEL[gift.status]}</Badge>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7">{gift.description}</p>
            {gift.extra_info ? (
              <p className="mt-4 rounded-xl bg-paper p-4 text-sm">
                <span className="font-semibold">Thông tin thêm: </span>
                {gift.extra_info}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-muted">Nhận / giao: {gift.area || "Thỏa thuận với người tặng"}</p>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <Link href={`/ho-so/${gift.user_id}`} className="flex items-center gap-3">
              <Avatar name={owner?.full_name} src={owner?.avatar_url} />
              <div>
                <p className="font-medium">{owner?.full_name}</p>
                <p className="text-xs text-muted">Người tặng</p>
              </div>
            </Link>
          </Card>
          {canRequest ? (
            <Card>
              <p className="text-xl font-bold">Nhận quà</p>
              <p className="mt-2 text-sm text-muted">
                Bạn sẽ trả <strong>{formatCredit(gift.time_credit)} TC</strong> khi hai bên xác nhận đã giao nhận. Số dư hiện tại: {formatCredit(profile?.time_credit)} TC.
              </p>
              {!enough ? (
                <p className="mt-3 text-sm text-danger">Bạn chưa đủ Time Credit.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  <ClientForm action={requestGift.bind(null, id)} success="">
                    <Field label="Lời nhắn cho người tặng">
                      <textarea name="note" rows={3} className={inputClass()} placeholder="Khi nào nhận được, địa điểm..." />
                    </Field>
                    <SubmitButton>Gửi yêu cầu nhận quà</SubmitButton>
                  </ClientForm>
                </div>
              )}
            </Card>
          ) : null}
          {myTx ? (
            <Card>
              <p className="font-bold">Yêu cầu của bạn</p>
              <p className="mt-1 text-sm text-muted">{TX_LABEL[myTx.status]}</p>
              <LinkButton href={`/giao-dich/${myTx.id}`} variant="secondary">
                Xem giao dịch
              </LinkButton>
            </Card>
          ) : null}
          {mine ? (
            <Card>
              <p className="text-xl font-bold">Yêu cầu nhận quà</p>
              <div className="mt-3 space-y-3">
                {(claims || []).map((tx) => {
                  const person = one(tx.requester);
                  return (
                    <div key={tx.id} className="rounded-xl border border-line p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{person?.full_name}</p>
                        <Badge tone="muted">{TX_LABEL[tx.status]}</Badge>
                      </div>
                      <p className="text-xs text-muted">{formatCredit(tx.amount)} TC · {formatDate(tx.created_at)}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Link href={`/giao-dich/${tx.id}`} className="text-sm font-semibold text-terracotta">
                          Chi tiết
                        </Link>
                        {tx.status === "pending" && gift.status === "open" ? (
                          <ConfirmForm
                            label="Chọn người này"
                            confirm="Xác nhận người nhận. Các yêu cầu khác sẽ bị hủy."
                            action={helperAccept.bind(null, tx.id)}
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {!claims.length ? <p className="text-sm text-muted">Chưa có ai gửi yêu cầu.</p> : null}
              </div>
              {gift.status === "open" ? (
                <div className="mt-4">
                  <ConfirmForm
                    label="Đánh dấu đã tặng"
                    confirm="Tin sẽ đóng, không nhận yêu cầu mới. Không chuyển Time Credit nếu chưa có giao dịch."
                    action={closeGift.bind(null, id)}
                  />
                </div>
              ) : null}
              <div className="mt-3">
                <ConfirmForm variant="danger" label="Xóa tin" confirm="Tin sẽ ẩn khỏi cộng đồng." action={deleteGift.bind(null, id)} />
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
