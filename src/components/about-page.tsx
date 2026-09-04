"use client";

import * as React from "react";
import { Radio, Database, Globe, Users, Mail, Github, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toPersianDigits, IRAN_TOTAL_POPULATION, IRAN_AREA_KM2 } from "@/lib/iran-data";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 py-4">
      <Card className="overflow-hidden shadow-lg">
        <div className="bg-gradient-to-l from-primary/20 via-primary/5 to-transparent px-6 py-6 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
            <Radio className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold">
            ایران‌<span className="text-gradient">مانیتور</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">داشبورد بلادرنگ پایش ایران — زلزله، آب‌وهوا، ارز، اخبار و هوش مصنوعی</p>
        </div>

        <div className="space-y-4 p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed text-foreground/80">
              ایران‌مانیتور یک پلتفرم جامع پایش لحظه‌ای ایران است که داده‌های زلزله، آب‌وهوا،
              کیفیت هوا، نرخ ارز، ارزهای دیجیتال، کالاهای جهانی و اخبار را از منابع معتبر
              گردآوری و به‌صورت بصری نمایش می‌دهد. این داشبورد با استفاده از ایجنت‌های
              هوش مصنوعی، تحلیل و خلاصه‌سازی خودکار ارائه می‌دهد.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={<Globe className="h-5 w-5" />} label="استان" value={toPersianDigits(31)} />
            <Stat icon={<Users className="h-5 w-5" />} label="جمعیت" value={toPersianDigits(83) + " م"} />
            <Stat icon={<Database className="h-5 w-5" />} label="منبع داده" value={toPersianDigits(10) + "+"} />
            <Stat icon={<Radio className="h-5 w-5" />} label="ایجنت AI" value={toPersianDigits(4)} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold">منابع داده</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                "USGS (زلزله)",
                "wttr.in (آب‌وهوا)",
                "Open-Meteo (کیفیت هوا)",
                "CoinGecko (کریپتو)",
                "open.er-api (نرخ ارز)",
                "gold-api.com (طلا)",
                "خبرگزاری مهر (RSS)",
                "خبرگزاری ایسنا (RSS)",
                "z-ai (هوش مصنوعی)",
              ].map((src) => (
                <div key={src} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span>{src}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold">فناوری‌ها</h3>
            <div className="flex flex-wrap gap-2">
              {["Next.js 16", "TypeScript", "Tailwind CSS 4", "shadcn/ui", "FastAPI (Python)", "d3-geo", "Recharts", "@dnd-kit"].map((tech) => (
                <span key={tech} className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-1">
              ساخته‌شده با <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> برای ایران
            </p>
            <p className="mt-1 text-[10px]">© {toPersianDigits(1404)} ایران‌مانیتور — تمام حقوق محفوظ است</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-3 text-center">
      <div className="mx-auto mb-1 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <p className="text-lg font-extrabold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
