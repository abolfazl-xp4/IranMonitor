import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevent prerendering at build time (uses LLM)
export const revalidate = 900; // 15 min

export async function GET() {
  try {
    const { data, cached } = await withCache("news-summary", 1000 * 900, async () => {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();

      // First fetch fresh news
      let news: any[] = [];
      try {
        const r: any = await zai.functions.invoke("web_search", { query: "اخبار امروز ایران", num: 12 });
        news = Array.isArray(r) ? r : [];
      } catch {
        return { summary: "", points: [], updatedAt: 0 };
      }

      const context = news
        .slice(0, 10)
        .map((n, i) => `${i + 1}. ${n.name || n.title || ""}\n${n.snippet || ""}`)
        .join("\n\n");

      if (!context.trim()) {
        return { summary: "", points: [], updatedAt: 0 };
      }

      // Ask LLM for a concise Persian summary + 3 bullet points
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: "assistant",
            content:
              "تو یک دستیار خبری هستی. بر اساس اخبار ارائه‌شده، یک خلاصه کوتاه ۱-۲ جمله‌ای از مهم‌ترین رویدادهای ایران امروز بنویس و سپس ۳ نکته کلیدی به صورت بولت (با شروع •) ارائه کن. فقط فارسی، مختصر و مفید. بدون مقدمه.",
          },
          {
            role: "user",
            content: `اخبار:\n${context}\n\nخلاصه و ۳ نکته کلیدی:`,
          },
        ],
        thinking: { type: "disabled" },
      });

      const raw = completion.choices[0]?.message?.content || "";
      // parse: first paragraph = summary, lines starting with • = points
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      const points = lines.filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*")).map((l) => l.replace(/^[•\-*]\s*/, ""));
      const summaryPart = lines.filter((l) => !l.startsWith("•") && !l.startsWith("-") && !l.startsWith("*")).join(" ") || lines.join(" ");

      return {
        summary: summaryPart.slice(0, 280),
        points: points.slice(0, 4),
        updatedAt: Date.now(),
      };
    });

    return NextResponse.json({ ok: true, cached, ...data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), summary: "", points: [] },
      { status: 200 }
    );
  }
}
