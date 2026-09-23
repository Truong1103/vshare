import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeSearch } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = sanitizeSearch(searchParams.get("q") || "");
  if (q.length < 1) return NextResponse.json({ items: [] });

  const supabase = await createClient();
  const like = `%${q}%`;

  const [{ data: skills }, { data: requests }, { data: people }, { data: categories }] = await Promise.all([
    supabase.from("skill_posts").select("id, title").eq("status", "active").ilike("title", like).limit(4),
    supabase.from("help_requests").select("id, title").eq("status", "open").ilike("title", like).limit(4),
    supabase.from("profiles").select("id, full_name").eq("is_banned", false).ilike("full_name", like).limit(3),
    supabase.from("categories").select("id, name").ilike("name", like).limit(3),
  ]);

  const items = [
    ...(categories || []).map((c) => ({
      kind: "category" as const,
      id: c.id,
      label: c.name,
      href: `/tim-kiem?tab=all&category=${c.id}`,
    })),
    ...(skills || []).map((s) => ({
      kind: "skill" as const,
      id: s.id,
      label: s.title,
      href: `/ky-nang/${s.id}`,
    })),
    ...(requests || []).map((r) => ({
      kind: "request" as const,
      id: r.id,
      label: r.title,
      href: `/yeu-cau/${r.id}`,
    })),
    ...(people || []).map((p) => ({
      kind: "person" as const,
      id: p.id,
      label: p.full_name,
      href: `/ho-so/${p.id}`,
    })),
  ].slice(0, 8);

  return NextResponse.json({ items, q });
}
