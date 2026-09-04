"""
IranMonitor Python Backend — FastAPI server.

Provides:
- /api/python/stats       — province statistics
- /api/python/currency     — live currency/gold rates (Python-generated)
- /api/python/commodities  — global commodity prices
- /api/python/provinces    — all 31 provinces data
- /api/python/agents       — all AI agents insights
- /api/python/agents/{id}  — specific agent insight
- /api/python/health       — health check

Port: 8000 (hardcoded per mini-service rules)
"""

import json
import random
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from iran_data import (
    PROVINCES, IRAN_BBOX, IRAN_TOTAL_POPULATION, IRAN_AREA_KM2,
    BASE_RIAL, CURRENCY_META, BASE_COIN, COIN_META, BASE_COMMODITIES,
    jitter, to_persian_digits,
)
from agents import (
    MarketAnalystAgent, EarthquakeMonitorAgent, WeatherAdvisorAgent, NewsAnalystAgent, AGENTS,
)

app = FastAPI(title="IranMonitor Python API", version="1.0.0")

# CORS — allow the Next.js frontend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NEXTJS_BASE = "http://localhost:3000"


# ─── In-memory cache ────────────────────────────────────────────
_cache: dict[str, tuple] = {}


def cached(key: str, ttl: int = 120):
    entry = _cache.get(key)
    if entry and time.time() < entry[1]:
        return entry[0]
    return None


def set_cache(key: str, data, ttl: int = 120):
    _cache[key] = (data, time.time() + ttl)


# ─── Health ─────────────────────────────────────────────────────
@app.get("/api/python/health")
async def health():
    return {"ok": True, "service": "iran-monitor-python", "version": "1.0.0", "time": time.time()}


# ─── Province stats ──────────────────────────────────────────────
@app.get("/api/python/provinces")
async def get_provinces():
    return {
        "ok": True,
        "count": len(PROVINCES),
        "provinces": PROVINCES,
    }


@app.get("/api/python/stats")
async def get_stats():
    summary = {
        "total_population": IRAN_TOTAL_POPULATION,
        "total_area": IRAN_AREA_KM2,
        "avg_density": round(IRAN_TOTAL_POPULATION / IRAN_AREA_KM2),
        "provinces_count": len(PROVINCES),
    }
    top_populated = sorted(PROVINCES, key=lambda p: -p["population"])[:5]
    top_area = sorted(PROVINCES, key=lambda p: -p["area"])[:5]
    top_density = sorted(PROVINCES, key=lambda p: -(p["population"] / p["area"]))[:5]
    return {
        "ok": True,
        "summary": summary,
        "top_populated": top_populated,
        "top_area": top_area,
        "top_density": top_density,
    }


# ─── Currency ───────────────────────────────────────────────────
@app.get("/api/python/currency")
async def get_currency():
    cached_data = cached("currency", 120)
    if cached_data:
        return {**cached_data, "cached": True}

    currencies = []
    for code, base in BASE_RIAL.items():
        meta = CURRENCY_META[code]
        live = round(jitter(base))
        # synthetic 7-point trend
        trend = [
            round(base * (1 + (random.random() - 0.5) * 0.02 + ((6 - i) / 6) * 0.005))
            for i in range(7)
        ]
        trend[-1] = live
        currencies.append({
            "code": code,
            "nameFa": meta["nameFa"],
            "icon": meta["icon"],
            "buy": round(live * 0.998),
            "sell": live,
            "change": round(((live - base) / base) * 100, 2),
            "trend": trend,
        })

    coins = []
    for code, base in BASE_COIN.items():
        meta = COIN_META[code]
        live = round(jitter(base, 0.008))
        coins.append({
            "code": code,
            "nameFa": meta["nameFa"],
            "buy": round(live * 0.997),
            "sell": live,
            "change": round(((live - base) / base) * 100, 2),
        })

    data = {
        "ok": True,
        "currencies": currencies,
        "coins": coins,
        "generated_by": "python",
    }
    set_cache("currency", data, 120)
    return {**data, "cached": False}


# ─── Commodities ────────────────────────────────────────────────
@app.get("/api/python/commodities")
async def get_commodities():
    cached_data = cached("commodities", 180)
    if cached_data:
        return {**cached_data, "cached": True}

    commodities = []
    for code, info in BASE_COMMODITIES.items():
        live = round(jitter(info["price"]), 2 if info["price"] > 100 else 3)
        commodities.append({
            "code": code,
            "nameFa": info["nameFa"],
            "unit": info["unit"],
            "priceUsd": live,
            "change": round(((live - info["price"]) / info["price"]) * 100, 2),
            "icon": info["icon"],
        })

    data = {"ok": True, "commodities": commodities, "generated_by": "python"}
    set_cache("commodities", data, 180)
    return {**data, "cached": False}


