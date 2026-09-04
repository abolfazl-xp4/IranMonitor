import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevent prerendering at build time
export const revalidate = 300;

export interface Commodity {
  code: string;
  nameFa: string;
  unit: string;
  priceUsd: number;
  change: number;
  icon: string;
  source: string;
}

// Base reference prices (for fallback + change calculation)
const BASE: Record<string, { nameFa: string; unit: string; price: number; icon: string }> = {
  brent: { nameFa: "نفت برنت", unit: "بشکه", price: 78.4, icon: "oil" },
  wti: { nameFa: "نفت وست تگزاس", unit: "بشکه", price: 74.2, icon: "oil" },
  gold_oz: { nameFa: "انس طلا", unit: "انس", price: 2412, icon: "gold" },
  silver_oz: { nameFa: "انس نقره", unit: "انس", price: 30.8, icon: "silver" },
  copper: { nameFa: "مس", unit: "پوند", price: 4.42, icon: "copper" },
  steel: { nameFa: "فولاد", unit: "تن", price: 720, icon: "steel" },
  gas: { nameFa: "گاز طبیعی", unit: "MMBtu", price: 2.95, icon: "gas" },
  wheat: { nameFa: "گندم", unit: "بوشل", price: 615, icon: "wheat" },
};

let _prevCommodities: Record<string, number> = {};

export async function GET() {
  const { data, cached } = await withCache("commodities-real-v2", 1000 * 300, async () => {
    // 1. Fetch real gold + silver spot prices
    let goldUsd = 0, silverUsd = 0;
    try {
      const [goldRes, silverRes] = await Promise.all([
        fetch("https://api.gold-api.com/price/XAU", { next: { revalidate: 300 } }),
        fetch("https://api.gold-api.com/price/XAG", { next: { revalidate: 300 } }),
      ]);
      goldUsd = (await goldRes.json()).price || 0;
      silverUsd = (await silverRes.json()).price || 0;
    } catch {}

    // 2. Fetch real oil prices from CoinGecko-style or FCS API
    // (use a simple approach: query oilprice API or fallback to base)
    let brentPrice = BASE.brent.price;
    let wtiPrice = BASE.wti.price;
    try {
      // Try to get Brent/WTI from a public API
      const oilRes = await fetch("https://api.oilpriceapi.com/v1/price", {
        headers: { accept: "application/json" },
        next: { revalidate: 300 },
      });
      if (oilRes.ok) {
        const oilData = await oilRes.json();
        brentPrice = oilData?.data?.brent || brentPrice;
        wtiPrice = oilData?.data?.wti || wtiPrice;
      }
    } catch {}

    // 3. Build commodity list with real data where available
    const commodities: Commodity[] = Object.entries(BASE).map(([code, b]) => {
      let price = b.price;
      let source = "estimated";

      // Use real data for gold and silver
      if (code === "gold_oz" && goldUsd > 0) {
        price = goldUsd;
        source = "real";
      } else if (code === "silver_oz" && silverUsd > 0) {
        price = silverUsd;
        source = "real";
      } else if (code === "brent") {
        price = brentPrice;
        source = brentPrice !== b.price ? "real" : "estimated";
      } else if (code === "wti") {
        price = wtiPrice;
        source = wtiPrice !== b.price ? "real" : "estimated";
      }

      // Change calculation
      const prev = _prevCommodities[code];
      const change = prev && prev > 0 ? ((price - prev) / prev) * 100 : ((price - b.price) / b.price) * 100;
      _prevCommodities[code] = price;

      return {
        code,
        nameFa: b.nameFa,
        unit: b.unit,
        priceUsd: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        icon: b.icon,
        source,
      };
    });

    return {
      commodities,
      goldSpotUsd: goldUsd,
      silverSpotUsd: silverUsd,
      dataSource: goldUsd > 0 ? "real" : "estimated",
    };
  });

  return NextResponse.json({ ok: true, cached, updatedAt: Date.now(), ...data });
}
