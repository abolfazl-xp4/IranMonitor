"use client";

import * as React from "react";
import { Moon, Sun, Activity, RefreshCw, Radio, MapPin, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { formatClockFa, formatDateFa } from "@/lib/format";
import { toPersianDigits } from "@/lib/iran-data";

const AUTO_KEY = "iranmonitor:theme-auto";

export function Header({ onRefresh, children }: { onRefresh?: () => void; children?: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [now, setNow] = React.useState<Date | null>(null);
  const [autoMode, setAutoMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load auto mode + apply
  React.useEffect(() => {
    try {
      setAutoMode(localStorage.getItem(AUTO_KEY) === "1");
    } catch {}
  }, []);

  // Auto-switch theme by hour
  React.useEffect(() => {
    if (!autoMode || !now) return;
    const hour = now.getHours();
    const isDay = hour >= 7 && hour < 19;
    const next = isDay ? "light" : "dark";
    if (theme !== next) setTheme(next);
  }, [now, autoMode, theme, setTheme]);

  const toggleAuto = () => {
    const next = !autoMode;
    setAutoMode(next);
    try { localStorage.setItem(AUTO_KEY, next ? "1" : "0"); } catch {}
    if (next && now) {
      const hour = now.getHours();
      setTheme(hour >= 7 && hour < 19 ? "light" : "dark");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Radio className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
            </span>
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-extrabold tracking-tight">
              ایران‌<span className="text-gradient">مانیتور</span>
            </h1>
            <p className="hidden text-[10px] text-muted-foreground sm:block">
              داشبورد بلادرنگ پایش ایران
            </p>
          </div>
        </div>

        <div className="ms-2 hidden items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground lg:flex">
          <MapPin className="h-3.5 w-3.5 text-emerald-500" />
          <span>۳۱ استان • زلزله • ارز • اخبار</span>
        </div>

        {/* Navigation menu (hamburger on mobile, inline on desktop) */}
        {children}

        <div className="ms-auto flex items-center gap-2">
          <div className="hidden flex-col items-end leading-tight sm:flex">
            <span className="font-mono text-sm font-bold tabular-nums">
              {now ? formatClockFa(now) : toPersianDigits("--:--:--")}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {now ? formatDateFa(now) : ""}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={onRefresh}
            title="بازخوانی"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="تغییر تم"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">تغییر تم</span>
          </Button>

          <Button
            variant={autoMode ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={toggleAuto}
            title={autoMode ? "تم خودکار فعال (بر اساس ساعت)" : "فعال‌سازی تم خودکار بر اساس ساعت"}
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function LiveBadge({ updatedAt, nextRefreshIn }: { updatedAt: number | null; nextRefreshIn?: number }) {
  const [ago, setAgo] = React.useState<string>("");
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!updatedAt) return;
    const tick = () => {
      const diff = Math.floor((Date.now() - updatedAt) / 1000);
      setAgo(`بروزرسانی ${toPersianDigits(diff)} ثانیه پیش`);
      if (nextRefreshIn && nextRefreshIn > 0) {
        const r = Math.max(0, nextRefreshIn - diff);
        setRemaining(r);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [updatedAt, nextRefreshIn]);

  const pct = nextRefreshIn && remaining !== null
    ? Math.max(0, Math.min(100, ((nextRefreshIn - remaining) / nextRefreshIn) * 100))
    : 0;

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      {nextRefreshIn && remaining !== null ? (
        <span className="relative grid h-3.5 w-3.5 place-items-center">
          <svg className="h-3.5 w-3.5 -rotate-90" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--muted)" strokeWidth="2" />
            <circle
              cx="7"
              cy="7"
              r="5.5"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 34.56} 34.56`}
            />
          </svg>
        </span>
      ) : (
        <Activity className="h-3 w-3 text-emerald-500" />
      )}
      {ago}
      {nextRefreshIn && remaining !== null && remaining > 0 && (
        <span className="text-[9px] opacity-60">• بازخوانی {toPersianDigits(Math.ceil(remaining))}ث</span>
      )}
    </span>
  );
}
