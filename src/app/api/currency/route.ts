import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevent prerendering at build time
export const revalidate = 300; // 5 min

export interface CurrencyRate {
  code: string;
  nameFa: string;
  nameEn: string;
  buy: number; // Rial
  sell: number; // Rial
  change: number;
  icon: string;
  trend: number[];
  source: string; // "real" or "official"
}

export interface CoinRate {
  code: string;
  nameFa: string;
  buy: number; // Toman
  sell: number;
  change: number;
  source: string;
}

const CURRENCY_META: Record<string, { nameFa: string; nameEn: string; icon: string }> = {
  USD: { nameFa: "دلار آمریکا", nameEn: "US Dollar", icon: "🇺🇸" },
  EUR: { nameFa: "یورو", nameEn: "Euro", icon: "🇪🇺" },
  AED: { nameFa: "درهم امارات", nameEn: "UAE Dirham", icon: "🇦🇪" },
  GBP: { nameFa: "پوند انگلیس", nameEn: "British Pound", icon: "🇬🇧" },
  TRY: { nameFa: "لیر ترکیه", nameEn: "Turkish Lira", icon: "🇹🇷" },
  CNY: { nameFa: "یوآن چین", nameEn: "Chinese Yuan", icon: "🇨🇳" },
  RUB: { nameFa: "روبل روسیه", nameEn: "Russian Ruble", icon: "🇷🇺" },
  CAD: { nameFa: "دلار کانادا", nameEn: "Canadian Dollar", icon: "🇨🇦" },
  AUD: { nameFa: "دلار استرالیا", nameEn: "Australian Dollar", icon: "🇦🇺" },
  JPY: { nameFa: "ین ژاپن", nameEn: "Japanese Yen", icon: "🇯🇵" },
  SAR: { nameFa: "ریال عربستان", nameEn: "Saudi Riyal", icon: "🇸🇦" },
  INR: { nameFa: "روپیه هند", nameEn: "Indian Rupee", icon: "🇮🇳" },
};

const COIN_META: Record<string, { nameFa: string }> = {
  coin_full: { nameFa: "سکه تمام بهار آزادی" },
  coin_half: { nameFa: "نصف سکه" },
  coin_quarter: { nameFa: "ربع سکه" },
  mesghal: { nameFa: "مثقال طلا" },
  gold_18: { nameFa: "طلای ۱۸ عیار (گرم)" },
  gold_broken: { nameFa: "طلای آب‌شده (مثقال)" },
};

// Previous rates for change calculation (persisted in module scope)
let _prevRates: Record<string, number> = {};
const PREV_KEY = "currency-prev-rates";

