"use client";

import * as React from "react";
import { Cloud, Droplets, Wind, Eye, Gauge, Sun, CloudRain, Snowflake, CloudSun, Cloudy, CloudFog, CloudLightning, ChevronDown, Thermometer, Sunrise, Search } from "lucide-react";
import { Panel } from "@/components/panel";
import { useApi } from "@/hooks/use-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toPersianDigits } from "@/lib/iran-data";
import { WEATHER_CODES } from "@/app/api/weather/route";

function wxIcon(code: number) {
  if (code === 113) return <Sun className="h-4 w-4" />;
  if ([116, 119].includes(code)) return <CloudSun className="h-4 w-4" />;
  if (code === 122) return <Cloudy className="h-4 w-4" />;
  if ([143, 248, 260].includes(code)) return <CloudFog className="h-4 w-4" />;
  if ([263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 314, 317, 350, 353, 356, 359].includes(code)) return <CloudRain className="h-4 w-4" />;
  if ([176, 179, 182, 185, 320, 323, 326, 329, 332, 335, 338, 362, 365, 368, 371, 374, 377, 227, 230].includes(code)) return <Snowflake className="h-4 w-4" />;
  if ([200, 386, 389, 392, 395].includes(code)) return <CloudLightning className="h-4 w-4" />;
  return <Cloud className="h-4 w-4" />;
}

