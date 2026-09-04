"use client";

import * as React from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toPersianDigits } from "@/lib/iran-data";

interface ShareButtonProps {
  selectedProvince: string | null;
}

export function ShareButton({ selectedProvince }: ShareButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const buildUrl = () => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.hash = selectedProvince ? `province=${selectedProvince}` : "";
    return url.toString();
  };

  const shareUrl = buildUrl();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select input
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ایران‌مانیتور",
          text: selectedProvince ? `وضعیت استان در ایران‌مانیتور` : "داشبورد بلادرنگ پایش ایران",
          url: shareUrl,
        });
      } catch {}
    } else {
      copy();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={() => setOpen(true)}
        title="اشتراک‌گذاری"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">اشتراک</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-[480px]">
          <DialogHeader className="border-b border-border/60 bg-muted/30 px-4 py-3">
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <Share2 className="h-4 w-4 text-primary" />
              اشتراک‌گذاری این نما
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 p-4">
            <p className="text-xs text-muted-foreground">
              {selectedProvince
                ? `این لینک، نقشه ایران را روی استان انتخاب‌شده متمرکز می‌کند. هر کسی این لینک را باز کند، همان استان را می‌بیند.`
                : `این لینک، داشبورد ایران‌مانیتور را به‌اشتراک می‌گذارد.`}
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  readOnly
                  value={shareUrl}
                  className="h-9 pr-8 text-xs"
                  onFocus={(e) => e.currentTarget.select()}
                />
              </div>
              <Button size="sm" className="h-9 gap-1.5" onClick={copy}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : null}
                {copied ? "کپی شد" : "کپی"}
              </Button>
            </div>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button variant="outline" className="w-full gap-1.5" onClick={nativeShare}>
                <Share2 className="h-4 w-4" />
                اشتراک‌گذاری با اپلیکیشن دیگر
              </Button>
            )}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center text-[10px] text-muted-foreground">
              <span className="font-medium">اطلاعیه:</span> لینک شامل وضعیت فعلی ({toPersianDigits(selectedProvince ? "۱ استان انتخاب‌شده" : "نمای کلی")}) است
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
