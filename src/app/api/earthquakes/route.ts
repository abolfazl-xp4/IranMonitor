import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";
import { IRAN_BBOX } from "@/lib/iran-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 120;

interface UsgsFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    tsunami: number;
    type: string;
    title: string;
  };
  geometry: { type: string; coordinates: [number, number, number] };
}

interface UsgsResponse {
  features: UsgsFeature[];
}

export interface Earthquake {
  id: string;
  mag: number;
  depth: number;
  place: string;
  title: string;
  time: number;
  lat: number;
  lon: number;
  url: string;
  tsunami: boolean;
  severity: "low" | "moderate" | "strong" | "major";
}

function severity(mag: number): Earthquake["severity"] {
  if (mag >= 6) return "major";
  if (mag >= 5) return "strong";
  if (mag >= 4) return "moderate";
  return "low";
}

export async function GET() {
  try {
    const { data, cached } = await withCache("earthquakes-iran", 1000 * 90, async () => {
      const url =
        `https://earthquake.usgs.gov/fdsnws/event/1/query` +
        `?format=geojson` +
        `&starttime=${new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)}` +
        `&endtime=${new Date().toISOString().slice(0, 10)}` +
        `&minmagnitude=2.5` +
        `&minlatitude=${IRAN_BBOX.minLat}` +
        `&maxlatitude=${IRAN_BBOX.maxLat}` +
        `&minlongitude=${IRAN_BBOX.minLon}` +
        `&maxlongitude=${IRAN_BBOX.maxLon}` +
        `&orderby=time`;
      const res = await fetch(url, { next: { revalidate: 120 } });
      if (!res.ok) throw new Error(`USGS ${res.status}`);
      const json: UsgsResponse = await res.json();
      const eqs: Earthquake[] = (json.features || [])
        .filter((f) => f.geometry?.coordinates?.length >= 2)
        .map((f) => ({
          id: f.id,
          mag: f.properties.mag ?? 0,
          depth: f.geometry.coordinates[2] ?? 0,
          place: f.properties.place ?? "Iran region",
          title: f.properties.title ?? "",
          time: f.properties.time,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          url: f.properties.url ?? "",
          tsunami: f.properties.tsunami === 1,
          severity: severity(f.properties.mag ?? 0),
        }))
        .sort((a, b) => b.time - a.time);
      return eqs;
    });

    return NextResponse.json({
      ok: true,
      cached,
      count: data.length,
      updatedAt: Date.now(),
      earthquakes: data,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), earthquakes: [], count: 0 },
      { status: 200 }
    );
  }
}
