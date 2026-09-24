import { PublicHeader, PublicFooter } from "@/components/shell";
import { getSessionUser } from "@/lib/supabase/server";
import { Card, Field, inputClass } from "@/components/ui";
import { ClientForm, SubmitButton } from "@/components/forms";
import { submitContact } from "@/lib/actions/app";
import { CONTACT } from "@/lib/brand";
import { hasSupabaseEnv } from "@/lib/env";
import { FullBanner } from "@/components/brand";
import { FloatingBubbles } from "@/components/floating-bubbles";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export default async function ContactPage() {
  let user: { id: string } | null = null;
  if (hasSupabaseEnv()) {
    const ctx = await getSessionUser();
    user = ctx.user;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <FloatingBubbles />
      <div className="relative z-10">
        <PublicHeader authed={!!user} />
        <div className="mx-auto max-w-6xl px-4 py-14">
          <FullBanner src="/banner1.png" alt="Liên hệ VShare" priority />
          <p className="kicker mt-8">Liên hệ</p>
          <h1 className="mt-3 text-4xl font-extrabold">Ban điều hành VShare</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Gửi câu hỏi về thí điểm Hà Nội – Nghệ An, hợp tác trường học / CLB, hoặc hỗ trợ tài khoản. Thông tin đến trực tiếp admin.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <Card className="flex gap-3">
                <Mail className="h-5 w-5 text-terracotta" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">Email admin</p>
                  <a href={`mailto:${CONTACT.email}`} className="font-semibold text-terracotta">
                    {CONTACT.email}
                  </a>
                </div>
              </Card>
              <Card className="flex gap-3">
                <Phone className="h-5 w-5 text-terracotta" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">Điện thoại</p>
                  <p className="font-semibold">{CONTACT.phone}</p>
                </div>
              </Card>
              <Card className="flex gap-3">
                <Clock className="h-5 w-5 text-terracotta" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">Giờ làm việc</p>
                  <p className="font-semibold">{CONTACT.hours}</p>
                </div>
              </Card>
              <Card className="flex gap-3">
                <MapPin className="h-5 w-5 text-terracotta" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">Khu vực thí điểm</p>
                  <p className="font-semibold">{CONTACT.addressHn}</p>
                  <p className="mt-1 font-semibold">{CONTACT.addressNa}</p>
                </div>
              </Card>
            </div>
            <Card className="p-6">
              <h2 className="text-xl font-bold">Gửi tin nhắn</h2>
              <p className="mt-1 text-sm text-muted">Admin nhận thông báo trên hệ thống.</p>
              <div className="mt-4">
                <ClientForm action={submitContact} success="Đã gửi. Ban điều hành sẽ phản hồi qua email.">
                  <Field label="Họ tên">
                    <input name="name" required className={inputClass()} />
                  </Field>
                  <Field label="Email">
                    <input name="email" type="email" required className={inputClass()} />
                  </Field>
                  <Field label="Nội dung">
                    <textarea name="body" required rows={5} className={inputClass()} />
                  </Field>
                  <SubmitButton>Gửi liên hệ</SubmitButton>
                </ClientForm>
              </div>
            </Card>
          </div>
        </div>
        <PublicFooter />
      </div>
    </div>
  );
}
