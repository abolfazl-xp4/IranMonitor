import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevent prerendering at build time (uses web_search)
export const revalidate = 600;

export interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date: string;
  category: string;
}

const QUERIES = [
  { q: "اخبار ایران امروز", category: "عمومی" },
  { q: "اقتصاد ایران نرخ ارز", category: "اقتصاد" },
  { q: "زلزله ایران", category: "حوادث" },
];

export async function GET() {
  try {
    const { data, cached } = await withCache("news-iran", 1000 * 600, async () => {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      const results = await Promise.all(
        QUERIES.map(async ({ q, category }) => {
          try {
            const r: any = await zai.functions.invoke("web_search", { query: q, num: 8 });
            return (Array.isArray(r) ? r : []).map((item: any) => ({
              title: item.name || item.title || "",
              url: item.url || "",
              snippet: item.snippet || "",
              source: item.host_name || "",
              date: item.date || "",
              category,
            }));
          } catch {
            return [];
          }
        })
      );
      // merge, dedupe by url, sort by date desc
      const merged: NewsItem[] = results.flat();
      const seen = new Set<string>();
      const deduped = merged
        .filter((n) => {
          if (!n.url || seen.has(n.url)) return false;
          seen.add(n.url);
          return true;
        })
        .sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0))
        .slice(0, 30);
      return deduped;
    });

    return NextResponse.json({ ok: true, cached, updatedAt: Date.now(), news: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), news: [] }, { status: 200 });
  }
}
