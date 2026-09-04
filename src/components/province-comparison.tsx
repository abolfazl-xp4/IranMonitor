"use client";

import * as React from "react";
import { GitCompare, X, Plus, Users, Ruler, Layers3, Cloud, Wind, Mountain, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PROVINCES, provinceById, toPersianDigits, formatFa } from "@/lib/iran-data";
import { useApi } from "@/hooks/use-api";

interface ProvinceComparisonProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** ids pre-selected (e.g. currently selected province) */
  initial?: string[];
}

export function ProvinceComparison({ open, onOpenChange, initial = [] }: ProvinceComparisonProps) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [picker, setPicker] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) setSelected((prev) => (prev.length ? prev : initial.slice(0, 3)));
  }, [open, initial]);

  const { data: wx } = useApi<any>("/api/weather", 300000);
  const { data: aq } = useApi<any>("/api/airquality", 300000);
  const { data: eq } = useApi<any>("/api/earthquakes", 90000);

  const remove = (id: string) => setSelected((s) => s.filter((x) => x !== id));
  const add = (id: string) => {
    setSelected((s) => (s.length >= 3 ? [s[1], s[2], id] : [...s, id]));
    setPicker(false);
  };

  const rows = selected.map((id) => {
    const p = provinceById(id);
    if (!p) return null;
    const aqC = aq?.cities?.find((c: any) => c.nameEn === p.capitalEn);
    const wxC = wx?.cities?.find((c: any) => c.nameEn === p.capitalEn);
    const nearby = (eq?.earthquakes || []).filter((e: any) => Math.abs(e.lat - p.lat) < 3 && Math.abs(e.lon - p.lon) < 3);
    return {
      p,
      wx: wxC,
      aq: aqC,
      nearbyCount: nearby.length,
      biggestNearby: nearby[0],
    };
  }).filter(Boolean) as any[];

  const metrics: { label: string; icon: React.ReactNode; get: (r: any) => string; color?: string }[] = [
    { label: "جمعیت", icon: <Users className="h-3.5 w-3.5" />, get: (r) => formatFa(r.p.population / 1_000_000, 2) + " م" },
    { label: "مساحت", icon: <Ruler className="h-3.5 w-3.5" />, get: (r) => formatFa(r.p.area / 1000, 1) + " هـک" },
    { label: "تراکم", icon: <Layers3 className="h-3.5 w-3.5" />, get: (r) => toPersianDigits(Math.round(r.p.population / r.p.area)) },
    { label: "دمای مرکز", icon: <Cloud className="h-3.5 w-3.5" />, get: (r) => (r.wx ? toPersianDigits(Math.round(r.wx.temp)) + "°" : "—") },
    { label: "رطوبت", icon: <Cloud className="h-3.5 w-3.5" />, get: (r) => (r.wx ? toPersianDigits(Math.round(r.wx.humidity)) + "٪" : "—") },
    { label: "کیفیت هوا", icon: <Wind className="h-3.5 w-3.5" />, get: (r) => (r.aq ? toPersianDigits(Math.round(r.aq.aqi)) : "—") },
    { label: "زلزله نزدیک", icon: <Mountain className="h-3.5 w-3.5" />, get: (r) => toPersianDigits(r.nearbyCount) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-[760px]">
        <DialogHeader className="border-b border-border/60 bg-muted/30 px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold">
            <GitCompare className="h-4 w-4 text-primary" />
            مقایسه استان‌ها
            <span className="text-[11px] font-normal text-muted-foreground">
              (حداکثر ۳ استان)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {rows.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <GitCompare className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium">هنوز استانی انتخاب نشده</p>
              <p className="mt-1 text-xs text-muted-foreground">برای مقایسه، یک استان اضافه کنید.</p>
              <Button size="sm" className="mt-3 gap-1.5" onClick={() => setPicker(true)}>
                <Plus className="h-4 w-4" /> افزودن استان
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[70vh] scroll-thin">
              <div className="p-4">
                {/* Province header chips */}
                <div className="mb-4 grid gap-2" style={{ gridTemplateColumns: `140px repeat(${rows.length}, 1fr)` }}>
                  <div></div>
                  {rows.map((r) => (
                    <div key={r.p.id} className="rounded-lg border border-border/60 bg-card/60 p-2 text-center">
                      <button
                        onClick={() => remove(r.p.id)}
                        className="absolute -ms-1 -mt-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600"
                        style={{ position: "relative", float: "left" }}
                        title="حذف"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <p className="truncate text-sm font-bold">{r.p.nameFa}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{r.p.capitalFa}</p>
                    </div>
                  ))}
                  {rows.length < 3 && (
                    <button
                      onClick={() => setPicker(true)}
                      className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 p-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Plus className="h-5 w-5" />
                      افزودن
                    </button>
                  )}
                </div>

                {/* Metric rows */}
                <div className="space-y-1.5">
                  {metrics.map((m) => {
                    // highlight best/worst for numeric metrics
                    return (
                      <div
                        key={m.label}
                        className="grid items-center gap-2 rounded-md bg-muted/20 py-1.5"
                        style={{ gridTemplateColumns: `140px repeat(${rows.length}, 1fr)` }}
                      >
                        <div className="flex items-center gap-1.5 px-3 text-[11px] font-medium text-muted-foreground">
                          {m.icon}
                          {m.label}
                        </div>
                        {rows.map((r) => {
                          const val = m.get(r);
                          return (
                            <div key={r.p.id} className="px-2 text-center font-mono text-sm font-bold tabular-nums">
                              {val}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Picker sub-dialog */}
        {picker && (
          <div className="absolute inset-0 z-10 flex flex-col bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <p className="text-sm font-bold">انتخاب استان</p>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setPicker(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 scroll-thin">
              <ul className="divide-y divide-border/40">
                {PROVINCES.filter((p) => !selected.includes(p.id)).map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => add(p.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-muted/40"
                    >
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.nameFa}</p>
                        <p className="text-[11px] text-muted-foreground">مرکز: {p.capitalFa} • جمعیت {formatFa(p.population / 1_000_000, 1)} م</p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
