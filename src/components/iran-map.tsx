"use client";

import * as React from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { toPersianDigits, PROVINCES } from "@/lib/iran-data";

export interface EqMarker {
  id: string;
  lat: number;
  lon: number;
  mag: number;
  place: string;
  time: number;
  depth: number;
}
export interface CityMarker {
  nameFa: string;
  nameEn: string;
  lat: number;
  lon: number;
  temp?: number;
  code?: number;
  aqi?: number;
  aqiColor?: string;
}

interface IranMapProps {
  earthquakes?: EqMarker[];
  cities?: CityMarker[];
  selectedProvince?: string | null;
  onSelectProvince?: (id: string | null) => void;
  layer: "earthquakes" | "weather" | "airquality" | "none";
  showLabels?: boolean;
  heatData?: Record<string, number> | null;
  heatColor?: (v: number) => string;
  height?: number;
}

const W = 760;
const H = 520;

function severityColor(mag: number): string {
  if (mag >= 6) return "#ef4444";
  if (mag >= 5) return "#f97316";
  if (mag >= 4) return "#eab308";
  return "#84cc16";
}
function severityRadius(mag: number): number {
  if (mag >= 6) return 9;
  if (mag >= 5) return 7;
  if (mag >= 4) return 5;
  return 3.5;
}

