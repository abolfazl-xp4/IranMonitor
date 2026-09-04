// Comprehensive static data for Iran: provinces, cities, coordinates, stats

export interface Province {
  id: string; // matches geojson NAME_1
  nameFa: string;
  nameEn: string;
  capitalFa: string;
  capitalEn: string;
  lat: number;
  lon: number;
  population: number; // approx 2016 census
  area: number; // km²
  region: "north" | "south" | "east" | "west" | "center";
}

export const PROVINCES: Province[] = [
  { id: "Tehran", nameFa: "تهران", nameEn: "Tehran", capitalFa: "تهران", capitalEn: "Tehran", lat: 35.6892, lon: 51.389, population: 13592000, area: 18814, region: "center" },
  { id: "RazaviKhorasan", nameFa: "خراسان رضوی", nameEn: "Razavi Khorasan", capitalFa: "مشهد", capitalEn: "Mashhad", lat: 36.297, lon: 59.606, population: 6434000, area: 118854, region: "east" },
  { id: "Esfahan", nameFa: "اصفهان", nameEn: "Isfahan", capitalFa: "اصفهان", capitalEn: "Isfahan", lat: 32.6546, lon: 51.668, population: 5120000, area: 107017, region: "center" },
  { id: "Fars", nameFa: "فارس", nameEn: "Fars", capitalFa: "شیراز", capitalEn: "Shiraz", lat: 29.5918, lon: 52.5837, population: 4851000, area: 122608, region: "south" },
  { id: "Khuzestan", nameFa: "خوزستان", nameEn: "Khuzestan", capitalFa: "اهواز", capitalEn: "Ahvaz", lat: 31.3208, lon: 48.6693, population: 4710000, area: 64057, region: "south" },
  { id: "EastAzarbaijan", nameFa: "آذربایجان شرقی", nameEn: "East Azarbaijan", capitalFa: "تبریز", capitalEn: "Tabriz", lat: 38.0801, lon: 46.2919, population: 3909000, area: 45650, region: "west" },
  { id: "Mazandaran", nameFa: "مازندران", nameEn: "Mazandaran", capitalFa: "ساری", capitalEn: "Sari", lat: 36.5633, lon: 53.06, population: 3283000, area: 23756, region: "north" },
  { id: "WestAzarbaijan", nameFa: "آذربایجان غربی", nameEn: "West Azarbaijan", capitalFa: "ارومیه", capitalEn: "Urmia", lat: 37.5476, lon: 45.0752, population: 3265000, area: 43660, region: "west" },
  { id: "Kerman", nameFa: "کرمان", nameEn: "Kerman", capitalFa: "کرمان", capitalEn: "Kerman", lat: 30.2832, lon: 57.0788, population: 3164000, area: 183931, region: "south" },
  { id: "SistanandBaluchestan", nameFa: "سیستان و بلوچستان", nameEn: "Sistan and Baluchestan", capitalFa: "زاهدان", capitalEn: "Zahedan", lat: 29.5014, lon: 60.8626, population: 2775000, area: 187502, region: "east" },
  { id: "Alborz", nameFa: "البرز", nameEn: "Alborz", capitalFa: "کرج", capitalEn: "Karaj", lat: 35.84, lon: 50.9881, population: 2712000, area: 5833, region: "center" },
  { id: "Gilan", nameFa: "گیلان", nameEn: "Gilan", capitalFa: "رشت", capitalEn: "Rasht", lat: 37.2808, lon: 49.5832, population: 2530000, area: 14042, region: "north" },
  { id: "Kermanshah", nameFa: "کرمانشاه", nameEn: "Kermanshah", capitalFa: "کرمانشاه", capitalEn: "Kermanshah", lat: 34.3142, lon: 47.065, population: 1952000, area: 24634, region: "west" },
  { id: "Golestan", nameFa: "گلستان", nameEn: "Golestan", capitalFa: "گرگان", capitalEn: "Gorgan", lat: 36.8456, lon: 54.4393, population: 1869000, area: 20437, region: "north" },
  { id: "Hormozgan", nameFa: "هرمزگان", nameEn: "Hormozgan", capitalFa: "بندرعباس", capitalEn: "Bandar Abbas", lat: 27.1832, lon: 56.2666, population: 1776000, area: 70612, region: "south" },
  { id: "Lorestan", nameFa: "لرستان", nameEn: "Lorestan", capitalFa: "خرم‌آباد", capitalEn: "Khorramabad", lat: 33.4878, lon: 48.3558, population: 1760000, area: 28424, region: "west" },
  { id: "Hamadan", nameFa: "همدان", nameEn: "Hamadan", capitalFa: "همدان", capitalEn: "Hamadan", lat: 34.7989, lon: 48.5147, population: 1738000, area: 19368, region: "west" },
  { id: "Kurdistan", nameFa: "کردستان", nameEn: "Kordestan", capitalFa: "سنندج", capitalEn: "Sanandaj", lat: 35.3148, lon: 46.9923, population: 1603000, area: 28235, region: "west" },
  { id: "Markazi", nameFa: "مرکزی", nameEn: "Markazi", capitalFa: "اراک", capitalEn: "Arak", lat: 34.0917, lon: 49.6892, population: 1429000, area: 29127, region: "center" },
  { id: "Qazvin", nameFa: "قزوین", nameEn: "Qazvin", capitalFa: "قزوین", capitalEn: "Qazvin", lat: 36.2725, lon: 50.0039, population: 1302000, area: 15649, region: "center" },
  { id: "Semnan", nameFa: "سمنان", nameEn: "Semnan", capitalFa: "سمنان", capitalEn: "Semnan", lat: 35.5769, lon: 53.3921, population: 702000, area: 97411, region: "east" },
  { id: "Bushehr", nameFa: "بوشهر", nameEn: "Bushehr", capitalFa: "بوشهر", capitalEn: "Bushehr", lat: 28.9689, lon: 50.8374, population: 1163000, area: 22750, region: "south" },
  { id: "Yazd", nameFa: "یزد", nameEn: "Yazd", capitalFa: "یزد", capitalEn: "Yazd", lat: 31.8974, lon: 54.3569, population: 1133000, area: 72165, region: "center" },
  { id: "Ilam", nameFa: "ایلام", nameEn: "Ilam", capitalFa: "ایلام", capitalEn: "Ilam", lat: 33.6374, lon: 46.066, population: 580000, area: 20150, region: "west" },
  { id: "KohgiluyehandBuyerAhmad", nameFa: "کهگیلویه و بویراحمد", nameEn: "Kohgiluyeh and Buyer Ahmad", capitalFa: "یاسوج", capitalEn: "Yasuj", lat: 30.6684, lon: 51.5945, population: 713000, area: 15504, region: "south" },
  { id: "ChaharMahallandBakhtiari", nameFa: "چهارمحال و بختیاری", nameEn: "Chahar Mahall and Bakhtiari", capitalFa: "شهرکرد", capitalEn: "Shahrekord", lat: 32.3256, lon: 50.8644, population: 947000, area: 16419, region: "center" },
  { id: "NorthKhorasan", nameFa: "خراسان شمالی", nameEn: "North Khorasan", capitalFa: "بجنورد", capitalEn: "Bojnord", lat: 37.4753, lon: 57.3283, population: 863000, area: 28179, region: "east" },
  { id: "SouthKhorasan", nameFa: "خراسان جنوبی", nameEn: "South Khorasan", capitalFa: "بیرجند", capitalEn: "Birjand", lat: 32.8649, lon: 59.2166, population: 768000, area: 95281, region: "east" },
  { id: "Zanjan", nameFa: "زنجان", nameEn: "Zanjan", capitalFa: "زنجان", capitalEn: "Zanjan", lat: 36.6764, lon: 48.496, population: 1057000, area: 22164, region: "west" },
  { id: "Ardebil", nameFa: "اردبیل", nameEn: "Ardebil", capitalFa: "اردبیل", capitalEn: "Ardebil", lat: 38.2498, lon: 48.2959, population: 1270000, area: 17800, region: "west" },
  { id: "Qom", nameFa: "قم", nameEn: "Qom", capitalFa: "قم", capitalEn: "Qom", lat: 34.6399, lon: 50.8759, population: 1292000, area: 11726, region: "center" },
];

