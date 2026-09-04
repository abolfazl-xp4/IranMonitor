"use client";

import * as React from "react";
import { Mountain, Waves, AlertTriangle, Clock, BarChart3, ScatterChart, ArrowUpDown, ArrowDown, ArrowUp, Download } from "lucide-react";
import { Panel } from "@/components/panel";
import { useApi } from "@/hooks/use-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toPersianDigits } from "@/lib/iran-data";
import { timeAgoFa } from "@/lib/format";
import { exportCSV, timestamp } from "@/lib/export";

function sevStyle(sev: string) {
  switch (sev) {
    case "major":
      return { bg: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/30", label: "بزرگ" };
    case "strong":
      return { bg: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-500/30", label: "قوی" };
    case "moderate":
      return { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/30", label: "متوسط" };
    default:
      return { bg: "bg-lime-500", text: "text-lime-600 dark:text-lime-400", ring: "ring-lime-500/30", label: "کم" };
  }
}

function SortBtn({ label, active, dir, onClick }: { label: string; active: boolean; dir: "desc" | "asc"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 transition-colors hover:bg-muted ${
        active ? "bg-primary/10 font-bold text-primary" : "text-muted-foreground"
      }`}
    >
      {label}
      {active ? (
        dir === "desc" ? <ArrowDown className="h-2.5 w-2.5" /> : <ArrowUp className="h-2.5 w-2.5" />
      ) : (
        <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
      )}
    </button>
  );
}

function scatterColor(mag: number): string {
  if (mag >= 6) return "#ef4444";
  if (mag >= 5) return "#f97316";
  if (mag >= 4) return "#eab308";
  return "#84cc16";
}

function DepthMagScatter({ eqs }: { eqs: any[] }) {
  // X axis: magnitude (2.5 - 7), Y axis: depth (0 - 100 km, inverted)
  const W = 320;
  const H = 70;
  const padL = 22;
  const padB = 14;
  const padT = 6;
  const padR = 6;
  const minMag = 2.5;
  const maxMag = 7;
  const maxDepth = 100;

  const x = (mag: number) => padL + ((mag - minMag) / (maxMag - minMag)) * (W - padL - padR);
  const y = (depth: number) => H - padB - (Math.min(depth, maxDepth) / maxDepth) * (H - padB - padT);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 70 }}>
      {/* grid lines */}
      {[0, 25, 50, 75, 100].map((d) => (
        <g key={d}>
          <line
            x1={padL}
            y1={y(d)}
            x2={W - padR}
            y2={y(d)}
            stroke="var(--border)"
            strokeWidth={0.5}
            strokeDasharray="2 2"
            opacity={0.5}
          />
          <text x={padL - 3} y={y(d) + 2.5} textAnchor="end" fontSize={7} fill="var(--muted-foreground)">
            {toPersianDigits(d)}
          </text>
        </g>
      ))}
      {/* x labels */}
      {[2.5, 3, 4, 5, 6, 7].map((m) => (
        <text key={m} x={x(m)} y={H - 3} textAnchor="middle" fontSize={7} fill="var(--muted-foreground)">
          {toPersianDigits(m)}
        </text>
      ))}
      {/* axis titles */}
      <text x={2} y={H / 2} fontSize={7} fill="var(--muted-foreground)" transform={`rotate(-90 8 ${H / 2})`} textAnchor="middle">
        عمق (km)
      </text>
      {/* points */}
      {eqs.map((e, i) => (
        <circle
          key={e.id || i}
          cx={x(e.mag)}
          cy={y(e.depth)}
          r={Math.max(2, Math.min(6, e.mag - 1.5))}
          fill={scatterColor(e.mag)}
          fillOpacity={0.7}
          stroke="var(--background)"
          strokeWidth={0.6}
        >
          <title>{`M${e.mag} • عمق ${Math.round(e.depth)}km • ${e.place}`}</title>
        </circle>
      ))}
      {eqs.length === 0 && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)">
          داده‌ای موجود نیست
        </text>
      )}
    </svg>
  );
}

export function EarthquakePanel() {
  const { data, loading, error, updatedAt } = useApi<any>("/api/earthquakes", 90000);
  const eqs = data?.earthquakes || [];
  const [chartView, setChartView] = React.useState<"bar" | "scatter">("bar");
  const [sortKey, setSortKey] = React.useState<"time" | "mag" | "depth">("time");
  const [sortDir, setSortDir] = React.useState<"desc" | "asc">("desc");

  const toggleSort = (key: "time" | "mag" | "depth") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir(key === "time" ? "desc" : "desc");
    }
  };

  const sortedEqs = React.useMemo(() => {
    const arr = [...eqs];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = av - bv;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return arr;
  }, [eqs, sortKey, sortDir]);

  const biggest = eqs[0];
  const strongCount = eqs.filter((e: any) => e.mag >= 4.5).length;

  // magnitude distribution buckets
  const buckets = [
    { label: "۲.۵–۳", min: 2.5, max: 3, color: "#84cc16" },
    { label: "۳–۴", min: 3, max: 4, color: "#a3e635" },
    { label: "۴–۵", min: 4, max: 5, color: "#eab308" },
    { label: "۵–۶", min: 5, max: 6, color: "#f97316" },
    { label: "۶+", min: 6, max: 99, color: "#ef4444" },
  ].map((b) => ({
    ...b,
    count: eqs.filter((e: any) => e.mag >= b.min && e.mag < b.max).length,
  }));
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));
  // last 24h count
  const last24h = eqs.filter((e: any) => Date.now() - e.time < 86400000).length;
  const last7d = eqs.filter((e: any) => Date.now() - e.time < 7 * 86400000).length;

  return (
    <Panel
      title="زلزله‌های اخیر ایران"
      icon={<Mountain className="h-4 w-4" />}
      updatedAt={updatedAt}
      nextRefreshIn={90}
      loading={loading}
      error={error}
      collapsible
      storageKey="earthquakes"
      action={
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <div className="hidden items-center gap-3 sm:flex">
            <span>کل: <b className="text-foreground">{toPersianDigits(eqs.length)}</b></span>
            <span>≥۴.۵: <b className="text-rose-500">{toPersianDigits(strongCount)}</b></span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => exportCSV(`earthquakes-${timestamp()}.csv`, sortedEqs, ["time", "mag", "depth", "lat", "lon", "place", "severity"])}
              className="rounded-md border border-border/60 bg-card/60 p-1.5 transition-colors hover:bg-muted hover:text-foreground"
              title="خروجی CSV"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col">
        {biggest && (
          <div className="border-b border-border/60 bg-rose-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              بزرگ‌ترین زلزله ثبت‌شده (۳۰ روز)
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tabular-nums text-rose-600 dark:text-rose-400">
                {toPersianDigits(biggest.mag.toFixed(1))}
              </span>
              <span className="text-sm text-muted-foreground">{biggest.place}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgoFa(biggest.time)}</span>
              <span className="inline-flex items-center gap-1"><Waves className="h-3 w-3" /> عمق {toPersianDigits(Math.round(biggest.depth))} کیلومتر</span>
            </div>
          </div>
        )}
        {/* magnitude distribution / depth scatter */}
        {eqs.length > 0 && (
          <div className="border-b border-border/60 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">
                {chartView === "bar" ? "توزیع بزرگی زلزله‌ها" : "عمق در برابر بزرگی"}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>۲۴ ساعت: <b className="text-foreground">{toPersianDigits(last24h)}</b></span>
                  <span>۷ روز: <b className="text-foreground">{toPersianDigits(last7d)}</b></span>
                </div>
                <button
                  onClick={() => setChartView((v) => (v === "bar" ? "scatter" : "bar"))}
                  className="rounded-md border border-border/60 bg-card/60 p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title={chartView === "bar" ? "نمایش نمودار پراکندگی" : "نمایش نمودار میله‌ای"}
                >
                  {chartView === "bar" ? <ScatterChart className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            {chartView === "bar" ? (
              <div className="flex items-end justify-between gap-1.5" style={{ height: 56 }}>
                {buckets.map((b) => (
                  <div key={b.label} className="flex flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[10px] font-bold tabular-nums text-foreground">{toPersianDigits(b.count)}</span>
                    <div
                      className="w-full rounded-t-sm transition-all hover:opacity-80"
                      style={{
                        height: `${(b.count / maxCount) * 38 + 2}px`,
                        background: b.color,
                        minHeight: 2,
                      }}
                      title={`${b.label}: ${b.count}`}
                    />
                    <span className="text-[9px] text-muted-foreground">{b.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <DepthMagScatter eqs={eqs.slice(0, 60)} />
            )}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-4 py-1.5 text-[10px] text-muted-foreground">
          <span>مرتب‌سازی:</span>
          <SortBtn label="زمان" active={sortKey === "time"} dir={sortDir} onClick={() => toggleSort("time")} />
          <SortBtn label="بزرگی" active={sortKey === "mag"} dir={sortDir} onClick={() => toggleSort("mag")} />
          <SortBtn label="عمق" active={sortKey === "depth"} dir={sortDir} onClick={() => toggleSort("depth")} />
        </div>
        <ScrollArea className="h-[280px] scroll-thin">
          <ul className="divide-y divide-border/50">
            {sortedEqs.slice(0, 40).map((e: any) => {
              const s = sevStyle(e.severity);
              return (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${s.bg} text-white shadow`}>
                    <span className="text-sm font-extrabold tabular-nums">{toPersianDigits(e.mag.toFixed(1))}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.place}</p>
                    <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{timeAgoFa(e.time)}</span>
                      <span>•</span>
                      <span>عمق {toPersianDigits(Math.round(e.depth))} کیلومتر</span>
                      {e.tsunami && <span className="text-rose-500">• خطر سونامی</span>}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${s.ring} ${s.text}`}>
                    {s.label}
                  </span>
                </li>
              );
            })}
            {eqs.length === 0 && !loading && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">زلزله‌ای یافت نشد</li>
            )}
          </ul>
        </ScrollArea>
      </div>
    </Panel>
  );
}
