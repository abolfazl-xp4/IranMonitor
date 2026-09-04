"use client";

import { Wind } from "lucide-react";
import { Panel } from "@/components/panel";
import { useApi } from "@/hooks/use-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toPersianDigits } from "@/lib/iran-data";

const COLOR_MAP: Record<string, { dot: string; bar: string; text: string }> = {
  emerald: { dot: "bg-emerald-500", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  green: { dot: "bg-green-500", bar: "bg-green-500", text: "text-green-600 dark:text-green-400" },
  yellow: { dot: "bg-yellow-500", bar: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400" },
  amber: { dot: "bg-amber-500", bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  orange: { dot: "bg-orange-500", bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  red: { dot: "bg-rose-500", bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
};

export function AirQualityPanel() {
  const { data, loading, error, updatedAt } = useApi<any>("/api/airquality", 300000);
  const cities = (data?.cities || []).slice().sort((a: any, b: any) => b.aqi - a.aqi);

  return (
    <Panel
      title="کیفیت هوای شهرها"
      icon={<Wind className="h-4 w-4" />}
      updatedAt={updatedAt}
      nextRefreshIn={300}
      loading={loading}
      error={error}
      collapsible
      storageKey="airquality"
    >
      <ScrollArea className="h-[400px] scroll-thin">
        <ul className="divide-y divide-border/50">
          {cities.map((c: any) => {
            const col = COLOR_MAP[c.category?.color] || COLOR_MAP.yellow;
            const pct = Math.min(100, (c.aqi / 120) * 100);
            return (
              <li key={c.nameEn} className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <span className="text-sm font-medium">{c.nameFa}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-extrabold tabular-nums ${col.text}`}>{toPersianDigits(Math.round(c.aqi))}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${col.text} bg-muted/60`}>{c.category?.fa}</span>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${col.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 grid grid-cols-4 gap-1 text-[10px] text-muted-foreground">
                  <span>PM۲.۵: <b className="text-foreground">{toPersianDigits(Math.round(c.pm25))}</b></span>
                  <span>PM۱۰: <b className="text-foreground">{toPersianDigits(Math.round(c.pm10))}</b></span>
                  <span>O₃: <b className="text-foreground">{toPersianDigits(Math.round(c.o3))}</b></span>
                  <span>گرد و غبار: <b className="text-foreground">{toPersianDigits(Math.round(c.dust))}</b></span>
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </Panel>
  );
}
