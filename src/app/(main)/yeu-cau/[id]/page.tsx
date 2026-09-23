import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, LinkButton, PageHeader, Avatar } from "@/components/ui";
import { MODE_LABEL, REQUEST_LABEL } from "@/lib/constants";
import { acceptRequest } from "@/lib/actions/app";
import { ConfirmForm } from "@/components/forms";
import { formatCredit, one } from "@/lib/utils";
import Link from "next/link";

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, supabase } = await getSessionUser();
  const { data: req } = await supabase
    .from("help_requests")
    .select("*, categories(name), profiles(*)")
    .eq("id", id)
    .maybeSingle();
  if (!req) notFound();
  const mine = req.user_id === user!.id;

  const owner = one(req.profiles);
  const category = one(req.categories);

  return (
    <div>
      <PageHeader
        kicker={category?.name}
        title={req.title}
        action={mine ? <LinkButton href={`/yeu-cau/${id}/sua`} variant="secondary">Sửa tin</LinkButton> : null}
      />
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <div className="mb-3 flex gap-2">
            <Badge tone="sage">{formatCredit(req.time_credit)} Time Credit</Badge>
            <Badge>{REQUEST_LABEL[req.status]}</Badge>
            <Badge tone="muted">{MODE_LABEL[req.mode]}</Badge>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7">{req.description}</p>
          <p className="mt-4 text-sm text-muted">
            Thời lượng {req.duration_hours} giờ · Khu vực {req.area || "—"} · Thời gian mong muốn {req.desired_time || "linh hoạt"}
          </p>
        </Card>
        <div className="space-y-4">
          <Card>
            <Link href={`/ho-so/${req.user_id}`} className="flex items-center gap-3">
              <Avatar name={owner?.full_name} src={owner?.avatar_url} />
              <div>
                <p className="font-medium">{owner?.full_name}</p>
                <p className="text-xs text-muted">Người cần hỗ trợ</p>
              </div>
            </Link>
          </Card>
          {!mine && req.status === "open" ? (
            <Card>
              <p className="text-xl font-bold">Nhận hỗ trợ</p>
              <p className="mt-2 mb-4 text-sm text-muted">
                Hệ thống sẽ tạo giao dịch và mở chat để hai bên thống nhất thời gian, địa điểm và nội dung.
              </p>
              <ConfirmForm
                label="Nhận hỗ trợ"
                confirm="Bạn sẽ trở thành người hỗ trợ cho yêu cầu này."
                action={acceptRequest.bind(null, id)}
              />
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
