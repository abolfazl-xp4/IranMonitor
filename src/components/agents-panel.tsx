"use client";

import * as React from "react";
import { Bot, RefreshCw, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { toPersianDigits } from "@/lib/iran-data";

interface AgentInsight {
  agent: string;
  role: string;
  icon: string;
  color: string;
  insight: string;
  recommendation: string;
  sentiment?: number;
  sentiment_label?: string;
  risk_level?: string;
  timestamp?: number;
  error?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-500/20" },
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20" },
};

export function AgentsPanel() {
  const { data, loading, error, refresh } = useApi<any>("/api/python-agents", 0);
  const agents: AgentInsight[] = data?.agents || [];

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground ring-1 ring-primary/20">
            <Bot className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold">ایجنت‌های هوش مصنوعی</h2>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
            Python
          </span>
          {agents.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {toPersianDigits(agents.length)} ایجنت فعال
            </span>
          )}
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={refresh} title="بازخوانی">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            ایجنت‌ها در حال تحلیل داده‌ها...
          </div>
        ) : error || agents.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 bg-card/40 px-3 py-6 text-center text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            سرویس پایتون در دسترس نیست. مطمئن شوید mini-service روی پورت 8000 اجرا می‌شود.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {agents.map((a, i) => {
              const c = COLOR_MAP[a.color] || COLOR_MAP.primary;
              return (
                <div
                  key={i}
                  className={`fade-up relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-3`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-lg ${c.bg}`}>
                      {a.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{a.agent}</p>
                      {a.sentiment_label && (
                        <span className={`text-[10px] font-medium ${c.text}`}>
                          احساس بازار: {a.sentiment_label} ({toPersianDigits(a.sentiment || 0)})
                        </span>
                      )}
                      {a.risk_level && (
                        <span className={`text-[10px] font-medium ${c.text}`}>
                          سطح ریسک: {a.risk_level}
                        </span>
                      )}
                    </div>
                  </div>
                  {a.error ? (
                    <p className="mt-2 text-[11px] text-rose-500">{a.error}</p>
                  ) : (
                    <>
                      <pre className="mt-2 whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-foreground/80">
{a.insight}
                      </pre>
                      <div className={`mt-2 flex items-start gap-1.5 rounded-lg ${c.bg} px-2 py-1.5`}>
                        <Sparkles className={`mt-0.5 h-3 w-3 shrink-0 ${c.text}`} />
                        <p className={`text-[11px] leading-snug ${c.text}`}>{a.recommendation}</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
