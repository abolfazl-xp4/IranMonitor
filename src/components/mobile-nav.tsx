"use client";

import * as React from "react";
import { LayoutGrid, Map, Mountain, Cloud, Coins, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ITEMS: NavItem[] = [
  { id: "stats", label: "خلاصه", icon: <LayoutGrid className="h-5 w-5" /> },
  { id: "map", label: "نقشه", icon: <Map className="h-5 w-5" /> },
  { id: "earthquakes", label: "زلزله", icon: <Mountain className="h-5 w-5" /> },
  { id: "weather", label: "هوا", icon: <Cloud className="h-5 w-5" /> },
  { id: "currency", label: "ارز", icon: <Coins className="h-5 w-5" /> },
  { id: "news", label: "اخبار", icon: <Newspaper className="h-5 w-5" /> },
];

export function MobileNav() {
  const [active, setActive] = React.useState<string>("stats");

  // Track active section via IntersectionObserver
  React.useEffect(() => {
    const sections = ITEMS.map((it) => document.getElementById(`section-${it.id}`)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = visible.target.id.replace("section-", "");
          setActive(id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 glass pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="ناوبری سریع موبایل"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {ITEMS.map((it) => {
          const isActive = active === it.id;
          return (
            <li key={it.id} className="flex-1">
              <button
                onClick={() => go(it.id)}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={cn("relative grid h-7 w-7 place-items-center transition-transform", isActive && "scale-110")}>
                  {it.icon}
                  {isActive && (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
                  )}
                </span>
                <span className="text-[10px] font-medium">{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
