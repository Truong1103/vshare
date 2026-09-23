import { getSessionUser } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui";
import { updatePassword } from "@/lib/actions/auth";
import { ClientForm, SubmitButton } from "@/components/forms";
import { Field, inputClass } from "@/components/ui";
import { signOut } from "@/lib/actions/auth";
import { formAction } from "@/lib/utils";
import { Button } from "@/components/ui";

export default async function SettingsPage() {
  const { profile } = await getSessionUser();
  return (
    <div>
      <PageHeader title="Cài đặt tài khoản" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <p className="text-xl font-bold">Email</p>
          <p className="mt-2 text-sm text-muted">{profile!.email}</p>
        </Card>
        <Card>
          <p className="text-xl font-bold">Đổi mật khẩu</p>
          <div className="mt-4">
            <ClientForm action={updatePassword} success="Đã đổi mật khẩu.">
              <Field label="Mật khẩu mới">
                <input name="password" type="password" minLength={8} required className={inputClass()} />
              </Field>
              <SubmitButton>Cập nhật</SubmitButton>
            </ClientForm>
          </div>
        </Card>
        <Card>
          <p className="text-xl font-bold">Đăng xuất</p>
          <form action={formAction(signOut)} className="mt-4">
            <Button type="submit" variant="secondary">
              Đăng xuất
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
