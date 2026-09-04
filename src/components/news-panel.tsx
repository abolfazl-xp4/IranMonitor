"use client";

import * as React from "react";
import { Newspaper, ExternalLink, Search } from "lucide-react";
import { Panel } from "@/components/panel";
import { useApi } from "@/hooks/use-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const CAT_COLOR: Record<string, string> = {
  "عمومی": "bg-primary/10 text-primary",
  "اقتصاد": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "حوادث": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const FILTERS = [
  { id: "all", label: "همه" },
  { id: "عمومی", label: "عمومی" },
  { id: "اقتصاد", label: "اقتصاد" },
  { id: "حوادث", label: "حوادث" },
] as const;

export function NewsPanel() {
  const { data, loading, error, updatedAt } = useApi<any>("/api/news", 300000);
  const [filter, setFilter] = React.useState<string>("all");
  const [q, setQ] = React.useState<string>("");

  const allNews = data?.news || [];
  const filtered = allNews
    .filter((n: any) => filter === "all" || n.category === filter)
    .filter((n: any) => !q.trim() || n.title?.includes(q.trim()) || n.snippet?.includes(q.trim()));

  const counts: Record<string, number> = { all: allNews.length };
  allNews.forEach((n: any) => { counts[n.category] = (counts[n.category] || 0) + 1; });

  return (
    <Panel
      title="اخبار ایران"
      icon={<Newspaper className="h-4 w-4" />}
      updatedAt={updatedAt}
      nextRefreshIn={300}
      loading={loading}
      error={error}
      collapsible
      storageKey="news"
    >
      <div className="border-b border-border/60 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filter === f.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f.label}
              {counts[f.id] !== undefined && (
                <span className="ms-1 opacity-70">{`(${counts[f.id]})`}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجوی خبر..."
            className="h-8 pr-8 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="h-[340px] scroll-thin">
        <ul className="divide-y divide-border/40">
          {filtered.map((n: any, i: number) => (
            <li key={i}>
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                    {n.title}
                  </p>
                  {n.snippet && (
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{n.snippet}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant="secondary" className={`px-1.5 py-0 text-[10px] font-normal ${CAT_COLOR[n.category] || ""}`}>
                      {n.category}
                    </Badge>
                    <span className="truncate">{n.source}</span>
                  </div>
                </div>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </li>
          ))}
          {filtered.length === 0 && !loading && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              {q ? "نتیجه‌ای یافت نشد" : "خبری یافت نشد"}
            </li>
          )}
        </ul>
      </ScrollArea>
    </Panel>
  );
}
