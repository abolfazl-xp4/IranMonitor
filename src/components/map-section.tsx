"use client";

import * as React from "react";
import { Layers, Mountain, Cloud, Wind, Map as MapIcon, Tag, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IranMap, type EqMarker, type CityMarker } from "@/components/iran-map";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits, PROVINCES } from "@/lib/iran-data";

type Layer = "earthquakes" | "weather" | "airquality" | "none";
type HeatMode = "off" | "population" | "aqi";

const LAYERS: { id: Layer; label: string; icon: React.ReactNode }[] = [
  { id: "earthquakes", label: "زلزله", icon: <Mountain className="h-3.5 w-3.5" /> },
  { id: "weather", label: "آب‌وهوا", icon: <Cloud className="h-3.5 w-3.5" /> },
  { id: "airquality", label: "کیفیت هوا", icon: <Wind className="h-3.5 w-3.5" /> },
  { id: "none", label: "خام", icon: <MapIcon className="h-3.5 w-3.5" /> },
];

const HEAT_LABELS: Record<HeatMode, string> = {
  off: "خام",
  population: "جمعیت",
  aqi: "کیفیت هوا",
};

export function MapSection({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [layer, setLayer] = React.useState<Layer>("earthquakes");
  const [showLabels, setShowLabels] = React.useState<boolean>(false);
  const [heatMode, setHeatMode] = React.useState<HeatMode>("off");

  const { data: eq } = useApi<any>("/api/earthquakes", 90000);
  const { data: wx } = useApi<any>("/api/weather", 300000);
  const { data: aq } = useApi<any>("/api/airquality", 300000);

  const eqMarkers: EqMarker[] = (eq?.earthquakes || []).map((e: any) => ({
    id: e.id,
    lat: e.lat,
    lon: e.lon,
    mag: e.mag,
    place: e.place,
    time: e.time,
    depth: e.depth,
  }));

  const cityMarkers: CityMarker[] = (wx?.cities || []).map((c: any, i: number) => {
    const aqiCity = aq?.cities?.[i];
    return {
      nameFa: c.nameFa,
      nameEn: c.nameEn,
      lat: c.lat,
      lon: c.lon,
      temp: c.temp,
      code: c.weatherCode,
      aqi: aqiCity?.aqi,
      aqiColor: aqiCity?.category?.color,
    };
  });

  // Build heatmap data: province id -> normalized value (0-1)
  const heatData = React.useMemo(() => {
    if (heatMode === "off") return null;
    const map: Record<string, number> = {};
    if (heatMode === "population") {
      const max = Math.max(...PROVINCES.map((p) => p.population));
      PROVINCES.forEach((p) => { map[p.id] = p.population / max; });
    } else if (heatMode === "aqi") {
      const aqiMap: Record<string, number> = {};
      (aq?.cities || []).forEach((c: any) => { aqiMap[c.nameEn] = c.aqi || 0; });
      const max = Math.max(1, ...Object.values(aqiMap));
      PROVINCES.forEach((p) => { map[p.id] = (aqiMap[p.capitalEn] || 0) / max; });
    }
    return map;
  }, [heatMode, aq]);

  // heat color: 0 = cool (emerald), 1 = hot (red)
  const heatColor = (v: number) => {
    if (heatMode === "aqi") {
      // green->yellow->orange->red
      if (v < 0.2) return `oklch(0.7 0.15 150)`;
      if (v < 0.4) return `oklch(0.75 0.16 90)`;
      if (v < 0.6) return `oklch(0.7 0.18 60)`;
      if (v < 0.8) return `oklch(0.65 0.2 40)`;
      return `oklch(0.6 0.22 25)`;
    }
    // population: emerald intensity
    const lightness = 0.55 - v * 0.25;
    const chroma = 0.12 + v * 0.1;
    return `oklch(${lightness} ${chroma} 165)`;
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold">نقشه پایش ایران</h2>
          <span className="hidden items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary sm:inline-flex">
            📰 روی هر استان کلیک کنید — اخبار لحظه‌ای
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Heatmap selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card/60 p-0.5">
            <Flame className="ms-1 h-3 w-3 text-amber-500" />
            {(["off", "population", "aqi"] as HeatMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setHeatMode(m)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  heatMode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {HEAT_LABELS[m]}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant={showLabels ? "default" : "outline"}
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={() => setShowLabels((v) => !v)}
            title="نمایش نام استان‌ها"
          >
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">نام استان‌ها</span>
          </Button>
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card/60 p-1">
            {LAYERS.map((l) => (
              <Button
                key={l.id}
                size="sm"
                variant={layer === l.id ? "default" : "ghost"}
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={() => setLayer(l.id)}
              >
                {l.icon}
                <span className="hidden sm:inline">{l.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-3">
        <IranMap
          earthquakes={eqMarkers}
          cities={cityMarkers}
          layer={layer}
          selectedProvince={selected}
          onSelectProvince={onSelect}
          showLabels={showLabels}
          heatData={heatData}
          heatColor={heatMode !== "off" ? heatColor : undefined}
          height={520}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
        <span>
          {heatMode !== "off" ? (
            <>نقشه حرارتی: {HEAT_LABELS[heatMode]} (رنگ‌بندی استان‌ها بر اساس داده)</>
          ) : (
            <>
              {layer === "earthquakes" && <>نمایش {toPersianDigits(eqMarkers.length)} زلزله (۳۰ روز اخیر)</>}
              {layer === "weather" && <>نمایش دمای {toPersianDigits(cityMarkers.length)} مرکز استان</>}
              {layer === "airquality" && <>نمایش شاخص کیفیت هوا برای {toPersianDigits(cityMarkers.length)} شهر</>}
              {layer === "none" && <>نمای خام نقشه استان‌ها</>}
            </>
          )}
        </span>
        <span className="inline-flex items-center gap-1.5">
          داده‌ها: USGS • wttr.in • Open-Meteo • CoinGecko
        </span>
      </div>
    </Card>
  );
}
