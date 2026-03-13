import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sites, alerts } from "@/data/mockData";
import type { Site } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Filter, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

function getSiteHealth(site: Site): "healthy" | "warning" | "critical" | "offline" {
  if (site.status === "offline" || site.status === "pending") return "offline";
  const siteAlerts = alerts.filter((a) => a.siteId === site.id && !a.acknowledged);
  if (siteAlerts.some((a) => a.severity === "critical")) return "critical";
  if (siteAlerts.some((a) => a.severity === "warning")) return "warning";
  return "healthy";
}

const healthConfig = {
  healthy: { color: "hsl(152 60% 48%)", label: "Healthy", dotClass: "bg-savings" },
  warning: { color: "hsl(38 92% 50%)", label: "Warning", dotClass: "bg-warning" },
  critical: { color: "hsl(0 72% 51%)", label: "Critical", dotClass: "bg-destructive" },
  offline: { color: "hsl(215 15% 55%)", label: "Offline / Pending", dotClass: "bg-muted-foreground" },
} as const;

type HealthFilter = "all" | "healthy" | "warning" | "critical" | "offline";

const DARK_TILE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const SATELLITE_TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export function SiteMapView() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [filter, setFilter] = useState<HealthFilter>("all");
  const [satellite, setSatellite] = useState(false);

  const sitesWithHealth = useMemo(
    () => sites.map((s) => ({
      ...s,
      health: getSiteHealth(s),
      alertCount: alerts.filter((a) => a.siteId === s.id && !a.acknowledged).length,
    })),
    []
  );

  const filteredSites = filter === "all" ? sitesWithHealth : sitesWithHealth.filter((s) => s.health === filter);

  const healthCounts = useMemo(() => ({
    all: sitesWithHealth.length,
    healthy: sitesWithHealth.filter((s) => s.health === "healthy").length,
    warning: sitesWithHealth.filter((s) => s.health === "warning").length,
    critical: sitesWithHealth.filter((s) => s.health === "critical").length,
    offline: sitesWithHealth.filter((s) => s.health === "offline").length,
  }), [sitesWithHealth]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
    }).setView([24.0, 44.0], 6);

    tileLayerRef.current = L.tileLayer(DARK_TILE, { maxZoom: 18 }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      markersLayerRef.current?.clearLayers();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Toggle satellite
  const toggleSatellite = useCallback(() => {
    const map = mapRef.current;
    if (!map || !tileLayerRef.current) return;
    const next = !satellite;
    map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(next ? SATELLITE_TILE : DARK_TILE, { maxZoom: 18 }).addTo(map);
    setSatellite(next);
  }, [satellite]);

  // Render markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    filteredSites.forEach((site) => {
      const cfg = healthConfig[site.health];
      const radius = site.health === "critical" ? 12 : site.health === "warning" ? 10 : 8;

      const marker = L.circleMarker([site.lat, site.lng], {
        radius,
        color: cfg.color,
        fillColor: cfg.color,
        fillOpacity: site.health === "offline" ? 0.4 : 0.78,
        weight: site.health === "critical" ? 3 : 2,
        opacity: 1,
      });

      // Rich tooltip content
      const tooltipHtml = `
        <div style="min-width:160px">
          <div style="font-weight:600;font-size:12px;margin-bottom:4px">${site.name}</div>
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
            <span style="width:6px;height:6px;border-radius:50%;background:${cfg.color};display:inline-block"></span>
            <span style="font-size:10px">${cfg.label}</span>
          </div>
          <div style="font-size:10px;opacity:0.7;margin-top:4px">
            ${site.city} · ${(site.consumption_kwh / 1000).toFixed(0)}K kWh
            ${site.savings_pct > 0 ? ` · <span style="color:hsl(152 60% 48%)">${site.savings_pct}% savings</span>` : ''}
            ${site.alertCount ? ` · <span style="color:hsl(0 72% 51%)">${site.alertCount} alert${site.alertCount > 1 ? 's' : ''}</span>` : ''}
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        direction: "top",
        offset: [0, -10],
        opacity: 0.95,
        className: "!bg-card !text-foreground !border-border !rounded-lg !px-3 !py-2 !shadow-lg !text-[11px]",
      });

      marker.on("click", () => navigate(`/sites/${site.id}`));
      marker.addTo(layer);

      // Alert badge
      if (site.alertCount > 0) {
        const badge = L.marker([site.lat, site.lng], {
          interactive: false,
          icon: L.divIcon({
            className: "",
            html: `<div style="
              width:18px;height:18px;border-radius:9999px;
              background:hsl(0 72% 51%);
              color:white;font-size:10px;font-weight:700;
              display:flex;align-items:center;justify-content:center;
              transform:translate(10px,-15px);
              box-shadow:0 0 0 2px hsl(222 47% 6%), 0 0 8px hsl(0 72% 51% / 0.4);
            ">${site.alertCount}</div>`,
          }),
        });
        badge.addTo(layer);
      }

      // Pulse ring for critical sites
      if (site.health === "critical") {
        const pulse = L.circleMarker([site.lat, site.lng], {
          radius: radius + 6,
          color: cfg.color,
          fillColor: "transparent",
          fillOpacity: 0,
          weight: 1.5,
          opacity: 0.4,
          className: "pulse-ring",
        });
        pulse.addTo(layer);
      }
    });
  }, [filteredSites, navigate]);

  // Fit bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || filteredSites.length === 0) return;
    const bounds = L.latLngBounds(filteredSites.map((s) => [s.lat, s.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  }, [filter, filteredSites]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-full"
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["all", "healthy", "warning", "critical", "offline"] as HealthFilter[]).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className={cn(
              "h-7 text-xs gap-1.5 capitalize",
              filter === f && f === "healthy" && "bg-savings text-primary-foreground hover:bg-savings/90",
              filter === f && f === "warning" && "bg-warning text-primary-foreground hover:bg-warning/90",
              filter === f && f === "critical" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
            onClick={() => setFilter(f)}
          >
            {f !== "all" && (
              <span className={cn("h-2 w-2 rounded-full", healthConfig[f as keyof typeof healthConfig]?.dotClass)} />
            )}
            {f} ({healthCounts[f]})
          </Button>
        ))}
        <div className="ml-auto">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5"
            onClick={toggleSatellite}
          >
            <Layers className="h-3.5 w-3.5" />
            {satellite ? "Dark" : "Satellite"}
          </Button>
        </div>
      </div>

      <div className="relative rounded-xl border border-border overflow-hidden h-[520px]">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[500] bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Health Status</p>
          {Object.entries(healthConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dotClass)} />
              <span className="text-[10px] text-foreground">{cfg.label}</span>
              <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                {healthCounts[key as HealthFilter]}
              </span>
            </div>
          ))}
        </div>

        {/* Stats overlay */}
        <div className="absolute top-3 right-3 z-[500] bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Portfolio</p>
          <p className="text-lg font-bold font-mono">{filteredSites.length} <span className="text-xs font-normal text-muted-foreground">sites</span></p>
          <p className="text-[10px] text-muted-foreground">
            {(filteredSites.reduce((a, s) => a + s.consumption_kwh, 0) / 1e6).toFixed(1)}M kWh total
          </p>
        </div>
      </div>
    </motion.div>
  );
}
