import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";
import { CITIES } from "@/lib/iran-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 600;

export interface CityWeather {
  nameFa: string;
  nameEn: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDir: number;
  pressure: number;
  cloudCover: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  uv: number;
  visibility: number;
  hourly: { time: string; temp: number; code: number }[];
  daily: { date: string; maxTemp: number; minTemp: number; avgTemp: number; code: number; desc: string }[];
}

// wttr.in weather code -> fa label + icon hint
export const WEATHER_CODES: Record<number, { fa: string; icon: string }> = {
  113: { fa: "آفتابی", icon: "sun" },
  116: { fa: "نیمه‌آفتابی", icon: "cloud-sun" },
  119: { fa: "ابری", icon: "cloud" },
  122: { fa: "اپراتی", icon: "cloud" },
  143: { fa: "مه", icon: "fog" },
  176: { fa: "احتمال باران پراکنده", icon: "rain" },
  179: { fa: "احتمال برف پراکنده", icon: "snow" },
  182: { fa: "احتمال باران‌وبرف", icon: "snow" },
  185: { fa: "احتمال باران‌وبرف", icon: "snow" },
  200: { fa: "احتمال رعدوبرق", icon: "storm" },
  227: { fa: "بوران", icon: "snow" },
  230: { fa: "بوران شدید", icon: "snow" },
  248: { fa: "مه", icon: "fog" },
  260: { fa: "مه غلیظ", icon: "fog" },
  263: { fa: "نم‌نمک سبک", icon: "drizzle" },
  266: { fa: "نم‌نمک", icon: "drizzle" },
  281: { fa: "نم‌نمک یخ‌زده", icon: "rain" },
  284: { fa: "نم‌نمک یخ‌زده", icon: "rain" },
  293: { fa: "باران سبک", icon: "rain" },
  296: { fa: "باران سبک", icon: "rain" },
  299: { fa: "باران", icon: "rain" },
  302: { fa: "باران", icon: "rain" },
  305: { fa: "باران شدید", icon: "rain" },
  308: { fa: "باران شدید", icon: "rain" },
  311: { fa: "باران یخ‌زده", icon: "rain" },
  314: { fa: "باران یخ‌زده", icon: "rain" },
  317: { fa: "باران یخ‌زده", icon: "rain" },
  320: { fa: "باران‌وبرف", icon: "snow" },
  323: { fa: "برف سبک", icon: "snow" },
  326: { fa: "برف", icon: "snow" },
  329: { fa: "برف", icon: "snow" },
  332: { fa: "برف شدید", icon: "snow" },
  335: { fa: "برف شدید", icon: "snow" },
  338: { fa: "برف شدید", icon: "snow" },
  350: { fa: "رگبار", icon: "rain" },
  353: { fa: "رگبار باران", icon: "rain" },
  356: { fa: "رگبار شدید", icon: "rain" },
  359: { fa: "رگبار شدید", icon: "rain" },
  362: { fa: "رگبار باران‌وبرف", icon: "snow" },
  365: { fa: "رگبار باران‌وبرف", icon: "snow" },
  368: { fa: "رگبار برف", icon: "snow" },
  371: { fa: "رگبار برف", icon: "snow" },
  374: { fa: "رگبار برف شدید", icon: "snow" },
  377: { fa: "رگبار برف شدید", icon: "snow" },
  386: { fa: "رعدوبرق با باران", icon: "storm" },
  389: { fa: "رعدوبرق با باران", icon: "storm" },
  392: { fa: "رعدوبرق با برف", icon: "storm" },
  395: { fa: "رعدوبرق با برف", icon: "storm" },
};

export async function GET() {
  try {
    const { data, cached } = await withCache("weather-iran-wttr", 1000 * 600, async () => {
      // Fetch all cities in parallel via wttr.in (free, no key). format=j1 returns JSON.
      const results = await Promise.allSettled(
        CITIES.map(async (city) => {
          const url = `https://wttr.in/${encodeURIComponent(city.nameEn)}?format=j1&lang=fa`;
          const res = await fetch(url, {
            headers: { accept: "application/json" },
            next: { revalidate: 600 },
          });
          if (!res.ok) throw new Error(`wttr ${res.status}`);
          return res.json();
        })
      );

      const out: CityWeather[] = CITIES.map((city, i) => {
        const r = results[i];
        if (r.status !== "fulfilled") {
          return {
            nameFa: city.nameFa,
            nameEn: city.nameEn,
            lat: city.lat,
            lon: city.lon,
            temp: 0,
            feelsLike: 0,
            humidity: 0,
            windSpeed: 0,
            windDir: 0,
            pressure: 0,
            cloudCover: 0,
            precipitation: 0,
            weatherCode: 113,
            isDay: true,
            uv: 0,
            visibility: 0,
            hourly: [],
            daily: [],
          };
        }
        const j = r.value;
        const cur = j.current_condition?.[0] || {};
        const hourly = (j.weather?.[0]?.hourly || []).slice(0, 8).map((h: any) => ({
          time: h.time || "",
          temp: Number(h.tempC ?? 0),
          code: Number(h.weatherCode ?? 0),
        }));
        // 3-day daily forecast
        const daily = (j.weather || []).slice(0, 3).map((w: any) => ({
          date: w.date || "",
          maxTemp: Number(w.maxtempC ?? 0),
          minTemp: Number(w.mintempC ?? 0),
          avgTemp: Number(w.avgtempC ?? 0),
          code: Number(w.hourly?.[4]?.weatherCode ?? 113),
          desc: w.hourly?.[4]?.weatherDesc?.[0]?.value || "",
        }));
        return {
          nameFa: city.nameFa,
          nameEn: city.nameEn,
          lat: city.lat,
          lon: city.lon,
          temp: Number(cur.temp_C ?? 0),
          feelsLike: Number(cur.FeelsLikeC ?? cur.temp_C ?? 0),
          humidity: Number(cur.humidity ?? 0),
          windSpeed: Number(cur.windspeedKmph ?? 0),
          windDir: Number(cur.winddirDegree ?? 0),
          pressure: Number(cur.pressure ?? 0),
          cloudCover: Number(cur.cloudcover ?? 0),
          precipitation: Number(cur.precipMM ?? 0),
          weatherCode: Number(cur.weatherCode ?? 113),
          isDay: true,
          uv: Number(cur.uvIndex ?? 0),
          visibility: Number(cur.visibility ?? 0),
          hourly,
          daily,
        };
      });
      return out;
    });

    return NextResponse.json({ ok: true, cached, updatedAt: Date.now(), cities: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), cities: [] }, { status: 200 });
  }
}
