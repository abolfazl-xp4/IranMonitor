import { NextResponse } from "next/server";
import { withCache } from "@/lib/cache";
import { PROVINCES, provinceById, toPersianDigits } from "@/lib/iran-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevent prerendering at build time (uses web_search)
export const revalidate = 60; // 1 min — live updates

interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date: string;
  category: string;
}

// Map province IDs to Persian names for RSS category matching
const PROVINCE_NAMES_FA: Record<string, string[]> = {
  Tehran: ["تهران"],
  RazaviKhorasan: ["خراسان رضوی", "مشهد"],
  Esfahan: ["اصفهان"],
  Fars: ["فارس", "شیراز"],
  Khuzestan: ["خوزستان", "اهواز"],
  EastAzarbaijan: ["آذربایجان شرقی", "تبریز"],
  Mazandaran: ["مازندران", "ساری"],
  WestAzarbaijan: ["آذربایجان غربی", "ارومیه"],
  Kerman: ["کرمان"],
  SistanandBaluchestan: ["سیستان و بلوچستان", "زاهدان"],
  Alborz: ["البرز", "کرج"],
  Gilan: ["گیلان", "رشت"],
  Kermanshah: ["کرمانشاه"],
  Golestan: ["گلستان", "گرگان"],
  Hormozgan: ["هرمزگان", "بندر"],
  Lorestan: ["لرستان", "خرم"],
  Hamadan: ["همدان"],
  Kurdistan: ["کردستان", "سنندج"],
  Markazi: ["مرکزی", "اراک"],
  Qazvin: ["قزوین"],
  Semnan: ["سمنان"],
  Bushehr: ["بوشهر"],
  Yazd: ["یزد"],
  Ilam: ["ایلام"],
  KohgiluyehandBuyerAhmad: ["کهگیلویه و بویراحمد", "یاسوج"],
  ChaharMahallandBakhtiari: ["چهارمحال و بختیاری", "شهرکرد"],
  NorthKhorasan: ["خراسان شمالی", "بجنورد"],
  SouthKhorasan: ["خراسان جنوبی", "بیرجند"],
  Zanjan: ["زنجان"],
  Ardebil: ["اردبیل"],
  Qom: ["قم"],
};

// RSS feeds from reliable Persian news agencies
const RSS_FEEDS = [
  { url: "https://www.mehrnews.com/rss", source: "خبرگزاری مهر" },
  { url: "https://www.isna.ir/rss", source: "خبرگزاری ایسنا" },
  { url: "https://www.mashreghnews.ir/rss", source: "مشرق" },
];

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

function parseRss(xml: string, source: string): NewsItem[] {
  try {
    // Simple XML parsing without external libs
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || block.match(/<title>([\s\S]*?)<\/title>/))?.[1] || "";
      const link = (block.match(/<link>([\s\S]*?)<\/link>/))?.[1]?.trim() || "";
      const desc = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || block.match(/<description>([\s\S]*?)<\/description>/))?.[1] || "";
      const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/))?.[1]?.trim() || "";
      const category = (block.match(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/) || block.match(/<category>([\s\S]*?)<\/category>/))?.[1]?.trim() || "";

      items.push({
        title: stripHtml(title),
        url: link,
        snippet: stripHtml(desc).slice(0, 150),
        source,
        date: pubDate,
        category,
      });
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provinceId = searchParams.get("province") || "";

  const prov = provinceById(provinceId);
  if (!prov) {
    return NextResponse.json({ ok: false, error: "province not found", news: [] });
  }

  const cacheKey = `province-news-rss-${provinceId}`;
  const { data, cached } = await withCache(cacheKey, 1000 * 60, async () => {
    // Fetch all RSS feeds in parallel
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          next: { revalidate: 60 },
          headers: { "accept": "application/xml, text/xml, */*" },
        });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRss(xml, feed.source);
      } catch {
        return [];
      }
    });

    const allFeeds = await Promise.all(feedPromises);
    const allNews = allFeeds.flat();

    // Filter news by province name (match category or title)
    const provinceKeywords = PROVINCE_NAMES_FA[provinceId] || [prov.nameFa];
    const provinceNews = allNews.filter((n) => {
      const text = (n.category + " " + n.title + " " + n.snippet).toLowerCase();
      // Check if any province keyword appears in category (most reliable)
      if (n.category) {
        for (const kw of provinceKeywords) {
          if (n.category.includes(kw)) return true;
        }
      }
      // Also check title for province name
      for (const kw of provinceKeywords) {
        if (n.title.includes(kw)) return true;
      }
      return false;
    });

    // Dedupe by URL
    const seen = new Set<string>();
    const deduped = provinceNews
      .filter((n) => {
        if (!n.url || seen.has(n.url)) return false;
        seen.add(n.url);
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    // Also supplement with general Iran news if province-specific is too few
    let result = deduped;
    if (deduped.length < 5) {
      const general = allNews
        .filter((n) => !seen.has(n.url))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10 - deduped.length);
      result = [...deduped, ...general];
    }

    return result.map((n) => ({
      ...n,
      isProvinceSpecific: provinceKeywords.some((kw) => n.category?.includes(kw) || n.title.includes(kw)),
    }));
  });

  return NextResponse.json({
    ok: true,
    cached,
    province: prov.nameFa,
    capital: prov.capitalFa,
    count: data.length,
    news: data,
    source: "rss",
    updatedAt: Date.now(),
  });
}
