"use client";

import * as React from "react";
import { Brain, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits } from "@/lib/iran-data";

export function MarketInsights() {
  const { data, loading, error, refresh } = useApi<any>("/api/market-insights", 600000);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    if (error && retryCount < 2) {
      const id = setTimeout(() => { setRetryCount(c => c + 1); refresh(); }, 3000);
      return () => clearTimeout(id);
    }
  }, [error, retryCount, refresh]);

  const sentiment = data?.sentiment || 0;
  const sentimentLabel = sentiment > 30 ? "خوش‌بین" : sentiment < -30 ? "بدبین" : "خنثی";
  const sentimentColor = sentiment > 30 ? "text-emerald-500" : sentiment < -30 ? "text-rose-500" : "text-amber-500";
  const SentimentIcon = sentiment > 30 ? TrendingUp : sentiment < -30 ? TrendingDown : Minus;
  const angle = (sentiment + 100) / 200 * 180 - 90;

  if (loading) {
    return (
      <Card className="overflow-hidden border-primary/30 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
            <Brain className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">تحلیل هوشمند بازار</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              در حال تحلیل داده‌های بازار...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !data?.analysis) {
    return (
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>تحلیل هوشمند بازار در حال بارگذاری است.</span>
          <button
            onClick={() => { setRetryCount(0); refresh(); }}
            className="ms-auto inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-2 py-1 text-[10px] transition-colors hover:bg-muted"
          >
            <RefreshCw className="h-3 w-3" />
            تلاش مجدد
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fade-up relative overflow-hidden border-primary/30 shadow-sm">
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-primary/20 opacity-20 blur-2xl" />
      <div className="relative flex items-start gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
          <Brain className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-sm font-bold">تحلیل هوشمند بازار</h3>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">AI</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{data.analysis}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 border-t border-border/60 bg-muted/20 px-4 py-3">
        <div className="relative h-12 w-12 shrink-0">
          <svg viewBox="0 0 48 48" className="h-12 w-12">
            <defs>
              <linearGradient id="sentGauge" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path d="M 6 38 A 18 18 0 0 1 42 38" fill="none" stroke="url(#sentGauge)" strokeWidth="4" strokeLinecap="round" />
            <g transform={`rotate(${angle} 24 38)`}>
              <line x1="24" y1="38" x2="24" y2="22" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="38" r="2.5" fill="var(--foreground)" />
            </g>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">احساس بازار</span>
            <span className={`flex items-center gap-1 text-xs font-bold ${sentimentColor}`}>
              <SentimentIcon className="h-3 w-3" />
              {sentimentLabel}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${sentiment > 30 ? "bg-emerald-500" : sentiment < -30 ? "bg-rose-500" : "bg-amber-500"}`} style={{ width: `${((sentiment + 100) / 200) * 100}%` }} />
            </div>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {sentiment > 0 ? "+" : ""}{toPersianDigits(sentiment)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
