import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sites, alerts } from "@/data/mockData";
import type { Site } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Zap, TrendingUp, AlertTriangle, Building2,
  Activity, ChevronRight, X, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function getSiteHealth(site: Site): 'healthy' | 'warning' | 'critical' | 'offline' {
  if (site.status === 'offline') return 'offline';
  if (site.status === 'pending') return 'offline';
  const siteAlerts = alerts.filter(a => a.siteId === site.id && !a.acknowledged);
  if (siteAlerts.some(a => a.severity === 'critical')) return 'critical';
  if (siteAlerts.some(a => a.severity === 'warning')) return 'warning';
  return 'healthy';
}

const healthConfig = {
  healthy: {
    color: '#34d399',
    label: 'Healthy',
    bgClass: 'bg-savings/20 text-savings',
    dotClass: 'bg-savings',
  },
  warning: {
    color: '#f59e0b',
    label: 'Warning',
    bgClass: 'bg-warning/20 text-warning',
    dotClass: 'bg-warning',
  },
  critical: {
    color: '#ef4444',
    label: 'Critical',
    bgClass: 'bg-destructive/20 text-destructive',
    dotClass: 'bg-destructive',
  },
  offline: {
    color: '#6b7280',
    label: 'Offline / Pending',
    bgClass: 'bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
};

type HealthFilter = 'all' | 'healthy' | 'warning' | 'critical' | 'offline';

// Component to fit map bounds when filter changes
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const L = require('leaflet');
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [positions, map]);
  return null;
}

export function SiteMapView() {
  const navigate = useNavigate();
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [filter, setFilter] = useState<HealthFilter>('all');

  const sitesWithHealth = useMemo(() =>
    sites.map(s => ({
      ...s,
      health: getSiteHealth(s),
      alertCount: alerts.filter(a => a.siteId === s.id && !a.acknowledged).length,
    }))
  , []);

  const filteredSites = filter === 'all'
    ? sitesWithHealth
    : sitesWithHealth.filter(s => s.health === filter);

  const healthCounts = useMemo(() => ({
    all: sitesWithHealth.length,
    healthy: sitesWithHealth.filter(s => s.health === 'healthy').length,
    warning: sitesWithHealth.filter(s => s.health === 'warning').length,
    critical: sitesWithHealth.filter(s => s.health === 'critical').length,
    offline: sitesWithHealth.filter(s => s.health === 'offline').length,
  }), [sitesWithHealth]);

  const positions: [number, number][] = filteredSites.map(s => [s.lat, s.lng]);

  const siteAlerts = selectedSite
    ? alerts.filter(a => a.siteId === selectedSite.id && !a.acknowledged)
    : [];

  // Saudi Arabia center
  const center: [number, number] = [24.0, 44.0];

  return (
    <div className="relative w-full">
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(['all', 'healthy', 'warning', 'critical', 'offline'] as HealthFilter[]).map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            className={cn(
              "h-7 text-xs gap-1.5 capitalize",
              filter === f && f === 'healthy' && "bg-savings text-primary-foreground hover:bg-savings/90",
              filter === f && f === 'warning' && "bg-warning text-primary-foreground hover:bg-warning/90",
              filter === f && f === 'critical' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
            onClick={() => setFilter(f)}
          >
            {f !== 'all' && (
              <span className={cn("h-2 w-2 rounded-full", healthConfig[f as keyof typeof healthConfig]?.dotClass)} />
            )}
            {f} ({healthCounts[f]})
          </Button>
        ))}
      </div>

      {/* Map container */}
      <div className="relative rounded-xl border border-border overflow-hidden" style={{ height: '520px' }}>
        <MapContainer
          center={center}
          zoom={6}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
          style={{ background: 'hsl(222, 47%, 6%)' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution=""
          />
          <FitBounds positions={positions} />

          {filteredSites.map(site => {
            const cfg = healthConfig[site.health];
            const isSelected = selectedSite?.id === site.id;

            return (
              <CircleMarker
                key={site.id}
                center={[site.lat, site.lng]}
                radius={isSelected ? 12 : site.health === 'critical' ? 10 : 8}
                pathOptions={{
                  color: cfg.color,
                  fillColor: cfg.color,
                  fillOpacity: isSelected ? 0.9 : 0.7,
                  weight: isSelected ? 3 : 2,
                  opacity: 1,
                }}
                eventHandlers={{
                  click: () => setSelectedSite(site),
                }}
              />
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-1.5">
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

        {/* Selected site detail panel */}
        {selectedSite && (() => {
          const health = getSiteHealth(selectedSite);
          const cfg = healthConfig[health];
          return (
            <div className="absolute top-3 right-3 z-[1000] w-72 bg-card/95 backdrop-blur-md border border-border rounded-xl overflow-hidden animate-scale-in">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", cfg.dotClass)} />
                      <h3 className="text-sm font-bold truncate">{selectedSite.name}</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {selectedSite.city}, {selectedSite.region}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setSelectedSite(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className={cn("text-[9px]", cfg.bgClass)}>{cfg.label}</Badge>
                  <Badge variant="outline" className="text-[9px]">
                    <Building2 className="h-2.5 w-2.5 mr-1" /> {selectedSite.type}
                  </Badge>
                </div>
              </div>

              {/* Metrics */}
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
                  <Zap className="h-3.5 w-3.5 mx-auto text-energy mb-1" />
                  <p className="text-xs font-bold font-mono">{(selectedSite.consumption_kwh / 1000).toFixed(0)}K</p>
                  <p className="text-[9px] text-muted-foreground">kWh/mo</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
                  <TrendingUp className="h-3.5 w-3.5 mx-auto text-savings mb-1" />
                  <p className="text-xs font-bold font-mono text-savings">
                    {selectedSite.savings_pct > 0 ? `${selectedSite.savings_pct}%` : '—'}
                  </p>
                  <p className="text-[9px] text-muted-foreground">Savings</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
                  <Activity className="h-3.5 w-3.5 mx-auto text-accent mb-1" />
                  <p className="text-xs font-bold font-mono">{selectedSite.demand_kw} kW</p>
                  <p className="text-[9px] text-muted-foreground">Demand</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
                  <AlertTriangle className="h-3.5 w-3.5 mx-auto text-warning mb-1" />
                  <p className="text-xs font-bold font-mono">{siteAlerts.length}</p>
                  <p className="text-[9px] text-muted-foreground">Active Alerts</p>
                </div>
              </div>

              {/* Alerts preview */}
              {siteAlerts.length > 0 && (
                <div className="px-4 pb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Active Alerts</p>
                  {siteAlerts.slice(0, 2).map(a => (
                    <div key={a.id} className="flex items-start gap-2 mb-1.5">
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full mt-1 shrink-0",
                        a.severity === 'critical' ? 'bg-destructive' : 'bg-warning'
                      )} />
                      <p className="text-[10px] text-muted-foreground leading-tight">{a.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer actions */}
              <div className="p-3 border-t border-border">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                  <span>{selectedSite.devices} devices · {selectedSite.assets} assets</span>
                  <span>{selectedSite.customer}</span>
                </div>
                {selectedSite.solutions.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-2">
                    {selectedSite.solutions.map(sol => (
                      <Badge key={sol} variant="outline" className="text-[8px] h-4">{sol}</Badge>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  className="w-full h-7 text-xs gap-1 bg-savings text-primary-foreground hover:bg-savings/90"
                  onClick={() => navigate(`/sites/${selectedSite.id}`)}
                >
                  View Site Details <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
