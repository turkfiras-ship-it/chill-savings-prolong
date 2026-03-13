import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { sites, alerts } from "@/data/mockData";
import type { Site } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Zap, TrendingUp, AlertTriangle, Building2,
  ExternalLink, Activity, ChevronRight, X, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

// Saudi Arabia approximate bounding box for projection
const SA_BOUNDS = { minLat: 16.0, maxLat: 32.5, minLng: 34.5, maxLng: 56.0 };
const MAP_WIDTH = 900;
const MAP_HEIGHT = 600;

function projectToMap(lat: number, lng: number) {
  const x = ((lng - SA_BOUNDS.minLng) / (SA_BOUNDS.maxLng - SA_BOUNDS.minLng)) * MAP_WIDTH;
  const y = MAP_HEIGHT - ((lat - SA_BOUNDS.minLat) / (SA_BOUNDS.maxLat - SA_BOUNDS.minLat)) * MAP_HEIGHT;
  return { x, y };
}

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
    color: 'hsl(152, 60%, 48%)',
    label: 'Healthy',
    bgClass: 'bg-savings/20 text-savings',
    dotClass: 'bg-savings',
    glowClass: 'shadow-[0_0_12px_hsl(152,60%,48%,0.5)]',
  },
  warning: {
    color: 'hsl(38, 92%, 50%)',
    label: 'Warning',
    bgClass: 'bg-warning/20 text-warning',
    dotClass: 'bg-warning',
    glowClass: 'shadow-[0_0_12px_hsl(38,92%,50%,0.5)]',
  },
  critical: {
    color: 'hsl(0, 72%, 51%)',
    label: 'Critical',
    bgClass: 'bg-destructive/20 text-destructive',
    dotClass: 'bg-destructive',
    glowClass: 'shadow-[0_0_12px_hsl(0,72%,51%,0.6)]',
  },
  offline: {
    color: 'hsl(215, 15%, 55%)',
    label: 'Offline / Pending',
    bgClass: 'bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground',
    glowClass: '',
  },
};

// Simplified Saudi Arabia SVG outline
const SA_PATH = "M 510 120 L 545 135 L 560 155 L 575 180 L 590 200 L 610 225 L 625 260 L 640 300 L 650 330 L 660 360 L 665 390 L 660 420 L 640 445 L 610 460 L 580 470 L 550 475 L 520 485 L 490 500 L 460 510 L 430 505 L 400 490 L 370 470 L 340 455 L 310 450 L 280 460 L 250 475 L 220 485 L 195 480 L 175 465 L 160 445 L 155 420 L 165 395 L 180 375 L 200 355 L 220 340 L 240 320 L 255 295 L 265 270 L 270 245 L 280 220 L 295 200 L 315 180 L 340 165 L 365 155 L 390 148 L 420 140 L 450 132 L 480 125 Z";

type HealthFilter = 'all' | 'healthy' | 'warning' | 'critical' | 'offline';

