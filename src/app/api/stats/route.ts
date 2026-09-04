import { NextResponse } from "next/server";
import { PROVINCES, IRAN_TOTAL_POPULATION, IRAN_AREA_KM2 } from "@/lib/iran-data";

export const runtime = "nodejs";

export async function GET() {
  const provinces = PROVINCES.map((p) => ({
    id: p.id,
    nameFa: p.nameFa,
    nameEn: p.nameEn,
    capitalFa: p.capitalFa,
    lat: p.lat,
    lon: p.lon,
    population: p.population,
    area: p.area,
    density: Math.round(p.population / p.area),
    region: p.region,
  }));

  const totalPopulation = IRAN_TOTAL_POPULATION;
  const totalArea = IRAN_AREA_KM2;
  const avgDensity = Math.round(totalPopulation / totalArea);
  const provincesCount = provinces.length;

  // top 5 by population
  const topPopulated = [...provinces].sort((a, b) => b.population - a.population).slice(0, 5);
  const topArea = [...provinces].sort((a, b) => b.area - a.area).slice(0, 5);
  const topDensity = [...provinces].sort((a, b) => b.density - a.density).slice(0, 5);

  return NextResponse.json({
    ok: true,
    summary: { totalPopulation, totalArea, avgDensity, provincesCount },
    provinces,
    topPopulated,
    topArea,
    topDensity,
  });
}