export function IranMap({
  earthquakes = [],
  cities = [],
  selectedProvince,
  onSelectProvince,
  layer,
  showLabels = false,
  heatData = null,
  heatColor,
  height = 520,
}: IranMapProps) {
  const [features, setFeatures] = React.useState<Feature<Geometry, any>[]>([]);
  const [hover, setHover] = React.useState<{ id: string; name: string; x: number; y: number } | null>(null);
  const [hoverMarker, setHoverMarker] = React.useState<{ text: string; x: number; y: number } | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const setZoomClamped = (z: number) => setZoom(clamp(z, 1, 4));
  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const zoomIn = () => setZoomClamped(zoom * 1.4);
  const zoomOut = () => setZoomClamped(zoom / 1.4);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setZoomClamped(zoom * factor);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    // don't start drag when clicking on a province
    if ((e.target as Element).tagName === "path" && (e.target as Element).classList.contains("province-path")) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    const dx = (e.clientX - dragStart.current.x) * (W / (svgRef.current?.clientWidth || W));
    const dy = (e.clientY - dragStart.current.y) * (H / (svgRef.current?.clientHeight || H));
    const maxPan = (zoom - 1) * 200;
    setPan({
      x: clamp(dragStart.current.px + dx, -maxPan, maxPan),
      y: clamp(dragStart.current.py + dy, -maxPan, maxPan),
    });
  };
  const endDrag = () => { setDragging(false); dragStart.current = null; };

  React.useEffect(() => {
    fetch("/iran-provinces.geojson")
      .then((r) => r.json())
      .then((fc: FeatureCollection) => setFeatures(fc.features as Feature<Geometry, any>[]))
      .catch(() => setFeatures([]));
  }, []);

  const projection = React.useMemo(() => {
    const p = geoMercator();
    if (features.length) {
      const fc: FeatureCollection = { type: "FeatureCollection", features };
      p.fitExtent(
        [
          [16, 16],
          [W - 16, H - 16],
        ],
        fc
      );
    }
    return p;
  }, [features]);

  const pathGen = React.useMemo(() => geoPath(projection), [projection]);

  // Zoom to selected province
  React.useEffect(() => {
    if (selectedProvince && features.length) {
      const f = features.find((x) => x.properties?.NAME_1 === selectedProvince);
      if (f) {
        const c = pathGen.centroid(f);
        if (c && !isNaN(c[0])) {
          setZoom(2.2);
          setPan({ x: (W / 2 - c[0]) * 1.2, y: (H / 2 - c[1]) * 1.2 });
        }
      }
    }
  }, [selectedProvince, features, pathGen]);

  const proj = (lat: number, lon: number): [number, number] | null => {
    const p = projection([lon, lat]);
    return p ? (p as [number, number]) : null;
  };

  const regionFill = (region: string) => {
    const map: Record<string, string> = {
      north: "color-mix(in oklch, var(--chart-1) 35%, var(--card))",
      south: "color-mix(in oklch, var(--chart-3) 35%, var(--card))",
      east: "color-mix(in oklch, var(--chart-2) 35%, var(--card))",
      west: "color-mix(in oklch, var(--chart-4) 38%, var(--card))",
      center: "color-mix(in oklch, var(--chart-5) 35%, var(--card))",
    };
    return map[region] || "color-mix(in oklch, var(--primary) 20%, var(--card))";
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <Card className="absolute inset-0 overflow-hidden grid-bg border-border/60">
        {/* Zoom controls */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-md"
            onClick={zoomIn}
            disabled={zoom >= 4}
            title="بزرگ‌نمایی"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-md"
            onClick={zoomOut}
            disabled={zoom <= 1}
            title="کوچک‌نمایی"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-md"
            onClick={reset}
            disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
            title="بازنشانی"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <div className="rounded-md border border-border/60 bg-card/80 px-1.5 py-0.5 text-center text-[9px] font-bold tabular-nums text-muted-foreground backdrop-blur">
            {toPersianDigits(Math.round(zoom * 100))}٪
          </div>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={`w-full h-full ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          preserveAspectRatio="xMidYMid meet"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
        >
          <defs>
            <radialGradient id="oceanGlow" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="color-mix(in oklch, var(--primary) 14%, transparent)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="eqGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--foreground)" floodOpacity="0.18" />
            </filter>
          </defs>

          <rect x="0" y="0" width={W} height={H} fill="url(#oceanGlow)" />

          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Provinces */}
          <g filter="url(#mapShadow)">
          {features.map((f) => {
            const d = pathGen(f) || "";
            const id = f.properties?.NAME_1 as string;
            const prov = PROVINCES.find((p) => p.id === id);
            const nameFa = prov?.nameFa || id;
            const region = prov?.region || "center";
            const isSelected = selectedProvince === id;
            const isHovered = hover?.id === id;
            const heatVal = heatData && heatData[id] !== undefined ? heatData[id] : null;
            const fill = isSelected
              ? "color-mix(in oklch, var(--primary) 55%, var(--card))"
              : (heatVal !== null && heatColor ? heatColor(heatVal) : regionFill(region));
            return (
              <g key={id}>
                <path
                  d={d}
                  className="province-path"
                  fill={fill}
                  stroke={isSelected
                    ? "var(--primary)"
                    : isHovered
                    ? "color-mix(in oklch, var(--primary) 60%, transparent)"
                    : "color-mix(in oklch, var(--foreground) 45%, transparent)"}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 1}
                  style={{
                    filter: isHovered ? "brightness(1.15)" : undefined,
                    transition: "filter 0.15s ease",
                  }}
                  onMouseEnter={() => {
                    const c = pathGen.centroid(f);
                    setHover({ id, name: nameFa, x: c[0], y: c[1] });
                  }}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onSelectProvince?.(selectedProvince === id ? null : id)}
                />
                {/* Selected province pulse marker */}
                {isSelected && (() => {
                  const c = pathGen.centroid(f);
                  if (!c || isNaN(c[0])) return null;
                  return (
                    <circle cx={c[0]} cy={c[1]} r={6} fill="var(--primary)" className="eq-pulse" />
                  );
                })()}
              </g>
            );
          })}
          </g>

          {/* Province labels (always visible, short names) */}
          {features.map((f) => {
            const id = f.properties?.NAME_1 as string;
            const prov = PROVINCES.find((p) => p.id === id);
            if (!prov) return null;
            const c = pathGen.centroid(f);
            if (!c || isNaN(c[0]) || isNaN(c[1])) return null;
            const short = prov.nameFa.split(" ")[0].slice(0, 8);
            const isSelected = selectedProvince === id;
            return (
              <text
                key={`lbl-${id}`}
                x={c[0]}
                y={c[1]}
                textAnchor="middle"
                dy={isSelected ? -12 : 3}
                fontSize={isSelected ? 10 : 8}
                fontWeight={isSelected ? 800 : 600}
                fill={isSelected ? "var(--primary)" : "var(--foreground)"}
                className="pointer-events-none select-none"
                style={{
                  paintOrder: "stroke",
                  stroke: "var(--background)",
                  strokeWidth: 3,
                  opacity: isSelected ? 1 : showLabels ? 0.9 : 0.5,
                }}
              >
                {short}
              </text>
            );
          })}

          {/* News hint badge on hovered province */}
          {hover && (() => {
            const prov = PROVINCES.find((p) => p.id === hover.id);
            if (!prov) return null;
            return (
              <g transform={`translate(${hover.x}, ${hover.y - 20})`} className="pointer-events-none">
                <rect x={-50} y={-14} width={100} height={20} rx={4} fill="var(--popover)" stroke="var(--primary)" strokeWidth={0.8} opacity={0.95} />
                <text x={0} y={-1} textAnchor="middle" fontSize={8} fill="var(--primary)" fontWeight={700}>
                  📰 کلیک: اخبار {prov.nameFa.split(" ")[0]}
                </text>
              </g>
            );
          })()}

          {/* City markers */}
          {layer === "weather" &&
            cities.map((c) => {
              const pt = proj(c.lat, c.lon);
              if (!pt) return null;
              return (
                <g key={`cw-${c.nameEn}`} transform={`translate(${pt[0]},${pt[1]})`}>
                  <circle r={11} fill="color-mix(in oklch, var(--primary) 85%, transparent)" stroke="var(--background)" strokeWidth={1.5} />
                  <text textAnchor="middle" dy={3.5} fontSize={9.5} fontWeight={700} fill="var(--primary-foreground)">
                    {c.temp !== undefined ? toPersianDigits(Math.round(c.temp)) : "–"}
                  </text>
                  <text
                    textAnchor="middle"
                    y={-16}
                    fontSize={9}
                    fill="var(--foreground)"
                    className="pointer-events-none"
                    style={{ paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 3 }}
                  >
                    {c.nameFa}
                  </text>
                  <rect
                    x={-9999}
                    y={-9999}
                    width={99999}
                    height={99999}
                    fill="transparent"
                    className="opacity-0"
                  />
                  <circle
                    r={13}
                    fill="transparent"
                    onMouseEnter={() => setHoverMarker({ text: `${c.nameFa} — ${c.temp !== undefined ? toPersianDigits(Math.round(c.temp)) + "°" : ""}`, x: pt[0], y: pt[1] })}
                    onMouseLeave={() => setHoverMarker(null)}
                  />
                </g>
              );
            })}

          {layer === "airquality" &&
            cities.map((c) => {
              const pt = proj(c.lat, c.lon);
              if (!pt) return null;
              const color =
                c.aqiColor === "emerald" ? "#10b981" :
                c.aqiColor === "green" ? "#22c55e" :
                c.aqiColor === "yellow" ? "#eab308" :
                c.aqiColor === "amber" ? "#f59e0b" :
                c.aqiColor === "orange" ? "#f97316" :
                c.aqiColor === "red" ? "#ef4444" : "#64748b";
              return (
                <g key={`ca-${c.nameEn}`} transform={`translate(${pt[0]},${pt[1]})`}>
                  <circle r={9} fill={color} stroke="var(--background)" strokeWidth={1.5} opacity={0.92} />
                  <text textAnchor="middle" dy={3} fontSize={8} fontWeight={700} fill="#0b0f0d">
                    {c.aqi !== undefined ? toPersianDigits(Math.round(c.aqi)) : "–"}
                  </text>
                  <text
                    textAnchor="middle"
                    y={-14}
                    fontSize={9}
                    fill="var(--foreground)"
                    className="pointer-events-none"
                    style={{ paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 3 }}
                  >
                    {c.nameFa}
                  </text>
                  <circle
                    r={11}
                    fill="transparent"
                    onMouseEnter={() => setHoverMarker({ text: `${c.nameFa} — شاخص هوا ${c.aqi !== undefined ? toPersianDigits(Math.round(c.aqi)) : "؟"}`, x: pt[0], y: pt[1] })}
                    onMouseLeave={() => setHoverMarker(null)}
                  />
                </g>
              );
            })}

          {/* Earthquake markers */}
          {layer === "earthquakes" &&
            earthquakes.slice(0, 60).map((eq) => {
              const pt = proj(eq.lat, eq.lon);
              if (!pt) return null;
              const r = severityRadius(eq.mag);
              const color = severityColor(eq.mag);
              const date = new Date(eq.time);
              return (
                <g key={eq.id} transform={`translate(${pt[0]},${pt[1]})`}>
                  {eq.mag >= 4 && <circle r={r} fill={color} opacity={0.35} className="eq-pulse" />}
                  <circle r={r} fill={color} stroke="var(--background)" strokeWidth={1} filter="url(#eqGlow)" />
                  <circle
                    r={r + 6}
                    fill="transparent"
                    onMouseEnter={() =>
                      setHoverMarker({
                        text: `بزرگی ${toPersianDigits(eq.mag.toFixed(1))} • ${eq.place} • ${toPersianDigits(date.getHours().toString().padStart(2, "0"))}:${toPersianDigits(date.getMinutes().toString().padStart(2, "0"))} • عمق ${toPersianDigits(Math.round(eq.depth))} کیلومتر`,
                        x: pt[0],
                        y: pt[1],
                      })
                    }
                    onMouseLeave={() => setHoverMarker(null)}
                  />
                </g>
              );
            })}
          </g>

          {/* Compass (outside zoom) */}
          <g transform={`translate(${W - 56}, 40)`} opacity={0.7}>
            <circle r={18} fill="none" stroke="var(--muted-foreground)" strokeWidth={0.8} />
            <text textAnchor="middle" y={-8} fontSize={9} fill="var(--muted-foreground)">ش</text>
            <text textAnchor="middle" y={16} fontSize={9} fill="var(--muted-foreground)">ج</text>
            <text textAnchor="start" x={6} y={3} fontSize={9} fill="var(--muted-foreground)">شرق</text>
            <text textAnchor="end" x={-6} y={3} fontSize={9} fill="var(--muted-foreground)">غرب</text>
          </g>
        </svg>

        {/* Hover tooltip */}
        {hoverMarker && (
          <div
            className="absolute z-20 pointer-events-none rounded-lg border border-border bg-popover/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur"
            style={{
              left: `${(hoverMarker.x / W) * 100}%`,
              top: `${(hoverMarker.y / H) * 100}%`,
              transform: "translate(8px, -120%)",
            }}
          >
            {hoverMarker.text}
          </div>
        )}
        {hover && !hoverMarker && (
          <div
            className="absolute z-20 pointer-events-none rounded-md border border-border bg-popover/95 px-2.5 py-1 text-[11px] shadow backdrop-blur"
            style={{
              left: `${(hover.x / W) * 100}%`,
              top: `${(hover.y / H) * 100}%`,
              transform: "translate(8px, -120%)",
            }}
          >
            {hover.name}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-border/60 bg-card/80 px-3 py-2 text-[11px] backdrop-blur">
          {layer === "earthquakes" ? (
            <>
              <span className="font-medium text-muted-foreground">زلزله (۳۰ روز):</span>
              <Legend color="#84cc16" label="کم (۲.۵–۴)" />
              <Legend color="#eab308" label="متوسط (۴–۵)" />
              <Legend color="#f97316" label="قوی (۵–۶)" />
              <Legend color="#ef4444" label="بزرگ (۶+)" />
            </>
          ) : layer === "weather" ? (
            <>
              <span className="font-medium text-muted-foreground">دمای شهرها (°س)</span>
              <span className="text-muted-foreground">نشانه‌های دایره‌ای روی مراکز استان</span>
            </>
          ) : layer === "airquality" ? (
            <>
              <span className="font-medium text-muted-foreground">شاخص کیفیت هوا:</span>
              <Legend color="#10b981" label="خوب" />
              <Legend color="#eab308" label="متوسط" />
              <Legend color="#f59e0b" label="حساس" />
              <Legend color="#f97316" label="ناسالم" />
              <Legend color="#ef4444" label="بسیار ناسالم" />
            </>
          ) : (
            <span className="text-muted-foreground">روی استان‌ها کلیک کنید تا اطلاعات آن نمایش داده شود</span>
          )}
          <span className="ms-auto flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 radar-spin" />
            زنده
          </span>
        </div>
      </Card>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

// helper removed: centroid computed via pathGen.centroid(f) directly

