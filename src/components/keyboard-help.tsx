"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Keyboard, Search, GitCompare, Mountain, Cloud, Coins, Newspaper, Map, X } from "lucide-react";

interface Shortcut {
  keys: string[];
  desc: string;
  icon?: React.ReactNode;
}

const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
  {
    group: "عمومی",
    items: [
      { keys: ["Ctrl", "K"], desc: "باز کردن پنل جستجو و فرمان", icon: <Search className="h-4 w-4" /> },
      { keys: ["?"], desc: "نمایش این راهنما", icon: <Keyboard className="h-4 w-4" /> },
      { keys: ["Esc"], desc: "بستن پنل‌های باز", icon: <X className="h-4 w-4" /> },
      { keys: ["T"], desc: "تغییر تم تاریک/روشن", icon: <Keyboard className="h-4 w-4" /> },
    ],
  },
  {
    group: "ناوبری سریع",
    items: [
      { keys: ["M"], desc: "رفتن به نقشه ایران", icon: <Map className="h-4 w-4" /> },
      { keys: ["E"], desc: "رفتن به پنل زلزله", icon: <Mountain className="h-4 w-4" /> },
      { keys: ["W"], desc: "رفتن به آب‌وهوا", icon: <Cloud className="h-4 w-4" /> },
      { keys: ["C"], desc: "رفتن به نرخ ارز", icon: <Coins className="h-4 w-4" /> },
      { keys: ["N"], desc: "رفتن به اخبار", icon: <Newspaper className="h-4 w-4" /> },
      { keys: ["Shift", "C"], desc: "مقایسه استان‌ها", icon: <GitCompare className="h-4 w-4" /> },
    ],
  },
];

export function KeyboardHelp({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[480px]">
        <DialogHeader className="border-b border-border/60 bg-muted/30 px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold">
            <Keyboard className="h-4 w-4 text-primary" />
            میان‌برهای صفحه‌کلید
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto scroll-thin p-4">
          {SHORTCUTS.map((sec) => (
            <div key={sec.group} className="mb-5 last:mb-0">
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {sec.group}
              </h3>
              <ul className="space-y-1.5">
                {sec.items.map((it) => (
                  <li
                    key={it.desc}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {it.icon && <span className="text-muted-foreground">{it.icon}</span>}
                      <span className="text-sm">{it.desc}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {it.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-mono font-bold text-foreground shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            میان‌برها در فیلدهای ورودی غیرفعال هستند.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
