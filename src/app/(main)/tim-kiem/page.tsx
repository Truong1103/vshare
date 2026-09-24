import { getSessionUser } from "@/lib/supabase/server";
import { Empty, PageHeader, Badge, Card, LinkButton, Avatar, Stars } from "@/components/ui";
import { SearchExplorer } from "@/components/search-explorer";
import { MODE_LABEL } from "@/lib/constants";
import { formatCredit, one, sanitizeSearch } from "@/lib/utils";
import Link from "next/link";

function applyListingFilters(query: any, q: string, category: string, area: string, mode: string) {
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (category) query = query.eq("category_id", category);
  if (area) query = query.ilike("area", `${area.replace(/[%_]/g, "")}%`);
  if (mode) query = query.eq("mode", mode);
  return query;
}

function listingHref(tab: string, values: Record<string, string>) {
  const p = new URLSearchParams();
  Object.entries({ ...values, tab }).forEach(([k, v]) => {
    if (v) p.set(k, v);
  });
  return `/tim-kiem?${p.toString()}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = sanitizeSearch(String(sp.q || ""));
  const tab = ["all", "skills", "requests", "gifts", "people"].includes(String(sp.tab || "all")) ? String(sp.tab || "all") : "all";
  const category = String(sp.category || "");
  const area = String(sp.area || "");
  const mode = String(sp.mode || "");
  const { supabase } = await getSessionUser();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");

  let peopleCountQuery = supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_banned", false);
  let peopleListQuery = supabase.from("profiles").select("*").eq("is_banned", false);
  if (q) {
    peopleCountQuery = peopleCountQuery.or(`full_name.ilike.%${q}%,bio.ilike.%${q}%`);
    peopleListQuery = peopleListQuery.or(`full_name.ilike.%${q}%,bio.ilike.%${q}%`);
  }
  if (area) {
    const prefix = `${area.replace(/[%_]/g, "")}%`;
    peopleCountQuery = peopleCountQuery.ilike("area", prefix);
    peopleListQuery = peopleListQuery.ilike("area", prefix);
  }

  const preview = tab === "all" ? 8 : 24;
  const wantSkills = tab === "all" || tab === "skills";
  const wantRequests = tab === "all" || tab === "requests";
  const wantGifts = tab === "all" || tab === "gifts";
  const wantPeople = tab === "all" || tab === "people";
  const filters = { q, category, area, mode };

  let giftCountQuery = supabase.from("gift_posts").select("id", { count: "exact", head: true }).eq("status", "open");
  let giftListQuery = supabase
    .from("gift_posts")
    .select("id, title, description, area, time_credit, image_urls, gift_categories(name), profiles(full_name, avatar_url)")
    .eq("status", "open");
  if (q) {
    giftCountQuery = giftCountQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    giftListQuery = giftListQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (area) {
    const prefix = `${area.replace(/[%_]/g, "")}%`;
    giftCountQuery = giftCountQuery.ilike("area", prefix);
    giftListQuery = giftListQuery.ilike("area", prefix);
  }

  const [
    { count: skillCount },
    { count: requestCount },
    { count: peopleCount },
    giftCountRes,
    skillRes,
    requestRes,
    peopleRes,
    giftRes,
  ] = await Promise.all([
      applyListingFilters(
        supabase.from("skill_posts").select("id", { count: "exact", head: true }).eq("status", "active"),
        q,
        category,
        area,
        mode
      ),
      applyListingFilters(
        supabase.from("help_requests").select("id", { count: "exact", head: true }).eq("status", "open"),
        q,
        category,
        area,
        mode
      ),
      peopleCountQuery,
      giftCountQuery,
      wantSkills
        ? applyListingFilters(
            supabase
              .from("skill_posts")
              .select("*, categories(name), profiles(full_name, rating_avg, avatar_url, area)")
              .eq("status", "active"),
            q,
            category,
            area,
            mode
          )
            .order("created_at", { ascending: false })
            .limit(preview)
        : Promise.resolve({ data: [] }),
      wantRequests
        ? applyListingFilters(
            supabase.from("help_requests").select("*, categories(name), profiles(full_name, avatar_url)").eq("status", "open"),
            q,
            category,
            area,
            mode
          )
            .order("created_at", { ascending: false })
            .limit(preview)
        : Promise.resolve({ data: [] }),
      wantPeople ? peopleListQuery.order("rating_avg", { ascending: false }).limit(preview) : Promise.resolve({ data: [] }),
      wantGifts
        ? giftListQuery.order("created_at", { ascending: false }).limit(preview)
        : Promise.resolve({ data: [] }),
    ]);

  const skills = skillRes.data || [];
  const requests = requestRes.data || [];
  const people = peopleRes.data || [];
  const gifts = "error" in giftRes && giftRes.error ? [] : giftRes.data || [];
  const giftCount = "error" in giftCountRes && giftCountRes.error ? 0 : giftCountRes.count || gifts.length;
  const counts = {
    skills: skillCount || 0,
    requests: requestCount || 0,
    people: peopleCount || 0,
    gifts: giftCount,
    all: (skillCount || 0) + (requestCount || 0) + (peopleCount || 0) + giftCount,
  };
  const empty = !skills.length && !requests.length && !people.length && !gifts.length;

  return (
    <div>
      <PageHeader kicker="Khám phá" title="Tìm kỹ năng, yêu cầu, quà tặng và người hỗ trợ" />
      <SearchExplorer
        key={`${q}-${tab}-${category}-${area}-${mode}`}
        q={q}
        tab={tab}
        category={category}
        area={area}
        mode={mode}
        categories={categories || []}
        counts={counts}
      />

      {q ? (
        <p className="mb-4 text-sm text-muted">
          {counts.all} kết quả cho “<span className="font-semibold text-ink">{q}</span>”
        </p>
      ) : null}

      {empty ? (
        <Empty title="Không có kết quả phù hợp" hint="Thử từ khóa khác, bỏ bớt bộ lọc, hoặc chọn gợi ý phía trên." />
      ) : null}

      {wantSkills && skills.length ? (
        <section className="mb-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold">Kỹ năng đang cho đi</h2>
            {tab === "all" && counts.skills > skills.length ? (
              <Link href={listingHref("skills", filters)} className="text-sm font-semibold text-terracotta">
                Xem tất cả {counts.skills}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((s) => {
              const cat = one(s.categories);
              const owner = one(s.profiles);
              return (
                <Card key={s.id}>
                  <div className="flex items-start justify-between gap-3">
                    <Badge>{cat?.name || "Kỹ năng"}</Badge>
                    <span className="text-xs text-muted">{MODE_LABEL[s.mode]}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-muted">{s.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                    <Avatar name={owner?.full_name} src={owner?.avatar_url} size={28} />
                    <span>{owner?.full_name}</span>
                    <span>· {s.area || "Toàn quốc"}</span>
                    {owner?.rating_avg ? <Stars value={Number(owner.rating_avg)} /> : null}
                  </div>
                  <div className="mt-4">
                    <LinkButton href={`/ky-nang/${s.id}`}>Xem kỹ năng</LinkButton>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {wantRequests && requests.length ? (
        <section className="mb-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold">Người đang cần hỗ trợ</h2>
            {tab === "all" && counts.requests > requests.length ? (
              <Link href={listingHref("requests", filters)} className="text-sm font-semibold text-terracotta">
                Xem tất cả {counts.requests}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map((r) => {
              const owner = one(r.profiles);
              return (
                <Card key={r.id}>
                  <div className="flex justify-between">
                    <Badge tone="sage">{formatCredit(r.time_credit)} TC</Badge>
                    <span className="text-xs text-muted">{MODE_LABEL[r.mode]}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold">{r.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-muted">{r.description}</p>
                  <p className="mt-3 text-xs text-muted">
                    {owner?.full_name} · {r.area || "Toàn quốc"}
                  </p>
                  <div className="mt-4">
                    <LinkButton href={`/yeu-cau/${r.id}`}>Xem yêu cầu</LinkButton>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {wantGifts && gifts.length ? (
        <section className="mb-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold">Tặng quà cộng đồng</h2>
            {tab === "all" && counts.gifts > gifts.length ? (
              <Link href={listingHref("gifts", filters)} className="text-sm font-semibold text-terracotta">
                Xem tất cả {counts.gifts}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {gifts.map((g) => {
              const owner = one(g.profiles);
              const cat = one(g.gift_categories);
              const cover = (g.image_urls || [])[0];
              return (
                <Card key={g.id} className="overflow-hidden p-0">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-40 w-full object-cover" />
                  ) : null}
                  <div className="p-5">
                    <div className="flex justify-between">
                      <Badge>{cat?.name || "Tặng quà"}</Badge>
                      <Badge tone="sage">{formatCredit(g.time_credit)} TC</Badge>
                    </div>
                    <h3 className="mt-2 text-xl font-bold">{g.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>
                    <p className="mt-3 text-xs text-muted">
                      {owner?.full_name} · {g.area || "Thỏa thuận"}
                    </p>
                    <div className="mt-4">
                      <LinkButton href={`/tang-qua/${g.id}`}>Xem món đồ</LinkButton>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {wantPeople && people.length ? (
        <section className="mb-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold">Người hỗ trợ</h2>
            {tab === "all" && counts.people > people.length ? (
              <Link href={listingHref("people", filters)} className="text-sm font-semibold text-terracotta">
                Xem tất cả {counts.people}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {people.map((p) => (
              <Card key={p.id} className="flex items-start gap-4">
                <Avatar name={p.full_name} src={p.avatar_url} size={48} />
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{p.full_name}</h3>
                  <p className="text-sm text-muted">
                    {p.area || "Chưa cập nhật khu vực"} · {formatCredit(p.time_credit)} TC
                  </p>
                  {p.rating_count ? (
                    <p className="mt-1 text-xs">
                      <Stars value={Number(p.rating_avg)} /> {Number(p.rating_avg).toFixed(1)}
                    </p>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-sm">{p.bio}</p>
                  <Link href={`/ho-so/${p.id}`} className="mt-3 inline-block text-sm font-semibold text-sage">
                    Xem hồ sơ
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
