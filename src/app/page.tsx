"use client";

import * as React from "react";
import { Header } from "@/components/header";
import { Ticker } from "@/components/ticker";
import { StatsOverview } from "@/components/stats-overview";
import { MapSection } from "@/components/map-section";
import { ProvinceDetail } from "@/components/province-detail";
import { EarthquakePanel } from "@/components/earthquake-panel";
import { WeatherPanel } from "@/components/weather-panel";
import { AirQualityPanel } from "@/components/airquality-panel";
import { CurrencyPanel } from "@/components/currency-panel";
import { CryptoPanel } from "@/components/crypto-panel";
import { CommoditiesPanel } from "@/components/commodities-panel";
import { NewsPanel } from "@/components/news-panel";
import { CommandPalette } from "@/components/command-palette";
import { MobileNav } from "@/components/mobile-nav";
import { ProvinceComparison } from "@/components/province-comparison";
import { EarthquakeAlert } from "@/components/earthquake-alert";
import { KeyboardHelp } from "@/components/keyboard-help";
import { CurrencyConverter } from "@/components/currency-converter";
import { NewsSummary } from "@/components/news-summary";
import { PriceAlerts } from "@/components/price-alerts";
import { PortfolioTracker } from "@/components/portfolio-tracker";
import { FavoriteProvinces } from "@/components/favorite-provinces";
import { BackToTop } from "@/components/back-to-top";
import { EconomicCalendar } from "@/components/economic-calendar";
import { MarketInsights } from "@/components/market-insights";
import { FearGreedIndex } from "@/components/fear-greed";
import { SettingsPanel } from "@/components/settings-panel";
import { ShareButton } from "@/components/share-button";
import { ComparisonChart } from "@/components/comparison-chart";
import { TravelComparison } from "@/components/travel-comparison";
import { ChatAssistant } from "@/components/chat-assistant";
import { ForecastStrip } from "@/components/forecast-strip";
import { SortableGrid, SortableItem } from "@/components/sortable-grid";
import { SectionNav } from "@/components/section-nav";
import { AgentsPanel } from "@/components/agents-panel";
import { NavMenu, type PageId } from "@/components/nav-menu";
import { LoginPage } from "@/components/login-page";
import { AboutPage } from "@/components/about-page";
import { Radio, Heart, Command as CommandIcon, MousePointerClick, GitCompare, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const DATA_PANELS_1_DEFAULT = ["weather", "airquality", "currency"];
const DATA_PANELS_2_DEFAULT = ["crypto", "commodities", "news"];
const ORDER_KEY_1 = "iranmonitor:order-panels-1";
const ORDER_KEY_2 = "iranmonitor:order-panels-2";

export default function Home() {
  const [currentPage, setCurrentPage] = React.useState<PageId>("home");
  const [selectedProvince, setSelectedProvince] = React.useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [compareOpen, setCompareOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [order1, setOrder1] = React.useState<string[]>(DATA_PANELS_1_DEFAULT);
  const [order2, setOrder2] = React.useState<string[]>(DATA_PANELS_2_DEFAULT);

  React.useEffect(() => {
    try {
      const o1 = localStorage.getItem(ORDER_KEY_1);
      if (o1) { const p = JSON.parse(o1); if (Array.isArray(p)) setOrder1(p); }
      const o2 = localStorage.getItem(ORDER_KEY_2);
      if (o2) { const p = JSON.parse(o2); if (Array.isArray(p)) setOrder2(p); }
    } catch {}
  }, []);

  const persistOrder = (which: 1 | 2, next: string[]) => {
    if (which === 1) { setOrder1(next); try { localStorage.setItem(ORDER_KEY_1, JSON.stringify(next)); } catch {} }
    else { setOrder2(next); try { localStorage.setItem(ORDER_KEY_2, JSON.stringify(next)); } catch {} }
  };

  const scrollTo = React.useCallback((id: string) => {
    setCurrentPage("home");
    setTimeout(() => {
      const el = document.getElementById(`section-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  // Hash routing
  React.useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash;
      const m = hash.match(/province=([^&]+)/);
      if (m) { setSelectedProvince(decodeURIComponent(m[1])); setTimeout(() => scrollTo("map"), 300); }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [scrollTo]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(v => !v); }
      else if (e.key === "?" && !inField) { e.preventDefault(); setHelpOpen(v => !v); }
      else if (e.key === "Escape") { setHelpOpen(false); }
      else if (!inField && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "m") scrollTo("map");
        else if (key === "e") scrollTo("earthquakes");
        else if (key === "w") scrollTo("weather");
        else if (key === "n") scrollTo("news");
        else if (key === "h") setCurrentPage("home");
        else if (key === "c" && e.shiftKey) { e.preventDefault(); setCompareOpen(true); }
        else if (key === "t") document.querySelector<HTMLButtonElement>('[title="تغییر تم"]')?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollTo]);

  const navigate = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onRefresh={() => { if (typeof window !== "undefined") window.location.reload(); }}>
        <NavMenu currentPage={currentPage} onNavigate={navigate} />
      </Header>
      <Ticker />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-4 px-3 py-4 pb-20 sm:px-4 md:pb-4">
        {currentPage === "home" && (
          <>
            <EarthquakeAlert onJump={() => scrollTo("earthquakes")} />

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <NewsSummary />
                <MarketInsights />
              </div>
              <FearGreedIndex />
            </section>

            <AgentsPanel />
            <section id="section-stats"><StatsOverview /></section>

            <section id="section-map" className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
              <MapSection selected={selectedProvince} onSelect={setSelectedProvince} />
              <div className="space-y-4">
                <FavoriteProvinces onSelect={setSelectedProvince} selected={selectedProvince} />
                {selectedProvince ? (
                  <ProvinceDetail provinceId={selectedProvince} onClose={() => setSelectedProvince(null)} />
                ) : (
                  <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-muted/20 p-5 text-center">
                    <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary shadow-lg shadow-primary/20">
                      <MousePointerClick className="h-7 w-7" />
                    </div>
                    <p className="font-bold text-sm">اخبار لحظه‌ای هر استان</p>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      روی هر استان در نقشه کلیک کنید تا اخبار لحظه‌ای از خبرگزاری‌های معتبر، آب‌وهوا، کیفیت هوا و زلزله‌های نزدیک آن استان را ببینید.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setPaletteOpen(true)}>
                        <CommandIcon className="h-3.5 w-3.5" /> جستجوی استان (Ctrl+K)
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-1.5 text-xs" onClick={() => setCompareOpen(true)}>
                        <GitCompare className="h-3.5 w-3.5" /> مقایسه استان‌ها
                      </Button>
                    </div>
                  </div>
                )}
                <div id="section-earthquakes"><EarthquakePanel /></div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <CurrencyConverter />
              <PriceAlerts />
              <PortfolioTracker />
            </section>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ComparisonChart />
              <TravelComparison />
            </section>
            <section className="grid grid-cols-1 gap-4">
              <EconomicCalendar />
            </section>

            <SortableGrid ids={order1} onReorder={(n) => persistOrder(1, n)} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {order1.map((id) => (
                <SortableItem key={id} id={id}>
                  {id === "weather" && <div id="section-weather"><WeatherPanel /></div>}
                  {id === "airquality" && <div id="section-airquality"><AirQualityPanel /></div>}
                  {id === "currency" && <div id="section-currency"><CurrencyPanel /></div>}
                </SortableItem>
              ))}
            </SortableGrid>
            <ForecastStrip />
            <SortableGrid ids={order2} onReorder={(n) => persistOrder(2, n)} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {order2.map((id) => (
                <SortableItem key={id} id={id}>
                  {id === "crypto" && <div id="section-crypto"><CryptoPanel /></div>}
                  {id === "commodities" && <div id="section-commodities"><CommoditiesPanel /></div>}
                  {id === "news" && <div id="section-news"><NewsPanel /></div>}
                </SortableItem>
              ))}
            </SortableGrid>
          </>
        )}

        {currentPage === "market" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4"><MarketInsights /></div>
              <FearGreedIndex />
            </div>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <CurrencyConverter />
              <PriceAlerts />
              <PortfolioTracker />
            </section>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ComparisonChart />
              <TravelComparison />
            </section>
            <EconomicCalendar />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div id="section-currency"><CurrencyPanel /></div>
              <div id="section-crypto"><CryptoPanel /></div>
            </div>
            <CommoditiesPanel />
          </div>
        )}

        {currentPage === "earthquakes" && (
          <div className="space-y-4">
            <EarthquakeAlert onJump={() => scrollTo("earthquakes")} />
            <section id="section-map" className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
              <MapSection selected={selectedProvince} onSelect={setSelectedProvince} />
              <div className="space-y-4">
                <FavoriteProvinces onSelect={setSelectedProvince} selected={selectedProvince} />
                {selectedProvince ? (
                  <ProvinceDetail provinceId={selectedProvince} onClose={() => setSelectedProvince(null)} />
                ) : (
                  <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-muted/20 p-5 text-center">
                    <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary shadow-lg shadow-primary/20">
                      <MousePointerClick className="h-7 w-7" />
                    </div>
                    <p className="font-bold text-sm">پایش زلزله استان‌ها</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">روی هر استان کلیک کنید تا زلزله‌های نزدیک آن را ببینید.</p>
                  </div>
                )}
                <div id="section-earthquakes"><EarthquakePanel /></div>
              </div>
            </section>
          </div>
        )}

        {currentPage === "weather" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div id="section-weather"><WeatherPanel /></div>
              <div id="section-airquality"><AirQualityPanel /></div>
            </div>
            <ForecastStrip />
          </div>
        )}

        {currentPage === "news" && (
          <div className="space-y-4">
            <NewsSummary />
            <div id="section-news"><NewsPanel /></div>
            <section id="section-map" className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
              <MapSection selected={selectedProvince} onSelect={setSelectedProvince} />
              <div className="space-y-4">
                {selectedProvince ? (
                  <ProvinceDetail provinceId={selectedProvince} onClose={() => setSelectedProvince(null)} />
                ) : (
                  <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-muted/20 p-5 text-center">
                    <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary shadow-lg shadow-primary/20">
                      <MousePointerClick className="h-7 w-7" />
                    </div>
                    <p className="font-bold text-sm">اخبار لحظه‌ای هر استان</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">روی هر استان در نقشه کلیک کنید تا اخبار لحظه‌ای از خبرگزاری‌های معتبر را ببینید.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {currentPage === "agents" && (
          <div className="space-y-4">
            <AgentsPanel />
          </div>
        )}

        {currentPage === "about" && <AboutPage />}

        {currentPage === "login" && <LoginPage />}
      </main>

      <footer className="mt-auto border-t border-border/60 bg-card/40">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <span><b className="text-foreground">ایران‌مانیتور</b> — پایش بلادرنگ ایران</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setPaletteOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-2 py-1 transition-colors hover:bg-muted">
              <CommandIcon className="h-3 w-3" /><span>جستجو</span><kbd className="rounded bg-muted px-1 py-0.5 text-[9px] font-mono">Ctrl K</kbd>
            </button>
            <button onClick={() => setCompareOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-2 py-1 transition-colors hover:bg-muted">
              <GitCompare className="h-3 w-3 text-primary" /><span>مقایسه استان‌ها</span>
            </button>
            <button onClick={() => setHelpOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-2 py-1 transition-colors hover:bg-muted">
              <Keyboard className="h-3 w-3" /><span>میان‌برها</span><kbd className="rounded bg-muted px-1 py-0.5 text-[9px] font-mono">?</kbd>
            </button>
            {currentPage === "home" && <ShareButton selectedProvince={selectedProvince} />}
            <SettingsPanel />
            <span className="inline-flex items-center gap-1">ساخته‌شده با <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> برای ایران</span>
          </div>
        </div>
      </footer>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onSelectProvince={setSelectedProvince} onScrollTo={scrollTo} />
      <ProvinceComparison open={compareOpen} onOpenChange={setCompareOpen} initial={selectedProvince ? [selectedProvince] : []} />
      <KeyboardHelp open={helpOpen} onOpenChange={setHelpOpen} />
      {currentPage === "home" && <BackToTop />}
      <ChatAssistant />
      {currentPage === "home" && <SectionNav />}
      {currentPage === "home" && <MobileNav />}
    </div>
  );
}
