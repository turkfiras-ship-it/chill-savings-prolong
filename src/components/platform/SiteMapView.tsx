import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sites, alerts } from "@/data/mockData";
import type { Site } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function getSiteHealth(site: Site): "healthy" | "warning" | "critical" | "offline" {
  if (site.status === "offline" || site.status === "pending") return "offline";
  const siteAlerts = alerts.filter((a) => a.siteId === site.id && !a.acknowledged);
  if (siteAlerts.some((a) => a.severity === "critical")) return "critical";
  if (siteAlerts.some((a) => a.severity === "warning")) return "warning";
  return "healthy";
}

const healthConfig = {
  healthy: {
    color: "hsl(152 60% 48%)",
    label: "Healthy",
    dotClass: "bg-savings",
  },
  warning: {
    color: "hsl(38 92% 50%)",
    label: "Warning",
    dotClass: "bg-warning",
  },
  critical: {
    color: "hsl(0 72% 51%)",
    label: "Critical",
    dotClass: "bg-destructive",
  },
  offline: {
    color: "hsl(215 15% 55%)",
    label: "Offline / Pending",
    dotClass: "bg-muted-foreground",
  },
} as const;

type HealthFilter = "all" | "healthy" | "warning" | "critical" | "offline";

export function SiteMapView() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [filter, setFilter] = useState<HealthFilter>("all");

  const sitesWithHealth = useMemo(
    () =>
      sites.map((s) => ({
        ...s,
        health: getSiteHealth(s),
        alertCount: alerts.filter((a) => a.siteId === s.id && !a.acknowledged).length,
      })),
    []
  );

  const filteredSites =
    filter === "all" ? sitesWithHealth : sitesWithHealth.filter((s) => s.health === filter);

  const healthCounts = useMemo(
    () => ({
      all: sitesWithHealth.length,
      healthy: sitesWithHealth.filter((s) => s.health === "healthy").length,
      warning: sitesWithHealth.filter((s) => s.health === "warning").length,
      critical: sitesWithHealth.filter((s) => s.health === "critical").length,
      offline: sitesWithHealth.filter((s) => s.health === "offline").length,
    }),
    [sitesWithHealth]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
    }).setView([24.0, 44.0], 6);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      markersLayerRef.current?.clearLayers();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    filteredSites.forEach((site) => {
      const cfg = healthConfig[site.health];
      const radius = site.health === "critical" ? 10 : site.health === "warning" ? 9 : 8;

      const marker = L.circleMarker([site.lat, site.lng], {
        radius,
        color: cfg.color,
        fillColor: cfg.color,
        fillOpacity: site.health === "offline" ? 0.5 : 0.78,
        weight: 2,
        opacity: 1,
      });

      marker.bindTooltip(
        `${site.name} • ${cfg.label}${site.alertCount ? ` • ${site.alertCount} alert${site.alertCount > 1 ? "s" : ""}` : ""}`,
        {
          direction: "top",
          offset: [0, -8],
          opacity: 0.9,
          className: "!bg-card !text-foreground !border-border !rounded-md !px-2 !py-1 !text-[11px]",
        }
      );

      marker.on("click", () => navigate(`/sites/${site.id}`));
      marker.addTo(layer);

      if (site.alertCount > 0) {
        const badge = L.marker([site.lat, site.lng], {
          interactive: false,
          icon: L.divIcon({
            className: "",
            html: `<div style="
              width:16px;height:16px;border-radius:9999px;
              background:hsl(0 72% 51%);
              color:white;font-size:10px;font-weight:700;
              display:flex;align-items:center;justify-content:center;
              transform:translate(10px,-13px);
              box-shadow:0 0 0 2px hsl(222 47% 6%);
            ">${site.alertCount}</div>`,
          }),
        });
        badge.addTo(layer);
      }
    });
  }, [filteredSites, navigate]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || filteredSites.length === 0) return;
    const bounds = L.latLngBounds(filteredSites.map((s) => [s.lat, s.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  }, [filter, filteredSites]);

  return (
    <div className="relative w-full">
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
      </div>

      <div className="relative rounded-xl border border-border overflow-hidden h-[520px]">
        <div ref={mapContainerRef} className="h-full w-full" />

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
      </div>
    </div>
  );
}
