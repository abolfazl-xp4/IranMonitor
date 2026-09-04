"use client";

import * as React from "react";
import { Menu, X, Home, Mountain, Cloud, TrendingUp, Newspaper, Bot, Info, LogIn, Radio, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/iran-data";

export type PageId = "home" | "earthquakes" | "weather" | "market" | "news" | "agents" | "about" | "login";

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "خانه", icon: <Home className="h-4 w-4" /> },
  { id: "market", label: "بازار", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "earthquakes", label: "زلزله", icon: <Mountain className="h-4 w-4" /> },
  { id: "weather", label: "آب‌وهوا", icon: <Cloud className="h-4 w-4" /> },
  { id: "news", label: "اخبار", icon: <Newspaper className="h-4 w-4" /> },
  { id: "agents", label: "ایجنت‌های هوش مصنوعی", icon: <Bot className="h-4 w-4" /> },
];

interface NavMenuProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function NavMenu({ currentPage, onNavigate }: NavMenuProps) {
  const [open, setOpen] = React.useState(false);

  const handleNavigate = (page: PageId) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <>
      {/* Hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 md:hidden"
        onClick={() => setOpen(v => !v)}
        title="منو"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              currentPage === item.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => handleNavigate("about")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            currentPage === "about"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Info className="h-4 w-4" />
          <span>درباره</span>
        </button>
        <button
          onClick={() => handleNavigate("login")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            currentPage === "login"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <LogIn className="h-4 w-4" />
          <span>ورود</span>
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-72 bg-card shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Radio className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm">ایران‌مانیتور</span>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    currentPage === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="my-1 border-t border-border/40" />
              <button
                onClick={() => handleNavigate("about")}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  currentPage === "about"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Info className="h-4 w-4" />
                <span>درباره ما</span>
              </button>
              <button
                onClick={() => handleNavigate("login")}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  currentPage === "login"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <LogIn className="h-4 w-4" />
                <span>ورود به سایت</span>
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
