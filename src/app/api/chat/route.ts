import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ ok: false, error: "question required" }, { status: 400 });
    }

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    // Gather live data snapshot for context
    const [curRes, cryptoRes, eqRes, wxRes] = await Promise.all([
      fetch("http://localhost:3000/api/currency").then((r) => r.json()).catch(() => null),
      fetch("http://localhost:3000/api/crypto").then((r) => r.json()).catch(() => null),
      fetch("http://localhost:3000/api/earthquakes").then((r) => r.json()).catch(() => null),
      fetch("http://localhost:3000/api/weather").then((r) => r.json()).catch(() => null),
    ]);

    const usd = curRes?.currencies?.find((c: any) => c.code === "USD");
    const eur = curRes?.currencies?.find((c: any) => c.code === "EUR");
    const gold = curRes?.coins?.find((c: any) => c.code === "gold_18");
    const btc = (cryptoRes?.coins || []).find((c: any) => c.symbol === "BTC");
    const eth = (cryptoRes?.coins || []).find((c: any) => c.symbol === "ETH");
    const recentEq = (eqRes?.earthquakes || []).slice(0, 3);
    const tehranWx = (wxRes?.cities || []).find((c: any) => c.nameEn === "Tehran");

    const context = [
      `دلار: ${usd ? Math.round(usd.sell / 10) : "?"} ت (${usd ? usd.change.toFixed(2) : "?"}٪)`,
      `یورو: ${eur ? Math.round(eur.sell / 10) : "?"} ت`,
      `طلای ۱۸: ${gold ? gold.sell : "?"} ت`,
      `بیت‌کوین: $${btc ? btc.priceUsd : "?"} (${btc ? btc.change24h.toFixed(1) : "?"}٪)`,
      `اتریوم: $${eth ? eth.priceUsd : "?"}`,
      `تهران: ${tehranWx ? tehranWx.temp + "°" : "?"}`,
      `زلزله اخیر: ${recentEq.map((e: any) => `M${e.mag} ${e.place}`).join("، ") || "نداریم"}`,
    ].join("\n");

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "تو دستیار هوشمند داشبورد ایران‌مانیتور هستی. بر اساس داده‌های لحظه‌ای زیر، به سوال کاربر به فارسی، مختصر و مفید پاسخ بده. اگر سوال خارج از حوزه داده‌هاست، مودبانه بگو که فقط درباره داده‌های داشبورد می‌توانی کمک کنی.",
        },
        {
          role: "user",
          content: `داده‌های لحظه‌ای:\n${context}\n\nسوال کاربر: ${question}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const answer = completion.choices[0]?.message?.content || "متأسفم، پاسخی دریافت نشد.";
    return NextResponse.json({ ok: true, answer });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), answer: "خطا در ارتباط با سرویس." }, { status: 200 });
  }
}
