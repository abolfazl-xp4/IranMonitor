"use client";

import * as React from "react";
import { Star, MapPin, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PROVINCES, provinceById, toPersianDigits, formatFa } from "@/lib/iran-data";
import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "iranmonitor:favorite-provinces";

export function FavoriteProvinces({
  onSelect,
  selected,
}: {
  onSelect: (id: string) => void;
  selected: string | null;
}) {
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [adding, setAdding] = React.useState(false);
  const { data: wx } = useApi<any>("/api/weather", 300000);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: string[]) => {
    setFavorites(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const toggleFav = (id: string) => {
    if (favorites.includes(id)) {
      persist(favorites.filter((f) => f !== id));
    } else if (favorites.length < 6) {
      persist([...favorites, id]);
    }
  };

  const favProvinces = favorites.map((id) => provinceById(id)).filter(Boolean);

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/20">
            <Star className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold">استان‌های موردعلاقه</h2>
          {favorites.length > 0 && (
            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {toPersianDigits(favorites.length)}
            </span>
          )}
        </div>
        {favorites.length < 6 && (
          <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => setAdding((v) => !v)}>
            {adding ? "انصراف" : "افزودن"}
          </Button>
        )}
      </div>

      <div className="p-3">
        {favProvinces.length === 0 && !adding ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-card/40 px-3 py-5 text-center text-xs text-muted-foreground">
            <Star className="mx-auto mb-1.5 h-5 w-5 opacity-40" />
            هنوز استانی به موردعلاقه‌ها اضافه نشده. برای دسترسی سریع، استان‌ها را اینجا پین کنید.
          </div>
        ) : adding ? (
          <div className="max-h-[200px] space-y-1 overflow-y-auto scroll-thin">
            {PROVINCES.filter((p) => !favorites.includes(p.id)).map((p) => (
              <button
                key={p.id}
                onClick={() => { toggleFav(p.id); setAdding(false); }}
                className="flex w-full items-center gap-2 rounded-md border border-border/40 bg-card/40 px-3 py-2 text-right transition-colors hover:bg-muted/50"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate text-xs">{p.nameFa}</span>
                <span className="text-[10px] text-muted-foreground">{p.capitalFa}</span>
                <Star className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {favProvinces.map((p) => {
              if (!p) return null;
              const wxCity = wx?.cities?.find((c: any) => c.nameEn === p.capitalEn);
              const isSel = selected === p.id;
              return (
                <li key={p.id}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                      isSel ? "border-primary/50 bg-primary/10" : "border-border/60 bg-card/60 hover:bg-muted/40"
                    )}
                  >
                    <button
                      onClick={() => onSelect(p.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-right"
                    >
                      <MapPin className={cn("h-3.5 w-3.5 shrink-0", isSel ? "text-primary" : "text-muted-foreground")} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{p.nameFa}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {wxCity ? `${toPersianDigits(Math.round(wxCity.temp))}°` : ""} • جمعیت {formatFa(p.population / 1_000_000, 1)} م
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => toggleFav(p.id)}
                      className="rounded p-1 text-amber-500 transition-colors hover:bg-amber-500/10"
                      title="حذف از موردعلاقه‌ها"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
