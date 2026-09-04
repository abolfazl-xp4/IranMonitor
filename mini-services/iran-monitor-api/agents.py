"""
AI Agents for IranMonitor — specialized analysts that provide insights.

Each agent has:
- A name, role, and system prompt
- A method to gather relevant data
- A method to analyze and produce a Persian insight

Agents:
1. MarketAnalystAgent — analyzes currency/crypto/commodity trends
2. EarthquakeMonitorAgent — monitors quakes, assesses risk
3. WeatherAdvisorAgent — provides weather-based recommendations
4. NewsAnalystAgent — summarizes and extracts key themes from news
"""

import httpx
import json
import time
from typing import Any

# Simple in-memory cache
_cache: dict[str, tuple[Any, float]] = {}
CACHE_TTL = 120


def get_cached(key: str):
    entry = _cache.get(key)
    if not entry:
        return None
    data, expires = entry
    if time.time() > expires:
        _cache.pop(key, None)
        return None
    return data


def set_cached(key: str, data: Any, ttl: int = CACHE_TTL):
    _cache[key] = (data, time.time() + ttl)


def _fetch(url: str, timeout: int = 10) -> dict:
    """Sync HTTP fetch (avoids async event loop issues with uvicorn)."""
    try:
        with httpx.Client(timeout=timeout) as client:
            r = client.get(url)
            return r.json()
    except Exception as e:
        return {}


class BaseAgent:
    name: str = "Agent"
    role: str = ""
    icon: str = "🤖"
    color: str = "primary"

    def __init__(self, nextjs_base: str = "http://localhost:3000"):
        self.nextjs_base = nextjs_base

    def gather_data(self) -> dict:
        raise NotImplementedError

    def analyze(self) -> dict:
        raise NotImplementedError


class MarketAnalystAgent(BaseAgent):
    name = "تحلیل‌گر بازار"
    role = "market_analyst"
    icon = "📊"
    color = "emerald"

    def gather_data(self) -> dict:
        cached = get_cached("market_agent_data")
        if cached:
            return cached
        cur = _fetch(f"{self.nextjs_base}/api/currency")
        crypto = _fetch(f"{self.nextjs_base}/api/crypto")
        com = _fetch(f"{self.nextjs_base}/api/commodities")
        data = {
            "usd": next((c for c in cur.get("currencies", []) if c["code"] == "USD"), None),
            "eur": next((c for c in cur.get("currencies", []) if c["code"] == "EUR"), None),
            "gold": next((c for c in cur.get("coins", []) if c["code"] == "gold_18"), None),
            "btc": next((c for c in crypto.get("coins", []) if c["symbol"] == "BTC"), None),
            "eth": next((c for c in crypto.get("coins", []) if c["symbol"] == "ETH"), None),
            "brent": next((c for c in com.get("commodities", []) if c["code"] == "brent"), None),
        }
        set_cached("market_agent_data", data, 120)
        return data

    def analyze(self) -> dict:
        data = self.gather_data()
        changes = []
        if data.get("usd"):
            changes.append(-data["usd"]["change"])
        if data.get("eur"):
            changes.append(-data["eur"]["change"])
        if data.get("gold"):
            changes.append(-data["gold"]["change"])
        if data.get("btc"):
            changes.append(data["btc"]["change24h"])
        if data.get("eth"):
            changes.append(data["eth"]["change24h"])
        if data.get("brent"):
            changes.append(data["brent"]["change"])

        avg_change = sum(changes) / len(changes) if changes else 0
        sentiment = max(-100, min(100, avg_change * 20))
        sentiment_label = "خوش‌بین" if sentiment > 30 else "بدبین" if sentiment < -30 else "خنثی"

        usd_price = round(data["usd"]["sell"] / 10) if data.get("usd") else None
        btc_price = data["btc"]["priceUsd"] if data.get("btc") else None
        gold_price = data["gold"]["sell"] if data.get("gold") else None

        insight = "دلار: {:,} تومان".format(usd_price) if usd_price else "دلار: ناموجود"
        if data.get("usd"):
            ch = data["usd"]["change"]
            insight += " ({:+.2f}٪)".format(ch)
        insight += "\nطلا: {:,} تومان".format(gold_price) if gold_price else "\nطلا: ناموجود"
        insight += "\nبیت‌کوین: ${:,.0f}".format(btc_price) if btc_price else "\nبیت‌کوین: ناموجود"
        if data.get("btc"):
            insight += " ({:+.2f}٪)".format(data["btc"]["change24h"])

        recommendation = (
            "روند صعودی بازار ارز — توصیه می‌شود معاملات با احتیاط"
            if sentiment < -20
            else "روند نزولی دلار — فرصت ممکن برای خرید"
            if sentiment > 20
            else "بازار در حالت تعادل — نظارت ادامه دارد"
        )

        return {
            "agent": self.name, "role": self.role, "icon": self.icon, "color": self.color,
            "sentiment": round(sentiment), "sentiment_label": sentiment_label,
            "insight": insight, "recommendation": recommendation,
            "timestamp": int(time.time() * 1000),
        }


