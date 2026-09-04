"use client";

import { MapPin, Users, Ruler, Layers3, X, Cloud, Wind, Clock, Compass, Waves } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { provinceById, toPersianDigits, formatFa } from "@/lib/iran-data";
import { useApi } from "@/hooks/use-api";
import { WEATHER_CODES } from "@/app/api/weather/route";
import { ProvinceNews } from "@/components/province-news";

function HourlyMini({ data }: { data: { time: string; temp: number }[] }) {
  if (!data || data.length < 2) return null;
  const w = 280;
  const h = 50;
  const padL = 6;
  const padR = 6;
  const padT = 14;
  const padB = 14;
  const temps = data.map((d) => d.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;
  const x = (i: number) => padL + (i / (data.length - 1)) * (w - padL - padR);
  const y = (t: number) => padT + (1 - (t - min) / range) * (h - padT - padB);
  const line = data.map((d, i) => `${x(i).toFixed(1)},${y(d.temp).toFixed(1)}`).join(" ");
  const area = `M${x(0)},${h - padB} L${data.map((d, i) => `${x(i)},${y(d.temp)}`).join(" L")} L${x(data.length - 1)},${h - padB} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 50 }}>
      <defs>
        <linearGradient id="provHourly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#provHourly)" />
      <polyline points={line} fill="none" stroke="var(--chart-1)" strokeWidth={1.5} strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.temp)} r={2.2} fill="var(--chart-1)" />
          <text x={x(i)} y={y(d.temp) - 5} textAnchor="middle" fontSize={8} fontWeight={600} fill="var(--foreground)">
            {toPersianDigits(Math.round(d.temp))}°
          </text>
        </g>
      ))}
      <text x={x(0)} y={h - 3} textAnchor="start" fontSize={7.5} fill="var(--muted-foreground)">
        {data[0]?.time?.slice(11, 16) || ""}
      </text>
      <text x={x(data.length - 1)} y={h - 3} textAnchor="end" fontSize={7.5} fill="var(--muted-foreground)">
        {data[data.length - 1]?.time?.slice(11, 16) || ""}
      </text>
    </svg>
  );
}

export function ProvinceDetail({ provinceId, onClose }: { provinceId: string | null; onClose: () => void }) {
  const { data: wx } = useApi<any>("/api/weather", 300000);
  const { data: aq } = useApi<any>("/api/airquality", 300000);
  const { data: eq } = useApi<any>("/api/earthquakes", 90000);

  const prov = provinceId ? provinceById(provinceId) : null;
  if (!prov) return null;

  const wxCity = (wx?.cities || []).find((c: any) => c.nameEn === prov.capitalEn);
  const aqCity = (aq?.cities || []).find((c: any) => c.nameEn === prov.capitalEn);
  // nearest earthquakes (within ~3 deg)
  const nearby = (eq?.earthquakes || [])
    .filter((e: any) => Math.abs(e.lat - prov.lat) < 3 && Math.abs(e.lon - prov.lon) < 3)
    .slice(0, 5);
  const wmo = wxCity ? (WEATHER_CODES[wxCity.weatherCode] || { fa: "—" }) : null;

  return (
    <Card className="fade-up overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-l from-primary/15 to-transparent px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-bold">{prov.nameFa}</h3>
            <p className="text-[11px] text-muted-foreground">مرکز: {prov.capitalFa}</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3">
        <Stat icon={<Users className="h-3.5 w-3.5" />} label="جمعیت" value={`${formatFa(prov.population / 1_000_000, 2)} م`} />
        <Stat icon={<Ruler className="h-3.5 w-3.5" />} label="مساحت" value={`${formatFa(prov.area / 1000, 1)} هـک`} />
        <Stat icon={<Layers3 className="h-3.5 w-3.5" />} label="تراکم" value={`${toPersianDigits(Math.round(prov.population / prov.area))}`} />
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-2">
        {wxCity && (
          <div className="rounded-lg border border-border/60 bg-card/60 p-2.5">
            <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Cloud className="h-3 w-3 text-cyan-500" /> {wmo?.fa || "آب‌وهوا"}
            </p>
            <p className="text-lg font-extrabold tabular-nums">{toPersianDigits(Math.round(wxCity.temp))}°</p>
            <p className="text-[10px] text-muted-foreground">
              رطوبت {toPersianDigits(Math.round(wxCity.humidity))}٪ • باد {toPersianDigits(Math.round(wxCity.windSpeed))} ک‌م‌س
            </p>
          </div>
        )}
        {aqCity && (
          <div className="rounded-lg border border-border/60 bg-card/60 p-2.5">
            <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Wind className="h-3 w-3 text-emerald-500" /> کیفیت هوا
            </p>
            <p className="text-lg font-extrabold tabular-nums">{toPersianDigits(Math.round(aqCity.aqi))}</p>
            <p className="text-[10px] text-muted-foreground">{aqCity.category?.fa}</p>
          </div>
        )}
      </div>

      {/* hourly forecast chart */}
      {wxCity?.hourly?.length >= 2 && (
        <div className="px-3 pb-2">
          <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Clock className="h-3 w-3" /> پیش‌بینی دمای ساعتی
          </p>
          <div className="rounded-lg border border-border/60 bg-card/60 p-2">
            <HourlyMini data={wxCity.hourly} />
          </div>
        </div>
      )}

      {/* geo info */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Compass className="h-3 w-3" />
          مختصات: {toPersianDigits(prov.lat.toFixed(2))}°، {toPersianDigits(prov.lon.toFixed(2))}° • منطقه {regionFa(prov.region)}
        </div>
      </div>

      <div className="px-3 pb-3">
        <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Waves className="h-3 w-3 text-rose-500" /> زلزله‌های نزدیک (۳ درجه)
        </p>
        {nearby.length > 0 ? (
          <ul className="space-y-1">
            {nearby.map((e: any) => (
              <li key={e.id} className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 text-[11px]">
                <span className="truncate">{e.place}</span>
                <span className="font-mono font-bold tabular-nums text-rose-500">M{toPersianDigits(e.mag.toFixed(1))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">زلزله‌ای در نزدیکی این استان ثبت نشده</p>
        )}
      </div>

      {/* Province live news (from reliable news agencies) */}
      <ProvinceNews provinceId={provinceId!} />
    </Card>
  );
}

function regionFa(r: string): string {
  return { north: "شمال", south: "جنوب", east: "شرق", west: "غرب", center: "مرکز" }[r] || r;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-2.5 text-center">
      <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">{icon}</div>
      <p className="text-sm font-extrabold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
