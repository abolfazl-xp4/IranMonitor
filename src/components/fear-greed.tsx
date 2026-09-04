"use client";

import * as React from "react";
import { Ghost, Flame, Annoyed, Meh, Smile, Laugh } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits } from "@/lib/iran-data";

interface FGData {
  value: number; // 0-100
  classification: string;
  history: number[];
}

// Simulated Fear & Greed Index (since external API may be unreliable).
// The value drifts based on crypto 24h changes for a realistic feel.
export function FearGreedIndex() {
  const { data: crypto } = useApi<any>("/api/crypto", 90000);
  const [fg, setFg] = React.useState<FGData | null>(null);

  React.useEffect(() => {
    if (!crypto?.coins?.length) return;
    const avgChange = crypto.coins.reduce((s: number, c: any) => s + (c.change24h || 0), 0) / crypto.coins.length;
    // map avgChange (-10..+10) to 0..100, base 50
    const base = 50 + avgChange * 4;
    const value = Math.max(5, Math.min(95, Math.round(base + (Math.random() - 0.5) * 6)));
    const classification =
      value < 25 ? "ترس شدید" :
      value < 45 ? "ترس" :
      value < 55 ? "خنثی" :
      value < 75 ? "طمع" :
      value < 90 ? "طمع شدید" : "طمع افراطی";
    // synthetic 7-pt history ending at current value
    const history = Array.from({ length: 7 }, (_, i) => {
      const t = (6 - i) / 6;
      return Math.max(5, Math.min(95, Math.round(value + (Math.random() - 0.5) * 15 * t)));
    });
    history[6] = value;
    setFg({ value, classification, history });
  }, [crypto]);

  if (!fg) {
    return (
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4 text-xs text-muted-foreground">
          <Ghost className="h-4 w-4 animate-pulse" />
          در حال محاسبه شاخص ترس و طمع...
        </div>
      </Card>
    );
  }

  const color = fg.value < 25 ? "#ef4444" : fg.value < 45 ? "#f97316" : fg.value < 55 ? "#eab308" : fg.value < 75 ? "#84cc16" : "#10b981";
  const Icon = fg.value < 25 ? Annoyed : fg.value < 45 ? Meh : fg.value < 55 ? Meh : fg.value < 75 ? Smile : Laugh;

  // arc gauge
  const angle = (fg.value / 100) * 180 - 90;
  const W = 120;
  const H = 70;

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/20">
            <Ghost className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold">شاخص ترس و طمع</h2>
        </div>
        <span className="text-[10px] text-muted-foreground">کریپتو</span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Gauge */}
          <div className="shrink-0">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-[120px]" style={{ height: 70 }}>
              <defs>
                <linearGradient id="fgGauge" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="33%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="66%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <path d={`M 8 ${H - 8} A 52 52 0 0 1 ${W - 8} ${H - 8}`} fill="none" stroke="var(--muted)" strokeWidth="6" strokeLinecap="round" />
              <path d={`M 8 ${H - 8} A 52 52 0 0 1 ${W - 8} ${H - 8}`} fill="none" stroke="url(#fgGauge)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(fg.value / 100) * 163} 163`} />
              <g transform={`rotate(${angle} ${W / 2} ${H - 8})`}>
                <line x1={W / 2} y1={H - 8} x2={W / 2} y2={H - 32} stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />
                <circle cx={W / 2} cy={H - 8} r="3" fill="var(--foreground)" />
              </g>
            </svg>
          </div>

          {/* Value + classification */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tabular-nums" style={{ color }}>{toPersianDigits(fg.value)}</span>
              <span className="text-xs text-muted-foreground">/۱۰۰</span>
            </div>
            <p className="flex items-center gap-1 text-sm font-bold" style={{ color }}>
              <Icon className="h-4 w-4" />
              {fg.classification}
            </p>
          </div>
        </div>

        {/* 7-day mini history */}
        <div className="mt-3 flex items-end justify-between gap-1" style={{ height: 28 }}>
          {fg.history.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
              <div
                className="w-full rounded-t-sm transition-all hover:opacity-80"
                style={{
                  height: `${(v / 100) * 22 + 2}px`,
                  background: v < 25 ? "#ef4444" : v < 45 ? "#f97316" : v < 55 ? "#eab308" : v < 75 ? "#84cc16" : "#10b981",
                  minHeight: 2,
                }}
                title={toPersianDigits(v)}
              />
              <span className="text-[8px] text-muted-foreground">{["۷", "۶", "۵", "۴", "۳", "۲", "۱"][i]}</span>
            </div>
          ))}
        </div>
        <p className="mt-1 text-center text-[10px] text-muted-foreground">روند ۷ روزه (نمایشی)</p>
      </div>
    </Card>
  );
}
