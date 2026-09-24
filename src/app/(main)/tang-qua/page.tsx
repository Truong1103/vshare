import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";
import { Empty, PageHeader, Badge, Card, LinkButton, Avatar } from "@/components/ui";
import { GIFT_LABEL } from "@/lib/constants";
import { formatCredit, one } from "@/lib/utils";
import { AreaPicker } from "@/components/area-picker";
import { inputClass } from "@/components/ui";

export default async function GiftMarketPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = String(sp.q || "").trim();
  const category = String(sp.category || "");
  const area = String(sp.area || "");
  const { supabase } = await getSessionUser();
  const { data: categories } = await supabase.from("gift_categories").select("*").order("sort_order");

  let query = supabase
    .from("gift_posts")
    .select("id, title, description, area, time_credit, image_urls, status, gift_categories(name), profiles(full_name, avatar_url)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(48);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (category) query = query.eq("category_id", category);
  if (area) query = query.ilike("area", `${area.replace(/[%_]/g, "")}%`);

  const { data, error } = await query;
  const rows = error ? [] : data || [];

  return (
    <div>
      <PageHeader
        kicker="Tặng quà"
        title="Đồ dùng cho đi trong cộng đồng"
        action={<LinkButton href="/tang-qua/moi">Đăng món đồ</LinkButton>}
      />
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Tặng lại vật dụng bạn không còn dùng. Người nhận trả Time Credit theo mức người tặng ghi — không dùng tiền mặt.
      </p>
      {error ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Chưa bật Tặng quà. Chạy file <code>supabase/gifts.sql</code> trên Supabase rồi tải lại trang.
        </p>
      ) : null}
      <form className="mb-6 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1fr_180px_1fr_auto]">
        <input name="q" defaultValue={q} placeholder="Tìm món đồ..." className={inputClass()} />
        <select name="category" defaultValue={category} className={inputClass()}>
          <option value="">Mọi danh mục</option>
          {(categories || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <AreaPicker defaultValue={area} />
        <button className="rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white">Lọc</button>
      </form>
      <div className="mb-4 flex gap-3 text-sm">
        <Link href="/tang-qua" className="font-semibold text-terracotta">
          Đang nhận yêu cầu
        </Link>
        <Link href="/tang-qua/cua-toi" className="text-muted hover:text-ink">
          Quà của tôi
        </Link>
      </div>
      {!rows.length && !error ? <Empty title="Chưa có món đồ nào" hint="Hãy là người tặng đầu tiên." /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((g) => {
          const owner = one(g.profiles);
          const cat = one(g.gift_categories);
          const cover = (g.image_urls || [])[0];
          return (
            <Link key={g.id} href={`/tang-qua/${g.id}`}>
              <Card className="overflow-hidden p-0 hover:border-terracotta/40">
                <div className="relative aspect-[4/3] bg-paper-2">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-muted">Chưa có ảnh</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge>{cat?.name || "Tặng quà"}</Badge>
                    <span className="text-sm font-extrabold text-sage">{formatCredit(g.time_credit)} TC</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold">{g.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                    <Avatar name={owner?.full_name} src={owner?.avatar_url} size={24} />
                    <span className="truncate">{owner?.full_name}</span>
                    <span>· {g.area || "Thỏa thuận"}</span>
                  </div>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-terracotta">{GIFT_LABEL[g.status]}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
