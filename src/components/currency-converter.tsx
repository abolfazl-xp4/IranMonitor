"use client";

import * as React from "react";
import { ArrowLeftRight, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits } from "@/lib/iran-data";
import { tomanFa } from "@/lib/format";

// Conversion units: each currency's "to-toman" multiplier.
// IRR (Toman) = 1; others = sell price (rial) / 10 (toman per unit)
function getToTomanMap(currencies: any[]): Record<string, number> {
  const map: Record<string, number> = { IRR: 1 };
  currencies.forEach((c) => {
    map[c.code] = c.sell / 10; // rial -> toman
  });
  return map;
}

function fmt(n: number): string {
  // large numbers in grouped form, Persian digits
  if (!isFinite(n)) return "—";
  const s = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
  return toPersianDigits(s);
}

const LABELS: Record<string, string> = {
  IRR: "تومان",
  USD: "دلار آمریکا",
  EUR: "یورو",
  AED: "درهم امارات",
  GBP: "پوند انگلیس",
  TRY: "لیر ترکیه",
  CNY: "یوآن چین",
  RUB: "روبل روسیه",
  CAD: "دلار کانادا",
  AUD: "دلار استرالیا",
  JPY: "ین ژاپن",
  SAR: "ریال عربستان",
  INR: "روپیه هند",
};

const FLAGS: Record<string, string> = {
  IRR: "🇮🇷",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  AED: "🇦🇪",
  GBP: "🇬🇧",
  TRY: "🇹🇷",
  CNY: "🇨🇳",
  RUB: "🇷🇺",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  JPY: "🇯🇵",
  SAR: "🇸🇦",
  INR: "🇮🇳",
};

export function CurrencyConverter() {
  const { data } = useApi<any>("/api/currency", 90000);
  const currencies = data?.currencies || [];
  const toToman = React.useMemo(() => getToTomanMap(currencies), [currencies]);
  const codes = React.useMemo(() => Object.keys(toToman).sort(), [toToman]);

  const [amount, setAmount] = React.useState<string>("1");
  const [from, setFrom] = React.useState<string>("USD");
  const [to, setTo] = React.useState<string>("IRR");

  const amountNum = parseFloat(amount.replace(/,/g, "")) || 0;
  const fromRate = toToman[from] || 0;
  const toRate = toToman[to] || 0;
  const inToman = amountNum * fromRate;
  const result = toRate > 0 ? inToman / toRate : 0;
  const rateInfo = fromRate > 0 && toRate > 0 ? fromRate / toRate : 0;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
          <Calculator className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-bold">ماشین‌حساب تبدیل ارز</h2>
      </div>
      <div className="space-y-3 p-4">
        {/* Amount input */}
        <div>
          <label className="mb-1 block text-[11px] font-medium text-muted-foreground">مبلغ</label>
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
              placeholder="۰"
              className="h-10 text-left text-base font-mono font-bold tabular-nums"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {FLAGS[from] || ""}
            </span>
          </div>
        </div>

        {/* From / To selectors with swap button */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">از</label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {codes.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    <span className="me-1.5">{FLAGS[c] || "🌐"}</span>
                    {LABELS[c] || c} <span className="text-muted-foreground">({c})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={swap}
            className="mb-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-all hover:rotate-180 hover:bg-muted hover:text-primary"
            title="جابجایی"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">به</label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {codes.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    <span className="me-1.5">{FLAGS[c] || "🌐"}</span>
                    {LABELS[c] || c} <span className="text-muted-foreground">({c})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result */}
        <div className="rounded-xl bg-gradient-to-l from-primary/10 to-transparent p-3">
          <p className="text-[11px] text-muted-foreground">نتیجه تبدیل</p>
          <p className="mt-0.5 font-mono text-2xl font-extrabold tabular-nums text-primary">
            {fmt(result)} <span className="text-sm font-normal text-muted-foreground">{LABELS[to] || to}</span>
          </p>
          {from !== to && rateInfo > 0 && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              ۱ {from} = {fmt(rateInfo)} {to}
            </p>
          )}
        </div>

        {/* quick presets */}
        <div className="flex flex-wrap gap-1.5">
          {["1", "10", "100", "1000"].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="rounded-md border border-border/60 bg-card/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {toPersianDigits(v)}
            </button>
          ))}
          <span className="ms-auto self-center text-[10px] text-muted-foreground">
            نرخ فروش لحظه‌ای
          </span>
        </div>
      </div>
    </Card>
  );
}
