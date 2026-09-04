"use client";

import * as React from "react";
import { Newspaper, ExternalLink, Loader2, Search, RefreshCw, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toPersianDigits } from "@/lib/iran-data";
import { timeAgoFa } from "@/lib/format";

const CAT_COLOR: Record<string, string> = {
  "عمومی": "bg-primary/10 text-primary",
  "حوادث": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const REFRESH_INTERVAL = 60; // seconds — auto-refresh province news

interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date: string;
  category: string;
  isProvinceSpecific?: boolean;
}

export function ProvinceNews({ provinceId }: { provinceId: string }) {
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState<number | null>(null);
  const [countdown, setCountdown] = React.useState(REFRESH_INTERVAL);
  const [tick, setTick] = React.useState(0);

  const fetchNews = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/province-news?province=${provinceId}&t=${Date.now()}`);
      const data = await res.json();
      if (data.ok) {
        setNews(data.news || []);
        setUpdatedAt(Date.now());
        setCountdown(REFRESH_INTERVAL);
      } else {
        setError(data.error || "خطا");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [provinceId]);

  // Initial fetch + when province changes
  React.useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Countdown timer (every second)
  React.useEffect(() => {
    if (countdown <= 0) {
      fetchNews();
      return;
    }
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown, fetchNews]);

  const progressPct = ((REFRESH_INTERVAL - countdown) / REFRESH_INTERVAL) * 100;

  return (
    <div className="border-t border-border/60">
      {/* Header with live indicator + countdown */}
      <div className="flex items-center justify-between gap-2 bg-gradient-to-l from-primary/10 to-transparent px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Newspaper className="h-3.5 w-3.5 text-primary" />
          <p className="text-[11px] font-bold text-foreground">اخبار استان</p>
          {news.length > 0 && (
            <span className="text-[10px] text-muted-foreground">{toPersianDigits(news.length)} خبر</span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            RSS زنده
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Countdown ring */}
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground" title="بازخوانی خودکار">
            <svg className="h-4 w-4 -rotate-90" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" fill="none" stroke="var(--muted)" strokeWidth="1.5" />
              <circle
                cx="8" cy="8" r="6"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={`${(progressPct / 100) * 37.7} 37.7`}
              />
            </svg>
            {toPersianDigits(countdown)}ث
          </div>
          <button
            onClick={fetchNews}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            title="بازخوانی فوری"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && news.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-4 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          در حال جستجوی اخبار از خبرگزاری‌های معتبر...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 px-3 py-3 text-[11px] text-rose-500">
          <Search className="h-3.5 w-3.5" />
          خطا: {error}
        </div>
      ) : news.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-3 text-[11px] text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          اخباری برای این استان یافت نشد
        </div>
      ) : (
        <>
          {/* Last updated indicator */}
          {updatedAt && (
            <div className="flex items-center gap-1 px-3 pb-1 text-[9px] text-muted-foreground">
              <Radio className="h-2.5 w-2.5 text-emerald-500" />
              آخرین بروزرسانی: {timeAgoFa(updatedAt)}
            </div>
          )}
          <ul className="max-h-[320px] divide-y divide-border/40 overflow-y-auto scroll-thin">
            {news.map((n, i) => (
              <li key={i} className={n.isProvinceSpecific ? "bg-primary/5" : ""}>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 px-3 py-2 transition-colors hover:bg-muted/40"
                >
                  <span className="mt-0.5 shrink-0 text-xs">
                    {n.isProvinceSpecific ? "📍" : "📰"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium leading-snug group-hover:text-primary">
                      {n.title}
                    </p>
                    {n.snippet && (
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{n.snippet}</p>
                    )}
                    <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                      <span className="truncate font-medium text-foreground/70">{n.source}</span>
                      {n.isProvinceSpecific && (
                        <span className="rounded-full bg-primary/15 px-1 py-0 text-[8px] font-bold text-primary">اخبار استان</span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
