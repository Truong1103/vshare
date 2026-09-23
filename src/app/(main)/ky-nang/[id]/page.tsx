import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { Badge, Card, LinkButton, PageHeader, Avatar } from "@/components/ui";
import { MODE_LABEL } from "@/lib/constants";
import { requestFromSkill } from "@/lib/actions/app";
import { ClientForm, SubmitButton } from "@/components/forms";
import { Field, inputClass } from "@/components/ui";
import { one } from "@/lib/utils";
import Link from "next/link";

export default async function SkillDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, supabase } = await getSessionUser();
  const { data: skill } = await supabase
    .from("skill_posts")
    .select("*, categories(name), profiles(*)")
    .eq("id", id)
    .maybeSingle();
  if (!skill || skill.status === "deleted") notFound();
  const mine = skill.user_id === user!.id;

  const owner = one(skill.profiles);
  const category = one(skill.categories);

  return (
    <div>
      <PageHeader kicker={category?.name} title={skill.title} action={mine ? <LinkButton href={`/ky-nang/${id}/sua`} variant="secondary">Sửa tin</LinkButton> : null} />
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <p className="whitespace-pre-wrap text-sm leading-7">{skill.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{MODE_LABEL[skill.mode]}</Badge>
            <Badge tone="muted">{skill.area}</Badge>
            {skill.availability ? <Badge tone="sage">{skill.availability}</Badge> : null}
          </div>
        </Card>
        <div className="space-y-4">
          <Card>
            <Link href={`/ho-so/${skill.user_id}`} className="flex items-center gap-3">
              <Avatar name={owner?.full_name} src={owner?.avatar_url} />
              <div>
                <p className="font-medium">{owner?.full_name}</p>
                <p className="text-xs text-muted">{owner?.rating_avg}★ · {owner?.rating_count} đánh giá</p>
              </div>
            </Link>
          </Card>
          {!mine ? (
            <Card>
              <p className="text-xl font-bold">Yêu cầu hỗ trợ</p>
              <p className="mt-1 text-sm text-muted">1 giờ = 1 Time Credit. Số dư của bạn sẽ được kiểm tra khi gửi.</p>
              <ClientForm action={requestFromSkill.bind(null, id)} success="Đã gửi yêu cầu.">
                <Field label="Số giờ">
                  <input name="hours" type="number" min="0.5" step="0.5" defaultValue={1} className={inputClass()} />
                </Field>
                <Field label="Ghi chú">
                  <textarea name="note" rows={3} className={inputClass()} placeholder="Mô tả ngắn nhu cầu..." />
                </Field>
                <SubmitButton>Gửi yêu cầu kết nối</SubmitButton>
              </ClientForm>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
