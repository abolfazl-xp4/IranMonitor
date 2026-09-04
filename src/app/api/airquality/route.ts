import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";
import { CITIES } from "@/lib/iran-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 900;

export interface CityAQI {
  nameFa: string;
  nameEn: string;
  lat: number;
  lon: number;
  pm10: number;
  pm25: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
  dust: number;
  aqi: number;
  category: { fa: string; color: string };
}

function aqiCategory(aqi: number): { fa: string; color: string } {
  if (aqi <= 20) return { fa: "بسیار خوب", color: "emerald" };
  if (aqi <= 40) return { fa: "خوب", color: "green" };
  if (aqi <= 60) return { fa: "متوسط", color: "yellow" };
  if (aqi <= 80) return { fa: "ناسالم برای گروه حساس", color: "amber" };
  if (aqi <= 100) return { fa: "ناسالم", color: "orange" };
  return { fa: "بسیار ناسالم", color: "red" };
}

export async function GET() {
  try {
    const { data, cached } = await withCache("aqi-iran-per-city", 1000 * 900, async () => {
      const results = await Promise.allSettled(
        CITIES.map(async (city) => {
          const url =
            `https://air-quality-api.open-meteo.com/v1/air-quality` +
            `?latitude=${city.lat.toFixed(3)}&longitude=${city.lon.toFixed(3)}` +
            `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,european_aqi` +
            `&timezone=Asia%2FTehran`;
          const res = await fetch(url, { next: { revalidate: 900 } });
          if (!res.ok) throw new Error(`AQI ${res.status}`);
          return res.json();
        })
      );

      const out: CityAQI[] = CITIES.map((city, i) => {
        const r = results[i];
        if (r.status !== "fulfilled") {
          return {
            nameFa: city.nameFa,
            nameEn: city.nameEn,
            lat: city.lat,
            lon: city.lon,
            pm10: 0,
            pm25: 0,
            co: 0,
            no2: 0,
            so2: 0,
            o3: 0,
            dust: 0,
            aqi: 0,
            category: aqiCategory(0),
          };
        }
        const cur = r.value.current || {};
        const aqi = Number(cur.european_aqi ?? 0);
        return {
          nameFa: city.nameFa,
          nameEn: city.nameEn,
          lat: city.lat,
          lon: city.lon,
          pm10: Number(cur.pm10 ?? 0),
          pm25: Number(cur.pm2_5 ?? 0),
          co: Number(cur.carbon_monoxide ?? 0),
          no2: Number(cur.nitrogen_dioxide ?? 0),
          so2: Number(cur.sulphur_dioxide ?? 0),
          o3: Number(cur.ozone ?? 0),
          dust: Number(cur.dust ?? 0),
          aqi,
          category: aqiCategory(aqi),
        };
      });
      return out;
    });

    return NextResponse.json({ ok: true, cached, updatedAt: Date.now(), cities: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), cities: [] }, { status: 200 });
  }
}
