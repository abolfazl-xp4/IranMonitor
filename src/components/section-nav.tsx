"use client";

import * as React from "react";

const SECTIONS = [
  { id: "stats", label: "خلاصه" },
  { id: "map", label: "نقشه" },
  { id: "earthquakes", label: "زلزله" },
  { id: "weather", label: "آب‌وهوا" },
  { id: "currency", label: "ارز" },
  { id: "crypto", label: "کریپتو" },
  { id: "news", label: "اخبار" },
];

export function SectionNav() {
  const [active, setActive] = React.useState<string>("stats");

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = visible.target.id.replace("section-", "");
          setActive(id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) { obs.observe(el); observers.push(obs); }
    });
    return () => obs.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1.5 lg:flex"
      aria-label="ناوبری بخش‌ها"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            className="group flex items-center gap-2"
            title={s.label}
            aria-label={s.label}
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className={`whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary opacity-100"
                  : "bg-card/80 text-muted-foreground opacity-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full border transition-all ${
                isActive
                  ? "border-primary bg-primary shadow-sm"
                  : "border-muted-foreground/40 bg-card/60 group-hover:border-foreground"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
