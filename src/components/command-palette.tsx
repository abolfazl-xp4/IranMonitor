"use client";

import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Search, Mountain, Cloud, Coins, Newspaper, Activity } from "lucide-react";
import { PROVINCES } from "@/lib/iran-data";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelectProvince: (id: string) => void;
  onScrollTo: (id: string) => void;
}

export function CommandPalette({ open, onOpenChange, onSelectProvince, onScrollTo }: CommandPaletteProps) {
  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[520px]">
        <DialogTitle className="sr-only">جستجوی فرمان</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
          <div className="flex items-center border-b border-border/60 px-3">
            <Search className="ms-2 me-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandInput placeholder="جستجوی استان یا عملیات..." />
          </div>
          <CommandList className="max-h-[380px] scroll-thin">
            <CommandEmpty>نتیجه‌ای یافت نشد</CommandEmpty>

            <CommandGroup heading="عملیات سریع">
              <CommandItem onSelect={() => run(() => onScrollTo("map"))} className="gap-2">
                <MapPin className="text-primary" />
                <span>رفتن به نقشه ایران</span>
              </CommandItem>
              <CommandItem onSelect={() => run(() => onScrollTo("earthquakes"))} className="gap-2">
                <Mountain className="text-rose-500" />
                <span>رفتن به پنل زلزله</span>
              </CommandItem>
              <CommandItem onSelect={() => run(() => onScrollTo("weather"))} className="gap-2">
                <Cloud className="text-cyan-500" />
                <span>رفتن به آب‌وهوا</span>
              </CommandItem>
              <CommandItem onSelect={() => run(() => onScrollTo("currency"))} className="gap-2">
                <Coins className="text-emerald-500" />
                <span>رفتن به نرخ ارز</span>
              </CommandItem>
              <CommandItem onSelect={() => run(() => onScrollTo("news"))} className="gap-2">
                <Newspaper className="text-amber-500" />
                <span>رفتن به اخبار</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="استان‌ها">
              {PROVINCES.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.nameFa} ${p.nameEn} ${p.capitalFa}`}
                  onSelect={() => run(() => { onSelectProvince(p.id); onScrollTo("map"); })}
                  className="gap-2"
                >
                  <Activity className="text-primary" />
                  <div className="flex flex-1 items-center justify-between">
                    <span>{p.nameFa}</span>
                    <span className="text-[10px] text-muted-foreground">مرکز: {p.capitalFa}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