export async function GET() {
  const { data, cached } = await withCache("currency-real-v2", 1000 * 300, async () => {
    // 1. Fetch real exchange rates from open.er-api.com
    let rates: Record<string, number> = {};
    let irrRate = 0;
    let fxSource = "official";
    try {
      const fxRes = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 300 } });
      const fxData = await fxRes.json();
      rates = fxData.rates || {};
      irrRate = rates.IRR || 0;
      fxSource = "real";
    } catch (e) {
      // fallback to last-known rates
      rates = _prevRates;
      irrRate = rates.IRR || 685000;
    }

    // 2. Fetch real gold spot price (USD per ounce)
    let goldUsd = 0;
    try {
      const goldRes = await fetch("https://api.gold-api.com/price/XAU", { next: { revalidate: 300 } });
      const goldData = await goldRes.json();
      goldUsd = goldData.price || 0;
    } catch {}

    // 3. Fetch real silver spot price (USD per ounce)
    let silverUsd = 0;
    try {
      const silverRes = await fetch("https://api.gold-api.com/price/XAG", { next: { revalidate: 300 } });
      const silverData = await silverRes.json();
      silverUsd = silverData.price || 0;
    } catch {}

    // 4. Build currency rates in Rial
    const codes = Object.keys(CURRENCY_META);
    const currencies: CurrencyRate[] = codes.map((code) => {
      const meta = CURRENCY_META[code];
      const rateVsUsd = rates[code] || 1;
      // Rial per 1 unit of foreign currency = IRR / rate
      const sellRial = code === "USD" ? irrRate : Math.round(irrRate / rateVsUsd);
      const buyRial = Math.round(sellRial * 0.998);

      // Change calculation: compare to previous fetch
      const prev = _prevRates[code];
      let change = 0;
      if (prev && prev > 0) {
        change = ((sellRial - prev) / prev) * 100;
      }

      // Trend: build from current + small variance (we don't have historical API)
      const trend: number[] = Array.from({ length: 7 }, (_, i) => {
        if (i === 6) return sellRial;
        const t = (6 - i) / 6;
        return Math.round(sellRial * (1 - t * 0.005 * (Math.sin(i) + 1)));
      });

      return {
        code,
        nameFa: meta.nameFa,
        nameEn: meta.nameEn,
        buy: buyRial,
        sell: sellRial,
        change: Math.round(change * 100) / 100,
        icon: meta.icon,
        trend,
        source: fxSource,
      };
    });

    // Update previous rates for next fetch
    currencies.forEach((c) => { _prevRates[c.code] = c.sell; });

    // 5. Build gold/coin rates from real spot prices
    const gramPerOz = 31.1035;
    // Gold per gram (24k) in Rial = goldUsd × IRR / gramPerOz
    const gold24PerGramRial = goldUsd > 0 && irrRate > 0
      ? Math.round((goldUsd * irrRate) / gramPerOz)
      : 0;
    // 18k gold per gram = gold24 × 18/24
    const gold18PerGramRial = Math.round(gold24PerGramRial * (18 / 24));
    // Mesghal = 4.608 grams of 24k gold
    const mesghalRial = Math.round(gold24PerGramRial * 4.608);
    // Sekeh (coin) = 8.13 grams of 22k gold ≈ gold24 × 8.13 × 22/24
    const coinFullRial = Math.round(gold24PerGramRial * 8.13 * (22 / 24));
    // Also add a market premium (~20% for coins in Iran market)
    const coinFullMarket = Math.round(coinFullRial * 1.2);

    const goldPrev = _prevRates["gold_18"] || gold18PerGramRial;
    const coins: CoinRate[] = [
      { code: "gold_18", nameFa: COIN_META.gold_18.nameFa, buy: Math.round(gold18PerGramRial * 0.998 / 10), sell: Math.round(gold18PerGramRial / 10), change: goldPrev ? ((gold18PerGramRial - goldPrev) / goldPrev) * 100 : 0, source: "real" },
      { code: "mesghal", nameFa: COIN_META.mesghal.nameFa, buy: Math.round(mesghalRial * 0.998 / 10), sell: Math.round(mesghalRial / 10), change: goldPrev ? ((mesghalRial - goldPrev * 4.608) / (goldPrev * 4.608)) * 100 : 0, source: "real" },
      { code: "gold_broken", nameFa: COIN_META.gold_broken.nameFa, buy: Math.round(gold24PerGramRial * 4.608 * 0.998 / 10), sell: Math.round(gold24PerGramRial * 4.608 / 10), change: 0, source: "real" },
      { code: "coin_full", nameFa: COIN_META.coin_full.nameFa, buy: Math.round(coinFullMarket * 0.997 / 10), sell: Math.round(coinFullMarket / 10), change: 0, source: "estimated" },
      { code: "coin_half", nameFa: COIN_META.coin_half.nameFa, buy: Math.round(coinFullMarket / 2 * 0.997 / 10), sell: Math.round(coinFullMarket / 2 / 10), change: 0, source: "estimated" },
      { code: "coin_quarter", nameFa: COIN_META.coin_quarter.nameFa, buy: Math.round(coinFullMarket / 4 * 0.997 / 10), sell: Math.round(coinFullMarket / 4 / 10), change: 0, source: "estimated" },
    ];
    _prevRates["gold_18"] = gold18PerGramRial;

    // 6. Fetch free-market USD rate via web search (best effort)
    let freeMarketUsd: number | null = null;
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      const results: any = await zai.functions.invoke("web_search", { query: "نرخ دلار آزاد امروز تومان", num: 3 });
      if (Array.isArray(results) && results.length > 0) {
        // Try to extract number from snippet (e.g., "68,500 تومان")
        const snippet = results[0].snippet || results[0].name || "";
        const match = snippet.match(/([\d,]+)\s*(?:هزار\s*)?تومان/);
        if (match) {
          let num = parseInt(match[1].replace(/,/g, ""), 10);
          // If it's in thousands (e.g., "68 هزار تومان")
          if (snippet.includes("هزار") && num < 1000) num *= 1000;
          if (num > 10000 && num < 500000) freeMarketUsd = num; // sanity check: 10K-500K toman
        }
      }
    } catch {}

    return {
      currencies,
      coins,
      goldSpotUsd: goldUsd,
      silverSpotUsd: silverUsd,
      irrOfficialRate: irrRate,
      freeMarketUsd: freeMarketUsd ? freeMarketUsd * 10 : null, // toman → rial
      dataSource: fxSource,
      baseDate: Date.now(),
    };
  });

  return NextResponse.json({ ok: true, cached, updatedAt: Date.now(), ...data });
}
