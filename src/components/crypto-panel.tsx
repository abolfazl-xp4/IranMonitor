"use client";

import { Bitcoin, Activity } from "lucide-react";
import { Panel } from "@/components/panel";
import { useApi } from "@/hooks/use-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toPersianDigits } from "@/lib/iran-data";
import { usdFa, tomanFa, changeFa } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PriceChart } from "@/components/price-chart";
import * as React from "react";

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (!data || data.length < 2) return null;
  const w = 80;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "#10b981" : "#f43f5e"}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CryptoPanel() {
  const { data, loading, error, updatedAt } = useApi<any>("/api/crypto", 90000);
  const coins = (data?.coins || []).slice().sort((a: any, b: any) => b.marketCap - a.marketCap);
  const maxVolume = Math.max(1, ...coins.map((c: any) => c.volume24h || 0));
  const [chart, setChart] = React.useState<{ name: string; data: number[]; changePct: number } | null>(null);

  return (
    <Panel
      title="ارزهای دیجیتال"
      icon={<Bitcoin className="h-4 w-4" />}
      updatedAt={updatedAt}
      nextRefreshIn={90}
      loading={loading}
      error={error}
      collapsible
      storageKey="crypto"
      action={
        <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
          <Activity className="h-3 w-3 text-amber-500" />
          حجم ۲۴ ساعت
        </div>
      }
    >
      <ScrollArea className="h-[400px] scroll-thin">
        <ul className="divide-y divide-border/40">
          {coins.map((c: any, i: number) => {
            const ch = changeFa(c.change24h);
            const up = c.change24h >= 0;
            const volPct = Math.max(2, (c.volume24h / maxVolume) * 100);
            return (
              <li key={c.id} className="px-4 py-3 transition-colors hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={c.image} alt={c.symbol} className="h-8 w-8 rounded-full" loading="lazy" />
                    <span className="absolute -bottom-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-card px-1 text-[8px] font-bold text-muted-foreground ring-1 ring-border">
                      {toPersianDigits(i + 1)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-[11px] uppercase text-muted-foreground">{c.symbol}</p>
                  </div>
                  <button
                    className="rounded transition-transform hover:scale-110"
                    onClick={() => setChart({ name: c.name, data: c.sparkline || [], changePct: c.change24h })}
                    title="نمایش نمودار کامل"
                  >
                    <Sparkline data={c.sparkline} up={up} />
                  </button>
                  <div className="text-left">
                    <p className="font-mono text-sm font-bold tabular-nums">{usdFa(c.priceUsd)}</p>
                    <p className="font-mono text-[10px] tabular-nums text-muted-foreground">{tomanFa(c.priceToman)} ت</p>
                  </div>
                  <span className={`w-14 text-left text-xs font-medium ${up ? "text-emerald-500" : "text-rose-500"}`}>
                    <span className="inline-flex items-center gap-0.5">
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {toPersianDigits(Math.abs(c.change24h).toFixed(1))}%
                    </span>
                  </span>
                </div>
                {/* volume bar */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground">حجم:</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${up ? "bg-emerald-500/70" : "bg-rose-500/70"}`}
                      style={{ width: `${volPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] tabular-nums text-muted-foreground">{usdFa(c.volume24h)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
      <PriceChart
        open={!!chart}
        onOpenChange={(v) => !v && setChart(null)}
        name={chart?.name || ""}
        data={chart?.data || []}
        unit="usd"
        changePct={chart?.changePct}
      />
    </Panel>
  );
}