function TempSparkline({ data }: { data: { time: string; temp: number }[] }) {
  if (!data || data.length < 2) return null;
  const w = 240;
  const h = 56;
  const temps = data.map((d) => d.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 24) + 12;
    const y = h - 14 - ((d.temp - min) / range) * (h - 28);
    return [x, y] as const;
  });
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `M${pts[0][0]},${h - 14} L${pts.map((p) => p.join(",")).join(" L")} L${pts[pts.length - 1][0]},${h - 14} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 56 }}>
      <defs>
        <linearGradient id="tempArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#tempArea)" />
      <polyline points={line} fill="none" stroke="var(--chart-1)" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r={2.4} fill="var(--chart-1)" />
          <text x={p[0]} y={p[1] - 7} textAnchor="middle" fontSize={9} fill="var(--foreground)" className="font-bold">
            {toPersianDigits(Math.round(data[i].temp))}°
          </text>
        </g>
      ))}
      <text x={12} y={h - 3} textAnchor="start" fontSize={8.5} fill="var(--muted-foreground)">
        {data[0]?.time?.slice(11, 16) || ""}
      </text>
      <text x={w - 12} y={h - 3} textAnchor="end" fontSize={8.5} fill="var(--muted-foreground)">
        {data[data.length - 1]?.time?.slice(11, 16) || ""}
      </text>
    </svg>
  );
}

export function WeatherPanel() {
  const { data, loading, error, updatedAt } = useApi<any>("/api/weather", 300000);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [q, setQ] = React.useState<string>("");
  const [sortMode, setSortMode] = React.useState<"temp" | "humidity" | "name">("temp");
  const cities = React.useMemo(() => {
    let arr = (data?.cities || []).slice();
    if (q.trim()) {
      arr = arr.filter((c) => c.nameFa.includes(q.trim()) || c.nameEn.toLowerCase().includes(q.trim().toLowerCase()));
    }
    arr.sort((a, b) => {
      if (sortMode === "name") return a.nameFa.localeCompare(b.nameFa, "fa");
      if (sortMode === "humidity") return b.humidity - a.humidity;
      return b.temp - a.temp;
    });
    return arr;
  }, [data?.cities, q, sortMode]);
  const hottest = (data?.cities || []).slice().sort((a: any, b: any) => b.temp - a.temp)[0];
  const coldest = (data?.cities || []).slice().sort((a: any, b: any) => a.temp - b.temp)[0];
  const avgTemp = (data?.cities || []).length ? Math.round((data?.cities || []).reduce((s: number, c: any) => s + c.temp, 0) / (data?.cities || []).length) : 0;

  return (
    <Panel
      title="آب‌وهوای مراکز استان"
      icon={<Cloud className="h-4 w-4" />}
      updatedAt={updatedAt}
      nextRefreshIn={300}
      loading={loading}
      error={error}
      collapsible
      storageKey="weather"
      action={
        <div className="hidden items-center gap-3 text-[11px] text-muted-foreground md:flex">
          <span className="inline-flex items-center gap-1">
            <Thermometer className="h-3 w-3 text-rose-500" />
            گرم‌ترین: <b className="text-foreground">{hottest ? `${hottest.nameFa} ${toPersianDigits(Math.round(hottest.temp))}°` : "—"}</b>
          </span>
          <span className="inline-flex items-center gap-1">
            <Thermometer className="h-3 w-3 text-cyan-500" />
            سردترین: <b className="text-foreground">{coldest ? `${coldest.nameFa} ${toPersianDigits(Math.round(coldest.temp))}°` : "—"}</b>
          </span>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-3 py-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجوی شهر..."
            className="h-8 pr-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card/60 p-0.5">
          {([
            { id: "temp", label: "دما" },
            { id: "humidity", label: "رطوبت" },
            { id: "name", label: "نام" },
          ] as const).map((s) => (
            <button
              key={s.id}
              onClick={() => setSortMode(s.id)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                sortMode === s.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="h-[420px] scroll-thin">
        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
          {cities.map((c: any) => {
            const wmo = WEATHER_CODES[c.weatherCode] || { fa: "—", icon: "cloud" };
            const isOpen = expanded === c.nameEn;
            const hasHourly = c.hourly?.length >= 2;
            return (
              <div
                key={c.nameEn}
                className={`group relative overflow-hidden rounded-xl border bg-card/60 transition-all hover:shadow-md ${
                  isOpen ? "border-primary/50 shadow-md" : "border-border/60"
                }`}
              >
                <button
                  type="button"
                  className="w-full p-3 text-right"
                  onClick={() => setExpanded(isOpen ? null : c.nameEn)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{c.nameFa}</p>
                      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        {wxIcon(c.weatherCode)}
                        {wmo.fa}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-extrabold tabular-nums leading-none">
                        {toPersianDigits(Math.round(c.temp))}°
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        حس {toPersianDigits(Math.round(c.feelsLike))}°
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[10px] text-muted-foreground">
                    <div className="rounded-md bg-muted/40 py-1">
                      <Droplets className="mx-auto mb-0.5 h-3 w-3 text-cyan-500" />
                      {toPersianDigits(Math.round(c.humidity))}٪
                    </div>
                    <div className="rounded-md bg-muted/40 py-1">
                      <Wind className="mx-auto mb-0.5 h-3 w-3 text-emerald-500" />
                      {toPersianDigits(Math.round(c.windSpeed))}
                    </div>
                    <div className="rounded-md bg-muted/40 py-1">
                      <Gauge className="mx-auto mb-0.5 h-3 w-3 text-violet-500" />
                      {toPersianDigits(Math.round(c.pressure))}
                    </div>
                    <div className="rounded-md bg-muted/40 py-1">
                      <Eye className="mx-auto mb-0.5 h-3 w-3 text-amber-500" />
                      {toPersianDigits(Math.round(c.visibility / 1000))}
                    </div>
                  </div>
                  {hasHourly && (
                    <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <Sunrise className="h-3 w-3" />
                      پیش‌بینی ۸ ساعته
                      <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  )}
                </button>
                {isOpen && hasHourly && (
                  <div className="border-t border-border/60 bg-muted/20 px-3 py-2 fade-up">
                    <p className="mb-1 text-[10px] font-medium text-muted-foreground">دمای ساعتی آینده (°C)</p>
                    <TempSparkline data={c.hourly} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Panel>
  );
}
