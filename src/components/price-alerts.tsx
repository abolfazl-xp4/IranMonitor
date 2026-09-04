"use client";

import * as React from "react";
import { Bell, BellRing, Plus, X, BellOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits, formatFa } from "@/lib/iran-data";
import { tomanFa } from "@/lib/format";

interface AlertRule {
  id: string;
  currency: string; // code
  label: string;
  threshold: number; // toman
  direction: "above" | "below";
  createdAt: number;
  triggered: boolean;
}

const STORAGE_KEY = "iranmonitor:price-alerts";

export function PriceAlerts() {
  const { data } = useApi<any>("/api/currency", 90000);
  const currencies = data?.currencies || [];
  const [rules, setRules] = React.useState<AlertRule[]>([]);
  const [currency, setCurrency] = React.useState<string>("USD");
  const [threshold, setThreshold] = React.useState<string>("");
  const [direction, setDirection] = React.useState<"above" | "below">("above");
  const [perm, setPerm] = React.useState<NotificationPermission>("default");

  // Load rules from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRules(JSON.parse(raw));
      if ("Notification" in window) setPerm(Notification.permission);
    } catch {}
  }, []);

  // Persist rules
  const persist = (next: AlertRule[]) => {
    setRules(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  // Check thresholds on currency updates
  React.useEffect(() => {
    if (!currencies.length) return;
    setRules((prev) => {
      let changed = false;
      const next = prev.map((r) => {
        const c = currencies.find((cu) => cu.code === r.currency);
        if (!c) return r;
        const price = c.sell / 10; // toman
        const crossed =
          (r.direction === "above" && price >= r.threshold) ||
          (r.direction === "below" && price <= r.threshold);
        if (crossed && !r.triggered) {
          changed = true;
          // fire notification
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification("هشدار قیمت — ایران‌مانیتور", {
                body: `${r.label} به ${tomanFa(price)} تومان رسید (${r.direction === "above" ? "بالاتر از" : "پایین‌تر از"} ${tomanFa(r.threshold)})`,
                icon: "/favicon.svg",
                tag: r.id,
              });
            } catch {}
          }
          return { ...r, triggered: true };
        }
        if (!crossed && r.triggered) {
          changed = true;
          return { ...r, triggered: false };
        }
        return r;
      });
      if (changed) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  }, [currencies]);

  const requestPerm = async () => {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setPerm(p);
  };

  const addRule = () => {
    const t = parseFloat(threshold.replace(/,/g, ""));
    if (!t || !currency) return;
    const c = currencies.find((cu) => cu.code === currency);
    if (!c) return;
    const rule: AlertRule = {
      id: `${currency}-${Date.now()}`,
      currency,
      label: c.nameFa,
      threshold: Math.round(t),
      direction,
      createdAt: Date.now(),
      triggered: false,
    };
    persist([rule, ...rules].slice(0, 10));
    setThreshold("");
  };

  const removeRule = (id: string) => {
    persist(rules.filter((r) => r.id !== id));
  };

  const currentPrice = currencies.find((c) => c.code === currency)?.sell / 10;

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
            <BellRing className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold">هشدار قیمت ارز</h2>
        </div>
        {perm !== "granted" && (
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={requestPerm}>
            <Bell className="h-3.5 w-3.5" />
            فعال‌سازی اعلان
          </Button>
        )}
      </div>

      <div className="space-y-3 p-4">
        {/* new rule form */}
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c: any) => (
                <SelectItem key={c.code} value={c.code} className="text-xs">
                  {c.icon} {c.nameFa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            inputMode="numeric"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value.replace(/[^\d]/g, ""))}
            placeholder={currentPrice ? `فعلی: ${formatFa(currentPrice)}` : "آستانه (تومان)"}
            className="h-9 text-left font-mono text-xs tabular-nums"
          />
          <Button size="sm" className="h-9 gap-1 px-2.5" onClick={addRule} disabled={!threshold}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDirection("above")}
            className={`flex-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${
              direction === "above" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-border/60 bg-card/60 text-muted-foreground"
            }`}
          >
            ▲ بالاتر از
          </button>
          <button
            onClick={() => setDirection("below")}
            className={`flex-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${
              direction === "below" ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400" : "border-border/60 bg-card/60 text-muted-foreground"
            }`}
          >
            ▼ پایین‌تر از
          </button>
        </div>

        {/* existing rules */}
        {rules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-card/40 px-3 py-4 text-center text-xs text-muted-foreground">
            <BellOff className="mx-auto mb-1.5 h-5 w-5 opacity-40" />
            هنوز هشداری تنظیم نشده. ارز، آستانه و جهت را انتخاب و «+» را بزنید.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {rules.map((r) => {
              const c = currencies.find((cu) => cu.code === r.currency);
              const price = c?.sell / 10;
              const dist = price ? Math.abs(price - r.threshold) / r.threshold * 100 : 0;
              return (
                <li
                  key={r.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                    r.triggered ? "border-primary/50 bg-primary/10" : "border-border/60 bg-card/60"
                  }`}
                >
                  <span className="text-base">{c?.icon || "🌐"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      {r.label}
                      <span className={`ms-1.5 ${r.direction === "above" ? "text-emerald-500" : "text-rose-500"}`}>
                        {r.direction === "above" ? "▲ ≥" : "▼ ≤"} {tomanFa(r.threshold)} ت
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      فعلی: {price ? `${tomanFa(price)} ت` : "—"}
                      {price && <span className="ms-1">• فاصله {toPersianDigits(dist.toFixed(1))}٪</span>}
                    </p>
                  </div>
                  {r.triggered && (
                    <span className="animate-pulse rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                      فعال
                    </span>
                  )}
                  <button
                    onClick={() => removeRule(r.id)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                    title="حذف"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
