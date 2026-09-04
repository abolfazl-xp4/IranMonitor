"use client";

import * as React from "react";
import { Plane, ArrowLeft, Thermometer, Droplets, Wind, Eye, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import { PROVINCES, toPersianDigits } from "@/lib/iran-data";
import { WEATHER_CODES } from "@/app/api/weather/route";

const ORIGIN_KEY = "iranmonitor:travel-origin";
const DEST_KEY = "iranmonitor:travel-dest";

function Metric({ icon, label, oVal, dVal, unit }: { icon: React.ReactNode; label: string; oVal: number; dVal: number; unit?: string }) {
  const diff = dVal - oVal;
  const diffColor = diff > 0 ? "text-amber-500" : diff < 0 ? "text-cyan-500" : "text-muted-foreground";
  return (
    <div className="flex items-center gap-2 border-t border-border/40 px-3 py-1.5">
      <span className="flex w-20 items-center gap-1 text-[10px] text-muted-foreground">
        {icon} {label}
      </span>
      <span className="flex-1 text-center font-mono text-xs font-bold tabular-nums">{toPersianDigits(Math.round(oVal))}{unit}</span>
      <span className={`w-16 text-center font-mono text-[10px] tabular-nums ${diffColor}`}>
        {diff > 0 ? "+" : ""}{toPersianDigits(Math.round(diff))}{unit}
      </span>
      <span className="flex-1 text-center font-mono text-xs font-bold tabular-nums">{toPersianDigits(Math.round(dVal))}{unit}</span>
    </div>
  );
}

export function TravelComparison() {
  const { data: wx } = useApi<any>("/api/weather", 300000);
  const [origin, setOrigin] = React.useState<string>("Tehran");
  const [dest, setDest] = React.useState<string>("Mazandaran");

  React.useEffect(() => {
    try {
      const o = localStorage.getItem(ORIGIN_KEY);
      const d = localStorage.getItem(DEST_KEY);
      if (o) setOrigin(o);
      if (d) setDest(d);
    } catch {}
  }, []);

  const setAndSave = (which: "origin" | "dest", id: string) => {
    if (which === "origin") {
      setOrigin(id);
      try { localStorage.setItem(ORIGIN_KEY, id); } catch {}
    } else {
      setDest(id);
      try { localStorage.setItem(DEST_KEY, id); } catch {}
    }
  };

  const oProv = PROVINCES.find((p) => p.id === origin);
  const dProv = PROVINCES.find((p) => p.id === dest);
  const oWx = wx?.cities?.find((c: any) => c.nameEn === oProv?.capitalEn);
  const dWx = wx?.cities?.find((c: any) => c.nameEn === dProv?.capitalEn);

  const swap = () => {
    setAndSave("origin", dest);
    setAndSave("dest", origin);
  };

  const tempDiff = oWx && dWx ? dWx.temp - oWx.temp : 0;
  const advice =
    !oWx || !dWx ? "—" :
    Math.abs(tempDiff) < 3 ? "آب‌وهوا مشابه — لباس عادی" :
    tempDiff > 0 ? `${toPersianDigits(Math.round(tempDiff))}° گرم‌تر — لباس سبک‌تر` :
    `${toPersianDigits(Math.abs(Math.round(tempDiff)))}° سردتر — لباس گرم‌تر`;

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-500/15 text-cyan-500 ring-1 ring-cyan-500/20">
            <Plane className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold">مقایسه آب‌وهوا (سفر)</h2>
        </div>
      </div>

      <div className="p-4">
        {/* selectors */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-muted-foreground">مبدا</label>
            <Select value={origin} onValueChange={(v) => setAndSave("origin", v)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVINCES.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">{p.nameFa} — {p.capitalFa}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={swap}
            className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-all hover:rotate-180 hover:bg-muted hover:text-primary"
            title="جابجایی مبدا/مقصد"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-muted-foreground">مقصد</label>
            <Select value={dest} onValueChange={(v) => setAndSave("dest", v)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVINCES.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">{p.nameFa} — {p.capitalFa}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* summary cards */}
        {oWx && dWx && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/60 bg-card/60 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">{oProv?.capitalFa}</p>
              <p className="text-2xl font-extrabold tabular-nums">{toPersianDigits(Math.round(oWx.temp))}°</p>
              <p className="text-[10px] text-muted-foreground">{WEATHER_CODES[oWx.weatherCode]?.fa || "—"}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/60 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">{dProv?.capitalFa}</p>
              <p className="text-2xl font-extrabold tabular-nums">{toPersianDigits(Math.round(dWx.temp))}°</p>
              <p className="text-[10px] text-muted-foreground">{WEATHER_CODES[dWx.weatherCode]?.fa || "—"}</p>
            </div>
          </div>
        )}

        {/* advice */}
        <div className="mt-2 rounded-lg bg-gradient-to-l from-cyan-500/10 to-transparent px-3 py-2 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400">
            <Calendar className="h-3.5 w-3.5" />
            {advice}
          </p>
        </div>

        {/* metrics table */}
        {oWx && dWx && (
          <div className="mt-2 overflow-hidden rounded-lg border border-border/60">
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
              <span className="w-20">معیار</span>
              <span className="flex-1 text-center">مبدا</span>
              <span className="w-16 text-center">تفاوت</span>
              <span className="flex-1 text-center">مقصد</span>
            </div>
            <Metric icon={<Thermometer className="h-3 w-3" />} label="دما" oVal={oWx.temp} dVal={dWx.temp} unit="°" />
            <Metric icon={<Droplets className="h-3 w-3" />} label="رطوبت" oVal={oWx.humidity} dVal={dWx.humidity} unit="٪" />
            <Metric icon={<Wind className="h-3 w-3" />} label="باد" oVal={oWx.windSpeed} dVal={dWx.windSpeed} />
            <Metric icon={<Eye className="h-3 w-3" />} label="دید" oVal={oWx.visibility / 1000} dVal={dWx.visibility / 1000} unit="km" />
          </div>
        )}
      </div>
    </Card>
  );
}
