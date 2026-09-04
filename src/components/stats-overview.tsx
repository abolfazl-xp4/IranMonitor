"use client";

import * as React from "react";
import { Users, Map, Mountain, Cloud, Wind, Coins, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits, formatFa, IRAN_TOTAL_POPULATION, IRAN_AREA_KM2 } from "@/lib/iran-data";

function MiniTrend({ data, up }: { data: number[]; up: boolean }) {
  if (!data || data.length < 2) return null;
  const w = 56;
  const h = 18;
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
        strokeWidth={1.3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  delay?: number;
  trend?: number[];
  trendUp?: boolean;
}

function StatCard({ icon, label, value, sub, accent, delay = 0, trend, trendUp }: StatCardProps) {
  return (
    <Card className="fade-up relative overflow-hidden p-3 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4" style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full opacity-20 blur-2xl transition-opacity hover:opacity-40 sm:h-20 sm:w-20" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{label}</p>
          <p className="mt-1 text-lg font-extrabold tracking-tight tabular-nums sm:text-xl lg:text-2xl">{value}</p>
          {sub && <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-[11px]">{sub}</p>}
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white shadow-md sm:h-10 sm:w-10 sm:rounded-xl" style={{ background: accent }}>
          {icon}
        </div>
      </div>
      {trend && trend.length >= 2 && (
        <div className="mt-1.5 flex justify-end">
          <MiniTrend data={trend} up={trendUp ?? true} />
        </div>
      )}
    </Card>
  );
}

function arrow(pct: number): string {
  return pct >= 0 ? "▲" : "▼";
}

export function StatsOverview() {
  const { data: eq } = useApi<any>("/api/earthquakes", 0);
  const { data: wx } = useApi<any>("/api/weather", 0);
  const { data: aq } = useApi<any>("/api/airquality", 0);
  const { data: cur } = useApi<any>("/api/currency", 60000);
  const { data: com } = useApi<any>("/api/commodities", 60000);

  const usd = (cur?.currencies || []).find((c: any) => c.code === "USD");
  const brent = (com?.commodities || []).find((c: any) => c.code === "brent");

  const eqCount = eq?.earthquakes?.length ?? 0;
  const strongEq = (eq?.earthquakes || []).filter((e: any) => e.mag >= 4.5).length;

  const temps = (wx?.cities || []).map((c: any) => c.temp as number);
  const avgTemp = temps.length ? temps.reduce((a: number, b: number) => a + b, 0) / temps.length : 0;
  const minTemp = temps.length ? Math.min(...temps) : 0;
  const maxTemp = temps.length ? Math.max(...temps) : 0;

  const aqis = (aq?.cities || []).map((c: any) => c.aqi as number);
  const avgAqi = aqis.length ? aqis.reduce((a: number, b: number) => a + b, 0) / aqis.length : 0;
  const worstCity = (aq?.cities || []).sort((a: any, b: any) => b.aqi - a.aqi)[0];

  // precomputed display strings (kept out of JSX to avoid nested-template parsing issues)
  const popValue = formatFa(IRAN_TOTAL_POPULATION / 1_000_000, 1) + " م";
  const popSub = toPersianDigits(31) + " استان";
  const areaValue = formatFa(IRAN_AREA_KM2 / 1000, 0) + " هزار";
  const areaSub = toPersianDigits(83183) + " نفر در کیلومترمربع";
  const eqValue = toPersianDigits(eqCount);
  const eqSub = toPersianDigits(strongEq) + " زلزله بزرگ‌تر از ۴.۵";
  const tempValue = toPersianDigits(avgTemp.toFixed(0)) + "°";
  const tempSub = toPersianDigits(minTemp.toFixed(0)) + "° تا " + toPersianDigits(maxTemp.toFixed(0)) + "°";
  const aqiValue = toPersianDigits(avgAqi.toFixed(0));
  const aqiSub = worstCity ? "بدترین: " + worstCity.nameFa : undefined;
  const usdValue = usd ? formatFa(usd.sell / 10) + " ت" : "—";
  const usdSub = usd ? arrow(usd.change) + " " + toPersianDigits(Math.abs(usd.change).toFixed(2)) + "%" : "نرخ بازار";
  const brentValue = brent ? "$" + toPersianDigits(brent.priceUsd.toFixed(2)) : "—";
  const brentSub = brent ? arrow(brent.change) + " " + toPersianDigits(Math.abs(brent.change).toFixed(2)) + "%" : "نمایندگی";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <StatCard icon={<Users className="h-5 w-5" />} label="جمعیت ایران" value={popValue} sub={popSub} accent="linear-gradient(135deg,#10b981,#0d9488)" delay={0} />
      <StatCard icon={<Map className="h-5 w-5" />} label="مساحت" value={areaValue} sub={areaSub} accent="linear-gradient(135deg,#0ea5e9,#0369a1)" delay={60} />
      <StatCard icon={<Mountain className="h-5 w-5" />} label="زلزله (۳۰ روز)" value={eqValue} sub={eqSub} accent="linear-gradient(135deg,#f97316,#dc2626)" delay={120} />
      <StatCard icon={<Cloud className="h-5 w-5" />} label="میانگین دما" value={tempValue} sub={tempSub} accent="linear-gradient(135deg,#06b6d4,#0891b2)" delay={180} />
      <StatCard icon={<Wind className="h-5 w-5" />} label="میانگین کیفیت هوا" value={aqiValue} sub={aqiSub} accent="linear-gradient(135deg,#eab308,#ca8a04)" delay={240} />
      <StatCard icon={<Coins className="h-5 w-5" />} label="دلار آزاد" value={usdValue} sub={usdSub} accent="linear-gradient(135deg,#84cc16,#65a30d)" delay={300} trend={usd?.trend} trendUp={usd ? usd.change >= 0 : true} />
      <StatCard icon={<Flame className="h-5 w-5" />} label="نفت برنت" value={brentValue} sub={brentSub} accent="linear-gradient(135deg,#78350f,#451a03)" delay={360} />
    </div>
  );
}
