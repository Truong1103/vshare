import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, LinkButton, PageHeader, Stars } from "@/components/ui";
import { TX_LABEL } from "@/lib/constants";
import { cancelTx, confirmTx, helperAccept, startTx, submitReview, createReport } from "@/lib/actions/app";
import { ConfirmForm, ClientForm, SubmitButton } from "@/components/forms";
import { Field, inputClass } from "@/components/ui";
import { formatCredit, formatDate, one } from "@/lib/utils";

export default async function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, supabase } = await getSessionUser();
  const { data: tx } = await supabase
    .from("transactions")
    .select(
      "*, requester:profiles!transactions_requester_id_fkey(*), helper:profiles!transactions_helper_id_fkey(*), help_requests(title), skill_posts(title)"
    )
    .eq("id", id)
    .maybeSingle();
  if (!tx) notFound();
  if (user!.id !== tx.requester_id && user!.id !== tx.helper_id) notFound();

  const iAmHelper = user!.id === tx.helper_id;
  const myConfirm = iAmHelper ? tx.helper_confirmed_at : tx.requester_confirmed_at;
  const theirConfirm = iAmHelper ? tx.requester_confirmed_at : tx.helper_confirmed_at;
  const other = one(iAmHelper ? tx.requester : tx.helper);
  const request = one(tx.help_requests);
  const skill = one(tx.skill_posts);

  const { data: myReview } = await supabase
    .from("reviews")
    .select("*")
    .eq("transaction_id", id)
    .eq("reviewer_id", user!.id)
    .maybeSingle();

  return (
    <div>
      <PageHeader
        kicker="Giao dịch"
        title={request?.title || skill?.title || "Kết nối hỗ trợ"}
      />
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <div className="flex flex-wrap gap-2">
            <Badge>{TX_LABEL[tx.status]}</Badge>
            <Badge tone="sage">{formatCredit(tx.amount)} Time Credit</Badge>
            <Badge tone="muted">{tx.hours} giờ</Badge>
          </div>
          <p className="mt-4 text-sm text-muted">Tạo lúc {formatDate(tx.created_at)}</p>
          <div className="mt-6 grid gap-3 text-sm">
            <p>Người cần hỗ trợ: {one(tx.requester)?.full_name}</p>
            <p>Người hỗ trợ: {one(tx.helper)?.full_name}</p>
            <p>Bạn đã xác nhận: {myConfirm ? formatDate(myConfirm) : "Chưa"}</p>
            <p>Đối phương xác nhận: {theirConfirm ? formatDate(theirConfirm) : "Chưa"}</p>
          </div>
          <p className="mt-4 rounded-2xl bg-paper-2 p-4 text-sm">
            Time Credit chỉ được cộng/trừ khi cả hai bên xác nhận. Không thể hoàn thành trùng, không cho số dư âm.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {tx.status === "pending" && iAmHelper ? (
              <ConfirmForm label="Chấp nhận kết nối" confirm="Bạn sẽ nhận hỗ trợ yêu cầu này." action={helperAccept.bind(null, id)} />
            ) : null}
            {tx.status === "accepted" ? (
              <ConfirmForm variant="sage" label="Bắt đầu thực hiện" confirm="Chuyển giao dịch sang đang thực hiện." action={startTx.bind(null, id)} />
            ) : null}
            {["accepted", "in_progress"].includes(tx.status) && !myConfirm ? (
              <ConfirmForm label="Xác nhận hoàn thành" confirm="Xác nhận công việc đã xong. Time Credit chỉ chuyển khi cả hai bên xác nhận." action={confirmTx.bind(null, id)} />
            ) : null}
            {["pending", "accepted", "in_progress"].includes(tx.status) ? (
              <ConfirmForm variant="danger" label="Hủy giao dịch" confirm="Giao dịch sẽ bị hủy và không chuyển Time Credit." action={cancelTx.bind(null, id)} />
            ) : null}
            {tx.conversation_id ? <LinkButton href={`/chat/${tx.conversation_id}`} variant="secondary">Mở chat</LinkButton> : null}
          </div>
        </Card>
        <div className="space-y-4">
          {tx.status === "completed" && !myReview ? (
            <Card>
              <p className="text-xl font-bold">Đánh giá {other?.full_name}</p>
              <ClientForm action={submitReview.bind(null, id)} success="Đã gửi đánh giá.">
                <Field label="Số sao (1-5)">
                  <select name="rating" className={inputClass()} defaultValue="5">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} sao
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Nhận xét">
                  <textarea name="comment" rows={3} className={inputClass()} />
                </Field>
                <SubmitButton>Gửi đánh giá</SubmitButton>
              </ClientForm>
            </Card>
          ) : null}
          {myReview ? (
            <Card>
              <p className="font-medium">Bạn đã đánh giá</p>
              <Stars value={myReview.rating} />
              <p className="mt-2 text-sm text-muted">{myReview.comment}</p>
            </Card>
          ) : null}
          <Card>
            <p className="text-xl font-bold">Báo cáo</p>
            <ClientForm action={createReport} success="Đã gửi báo cáo cho quản trị viên.">
              <input type="hidden" name="target_type" value="user" />
              <input type="hidden" name="target_id" value={other?.id} />
              <Field label="Lý do">
                <textarea name="reason" required rows={3} className={inputClass()} />
              </Field>
              <SubmitButton>Gửi báo cáo</SubmitButton>
            </ClientForm>
          </Card>
        </div>
      </div>
    </div>
  );
}
