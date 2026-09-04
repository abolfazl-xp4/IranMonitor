"""
Static data for Iran — provinces, cities, coordinates, statistics.
Mirrors the Next.js src/lib/iran-data.ts so the Python backend is self-contained.
"""

PROVINCES = [
    {"id": "Tehran", "nameFa": "تهران", "capitalFa": "تهران", "capitalEn": "Tehran", "lat": 35.6892, "lon": 51.389, "population": 13592000, "area": 18814, "region": "center"},
    {"id": "RazaviKhorasan", "nameFa": "خراسان رضوی", "capitalFa": "مشهد", "capitalEn": "Mashhad", "lat": 36.297, "lon": 59.606, "population": 6434000, "area": 118854, "region": "east"},
    {"id": "Esfahan", "nameFa": "اصفهان", "capitalFa": "اصفهان", "capitalEn": "Isfahan", "lat": 32.6546, "lon": 51.668, "population": 5120000, "area": 107017, "region": "center"},
    {"id": "Fars", "nameFa": "فارس", "capitalFa": "شیراز", "capitalEn": "Shiraz", "lat": 29.5918, "lon": 52.5837, "population": 4851000, "area": 122608, "region": "south"},
    {"id": "Khuzestan", "nameFa": "خوزستان", "capitalFa": "اهواز", "capitalEn": "Ahvaz", "lat": 31.3208, "lon": 48.6693, "population": 4710000, "area": 64057, "region": "south"},
    {"id": "EastAzarbaijan", "nameFa": "آذربایجان شرقی", "capitalFa": "تبریز", "capitalEn": "Tabriz", "lat": 38.0801, "lon": 46.2919, "population": 3909000, "area": 45650, "region": "west"},
    {"id": "Mazandaran", "nameFa": "مازندران", "capitalFa": "ساری", "capitalEn": "Sari", "lat": 36.5633, "lon": 53.06, "population": 3283000, "area": 23756, "region": "north"},
    {"id": "WestAzarbaijan", "nameFa": "آذربایجان غربی", "capitalFa": "ارومیه", "capitalEn": "Urmia", "lat": 37.5476, "lon": 45.0752, "population": 3265000, "area": 43660, "region": "west"},
    {"id": "Kerman", "nameFa": "کرمان", "capitalFa": "کرمان", "capitalEn": "Kerman", "lat": 30.2832, "lon": 57.0788, "population": 3164000, "area": 183931, "region": "south"},
    {"id": "SistanandBaluchestan", "nameFa": "سیستان و بلوچستان", "capitalFa": "زاهدان", "capitalEn": "Zahedan", "lat": 29.5014, "lon": 60.8626, "population": 2775000, "area": 187502, "region": "east"},
    {"id": "Alborz", "nameFa": "البرز", "capitalFa": "کرج", "capitalEn": "Karaj", "lat": 35.84, "lon": 50.9881, "population": 2712000, "area": 5833, "region": "center"},
    {"id": "Gilan", "nameFa": "گیلان", "capitalFa": "رشت", "capitalEn": "Rasht", "lat": 37.2808, "lon": 49.5832, "population": 2530000, "area": 14042, "region": "north"},
    {"id": "Kermanshah", "nameFa": "کرمانشاه", "capitalFa": "کرمانشاه", "capitalEn": "Kermanshah", "lat": 34.3142, "lon": 47.065, "population": 1952000, "area": 24634, "region": "west"},
    {"id": "Golestan", "nameFa": "گلستان", "capitalFa": "گرگان", "capitalEn": "Gorgan", "lat": 36.8456, "lon": 54.4393, "population": 1869000, "area": 20437, "region": "north"},
    {"id": "Hormozgan", "nameFa": "هرمزگان", "capitalFa": "بندرعباس", "capitalEn": "Bandar Abbas", "lat": 27.1832, "lon": 56.2666, "population": 1776000, "area": 70612, "region": "south"},
    {"id": "Lorestan", "nameFa": "لرستان", "capitalFa": "خرم‌آباد", "capitalEn": "Khorramabad", "lat": 33.4878, "lon": 48.3558, "population": 1760000, "area": 28424, "region": "west"},
    {"id": "Hamadan", "nameFa": "همدان", "capitalFa": "همدان", "capitalEn": "Hamadan", "lat": 34.7989, "lon": 48.5147, "population": 1738000, "area": 19368, "region": "west"},
    {"id": "Kurdistan", "nameFa": "کردستان", "capitalFa": "سنندج", "capitalEn": "Sanandaj", "lat": 35.3148, "lon": 46.9923, "population": 1603000, "area": 28235, "region": "west"},
    {"id": "Markazi", "nameFa": "مرکزی", "capitalFa": "اراک", "capitalEn": "Arak", "lat": 34.0917, "lon": 49.6892, "population": 1429000, "area": 29127, "region": "center"},
    {"id": "Qazvin", "nameFa": "قزوین", "capitalFa": "قزوین", "capitalEn": "Qazvin", "lat": 36.2725, "lon": 50.0039, "population": 1302000, "area": 15649, "region": "center"},
    {"id": "Semnan", "nameFa": "سمنان", "capitalFa": "سمنان", "capitalEn": "Semnan", "lat": 35.5769, "lon": 53.3921, "population": 702000, "area": 97411, "region": "east"},
    {"id": "Bushehr", "nameFa": "بوشهر", "capitalFa": "بوشهر", "capitalEn": "Bushehr", "lat": 28.9689, "lon": 50.8374, "population": 1163000, "area": 22750, "region": "south"},
    {"id": "Yazd", "nameFa": "یزد", "capitalFa": "یزد", "capitalEn": "Yazd", "lat": 31.8974, "lon": 54.3569, "population": 1133000, "area": 72165, "region": "center"},
    {"id": "Ilam", "nameFa": "ایلام", "capitalFa": "ایلام", "capitalEn": "Ilam", "lat": 33.6374, "lon": 46.066, "population": 580000, "area": 20150, "region": "west"},
    {"id": "KohgiluyehandBuyerAhmad", "nameFa": "کهگیلویه و بویراحمد", "capitalFa": "یاسوج", "capitalEn": "Yasuj", "lat": 30.6684, "lon": 51.5945, "population": 713000, "area": 15504, "region": "south"},
    {"id": "ChaharMahallandBakhtiari", "nameFa": "چهارمحال و بختیاری", "capitalFa": "شهرکرد", "capitalEn": "Shahrekord", "lat": 32.3256, "lon": 50.8644, "population": 947000, "area": 16419, "region": "center"},
    {"id": "NorthKhorasan", "nameFa": "خراسان شمالی", "capitalFa": "بجنورد", "capitalEn": "Bojnord", "lat": 37.4753, "lon": 57.3283, "population": 863000, "area": 28179, "region": "east"},
    {"id": "SouthKhorasan", "nameFa": "خراسان جنوبی", "capitalFa": "بیرجند", "capitalEn": "Birjand", "lat": 32.8649, "lon": 59.2166, "population": 768000, "area": 95281, "region": "east"},
    {"id": "Zanjan", "nameFa": "زنجان", "capitalFa": "زنجان", "capitalEn": "Zanjan", "lat": 36.6764, "lon": 48.496, "population": 1057000, "area": 22164, "region": "west"},
    {"id": "Ardebil", "nameFa": "اردبیل", "capitalFa": "اردبیل", "capitalEn": "Ardebil", "lat": 38.2498, "lon": 48.2959, "population": 1270000, "area": 17800, "region": "west"},
    {"id": "Qom", "nameFa": "قم", "capitalFa": "قم", "capitalEn": "Qom", "lat": 34.6399, "lon": 50.8759, "population": 1292000, "area": 11726, "region": "center"},
]

