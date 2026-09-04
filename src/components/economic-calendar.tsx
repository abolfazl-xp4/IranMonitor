"use client";

import * as React from "react";
import { Calendar, Clock, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toPersianDigits } from "@/lib/iran-data";

interface EconEvent {
  time: string; // HH:MM UTC
  timeFa: string; // Persian display
  title: string;
  country: string;
  flag: string;
  impact: "high" | "medium" | "low";
  forecast?: string;
  previous?: string;
  affects: string; // what it affects
}

// Curated upcoming events (relative to "today" — simulated schedule)
const EVENTS: EconEvent[] = [
  { time: "08:30", timeFa: "۱۲:۰۰", title: "شاخص قیمت مصرف‌کننده (CPI)", country: "آمریکا", flag: "🇺🇸", impact: "high", forecast: "۳.۱٪", previous: "۳.۲٪", affects: "دلار و طلا" },
  { time: "10:00", timeFa: "۱۳:۳۰", title: "تصمیم نرخ بهره فدرال رزرو", country: "آمریکا", flag: "🇺🇸", impact: "high", forecast: "۵.۵۰٪", previous: "۵.۵۰٪", affects: "همه بازارها" },
  { time: "14:00", timeFa: "۱۷:۳۰", title: "ذخایر نفت خام (EIA)", country: "آمریکا", flag: "🇺🇸", impact: "medium", forecast: "−۲.۱M", previous: "+۱.۵M", affects: "نفت برنت" },
  { time: "06:00", timeFa: "۰۹:۳۰", title: "شاخص PMI صنعتی", country: "یوروزون", flag: "🇪🇺", impact: "medium", forecast: "۴۶.۵", previous: "۴۶.۱", affects: "یورو" },
  { time: "12:30", timeFa: "۱۶:۰۰", title: "سخنرانی رئیس بانک مرکزی اروپا", country: "یوروزون", flag: "🇪🇺", impact: "medium", affects: "یورو" },
  { time: "09:00", timeFa: "۱۲:۳۰", title: "گزارش بازار کار (NFP)", country: "آمریکا", flag: "🇺🇸", impact: "high", forecast: "+۱۸۰K", previous: "+۲۰۳K", affects: "دلار و ارزها" },
];

const IMPACT_STYLE: Record<string, { label: string; color: string; dot: string }> = {
  high: { label: "زیاد", color: "text-rose-500 bg-rose-500/10", dot: "bg-rose-500" },
  medium: { label: "متوسط", color: "text-amber-500 bg-amber-500/10", dot: "bg-amber-500" },
  low: { label: "کم", color: "text-emerald-500 bg-emerald-500/10", dot: "bg-emerald-500" },
};

export function EconomicCalendar() {
  const [now] = React.useState(() => new Date());
  const todayFa = new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" }).format(now);

  // sort by time
  const sorted = [...EVENTS].sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = sorted.slice(0, 6);

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
            <Calendar className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold">تقویم اقتصادی</h2>
        </div>
        <span className="text-[10px] text-muted-foreground">{todayFa}</span>
      </div>

      <div className="max-h-[320px] overflow-y-auto scroll-thin">
        <ul className="divide-y divide-border/40">
          {upcoming.map((e, i) => {
            const imp = IMPACT_STYLE[e.impact];
            return (
              <li key={i} className="px-4 py-2.5 transition-colors hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex w-12 shrink-0 flex-col items-center">
                    <span className="font-mono text-xs font-bold tabular-nums">{e.timeFa}</span>
                    <span className="text-[9px] text-muted-foreground">UTC {toPersianDigits(e.time)}</span>
                  </div>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${imp.dot}`} title={`تأثیر: ${imp.label}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      <span className="me-1">{e.flag}</span>
                      {e.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {e.country} • تأثیر: {e.affects}
                    </p>
                  </div>
                  <Badge variant="secondary" className={`shrink-0 px-1.5 py-0 text-[9px] font-medium ${imp.color}`}>
                    {imp.label}
                  </Badge>
                </div>
                {(e.forecast || e.previous) && (
                  <div className="mt-1 flex items-center gap-3 ps-14 text-[10px] text-muted-foreground">
                    {e.forecast && (
                      <span>پیش‌بینی: <b className="text-foreground">{e.forecast}</b></span>
                    )}
                    {e.previous && (
                      <span>قبلی: <b className="text-muted-foreground">{e.previous}</b></span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground">
        <AlertCircle className="h-3 w-3" />
        <span>رویدادهای اقتصادی جهانی که بر بازار ایران تأثیر می‌گذارند</span>
      </div>
    </Card>
  );
}
