import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 120;

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  priceUsd: number;
  priceToman: number; // per coin, toman
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
}

const COIN_IDS = ["bitcoin", "ethereum", "tether", "binancecoin", "ripple", "tron", "dogecoin", "solana"];

export async function GET() {
  try {
    const { data, cached } = await withCache("crypto-iran", 1000 * 90, async () => {
      const url =
        `https://api.coingecko.com/api/v3/coins/markets` +
        `?vs_currency=usd&ids=${COIN_IDS.join(",")}` +
        `&order=market_cap_desc&price_change_percentage=24h&sparkline=true`;
      const res = await fetch(url, {
        headers: { accept: "application/json" },
        next: { revalidate: 90 },
      });
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
      const json: any[] = await res.json();
      // rough USD->Toman
      const usdToman = 68500;
      const coins: CryptoCoin[] = json.map((c) => ({
        id: c.id,
        symbol: (c.symbol || "").toUpperCase(),
        name: c.name,
        image: c.image,
        priceUsd: c.current_price ?? 0,
        priceToman: Math.round((c.current_price ?? 0) * usdToman),
        change24h: c.price_change_percentage_24h ?? 0,
        marketCap: c.market_cap ?? 0,
        volume24h: c.total_volume ?? 0,
        sparkline: c.sparkline_in_7d?.price ?? [],
      }));
      return coins;
    });

    return NextResponse.json({ ok: true, cached, updatedAt: Date.now(), coins: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), coins: [] }, { status: 200 });
  }
}
