"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits } from "@/lib/iran-data";
import { tomanFa, changeFa } from "@/lib/format";

export function Ticker() {
  const { data } = useApi<any>("/api/currency", 60000);
  const { data: crypto } = useApi<any>("/api/crypto", 60000);

  const items: { label: string; value: string; pct: number }[] = [];
  (data?.currencies || []).forEach((c: any) => {
    items.push({
      label: c.nameFa,
      value: `${tomanFa(c.sell / 10)} ت`,
      pct: c.change,
    });
  });
  (crypto?.coins || []).forEach((c: any) => {
    items.push({
      label: c.name,
      value: tomanFa(c.priceToman) + " ت",
      pct: c.change24h,
    });
  });

  if (items.length === 0) {
    return <div className="h-9 border-b border-border/60 bg-card/40" />;
  }

  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-card/60 to-card/30">
      <div className="marquee-track py-2">
        {doubled.map((it, i) => {
          const ch = changeFa(it.pct);
          return (
            <span key={i} className="mx-4 inline-flex items-center gap-1.5 text-xs">
              <span className="font-medium text-muted-foreground">{it.label}</span>
              <span className="font-bold tabular-nums">{it.value}</span>
              <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] ${ch.up ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                {ch.up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {ch.text}
              </span>
              <span className="mx-2 text-muted-foreground/30">•</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
