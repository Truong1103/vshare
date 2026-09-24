import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/shell";
import { getSessionUser } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { SKILL_GROUPS } from "@/lib/brand";
import { hasSupabaseEnv } from "@/lib/env";
import { FullBanner } from "@/components/brand";
import { FloatingBubbles } from "@/components/floating-bubbles";
import { Monitor, MapPin } from "lucide-react";

export default async function SkillGroupsPage() {
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
        <FullBanner src="/banner2.png" alt="Nhóm kỹ năng VShare" priority />
        <p className="kicker mt-8">Nhóm kỹ năng</p>
        <h1 className="mt-3 text-4xl font-extrabold">Đa dạng kỹ năng — online và trực tiếp</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Mỗi nhóm gồm hai nhánh: hỗ trợ từ xa và gặp mặt tại Hà Nội hoặc Nghệ An. Thời gian cho đi đều quy đổi 1 giờ = 1 Time Credit.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {SKILL_GROUPS.map((g) => (
            <Card key={g.id} className="p-6">
              <h2 className="text-xl font-bold">{g.name}</h2>
              <p className="mt-2 text-sm text-muted">{g.blurb}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-paper p-3">
                  <p className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-terracotta">
                    <Monitor className="h-3.5 w-3.5" /> Online
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.online.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-paper p-3">
                  <p className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-sage">
                    <MapPin className="h-3.5 w-3.5" /> Trực tiếp
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.offline.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link href={`/tim-kiem?q=${encodeURIComponent(g.query)}&tab=all`} className="mt-4 inline-block text-sm font-semibold text-terracotta">
                Tìm trong nhóm này
              </Link>
            </Card>
          ))}
        </div>
      </div>
      <PublicFooter />
      </div>
    </div>
  );
}
