import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { Avatar, Card, PageHeader, Stars, Badge } from "@/components/ui";
import { formatCredit, one } from "@/lib/utils";
import Link from "next/link";
import { ClientForm, SubmitButton } from "@/components/forms";
import { createReport } from "@/lib/actions/app";
import { Field, inputClass } from "@/components/ui";

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getSessionUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) notFound();
  const [{ data: skills }, { data: reviews }] = await Promise.all([
    supabase.from("skill_posts").select("*").eq("user_id", id).eq("status", "active"),
    supabase
      .from("reviews")
      .select("*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)")
      .eq("reviewee_id", id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  return (
    <div>
      <PageHeader title={profile.full_name} />
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={profile.full_name} src={profile.avatar_url} size={80} />
            <div>
              <p className="text-sm text-muted">{profile.area}</p>
              <p>
                <Stars value={Number(profile.rating_avg)} /> {profile.rating_count} lượt
              </p>
              <p className="text-sm">{formatCredit(profile.time_credit)} Time Credit</p>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm">{profile.bio || "Chưa có giới thiệu."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(profile.skills || []).map((s: string) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
          {profile.availability ? <p className="mt-3 text-sm text-muted">Có thể hỗ trợ: {profile.availability}</p> : null}
        </Card>
        <Card>
          <p className="text-xl font-bold">Báo cáo tài khoản</p>
          <ClientForm action={createReport} success="Đã gửi báo cáo.">
            <input type="hidden" name="target_type" value="user" />
            <input type="hidden" name="target_id" value={id} />
            <Field label="Lý do">
              <textarea name="reason" required className={inputClass()} rows={3} />
            </Field>
            <SubmitButton>Gửi</SubmitButton>
          </ClientForm>
        </Card>
      </div>
      <h2 className="mt-8 text-xl font-bold">Kỹ năng đã đăng</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {(skills || []).map((s) => (
          <Link key={s.id} href={`/ky-nang/${s.id}`}>
            <Card>
              <p className="font-medium">{s.title}</p>
              <p className="line-clamp-2 text-sm text-muted">{s.description}</p>
            </Card>
          </Link>
        ))}
      </div>
      <h2 className="mt-8 text-xl font-bold">Đánh giá từ cộng đồng</h2>
      <div className="mt-3 grid gap-3">
        {(reviews || []).map((r) => (
          <Card key={r.id}>
            <Stars value={r.rating} />
            <p className="mt-1 text-sm">{r.comment}</p>
            <p className="text-xs text-muted">{one(r.reviewer)?.full_name}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
