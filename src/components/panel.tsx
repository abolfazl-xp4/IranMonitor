"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveBadge } from "@/components/header";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  icon?: React.ReactNode;
  updatedAt?: number | null;
  nextRefreshIn?: number;
  onRefresh?: () => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  collapsible?: boolean;
  storageKey?: string;
}

export function Panel({
  title,
  icon,
  updatedAt,
  nextRefreshIn,
  loading,
  error,
  className,
  children,
  action,
  collapsible = false,
  storageKey,
}: PanelProps) {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const v = localStorage.getItem(`panel:${storageKey}`);
      if (v !== null) setCollapsed(v === "1");
    } catch {}
  }, [storageKey]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (storageKey) {
      try { localStorage.setItem(`panel:${storageKey}`, next ? "1" : "0"); } catch {}
    }
  };

  return (
    <Card className={cn("flex h-full flex-col overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/60 bg-muted/30 py-3">
        <div
          className={cn("flex min-w-0 items-center gap-2", collapsible && "cursor-pointer select-none")}
          onClick={collapsible ? toggle : undefined}
          role={collapsible ? "button" : undefined}
          aria-expanded={collapsible ? !collapsed : undefined}
        >
          {collapsible && (
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", collapsed && "-rotate-90")} />
          )}
          {icon && (
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
              {icon}
            </span>
          )}
          <CardTitle className="truncate text-sm font-bold">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {action}
          {!collapsed && <LiveBadge updatedAt={updatedAt ?? null} nextRefreshIn={nextRefreshIn} />}
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="flex-1 overflow-hidden p-0">
          {error ? (
            <div className="p-4 text-sm text-rose-500">خطا: {error}</div>
          ) : loading ? (
            <div className="space-y-2 p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted/60" />
                </div>
              </div>
              <div className="h-12 animate-pulse rounded-lg bg-muted/60" />
              <div className="h-12 animate-pulse rounded-lg bg-muted/40" />
              <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-muted-foreground">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                در حال دریافت داده...
              </div>
            </div>
          ) : (
            children
          )}
        </CardContent>
      )}
    </Card>
  );
}