class EarthquakeMonitorAgent(BaseAgent):
    name = "پایش‌گر زلزله"
    role = "earthquake_monitor"
    icon = "🌋"
    color = "rose"

    def gather_data(self) -> dict:
        cached = get_cached("eq_agent_data")
        if cached:
            return cached
        eq = _fetch(f"{self.nextjs_base}/api/earthquakes")
        data = {"earthquakes": eq.get("earthquakes", [])}
        set_cached("eq_agent_data", data, 90)
        return data

    def analyze(self) -> dict:
        data = self.gather_data()
        eqs = data["earthquakes"]
        now_ms = time.time() * 1000
        last_24h = [e for e in eqs if (now_ms - e["time"]) < 86400000]
        last_7d = [e for e in eqs if (now_ms - e["time"]) < 7 * 86400000]
        strong = [e for e in eqs if e["mag"] >= 4.5]
        biggest = max(eqs, key=lambda e: e["mag"]) if eqs else None

        risk_level = (
            "بالا" if len(strong) > 5 or (biggest and biggest["mag"] >= 6)
            else "متوسط" if len(strong) > 2 or (biggest and biggest["mag"] >= 5)
            else "پایین"
        )
        risk_color = {"بالا": "rose", "متوسط": "amber", "پایین": "emerald"}[risk_level]

        insight = "۲۴ ساعت: {} زلزله\n۷ روز: {} زلزله\nزلزله‌های قوی (≥۴.۵): {}".format(
            len(last_24h), len(last_7d), len(strong)
        )
        if biggest:
            insight += "\nبزرگ‌ترین: M{:.1f} — {}".format(biggest["mag"], biggest["place"])

        recommendation = (
            "هشدار: فعالیت لرزه‌ای بالا — احتیاط در مناطق زلزله‌خیز"
            if risk_level == "بالا"
            else "فعالیت لرزه‌ای متوسط — پایش ادامه دارد"
            if risk_level == "متوسط"
            else "فعالیت لرزه‌ای آرام — وضعیت عادی"
        )

        return {
            "agent": self.name, "role": self.role, "icon": self.icon, "color": risk_color,
            "risk_level": risk_level, "insight": insight, "recommendation": recommendation,
            "stats": {"last24h": len(last_24h), "last7d": len(last_7d), "strong": len(strong)},
            "timestamp": int(time.time() * 1000),
        }