// Major cities for weather/air-quality polling (subset, with province id)
export interface City {
  nameFa: string;
  nameEn: string;
  lat: number;
  lon: number;
  provinceId: string;
  isMajor: boolean;
}

export const CITIES: City[] = PROVINCES.map((p) => ({
  nameFa: p.capitalFa,
  nameEn: p.capitalEn,
  lat: p.lat,
  lon: p.lon,
  provinceId: p.id,
  isMajor: ["Tehran", "Mashhad", "Isfahan", "Shiraz", "Tabriz", "Ahvaz", "Rasht", "Kerman", "Bandar Abbas", "Yazd", "Sari", "Gorgan", "Sanandaj", "Kermanshah", "Zahedan"].includes(p.capitalEn),
}));

// Iran bounding box (for USGS earthquake query)
export const IRAN_BBOX = {
  minLat: 24.5,
  maxLat: 40.0,
  minLon: 43.5,
  maxLon: 63.5,
  center: { lat: 32.4, lon: 53.7 },
};

export const IRAN_TOTAL_POPULATION = 83183000;
export const IRAN_AREA_KM2 = 1648195;

export function provinceById(id: string): Province | undefined {
  return PROVINCES.find((p) => p.id === id);
}

export function formatNumber(n: number, locale = "fa-IR"): string {
  return new Intl.NumberFormat(locale).format(n);
}

// Persian digit conversion helpers
export function toPersianDigits(input: string | number): string {
  const map = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(input).replace(/\d/g, (d) => map[+d]);
}

export function formatFa(n: number, digits = 0): string {
  return toPersianDigits(new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n));
}
