"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown } from "lucide-react";
import { toPersianDigits } from "@/lib/iran-data";
import { tomanFa, usdFa } from "@/lib/format";

interface PriceChartProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  data: number[];
  // display config
  unit: "toman" | "usd";
  changePct?: number;
}

export function PriceChart({ open, onOpenChange, name, data, unit, changePct }: PriceChartProps) {
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!open) setHoverIdx(null);
  }, [open]);

  if (!data || data.length < 2) return null;

  const W = 560;
  const H = 220;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const up = (changePct ?? 0) >= 0;
  const color = up ? "#10b981" : "#f43f5e";

  const x = (i: number) => padL + (i / (data.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / range) * (H - padT - padB);

  const line = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `M${x(0)},${H - padB} L${data.map((v, i) => `${x(i)},${y(v)}`).join(" L")} L${x(data.length - 1)},${H - padB} Z`;

  // y-axis ticks
  const ticks = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max];
  const fmt = (v: number) => (unit === "toman" ? tomanFa(v) : usdFa(v));

  const first = data[0];
  const last = data[data.length - 1];
  const diff = last - first;
  const diffPct = first > 0 ? (diff / first) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[640px]">
        <DialogHeader className="border-b border-border/60 bg-muted/30 px-4 py-3">
          <DialogTitle className="flex items-center justify-between gap-2 text-sm font-bold">
            <span>نمودار قیمت — {name}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${up ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {diffPct >= 0 ? "+" : ""}{toPersianDigits(diffPct.toFixed(2))}٪
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {/* stats row */}
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border/60 bg-card/60 p-2">
              <p className="text-[10px] text-muted-foreground">کمینه</p>
              <p className="font-mono text-xs font-bold tabular-nums">{fmt(min)}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/60 p-2">
              <p className="text-[10px] text-muted-foreground">بیشینه</p>
              <p className="font-mono text-xs font-bold tabular-nums">{fmt(max)}</p>
            </div>
            <div className={`rounded-lg border p-2 ${up ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
              <p className="text-[10px] text-muted-foreground">تغییر</p>
              <p className={`font-mono text-xs font-bold tabular-nums ${up ? "text-emerald-500" : "text-rose-500"}`}>
                {diff >= 0 ? "+" : ""}{fmt(Math.abs(diff))}
              </p>
            </div>
          </div>

          {/* chart */}
          <div className="relative overflow-hidden rounded-lg border border-border/60 bg-card/40">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ height: 240 }}
              onMouseMove={(e) => {
                const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                const px = ((e.clientX - rect.left) / rect.width) * W;
                const idx = Math.round(((px - padL) / (W - padL - padR)) * (data.length - 1));
                setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
              }}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <defs>
                <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* grid + y labels */}
              {ticks.map((t, i) => (
                <g key={i}>
                  <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.5} />
                  <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize={9} fill="var(--muted-foreground)" className="font-mono">
                    {fmt(t)}
                  </text>
                </g>
              ))}
              {/* x labels */}
              <text x={padL} y={H - 8} textAnchor="start" fontSize={9} fill="var(--muted-foreground)">قدیمی‌تر</text>
              <text x={W - padR} y={H - 8} textAnchor="end" fontSize={9} fill="var(--muted-foreground)">اکنون</text>
              {/* area + line */}
              <path d={area} fill="url(#chartArea)" />
              <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {/* points */}
              {data.map((v, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(v)}
                  r={hoverIdx === i ? 4 : 2.5}
                  fill={color}
                  stroke="var(--background)"
                  strokeWidth={1}
                />
              ))}
              {/* hover line + tooltip */}
              {hoverIdx !== null && (
                <g>
                  <line x1={x(hoverIdx)} y1={padT} x2={x(hoverIdx)} y2={H - padB} stroke={color} strokeWidth={1} strokeDasharray="2 2" opacity={0.6} />
                  <rect x={Math.min(x(hoverIdx) - 45, W - padR - 90)} y={y(data[hoverIdx]) - 28} width={90} height={20} rx={4} fill="var(--popover)" stroke={color} strokeWidth={0.8} />
                  <text x={Math.min(x(hoverIdx), W - padR - 50)} y={y(data[hoverIdx]) - 14} textAnchor="middle" fontSize={10} fill="var(--foreground)" className="font-mono font-bold">
                    {fmt(data[hoverIdx])}
                  </text>
                </g>
              )}
            </svg>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            موس را روی نمودار حرکت دهید تا مقدار دقیق هر نقطه را ببینید
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
