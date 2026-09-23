import { getSessionUser } from "@/lib/supabase/server";
import { Avatar, Card, LinkButton, PageHeader, Stars } from "@/components/ui";
import { updateProfile, uploadAvatar } from "@/lib/actions/auth";
import { ClientForm, SubmitButton } from "@/components/forms";
import { Field, inputClass } from "@/components/ui";
import { AREAS } from "@/lib/constants";
import Link from "next/link";
import { formatCredit, one } from "@/lib/utils";

export default async function MyProfilePage() {
  const { user, profile, supabase } = await getSessionUser();
  const [{ data: skills }, { data: reviews }] = await Promise.all([
    supabase.from("skill_posts").select("*").eq("user_id", user!.id).eq("status", "active"),
    supabase
      .from("reviews")
      .select("*, reviewer:profiles!reviews_reviewer_id_fkey(full_name)")
      .eq("reviewee_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  return (
    <div>
      <PageHeader title="Hồ sơ của tôi" action={<LinkButton href="/cai-dat" variant="secondary">Cài đặt tài khoản</LinkButton>} />
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar name={profile!.full_name} src={profile!.avatar_url} size={72} />
              <div>
                <h2 className="text-3xl font-extrabold">{profile!.full_name}</h2>
                <p className="text-sm text-muted">{profile!.email}</p>
                <p className="mt-1 text-sm">
                  <Stars value={Number(profile!.rating_avg)} /> {profile!.rating_count} đánh giá · {formatCredit(profile!.time_credit)} TC
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <p className="text-xl font-bold">Chỉnh sửa thông tin</p>
            <div className="mt-4">
              <ClientForm action={updateProfile} success="Đã cập nhật hồ sơ.">
                <Field label="Họ tên">
                  <input name="full_name" defaultValue={profile!.full_name} className={inputClass()} />
                </Field>
                <Field label="Số điện thoại">
                  <input name="phone" defaultValue={profile!.phone || ""} className={inputClass()} />
                </Field>
                <Field label="Giới thiệu">
                  <textarea name="bio" rows={4} defaultValue={profile!.bio || ""} className={inputClass()} />
                </Field>
                <Field label="Khu vực">
                  <select name="area" defaultValue={profile!.area || ""} className={inputClass()}>
                    <option value="">Chọn khu vực</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Kỹ năng (phân tách bằng dấu phẩy)">
                  <input name="skills" defaultValue={(Array.isArray(profile!.skills) ? profile!.skills : []).join(", ")} className={inputClass()} />
                </Field>
                <Field label="Thời gian có thể hỗ trợ">
                  <input name="availability" defaultValue={profile!.availability || ""} className={inputClass()} />
                </Field>
                <SubmitButton>Lưu hồ sơ</SubmitButton>
              </ClientForm>
            </div>
          </Card>
          <Card>
            <p className="text-xl font-bold">Ảnh đại diện</p>
            <div className="mt-4">
              <ClientForm action={uploadAvatar} success="Đã cập nhật ảnh.">
                <input name="avatar" type="file" accept="image/*" />
                <SubmitButton>Tải ảnh lên</SubmitButton>
              </ClientForm>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <p className="text-xl font-bold">Kỹ năng đang đăng</p>
            <div className="mt-3 grid gap-2 text-sm">
              {(skills || []).map((s) => (
                <Link key={s.id} href={`/ky-nang/${s.id}`}>
                  {s.title}
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-xl font-bold">Đánh giá gần đây</p>
            <div className="mt-3 space-y-3">
              {(reviews || []).map((r) => (
                <div key={r.id}>
                  <Stars value={r.rating} />
                  <p className="text-sm">{r.comment}</p>
                  <p className="text-xs text-muted">{one(r.reviewer)?.full_name}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
