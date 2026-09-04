"use client";

import * as React from "react";
import { AlertTriangle, X, Volume2, VolumeX, MapPin, Bell, BellRing, BellOff } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits } from "@/lib/iran-data";
import { timeAgoFa } from "@/lib/format";

const STORAGE_KEY = "iranmonitor:alert-dismissed";
const SOUND_KEY = "iranmonitor:alert-sound";
const NOTIFY_KEY = "iranmonitor:alert-notify";

export function EarthquakeAlert({ onJump }: { onJump?: () => void }) {
  const { data } = useApi<any>("/api/earthquakes", 90000);
  const [dismissed, setDismissed] = React.useState<string | null>(null);
  const [soundOn, setSoundOn] = React.useState<boolean>(false);
  const [notifyOn, setNotifyOn] = React.useState<boolean>(false);
  const [perm, setPerm] = React.useState<NotificationPermission>("default");
  const lastAlertedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY));
      setSoundOn(localStorage.getItem(SOUND_KEY) === "1");
      setNotifyOn(localStorage.getItem(NOTIFY_KEY) === "1");
      if ("Notification" in window) setPerm(Notification.permission);
    } catch {}
  }, []);

  // Find most recent strong quake in last 24h
  const recentStrong = React.useMemo(() => {
    const list = (data?.earthquakes || []).filter(
      (e: any) => e.mag >= 4.5 && Date.now() - e.time < 24 * 3600 * 1000
    );
    return list[0] || null;
  }, [data]);

  // Sound + notification when a new strong quake appears
  React.useEffect(() => {
    if (!recentStrong) return;
    if (lastAlertedRef.current === recentStrong.id) return;
    lastAlertedRef.current = recentStrong.id;

    // Sound alert
    if (soundOn) {
      try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        setTimeout(() => ctx.close(), 800);
      } catch {}
    }

    // Browser notification
    if (notifyOn && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("🚨 هشدار زلزله — ایران‌مانیتور", {
          body: `بزرگی ${toPersianDigits(recentStrong.mag.toFixed(1))} • ${recentStrong.place} • عمق ${toPersianDigits(Math.round(recentStrong.depth))} کیلومتر`,
          icon: "/favicon.svg",
          tag: recentStrong.id,
          requireInteraction: recentStrong.mag >= 5,
        });
      } catch {}
    }
  }, [soundOn, notifyOn, recentStrong]);

  if (!recentStrong || dismissed === recentStrong.id) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, recentStrong.id); } catch {}
    setDismissed(recentStrong.id);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try { localStorage.setItem(SOUND_KEY, next ? "1" : "0"); } catch {}
  };

  const toggleNotify = async () => {
    if (!notifyOn) {
      // request permission first
      if ("Notification" in window && Notification.permission !== "granted") {
        const p = await Notification.requestPermission();
        setPerm(p);
        if (p !== "granted") return;
      }
    }
    const next = !notifyOn;
    setNotifyOn(next);
    try { localStorage.setItem(NOTIFY_KEY, next ? "1" : "0"); } catch {}
  };

  const borderColor =
    recentStrong.mag >= 6
      ? "var(--color-destructive)"
      : recentStrong.mag >= 5
      ? "oklch(0.65 0.2 40)"
      : "oklch(0.7 0.16 75)";

  return (
    <div
      className="fade-up relative overflow-hidden rounded-xl border bg-gradient-to-l from-rose-500/15 via-orange-500/5 to-transparent shadow-lg"
      style={{ borderColor }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-500/20 text-rose-500">
          <AlertTriangle className="h-5 w-5" />
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/30" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              <Bell className="h-3.5 w-3.5" /> هشدار زلزله
            </span>
            <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              M{toPersianDigits(recentStrong.mag.toFixed(1))}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm font-medium">{recentStrong.place}</p>
          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {timeAgoFa(recentStrong.time)}</span>
            <span>•</span>
            <span>عمق {toPersianDigits(Math.round(recentStrong.depth))} کیلومتر</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onJump && (
            <button
              onClick={onJump}
              className="rounded-md bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-medium text-rose-600 transition-colors hover:bg-rose-500/25 dark:text-rose-400"
            >
              مشاهده
            </button>
          )}
          <button
            onClick={toggleNotify}
            className={`rounded-md border p-1.5 transition-colors ${
              notifyOn
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title={notifyOn ? "اعلان‌ها فعال" : "فعال‌سازی اعلان مرورگر"}
          >
            {notifyOn ? <BellRing className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={toggleSound}
            className={`rounded-md border p-1.5 transition-colors ${
              soundOn
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title={soundOn ? "قطع صدا" : "فعال‌سازی صدا"}
          >
            {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={dismiss}
            className="rounded-md border border-border/60 bg-card/60 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="بستن"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

