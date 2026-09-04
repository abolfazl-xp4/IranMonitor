import { toPersianDigits } from "@/lib/iran-data";

export function timeAgoFa(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${toPersianDigits(sec)} ثانیه پیش`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${toPersianDigits(min)} دقیقه پیش`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${toPersianDigits(hr)} ساعت پیش`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${toPersianDigits(day)} روز پیش`;
  const mo = Math.floor(day / 30);
  return `${toPersianDigits(mo)} ماه پیش`;
}

export function formatClockFa(d: Date): string {
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  return `${toPersianDigits(hh)}:${toPersianDigits(mm)}:${toPersianDigits(ss)}`;
}

export function formatDateFa(d: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

export function tomanFa(n: number): string {
  if (n >= 1_000_000_000) return toPersianDigits((n / 1_000_000_000).toFixed(2)) + " میلیارد";
  if (n >= 1_000_000) return toPersianDigits((n / 1_000_000).toFixed(1)) + " میلیون";
  return toPersianDigits(new Intl.NumberFormat("en-US").format(Math.round(n)));
}

export function usdFa(n: number): string {
  if (n >= 1_000_000_000) return "$" + toPersianDigits((n / 1_000_000_000).toFixed(2)) + "B";
  if (n >= 1_000_000) return "$" + toPersianDigits((n / 1_000_000).toFixed(2)) + "M";
  if (n >= 1_000) return "$" + toPersianDigits((n / 1_000).toFixed(2)) + "K";
  return "$" + toPersianDigits(n.toFixed(2));
}

export function changeFa(pct: number): { text: string; up: boolean } {
  return { text: `${pct >= 0 ? "+" : ""}${toPersianDigits(pct.toFixed(2))}%`, up: pct >= 0 };
}
