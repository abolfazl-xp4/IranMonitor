"use client";

import * as React from "react";
import { Coins, Gem, Download, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Panel } from "@/components/panel";
import { useApi } from "@/hooks/use-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toPersianDigits } from "@/lib/iran-data";
import { tomanFa, changeFa } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import { exportCSV, timestamp } from "@/lib/export";
import { PriceChart } from "@/components/price-chart";

function MiniSparkline({ data, up }: { data: number[]; up: boolean }) {
  if (!data || data.length < 2) return null;
  const w = 70;
  const h = 26;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (w - 6) + 3;
      const y = h - 3 - ((v - min) / range) * (h - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "#10b981" : "#f43f5e"}
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CurrencyPanel() {
  const { data, loading, error, updatedAt } = useApi<any>("/api/currency", 90000);
  const [sortKey, setSortKey] = React.useState<"name" | "sell" | "change">("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [chart, setChart] = React.useState<{ name: string; data: number[]; changePct: number } | null>(null);

  const toggleSort = (key: "name" | "sell" | "change") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sortedCurrencies = React.useMemo(() => {
    const arr = [...(data?.currencies || [])];
    arr.sort((a, b) => {
      let cmp: number;
      if (sortKey === "name") cmp = a.nameFa.localeCompare(b.nameFa, "fa");
      else cmp = a[sortKey] - b[sortKey];
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data?.currencies, sortKey, sortDir]);

  return (
    <Panel
      title="نرخ ارز و طلا"
      icon={<Coins className="h-4 w-4" />}
      updatedAt={updatedAt}
      nextRefreshIn={90}
      loading={loading}
      error={error}
      collapsible
      storageKey="currency"
      action={
        <button
          onClick={() => {
            const rows = (data?.currencies || []).map((c: any) => ({
              code: c.code,
              name: c.nameFa,
              buy_rial: c.buy,
              sell_rial: c.sell,
              change_pct: c.change.toFixed(2),
            }));
            exportCSV(`currency-${timestamp()}.csv`, rows);
          }}
          className="rounded-md border border-border/60 bg-card/60 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="خروجی CSV"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      }
    >
      <Tabs defaultValue="currency" className="flex h-full flex-col">
        <TabsList className="mx-3 mt-3 grid grid-cols-2">
          <TabsTrigger value="currency" className="text-xs">ارز</TabsTrigger>
          <TabsTrigger value="coin" className="text-xs">طلا و سکه</TabsTrigger>
        </TabsList>
        <TabsContent value="currency" className="mt-0 flex-1 overflow-hidden">
          <ScrollArea className="h-[360px] scroll-thin">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                <tr className="text-[11px] text-muted-foreground">
                  <th className="px-3 py-2 text-right font-medium">
                    <SortHeader label="ارز" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} align="right" />
                  </th>
                  <th className="px-2 py-2 text-left font-medium">
                    <SortHeader label="فروش (ت)" active={sortKey === "sell"} dir={sortDir} onClick={() => toggleSort("sell")} align="left" />
                  </th>
                  <th className="px-2 py-2 text-center font-medium">روند ۷ نقطه</th>
                  <th className="px-3 py-2 text-left font-medium">
                    <SortHeader label="تغییر" active={sortKey === "change"} dir={sortDir} onClick={() => toggleSort("change")} align="left" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCurrencies.map((c: any) => {
                  const ch = changeFa(c.change);
                  return (
                    <tr key={c.code} className="border-t border-border/40 transition-colors hover:bg-muted/30">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.icon}</span>
                          <div>
                            <div className="font-medium">{c.nameFa}</div>
                            <div className="text-[10px] text-muted-foreground">{c.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-left font-mono text-xs tabular-nums">{tomanFa(c.sell / 10)}</td>
                      <td className="px-2 py-2">
                        <button
                          className="flex justify-center rounded transition-transform hover:scale-110"
                          onClick={() => setChart({ name: c.nameFa, data: c.trend || [], changePct: c.change })}
                          title="نمایش نمودار کامل"
                        >
                          <MiniSparkline data={c.trend || []} up={ch.up} />
                        </button>
                      </td>
                      <td className={`px-3 py-2 text-left text-xs font-medium ${ch.up ? "text-emerald-500" : "text-rose-500"}`}>
                        <span className="inline-flex items-center gap-0.5">
                          {ch.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {ch.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="coin" className="mt-0 flex-1 overflow-hidden">
          <ScrollArea className="h-[360px] scroll-thin">
            <ul className="divide-y divide-border/40">
              {(data?.coins || []).map((c: any) => {
                const ch = changeFa(c.change);
                return (
                  <li key={c.code} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-500">
                      <Gem className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.nameFa}</p>
                      <p className="font-mono text-xs tabular-nums text-muted-foreground">
                        خرید {tomanFa(c.buy)} • فروش {tomanFa(c.sell)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${ch.up ? "text-emerald-500" : "text-rose-500"}`}>
                      {ch.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <PriceChart
        open={!!chart}
        onOpenChange={(v) => !v && setChart(null)}
        name={chart?.name || ""}
        data={chart?.data || []}
        unit="toman"
        changePct={chart?.changePct}
      />
    </Panel>
  );
}

function SortHeader({ label, active, dir, onClick, align }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void; align: "left" | "right" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${active ? "text-primary" : "text-muted-foreground"} ${align === "right" ? "flex-row" : "flex-row-reverse"}`}
    >
      <span>{label}</span>
      {active ? (
        dir === "asc" ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />
      ) : (
        <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
      )}
    </button>
  );
}
