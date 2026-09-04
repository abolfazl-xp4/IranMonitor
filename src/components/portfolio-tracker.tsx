"use client";

import * as React from "react";
import { Wallet, Plus, X, TrendingUp, TrendingDown, Trash2, PiggyBank } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits, formatFa } from "@/lib/iran-data";
import { tomanFa, usdFa } from "@/lib/format";

interface Holding {
  id: string;
  type: "currency" | "coin" | "crypto";
  code: string; // currency code, coin code, or crypto id
  label: string;
  amount: number;
  buyPriceToman: number; // price per unit at purchase (toman)
  createdAt: number;
}

const STORAGE_KEY = "iranmonitor:portfolio";

// All investable assets with their live toman price getter
function useAssets() {
  const { data: cur } = useApi<any>("/api/currency", 90000);
  const { data: crypto } = useApi<any>("/api/crypto", 90000);

  const getLivePriceToman = React.useCallback((type: string, code: string): number => {
    if (type === "currency") {
      const c = cur?.currencies?.find((x: any) => x.code === code);
      return c ? c.sell / 10 : 0; // rial -> toman
    }
    if (type === "coin") {
      const c = cur?.coins?.find((x: any) => x.code === code);
      return c ? c.sell : 0; // already toman
    }
    if (type === "crypto") {
      const c = crypto?.coins?.find((x: any) => x.id === code);
      return c ? c.priceToman : 0;
    }
    return 0;
  }, [cur, crypto]);

  // Build selectable asset list
  const assets = React.useMemo(() => {
    const list: { type: "currency" | "coin" | "crypto"; code: string; label: string; price: number }[] = [];
    (cur?.currencies || []).forEach((c: any) => {
      list.push({ type: "currency", code: c.code, label: `${c.icon} ${c.nameFa}`, price: c.sell / 10 });
    });
    (cur?.coins || []).forEach((c: any) => {
      list.push({ type: "coin", code: c.code, label: `🥇 ${c.nameFa}`, price: c.sell });
    });
    (crypto?.coins || []).forEach((c: any) => {
      list.push({ type: "crypto", code: c.id, label: `${c.symbol}`, price: c.priceToman });
    });
    return list;
  }, [cur, crypto]);

  return { getLivePriceToman, assets };
}

export function PortfolioTracker() {
  const { getLivePriceToman, assets } = useAssets();
  const [holdings, setHoldings] = React.useState<Holding[]>([]);
  const [assetKey, setAssetKey] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [buyPrice, setBuyPrice] = React.useState<string>("");

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHoldings(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: Holding[]) => {
    setHoldings(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const addHolding = () => {
    const amt = parseFloat(amount.replace(/,/g, ""));
    const bp = parseFloat(buyPrice.replace(/,/g, ""));
    if (!amt || !bp || !assetKey) return;
    const [type, code] = assetKey.split("|");
    const asset = assets.find((a) => a.type === type && a.code === code);
    if (!asset) return;
    const h: Holding = {
      id: `${assetKey}-${Date.now()}`,
      type: type as any,
      code,
      label: asset.label,
      amount: amt,
      buyPriceToman: Math.round(bp),
      createdAt: Date.now(),
    };
    persist([h, ...holdings].slice(0, 20));
    setAmount("");
    setBuyPrice("");
    setAssetKey("");
  };

  const removeHolding = (id: string) => persist(holdings.filter((h) => h.id !== id));

  // Calculate P&L
  const computed = holdings.map((h) => {
    const livePrice = getLivePriceToman(h.type, h.code);
    const cost = h.buyPriceToman * h.amount;
    const value = livePrice * h.amount;
    const pnl = value - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    return { ...h, livePrice, cost, value, pnl, pnlPct };
  });
  const totalCost = computed.reduce((s, h) => s + h.cost, 0);
  const totalValue = computed.reduce((s, h) => s + h.value, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const isUp = totalPnl >= 0;

  const selectedAsset = assets.find((a) => `${a.type}|${a.code}` === assetKey);

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
            <Wallet className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold">سبد دارایی شخصی</h2>
          {holdings.length > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {toPersianDigits(holdings.length)}
            </span>
          )}
        </div>
      </div>

      {holdings.length > 0 && (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 ${isUp ? "bg-emerald-500/5" : "bg-rose-500/5"}`}>
          <div>
            <p className="text-[11px] text-muted-foreground">ارزش فعلی سبد</p>
            <p className="font-mono text-lg font-extrabold tabular-nums">{tomanFa(totalValue)} <span className="text-xs text-muted-foreground">تومان</span></p>
          </div>
          <div className="text-left">
            <p className="text-[11px] text-muted-foreground">سود/زیان</p>
            <p className={`flex items-center gap-1 font-mono text-lg font-extrabold tabular-nums ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
              {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isUp ? "+" : ""}{tomanFa(Math.abs(totalPnl))}
            </p>
            <p className={`text-[10px] ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
              {isUp ? "+" : ""}{toPersianDigits(totalPnlPct.toFixed(2))}٪
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 p-4">
        {/* Add form */}
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <Select value={assetKey} onValueChange={(v) => { setAssetKey(v); const a = assets.find(x => `${x.type}|${x.code}` === v); if (a) setBuyPrice(String(Math.round(a.price))); }}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="انتخاب دارایی" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((a) => (
                <SelectItem key={`${a.type}|${a.code}`} value={`${a.type}|${a.code}`} className="text-xs">
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="مقدار"
            className="h-9 text-left font-mono text-xs tabular-nums"
          />
          <Input
            type="text"
            inputMode="numeric"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="قیمت خرید (ت)"
            className="h-9 text-left font-mono text-xs tabular-nums"
          />
          <Button size="sm" className="h-9 gap-1 px-2.5" onClick={addHolding} disabled={!amount || !buyPrice || !assetKey}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {selectedAsset && (
          <p className="text-[10px] text-muted-foreground">
            قیمت فعلی: {tomanFa(selectedAsset.price)} تومان
          </p>
        )}

        {/* Holdings list */}
        {holdings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-card/40 px-3 py-6 text-center text-xs text-muted-foreground">
            <PiggyBank className="mx-auto mb-1.5 h-6 w-6 opacity-40" />
            هنوز دارایی‌ای اضافه نشده. دارایی، مقدار و قیمت خرید را وارد کنید تا سود/زیان لحظه‌ای محاسبه شود.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {computed.map((h) => {
              const up = h.pnl >= 0;
              return (
                <li
                  key={h.id}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{h.label}</p>
                    <p className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {toPersianDigits(h.amount)} × {tomanFa(h.buyPriceToman)} → {tomanFa(h.livePrice)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-mono text-xs font-bold tabular-nums">{tomanFa(h.value)}</p>
                    <p className={`flex items-center justify-end gap-0.5 font-mono text-[10px] tabular-nums ${up ? "text-emerald-500" : "text-rose-500"}`}>
                      {up ? "+" : ""}{toPersianDigits(h.pnlPct.toFixed(1))}٪
                    </p>
                  </div>
                  <button
                    onClick={() => removeHolding(h.id)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                    title="حذف"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