class WeatherAdvisorAgent(BaseAgent):
    name = "مشاور آب‌وهوا"
    role = "weather_advisor"
    icon = "🌤️"
    color = "cyan"

    def gather_data(self) -> dict:
        cached = get_cached("wx_agent_data")
        if cached:
            return cached
        wx = _fetch(f"{self.nextjs_base}/api/weather", timeout=20)
        data = {"cities": wx.get("cities", [])}
        set_cached("wx_agent_data", data, 300)
        return data

    def analyze(self) -> dict:
        data = self.gather_data()
        cities = data["cities"]
        if not cities:
            return {"agent": self.name, "role": self.role, "icon": self.icon, "color": self.color,
                    "insight": "داده‌های آب‌وهوا در دسترس نیست", "recommendation": "بعداً تلاش کنید",
                    "timestamp": int(time.time() * 1000)}

        hottest = max(cities, key=lambda c: c["temp"])
        coldest = min(cities, key=lambda c: c["temp"])
        avg_temp = sum(c["temp"] for c in cities) / len(cities)
        max_humidity = max(cities, key=lambda c: c.get("humidity", 0))

        insight = "گرم‌ترین: {} {:.0f}°\nسردترین: {} {:.0f}°\nمیانگین: {:.0f}°".format(
            hottest["nameFa"], hottest["temp"], coldest["nameFa"], coldest["temp"], avg_temp
        )

        if hottest["temp"] > 40:
            recommendation = "هوای بسیار گرم — توصیه به نوشیدن مایعات و دوری از آفتاب"
        elif coldest["temp"] < 5:
            recommendation = "هوای سرد — لباس گرم و احتیاط در جاده‌های یخی"
        elif max_humidity.get("humidity", 0) > 80:
            recommendation = "رطوبت بالا در {} — احتمال باران".format(max_humidity["nameFa"])
        else:
            recommendation = "آب‌وهوا معتدل — شرایط مناسب برای سفر و فعالیت‌های بیرونی"

        return {
            "agent": self.name, "role": self.role, "icon": self.icon, "color": self.color,
            "insight": insight, "recommendation": recommendation,
            "hottest": hottest["nameFa"], "coldest": coldest["nameFa"], "avg_temp": round(avg_temp),
            "timestamp": int(time.time() * 1000),
        }


class NewsAnalystAgent(BaseAgent):
    name = "تحلیل‌گر اخبار"
    role = "news_analyst"
    icon = "📰"
    color = "amber"

    def gather_data(self) -> dict:
        cached = get_cached("news_agent_data")
        if cached:
            return cached
        news = _fetch(f"{self.nextjs_base}/api/news", timeout=20)
        data = {"news": news.get("news", [])}
        set_cached("news_agent_data", data, 300)
        return data

    def analyze(self) -> dict:
        data = self.gather_data()
        news = data["news"]
        if not news:
            return {"agent": self.name, "role": self.role, "icon": self.icon, "color": self.color,
                    "insight": "خبری در دسترس نیست", "recommendation": "بعداً تلاش کنید",
                    "timestamp": int(time.time() * 1000)}

        categories: dict[str, int] = {}
        for n in news:
            cat = n.get("category", "عمومی")
            categories[cat] = categories.get(cat, 0) + 1
        top_category = max(categories, key=categories.get) if categories else "عمومی"
        insight = "مجموع اخبار: {}\nبیشترین موضوع: {} ({})\n".format(
            len(news), top_category, categories.get(top_category, 0)
        )
        insight += "\n".join("  • {}: {}".format(k, v) for k, v in sorted(categories.items(), key=lambda x: -x[1])[:3])

        sources: dict[str, int] = {}
        for n in news:
            src = n.get("source", "")
            if src:
                sources[src] = sources.get(src, 0) + 1
        top_source = max(sources, key=sources.get) if sources else None

        recommendation = (
            "تمرکز اخبار روی {} — پایش رویدادهای مرتبط توصیه می‌شود".format(top_category)
            if top_category != "عمومی" else "اخبار عمومی متنوع — وضعیت عادی"
        )

        return {
            "agent": self.name, "role": self.role, "icon": self.icon, "color": self.color,
            "insight": insight, "recommendation": recommendation,
            "total_news": len(news), "top_category": top_category, "top_source": top_source,
            "timestamp": int(time.time() * 1000),
        }


AGENTS = {
    "market": MarketAnalystAgent,
    "earthquake": EarthquakeMonitorAgent,
    "weather": WeatherAdvisorAgent,
    "news": NewsAnalystAgent,
}

