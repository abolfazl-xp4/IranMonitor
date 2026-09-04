"use client";

import * as React from "react";
import { Settings, Clock, Eye, Volume2, RotateCcw, Trash2, Check, Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toPersianDigits } from "@/lib/iran-data";

const SETTINGS_KEY = "iranmonitor:settings";
const CONTRAST_KEY = "iranmonitor:high-contrast";

interface Settings {
  refreshFast: number;
  refreshSlow: number;
  showTicker: boolean;
  showSeconds: boolean;
  compactMode: boolean;
}

const DEFAULTS: Settings = {
  refreshFast: 90,
  refreshSlow: 300,
  showTicker: true,
  showSeconds: true,
  compactMode: false,
};

const FAST_OPTIONS = [
  { value: "30", label: "۳۰ ثانیه" },
  { value: "60", label: "۱ دقیقه" },
  { value: "90", label: "۱.۵ دقیقه" },
  { value: "180", label: "۳ دقیقه" },
];
const SLOW_OPTIONS = [
  { value: "120", label: "۲ دقیقه" },
  { value: "300", label: "۵ دقیقه" },
  { value: "600", label: "۱۰ دقیقه" },
  { value: "900", label: "۱۵ دقیقه" },
];

export function SettingsPanel() {
  const [open, setOpen] = React.useState(false);
  const [s, setS] = React.useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
      setHighContrast(localStorage.getItem(CONTRAST_KEY) === "1");
    } catch {}
    setLoaded(true);
  }, []);

  // Apply high-contrast class to <body> (avoid conflict with next-themes on <html>)
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    try { localStorage.setItem(CONTRAST_KEY, next ? "1" : "0"); } catch {}
  };

  const save = (next: Settings) => {
    setS(next);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
  };

  const reset = () => {
    save(DEFAULTS);
  };

  const clearAll = () => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("iranmonitor:"));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
    setS(DEFAULTS);
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={() => setOpen(true)}
        title="تنظیمات"
      >
        <Settings className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">تنظیمات</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-[520px]">
          <DialogHeader className="border-b border-border/60 bg-muted/30 px-4 py-3">
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <Settings className="h-4 w-4 text-primary" />
              تنظیمات داشبورد
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto scroll-thin p-4">
            {/* Refresh intervals */}
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> بازخوانی داده‌ها
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/40 p-2.5">
                  <div>
                    <p className="text-xs font-medium">داده‌های سریع</p>
                    <p className="text-[10px] text-muted-foreground">زلزله، ارز، کریپتو</p>
                  </div>
                  <Select value={String(s.refreshFast)} onValueChange={(v) => save({ ...s, refreshFast: +v })}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FAST_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/40 p-2.5">
                  <div>
                    <p className="text-xs font-medium">داده‌های کند</p>
                    <p className="text-[10px] text-muted-foreground">آب‌وهوا، کیفیت هوا، اخبار</p>
                  </div>
                  <Select value={String(s.refreshSlow)} onValueChange={(v) => save({ ...s, refreshSlow: +v })}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLOW_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Display options */}
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <Eye className="h-3.5 w-3.5" /> نمایش
              </h3>
              <div className="space-y-1.5">
                <ToggleRow
                  label="نوار تیکر متحرک"
                  desc="نمایش قیمت‌های زنده در بالا"
                  checked={s.showTicker}
                  onChange={(v) => save({ ...s, showTicker: v })}
                />
                <ToggleRow
                  label="نمایش ثانیه‌شمار"
                  desc="در ساعت هدر"
                  checked={s.showSeconds}
                  onChange={(v) => save({ ...s, showSeconds: v })}
                />
                <ToggleRow
                  label="حالت فشرده"
                  desc="کاهش فاصله‌گذاری کارت‌ها"
                  checked={s.compactMode}
                  onChange={(v) => save({ ...s, compactMode: v })}
                />
              </div>
            </section>

            {/* Accessibility */}
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <Contrast className="h-3.5 w-3.5" /> دسترسی‌پذیری
              </h3>
              <ToggleRow
                label="حالت کنتراست بالا"
                desc="افزایش کنتراست متن و مرزها برای ضعف بینایی"
                checked={highContrast}
                onChange={toggleContrast}
              />
            </section>

            {/* Data management */}
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> مدیریت داده‌ها
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 text-xs" onClick={reset}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  بازنشانی تنظیمات به پیش‌فرض
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-xs text-rose-500 hover:bg-rose-500/10" onClick={clearAll}>
                  <Trash2 className="h-3.5 w-3.5" />
                  پاک کردن همه داده‌های محلی (سبد، هشدارها، موردعلاقه‌ها)
                </Button>
              </div>
            </section>

            <p className="text-center text-[10px] text-muted-foreground">
              تنظیمات در مرورگر شما ذخیره می‌شود.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/40 p-2.5">
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
