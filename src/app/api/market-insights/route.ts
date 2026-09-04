import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevent prerendering at build time (uses LLM)
export const revalidate = 600; // 10 min

export async function GET() {
  try {
    const { data, cached } = await withCache("market-insights", 1000 * 600, async () => {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();

      // Gather live market data from internal APIs
      const [curRes, cryptoRes, comRes] = await Promise.all([
        fetch("http://localhost:3000/api/currency").then((r) => r.json()).catch(() => null),
        fetch("http://localhost:3000/api/crypto").then((r) => r.json()).catch(() => null),
        fetch("http://localhost:3000/api/commodities").then((r) => r.json()).catch(() => null),
      ]);

      const usd = curRes?.currencies?.find((c: any) => c.code === "USD");
      const eur = curRes?.currencies?.find((c: any) => c.code === "EUR");
      const gold = curRes?.coins?.find((c: any) => c.code === "gold_18");
      const coins = cryptoRes?.coins || [];
      const btc = coins.find((c: any) => c.symbol === "BTC");
      const eth = coins.find((c: any) => c.symbol === "ETH");
      const brent = comRes?.commodities?.find((c: any) => c.code === "brent");

      // Build a market snapshot string for the LLM
      const snapshot = [
        `دلار آمریکا: ${usd ? Math.round(usd.sell / 10) : "?"} تومان (${usd ? usd.change.toFixed(2) : "?"}٪)`,
        `یورو: ${eur ? Math.round(eur.sell / 10) : "?"} تومان (${eur ? eur.change.toFixed(2) : "?"}٪)`,
        `طلای ۱۸ عیار: ${gold ? gold.sell : "?"} تومان (${gold ? gold.change.toFixed(2) : "?"}٪)`,
        `بیت‌کوین: $${btc ? btc.priceUsd : "?"} (${btc ? btc.change24h.toFixed(2) : "?"}٪)`,
        `اتریوم: $${eth ? eth.priceUsd : "?"} (${eth ? eth.change24h.toFixed(2) : "?"}٪)`,
        `نفت برنت: $${brent ? brent.priceUsd : "?"} (${brent ? brent.change.toFixed(2) : "?"}٪)`,
      ].join("\n");

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: "assistant",
            content:
              "تو یک تحلیل‌گر بازار مالی هستی. بر اساس داده‌های لحظه‌ای بازار ایران، یک تحلیل کوتاه ۲-۳ جمله‌ای از وضعیت کلی بازار بنویس. روند کلی (صعودی/نزولی/کسل)، مهم‌ترین حرکت‌ها و یک نکته کلیدی را ذکر کن. فقط فارسی، مختصر و حرفه‌ای. بدون مقدمه.",
          },
          {
            role: "user",
            content: `داده‌های لحظه‌ای بازار:\n${snapshot}\n\nتحلیل کوتاه بازار:`,
          },
        ],
        thinking: { type: "disabled" },
      });

      const analysis = completion.choices[0]?.message?.content || "";

      // Compute market sentiment score (-100 to +100) from weighted changes
      const changes: number[] = [];
      if (usd) changes.push(-usd.change); // USD up = negative for local market
      if (eur) changes.push(-eur.change);
      if (gold) changes.push(-gold.change); // gold up often = inflation fear
      if (btc) changes.push(btc.change24h);
      if (eth) changes.push(eth.change24h);
      if (brent) changes.push(brent.change);
      const avg = changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
      const sentiment = Math.max(-100, Math.min(100, avg * 20));

      return {
        analysis: analysis.slice(0, 400),
        sentiment: Math.round(sentiment),
        updatedAt: Date.now(),
      };
    });

    return NextResponse.json({ ok: true, cached, ...data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), analysis: "", sentiment: 0 },
      { status: 200 }
    );
  }
}