IRAN_BBOX = {"minLat": 24.5, "maxLat": 40.0, "minLon": 43.5, "maxLon": 63.5}
IRAN_TOTAL_POPULATION = 83183000
IRAN_AREA_KM2 = 1648195

# Currency base rates (Rial) — same as Next.js currency API
BASE_RIAL = {
    "USD": 685000, "EUR": 745000, "AED": 186500, "GBP": 870000, "TRY": 20100,
    "CNY": 94500, "RUB": 7600, "CAD": 500000, "AUD": 455000, "JPY": 4620,
    "SAR": 182500, "INR": 8150,
}

CURRENCY_META = {
    "USD": {"nameFa": "دلار آمریکا", "icon": "🇺🇸"},
    "EUR": {"nameFa": "یورو", "icon": "🇪🇺"},
    "AED": {"nameFa": "درهم امارات", "icon": "🇦🇪"},
    "GBP": {"nameFa": "پوند انگلیس", "icon": "🇬🇧"},
    "TRY": {"nameFa": "لیر ترکیه", "icon": "🇹🇷"},
    "CNY": {"nameFa": "یوآن چین", "icon": "🇨🇳"},
    "RUB": {"nameFa": "روبل روسیه", "icon": "🇷🇺"},
    "CAD": {"nameFa": "دلار کانادا", "icon": "🇨🇦"},
    "AUD": {"nameFa": "دلار استرالیا", "icon": "🇦🇺"},
    "JPY": {"nameFa": "ین ژاپن", "icon": "🇯🇵"},
    "SAR": {"nameFa": "ریال عربستان", "icon": "🇸🇦"},
    "INR": {"nameFa": "روپیه هند", "icon": "🇮🇳"},
}

BASE_COIN = {
    "coin_full": 72000000, "coin_half": 36000000, "coin_quarter": 18000000,
    "gold_18": 5800000, "gold_broken": 5650000, "mesghal": 36500000,
}

COIN_META = {
    "coin_full": {"nameFa": "سکه تمام بهار آزادی"},
    "coin_half": {"nameFa": "نصف سکه"},
    "coin_quarter": {"nameFa": "ربع سکه"},
    "gold_18": {"nameFa": "طلای ۱۸ عیار (گرم)"},
    "gold_broken": {"nameFa": "طلای آب‌شده (مثقال)"},
    "mesghal": {"nameFa": "مثقال طلا"},
}

BASE_COMMODITIES = {
    "brent": {"nameFa": "نفت برنت", "unit": "بشکه", "price": 78.4, "icon": "oil"},
    "wti": {"nameFa": "نفت وست تگزاس", "unit": "بشکه", "price": 74.2, "icon": "oil"},
    "gold_oz": {"nameFa": "انس طلا", "unit": "انس", "price": 2412, "icon": "gold"},
    "silver_oz": {"nameFa": "انس نقره", "unit": "انس", "price": 30.8, "icon": "silver"},
    "copper": {"nameFa": "مس", "unit": "پوند", "price": 4.42, "icon": "copper"},
    "steel": {"nameFa": "فولاد", "unit": "تن", "price": 720, "icon": "steel"},
    "gas": {"nameFa": "گاز طبیعی", "unit": "MMBtu", "price": 2.95, "icon": "gas"},
    "wheat": {"nameFa": "گندم", "unit": "بوشل", "price": 615, "icon": "wheat"},
}


def to_persian_digits(s):
    """Convert Latin digits in a string to Persian digits."""
    mapping = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
    return str(s).translate(mapping)


def jitter(base: float, pct: float = 0.012) -> float:
    """Small random walk around base price."""
    import random
    delta = (random.random() - 0.5) * 2 * pct
    return base * (1 + delta)
