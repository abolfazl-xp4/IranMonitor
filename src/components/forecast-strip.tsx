"use client";

import * as React from "react";
import { CalendarDays, Sun, CloudSun, Cloud, CloudFog, CloudRain, Snowflake, CloudLightning, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits } from "@/lib/iran-data";
import { WEATHER_CODES } from "@/app/api/weather/route";

function dayIcon(code: number) {
  if (code === 113) return <Sun className="h-5 w-5 text-amber-500" />;
  if ([116, 119].includes(code)) return <CloudSun className="h-5 w-5 text-amber-400" />;
  if (code === 122) return <Cloud className="h-5 w-5 text-muted-foreground" />;
  if ([143, 248, 260].includes(code)) return <CloudFog className="h-5 w-5 text-muted-foreground" />;
  if ([263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 314, 317, 350, 353, 356, 359].includes(code)) return <CloudRain className="h-5 w-5 text-cyan-500" />;
  if ([176, 179, 182, 185, 320, 323, 326, 329, 332, 335, 338, 362, 365, 368, 371, 374, 377, 227, 230].includes(code)) return <Snowflake className="h-5 w-5 text-sky-300" />;
  if ([200, 386, 389, 392, 395].includes(code)) return <CloudLightning className="h-5 w-5 text-amber-500" />;
  return <Cloud className="h-5 w-5 text-muted-foreground" />;
}

function dayNameFa(dateStr: string, offset: number): string {
  try {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + offset);
    return new Intl.DateTimeFormat("fa-IR", { weekday: "short" }).format(d);
  } catch {
    return ["امروز", "فردا", "پس‌فردا"][offset] || "";
  }
}

export function ForecastStrip() {
  const { data, loading } = useApi<any>("/api/weather", 300000);
  // Show 6 major cities
  const majors = ["Tehran", "Mashhad", "Isfahan", "Shiraz", "Tabriz", "Ahvaz"];
  const cities = (data?.cities || []).filter((c: any) => majors.includes(c.nameEn));

  if (loading || cities.length === 0) return null;

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-500/15 text-cyan-500 ring-1 ring-cyan-500/20">
            <CalendarDays className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold">پیش‌بینی ۳ روزه</h2>
        </div>
        <span className="text-[10px] text-muted-foreground">شهرهای بزرگ</span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-6">
        {cities.map((c: any) => {
          const daily = c.daily || [];
          if (daily.length === 0) return null;
          return (
            <div key={c.nameEn} className="rounded-lg border border-border/60 bg-card/60 p-2.5">
              <p className="mb-2 flex items-center gap-1 text-xs font-bold">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {c.nameFa}
              </p>
              <div className="space-y-1.5">
                {daily.map((d: any, i: number) => {
                  const wmo = WEATHER_CODES[d.code] || { fa: d.desc || "—" };
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-[10px] text-muted-foreground">{dayNameFa(d.date, i)}</span>
                      <span className="shrink-0">{dayIcon(d.code)}</span>
                      <span className="flex-1 text-left font-mono text-[11px] font-bold tabular-nums">
                        {toPersianDigits(Math.round(d.maxTemp))}°
                        <span className="ms-1 text-muted-foreground">{toPersianDigits(Math.round(d.minTemp))}°</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
