"use client";

import { Flame, Wheat, Wind, Hammer, CircleDot, Coins } from "lucide-react";
import { Panel } from "@/components/panel";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits } from "@/lib/iran-data";
import { usdFa, changeFa } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";

// distinct icons per commodity type
const ICONS: Record<string, React.ReactNode> = {
  oil: <Flame className="h-4 w-4" />,
  gold: <Coins className="h-4 w-4" />,
  silver: <CircleDot className="h-4 w-4" />,
  copper: <Hammer className="h-4 w-4" />,
  steel: <Hammer className="h-4 w-4" />,
  gas: <Wind className="h-4 w-4" />,
  wheat: <Wheat className="h-4 w-4" />,
};

const ACCENTS: Record<string, string> = {
  brent: "from-amber-600 to-orange-700",
  wti: "from-stone-600 to-stone-800",
  gold_oz: "from-yellow-500 to-amber-600",
  silver_oz: "from-slate-400 to-slate-600",
  copper: "from-orange-500 to-red-600",
  steel: "from-zinc-500 to-zinc-700",
  gas: "from-sky-500 to-cyan-700",
  wheat: "from-amber-400 to-yellow-600",
};

export function CommoditiesPanel() {
  const { data, loading, error, updatedAt } = useApi<any>("/api/commodities", 120000);
  const items = data?.commodities || [];

  return (
    <Panel
      title="کالاهای جهانی"
      icon={<Flame className="h-4 w-4" />}
      updatedAt={updatedAt}
      nextRefreshIn={120}
      loading={loading}
      error={error}
      collapsible
      storageKey="commodities"
    >
      <div className="grid grid-cols-2 gap-2 p-3">
        {items.map((c: any) => {
          const ch = changeFa(c.change);
          const up = c.change >= 0;
          return (
            <div
              key={c.code}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className={`absolute -left-4 -top-4 h-12 w-12 rounded-full bg-gradient-to-br ${ACCENTS[c.code] || "from-primary to-primary"} opacity-20 blur-xl transition-opacity group-hover:opacity-40`} />
              <div className="flex items-center justify-between">
                <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${ACCENTS[c.code] || "from-primary to-primary"} text-white shadow-sm`}>
                  {ICONS[c.icon] || <Flame className="h-4 w-4" />}
                </span>
                <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium ${up ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                  {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {ch.text}
                </span>
              </div>
              <p className="mt-2 truncate text-[11px] text-muted-foreground">{c.nameFa}</p>
              <p className="font-mono text-base font-extrabold tabular-nums">{usdFa(c.priceUsd)}</p>
              <p className="text-[10px] text-muted-foreground">به ازای هر {c.unit}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