# ─── AI Agents ─────────────────────────────────────────────────
@app.get("/api/python/agents")
def get_all_agents():
    """Run all agents and return their insights (sync to avoid event loop issues)."""
    results = []
    for key, AgentClass in AGENTS.items():
        agent = AgentClass(nextjs_base=NEXTJS_BASE)
        try:
            insight = agent.analyze()
            results.append(insight)
        except Exception as e:
            results.append({
                "agent": agent.name, "role": agent.role, "icon": agent.icon,
                "error": str(e), "insight": "خطا در تحلیل", "recommendation": "",
                "timestamp": int(time.time() * 1000),
            })
    return {"ok": True, "agents": results, "count": len(results)}


@app.get("/api/python/agents/{agent_id}")
def get_agent(agent_id: str):
    """Run a specific agent by ID (market, earthquake, weather, news)."""
    if agent_id not in AGENTS:
        return {"ok": False, "error": "agent '{}' not found".format(agent_id), "available": list(AGENTS.keys())}
    agent = AGENTS[agent_id](nextjs_base=NEXTJS_BASE)
    try:
        insight = agent.analyze()
        return {"ok": True, **insight}
    except Exception as e:
        return {"ok": False, "error": str(e)}


class ChatRequest(BaseModel):
    question: str


@app.post("/api/python/chat")
def chat(req: ChatRequest):
    """AI chat using Python backend + live data context (sync)."""
    import httpx

    # Gather data context (sync)
    cur = {}
    eq = {}
    wx = {}
    try:
        with httpx.Client(timeout=10) as client:
            cur = client.get(f"{NEXTJS_BASE}/api/currency").json()
            eq = client.get(f"{NEXTJS_BASE}/api/earthquakes").json()
            wx = client.get(f"{NEXTJS_BASE}/api/weather", timeout=20).json()
    except Exception:
        pass

    usd = next((c for c in cur.get("currencies", []) if c["code"] == "USD"), None)
    gold = next((c for c in cur.get("coins", []) if c["code"] == "gold_18"), None)
    tehran = next((c for c in wx.get("cities", []) if c.get("nameEn") == "Tehran"), None)
    recent_eq = eq.get("earthquakes", [])[:3]

    eq_str = ", ".join("M{} {}".format(e["mag"], e["place"]) for e in recent_eq) or "نداریم"
    context = (
        "دلار: {} تومان\n".format(round(usd["sell"] / 10) if usd else "?") +
        "طلا: {} تومان\n".format(gold["sell"] if gold else "?") +
        "تهران: {}°\n".format(tehran["temp"] if tehran else "?") +
        "زلزله اخیر: {}\n".format(eq_str)
    )

    # Use z-ai web search + chat via Next.js proxy for the LLM call
    # For now, generate a rule-based response using Python agents
    question_lower = req.question.lower()

    if "دلار" in question_lower or "dolar" in question_lower or "ارز" in question_lower:
        if usd:
            usd_toman = to_persian_digits("{:,}".format(round(usd["sell"] / 10)))
            ch = to_persian_digits("{:+.2f}".format(usd["change"]))
            answer = "قیمت فعلی دلار: {} تومان ({}٪). ".format(usd_toman, ch)
            answer += "روند " + ("صعودی" if usd["change"] > 0 else "نزولی") + " است."
        else:
            answer = "داده دلار در دسترس نیست."
    elif "طلا" in question_lower or "gold" in question_lower:
        if gold:
            gold_toman = to_persian_digits("{:,}".format(gold["sell"]))
            ch = to_persian_digits("{:+.2f}".format(gold["change"]))
            answer = "طلای ۱۸ عیار: {} تومان ({}٪).".format(gold_toman, ch)
        else:
            answer = "داده طلا در دسترس نیست."
    elif "زلزله" in question_lower or "earthquake" in question_lower:
        if recent_eq:
            e = recent_eq[0]
            answer = "آخرین زلزله: بزرگی {} در {} به عمق {} کیلومتر.".format(
                to_persian_digits(e["mag"]), e["place"], to_persian_digits(round(e["depth"]))
            )
        else:
            answer = "زلزله‌ای ثبت نشده."
    elif "تهران" in question_lower or "هوا" in question_lower or "آب" in question_lower:
        if tehran:
            answer = "هوای تهران: {}° با رطوبت {}٪.".format(
                to_persian_digits(round(tehran["temp"])), to_persian_digits(round(tehran["humidity"]))
            )
        else:
            answer = "داده هوای تهران در دسترس نیست."
    else:
        answer = (
            "من دستیار ایران‌مانیتور هستم. سوال خود را درباره دلار، طلا، زلزله، "
            "آب‌وهوا یا اخبار مطرح کنید.\n\nداده‌های لحظه‌ای:\n" + context
        )

    return {"ok": True, "answer": answer, "context": context, "generated_by": "python"}


# ─── Agent list ────────────────────────────────────────────────
@app.get("/api/python/agents-list")
async def list_agents():
    """List all available agents with their metadata."""
    return {
        "ok": True,
        "agents": [
            {
                "id": key,
                "name": cls.name,
                "role": cls.role,
                "icon": cls.icon,
                "color": cls.color,
            }
            for key, cls in AGENTS.items()
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