export function SiteMapView() {
  const navigate = useNavigate();
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);
  const [filter, setFilter] = useState<HealthFilter>('all');

  const sitesWithHealth = useMemo(() =>
    sites.map(s => ({
      ...s,
      health: getSiteHealth(s),
      pos: projectToMap(s.lat, s.lng),
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

  const siteAlerts = selectedSite
    ? alerts.filter(a => a.siteId === selectedSite.id && !a.acknowledged)
    : [];

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
      <div className="relative rounded-xl border border-border bg-card overflow-hidden" style={{ aspectRatio: `${MAP_WIDTH}/${MAP_HEIGHT}` }}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(152, 60%, 48%) 1px, transparent 1px), linear-gradient(90deg, hsl(152, 60%, 48%) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Glow filter for pins */}
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="hsl(152, 60%, 48%)" floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="hsl(38, 92%, 50%)" floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feFlood floodColor="hsl(0, 72%, 51%)" floodOpacity="0.7" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* Pulse animation for critical */}
            <radialGradient id="pulse-grad-red">
              <stop offset="0%" stopColor="hsl(0, 72%, 51%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(0, 72%, 51%)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="pulse-grad-green">
              <stop offset="0%" stopColor="hsl(152, 60%, 48%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(152, 60%, 48%)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="pulse-grad-amber">
              <stop offset="0%" stopColor="hsl(38, 92%, 50%)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(38, 92%, 50%)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Saudi Arabia outline */}
          <path
            d={SA_PATH}
            fill="hsl(215, 20%, 10%)"
            stroke="hsl(215, 20%, 20%)"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* City labels */}
          {['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'Jubail', 'Khobar'].map(city => {
            const site = sites.find(s => s.city === city);
            if (!site) return null;
            const pos = projectToMap(site.lat, site.lng);
            return (
              <text
                key={city}
                x={pos.x}
                y={pos.y + 22}
                textAnchor="middle"
                fill="hsl(215, 15%, 45%)"
                fontSize="9"
                fontFamily="Inter, sans-serif"
                fontWeight="500"
              >
                {city}
              </text>
            );
          })}

          {/* Site pins */}
          {filteredSites.map(site => {
            const config = healthConfig[site.health];
            const isHovered = hoveredSite === site.id;
            const isSelected = selectedSite?.id === site.id;
            const pinRadius = isHovered || isSelected ? 8 : 6;
            const glowFilter = site.health === 'healthy' ? 'url(#glow-green)'
              : site.health === 'warning' ? 'url(#glow-amber)'
              : site.health === 'critical' ? 'url(#glow-red)' : 'none';
            const pulseGrad = site.health === 'critical' ? 'url(#pulse-grad-red)'
              : site.health === 'warning' ? 'url(#pulse-grad-amber)'
              : site.health === 'healthy' ? 'url(#pulse-grad-green)' : 'none';

            return (
              <g
                key={site.id}
                className="cursor-pointer transition-transform"
                onClick={() => setSelectedSite(site)}
                onMouseEnter={() => setHoveredSite(site.id)}
                onMouseLeave={() => setHoveredSite(null)}
              >
                {/* Pulse ring for active sites */}
                {site.health !== 'offline' && (
                  <circle
                    cx={site.pos.x}
                    cy={site.pos.y}
                    r="18"
                    fill={pulseGrad}
                    className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
                    opacity="0.6"
                  />
                )}

                {/* Outer ring */}
                <circle
                  cx={site.pos.x}
                  cy={site.pos.y}
                  r={pinRadius + 3}
                  fill="none"
                  stroke={config.color}
                  strokeWidth="1.5"
                  opacity={isHovered || isSelected ? 0.8 : 0.3}
                />

                {/* Pin */}
                <circle
                  cx={site.pos.x}
                  cy={site.pos.y}
                  r={pinRadius}
                  fill={config.color}
                  filter={glowFilter}
                  className="transition-all duration-200"
                />

                {/* Inner dot */}
                <circle
                  cx={site.pos.x}
                  cy={site.pos.y}
                  r={pinRadius * 0.35}
                  fill="hsl(222, 47%, 6%)"
                />

                {/* Alert count badge */}
                {site.alertCount > 0 && (
                  <>
                    <circle
                      cx={site.pos.x + pinRadius + 2}
                      cy={site.pos.y - pinRadius - 2}
                      r="7"
                      fill="hsl(0, 72%, 51%)"
                    />
                    <text
                      x={site.pos.x + pinRadius + 2}
                      y={site.pos.y - pinRadius + 1}
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="700"
                      fontFamily="Inter, sans-serif"
                    >
                      {site.alertCount}
                    </text>
                  </>
                )}

                {/* Hover tooltip label */}
                {isHovered && !isSelected && (
                  <g>
                    <rect
                      x={site.pos.x - 55}
                      y={site.pos.y - 32}
                      width="110"
                      height="18"
                      rx="4"
                      fill="hsl(222, 40%, 9%)"
                      stroke={config.color}
                      strokeWidth="0.5"
                      opacity="0.95"
                    />
                    <text
                      x={site.pos.x}
                      y={site.pos.y - 19}
                      textAnchor="middle"
                      fill="hsl(210, 40%, 96%)"
                      fontSize="8"
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                    >
                      {site.name.length > 18 ? site.name.slice(0, 18) + '…' : site.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-1.5">
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
            <div className="absolute top-3 right-3 w-72 bg-card/95 backdrop-blur-md border border-border rounded-xl overflow-hidden animate-scale-in">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", cfg.dotClass, health !== 'offline' && 'pulse-dot')} />
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
