"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Search, Sparkles, X } from "lucide-react";
import { POPULAR_SEARCHES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AreaPicker } from "@/components/area-picker";

type Category = { id: string; name: string };
type Suggestion = { kind: "category" | "skill" | "request" | "person" | "gift"; id: string; label: string; href: string };
type Counts = { all: number; skills: number; requests: number; people: number; gifts: number };

const KIND_LABEL: Record<Suggestion["kind"], string> = {
  category: "Danh mục",
  skill: "Kỹ năng",
  request: "Yêu cầu",
  gift: "Tặng quà",
  person: "Người hỗ trợ",
};

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "skills", label: "Kỹ năng" },
  { id: "requests", label: "Yêu cầu" },
  { id: "gifts", label: "Tặng quà" },
  { id: "people", label: "Người hỗ trợ" },
] as const;

const RECENT_KEY = "vshare-recent-search";

function buildHref(params: Record<string, string>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  const qs = sp.toString();
  return qs ? `/tim-kiem?${qs}` : "/tim-kiem";
}

export function SearchExplorer({
  q,
  tab,
  category,
  area,
  mode,
  categories,
  counts,
}: {
  q: string;
  tab: string;
  category: string;
  area: string;
  mode: string;
  categories: Category[];
  counts: Counts;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  const base = useMemo(() => ({ tab, category, area, mode }), [tab, category, area, mode]);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      setRecent(raw ? (JSON.parse(raw) as string[]).slice(0, 6) : []);
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 1) {
      setItems([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`);
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items || []);
      setActive(0);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  function remember(term: string) {
    const next = [term, ...recent.filter((x) => x !== term)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  function goSearch(term: string, extra?: Record<string, string>) {
    const cleaned = term.trim();
    if (cleaned) remember(cleaned);
    router.push(buildHref({ ...base, q: cleaned, ...extra }));
    setOpen(false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = {
      q: String(fd.get("q") || "").trim(),
      tab,
      category: String(fd.get("category") || ""),
      area: String(fd.get("area") || ""),
      mode: String(fd.get("mode") || ""),
    };
    if (next.q) remember(next.q);
    router.push(buildHref(next));
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    const list = items.length ? items : [];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(list.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showPanel = open && (query.trim().length > 0 || recent.length > 0);

  return (
    <div className="mb-6 rounded-2xl border border-line bg-white p-4 shadow-sm md:p-5">
      <form onSubmit={onSubmit} className="grid gap-3">
        <input type="hidden" name="tab" value={tab} />
        <div ref={boxRef} className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Tìm kỹ năng, yêu cầu hỗ trợ, người giúp đỡ..."
            autoComplete="off"
            className="w-full rounded-xl border border-line bg-paper/60 py-3 pl-10 pr-10 text-sm outline-none ring-terracotta/25 transition focus:border-terracotta focus:bg-white focus:ring-4"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                goSearch("", { q: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label="Xóa"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          {showPanel ? (
            <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-[0_18px_50px_rgba(11,31,51,0.12)]">
              {items.length ? (
                <ul className="max-h-80 overflow-auto py-2">
                  {items.map((item, i) => (
                    <li key={`${item.kind}-${item.id}`}>
                      <Link
                        href={item.href}
                        onClick={() => remember(query.trim() || item.label)}
                        className={cn(
                          "flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-paper",
                          i === active && "bg-paper"
                        )}
                      >
                        <span className="truncate font-medium">{item.label}</span>
                        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">
                          {KIND_LABEL[item.kind]}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => goSearch(query, { tab: "all" })}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-terracotta hover:bg-paper"
                    >
                      <Search className="h-4 w-4" />
                      Tìm “{query.trim()}” trong tất cả
                    </button>
                  </li>
                </ul>
              ) : query.trim() ? (
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-terracotta hover:bg-paper"
                >
                  <Search className="h-4 w-4" />
                  Tìm “{query.trim()}”
                </button>
              ) : recent.length ? (
                <div className="py-2">
                  <p className="px-4 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">Tìm gần đây</p>
                  {recent.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => goSearch(term)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-paper"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted" />
                      {term}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            name="category"
            defaultValue={category}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="min-w-0 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Mọi danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="mode"
            defaultValue={mode}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="min-w-0 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Mọi hình thức</option>
            <option value="online">Trực tuyến</option>
            <option value="offline">Trực tiếp</option>
            <option value="both">Cả hai</option>
          </select>
        </div>
        <AreaPicker defaultValue={area} autoSubmit />

        <button className="w-full rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white">Tìm kiếm</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-terracotta" />
        <span className="text-xs font-semibold text-muted">Gợi ý:</span>
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => goSearch(term, { tab: "all" })}
            className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium hover:border-terracotta hover:text-terracotta"
          >
            {term}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto border-t border-line pt-3">
        {TABS.map((t) => {
          const n = counts[t.id];
          const href = buildHref({ q, category, area, mode, tab: t.id });
          const on = tab === t.id;
          return (
            <Link
              key={t.id}
              href={href}
              className={cn(
                "shrink-0 rounded-xl px-3 py-2 text-sm font-semibold",
                on ? "bg-navy text-white" : "text-muted hover:bg-paper"
              )}
            >
              {t.label}
              <span className={cn("ml-1.5 text-xs font-medium", on ? "text-white/70" : "text-muted")}>{n}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
