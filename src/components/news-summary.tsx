"use client";

import * as React from "react";
import { Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useApi } from "@/hooks/use-api";

export function NewsSummary() {
  const { data, loading, error, refresh } = useApi<any>("/api/news-summary", 900000);
  const [retryCount, setRetryCount] = React.useState(0);

  // Auto-retry once after 3 seconds if error
  React.useEffect(() => {
    if (error && retryCount < 2) {
      const id = setTimeout(() => { setRetryCount(c => c + 1); refresh(); }, 3000);
      return () => clearTimeout(id);
    }
  }, [error, retryCount, refresh]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-gradient-to-l from-primary/10 to-transparent px-4 py-3">
        <Sparkles className="h-4 w-4 animate-pulse text-primary" />
        <span className="text-sm text-muted-foreground">در حال تهیه خلاصه هوشمند اخبار...</span>
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.summary) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>خلاصه هوشمند اخبار در حال بارگذاری است.</span>
        <button
          onClick={() => { setRetryCount(0); refresh(); }}
          className="ms-auto inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-2 py-1 text-[10px] transition-colors hover:bg-muted"
        >
          <RefreshCw className="h-3 w-3" />
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent p-4">
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-primary/20 opacity-20 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-sm font-bold">خلاصه هوشمند اخبار ایران</h3>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">AI</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{data.summary}</p>
          {data.points?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {data.points.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5 text-[12px] text-muted-foreground">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
