"use client";

import * as React from "react";
import { GitCompare, X, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits } from "@/lib/iran-data";
import { tomanFa, usdFa } from "@/lib/format";

interface Asset {
  type: "currency" | "coin" | "crypto";
  code: string;
  label: string;
  data: number[];
  unit: "toman" | "usd";
  change: number;
}

export function ComparisonChart() {
  const { data: cur } = useApi<any>("/api/currency", 90000);
  const { data: crypto } = useApi<any>("/api/crypto", 90000);
  const [open, setOpen] = React.useState(false);
  const [a, setA] = React.useState<string>("");
  const [b, setB] = React.useState<string>("");

  // Build asset list
  const assets = React.useMemo(() => {
    const list: Asset[] = [];
    (cur?.currencies || []).forEach((c: any) => {
      list.push({ type: "currency", code: c.code, label: `${c.icon} ${c.nameFa}`, data: c.trend || [], unit: "toman", change: c.change });
    });
    (cur?.coins || []).forEach((c: any) => {
      list.push({ type: "coin", code: c.code, label: `🥇 ${c.nameFa}`, data: [], unit: "toman", change: c.change });
    });
    (crypto?.coins || []).forEach((c: any) => {
      list.push({ type: "crypto", code: c.id, label: c.symbol, data: c.sparkline || [], unit: "usd", change: c.change24h });
    });
    return list.filter((a) => a.data.length >= 2);
  }, [cur, crypto]);

  React.useEffect(() => {
    if (assets.length > 0 && !a) setA(`currency|USD`);
    if (assets.length > 1 && !b) setB(`crypto|bitcoin`);
  }, [assets, a, b]);

  const assetA = assets.find((x) => `${x.type}|${x.code}` === a);
  const assetB = assets.find((x) => `${x.type}|${x.code}` === b);

  // Normalize both series to 0-100 (percentage of first value) for comparison
  const normalize = (data: number[]) => {
    if (!data || data.length < 2) return [];
    const first = data[0] || 1;
    return data.map((v) => ((v - first) / first) * 100);
  };

  const normA = assetA ? normalize(assetA.data) : [];
  const normB = assetB ? normalize(assetB.data) : [];

  // Chart geometry
  const W = 560;
  const H = 260;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  // find min/max across both normalized series
  const all = [...normA, ...normB, 0];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;

  const x = (i: number, len: number) => padL + (i / Math.max(1, len - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / range) * (H - padT - padB);

  const lineA = normA.map((v, i) => `${x(i, normA.length).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const lineB = normB.map((v, i) => `${x(i, normB.length).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const ticks = [min, min + range * 0.5, max];
  const changeA = assetA?.change ?? 0;
  const changeB = assetB?.change ?? 0;
  const outperform = changeA > changeB ? "A" : "B";

  return (
    <>
      <Card className="overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
              <GitCompare className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold">مقایسه دارایی‌ها</h2>
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setOpen(true)}>
            مقایسه
          </Button>
        </div>
        <div className="p-4">
          {assetA && assetB ? (
            <>
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 bg-card/60 p-2.5">
                  <p className="truncate text-[11px] text-muted-foreground">{assetA.label}</p>
                  <p className={`flex items-center gap-1 text-sm font-bold ${changeA >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {changeA >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {changeA >= 0 ? "+" : ""}{toPersianDigits(changeA.toFixed(2))}٪
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/60 p-2.5">
                  <p className="truncate text-[11px] text-muted-foreground">{assetB.label}</p>
                  <p className={`flex items-center gap-1 text-sm font-bold ${changeB >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {changeB >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {changeB >= 0 ? "+" : ""}{toPersianDigits(changeB.toFixed(2))}٪
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-border/60 bg-card/40">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
                  {/* grid */}
                  {ticks.map((t, i) => (
                    <g key={i}>
                      <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.5} />
                      <text x={padL - 4} y={y(t) + 3} textAnchor="end" fontSize={9} fill="var(--muted-foreground)" className="font-mono">
                        {t >= 0 ? "+" : ""}{toPersianDigits(t.toFixed(1))}٪
                      </text>
                    </g>
                  ))}
                  {/* zero line */}
                  <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="var(--muted-foreground)" strokeWidth={0.8} opacity={0.5} />
                  {/* line A (emerald) */}
                  <polyline points={lineA} fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  {/* line B (amber) */}
                  <polyline points={lineB} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  {/* legend */}
                  <g transform={`translate(${padL + 8}, ${padT + 8})`}>
                    <rect x={-4} y={-8} width={120} height={32} rx={4} fill="var(--card)" opacity={0.9} />
                    <circle cx={4} cy={0} r={3} fill="#10b981" />
                    <text x={12} y={3} fontSize={9} fill="var(--foreground)" className="font-medium">{assetA.label.slice(0, 14)}</text>
                    <circle cx={4} cy={14} r={3} fill="#f59e0b" />
                    <text x={12} y={17} fontSize={9} fill="var(--foreground)" className="font-medium">{assetB.label.slice(0, 14)}</text>
                  </g>
                </svg>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                عملکرد نسبی (نرمال‌شده به درصد) —{" "}
                <b className={outperform === "A" ? "text-emerald-500" : "text-amber-500"}>
                  {outperform === "A" ? assetA.label : assetB.label}
                </b>{" "}
                عملکرد بهتری داشت
              </p>
            </>
          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">در حال بارگذاری داده‌ها...</p>
          )}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-[480px]">
          <DialogHeader className="border-b border-border/60 bg-muted/30 px-4 py-3">
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <GitCompare className="h-4 w-4 text-primary" />
              انتخاب دارایی‌ها برای مقایسه
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 p-4">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">دارایی اول</label>
              <Select value={a} onValueChange={setA}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {assets.map((x) => (
                    <SelectItem key={`${x.type}|${x.code}`} value={`${x.type}|${x.code}`} className="text-xs">{x.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">دارایی دوم</label>
              <Select value={b} onValueChange={setB}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {assets.map((x) => (
                    <SelectItem key={`${x.type}|${x.code}`} value={`${x.type}|${x.code}`} className="text-xs">{x.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-1.5" onClick={() => setOpen(false)}>
              مقایسه
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
