import { useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sites } from "@/data/mockData";
import { useGlobalWeather } from "@/context/WeatherContext";
import { Flame, Thermometer, AlertTriangle, Zap, Wind, Shield, TrendingUp } from "lucide-react";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCountUp } from "@/hooks/useCountUp";
import L from "leaflet";

function HeatRiskMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: [24.7, 44.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 18 }).addTo(map);

    sites.filter(s => s.status === "active").forEach(site => {
      const stress = Math.min(100, Math.max(0, (site.demand_kw / site.peak_kw) * 100 + Math.random() * 20));
      const color = stress >= 75 ? "#ef4444" : stress >= 50 ? "#eab308" : "#22c55e";
      L.circleMarker([site.lat, site.lng], {
        radius: 10,
        fillColor: color,
        fillOpacity: 0.6,
        color: color,
        weight: 2,
      }).addTo(map).bindPopup(`
        <div style="font-family:sans-serif;color:#fff;background:#1a1a2e;padding:8px 12px;border-radius:8px">
          <strong>${site.name}</strong><br/>
          <span style="color:${color};font-size:16px;font-weight:bold">${Math.round(stress)}</span>
          <span style="opacity:0.7;font-size:11px"> Stress Score</span><br/>
          <span style="font-size:11px;opacity:0.7">${site.demand_kw}kW / ${site.peak_kw}kW peak</span>
        </div>
      `, { className: "dark-popup" });
    });

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  return <div ref={mapRef} className="h-[320px] rounded-lg overflow-hidden border border-border" />;
}

function StressGaugeMini({ score }: { score: number }) {
  const color = score >= 75 ? "hsl(var(--destructive))" : score >= 50 ? "hsl(var(--warning))" : "hsl(var(--primary))";
  const label = score >= 75 ? "Critical" : score >= 50 ? "High Risk" : score >= 25 ? "Moderate" : "Safe";
  const r = 70;
  const cx = 90;
  const cy = 90;
  const angle = (score / 100) * 270;

  const arcPath = (sa: number, ea: number) => {
    const s = ((sa - 90) * Math.PI) / 180;
    const e = ((ea - 90) * Math.PI) / 180;
    return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${ea - sa > 180 ? 1 : 0} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={180} height={180} viewBox="0 0 180 180">
        <path d={arcPath(-135, 135)} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" strokeLinecap="round" />
        <motion.path
          d={arcPath(-135, -135 + angle)}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        <text x={cx} y={cy + 8} textAnchor="middle" style={{ fontSize: 32, fontWeight: 800, fill: color }}>{score}</text>
        <text x={cx} y={cy + 28} textAnchor="middle" style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}>/100</text>
      </svg>
      <Badge className={`${score >= 75 ? "bg-destructive/20 text-destructive" : score >= 50 ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"} border-0`}>
        {label}
      </Badge>
    </div>
  );
}

export default function HeatwaveCommandPage() {
  const { weather } = useGlobalWeather();
  const temp = weather?.current?.temperature ?? 46;
  const humidity = weather?.current?.humidity ?? 35;
  const isExtreme = temp >= 42;
  const stressScore = Math.min(100, Math.max(0, Math.round((temp - 25) * 3.5 + humidity * 0.3)));

  const countTemp = useCountUp({ end: Math.round(temp), duration: 1000 });

  const riskCards = [
    { label: "Compressor Failure Risk", value: isExtreme ? "High" : "Moderate", pct: isExtreme ? 78 : 42, icon: Zap, color: isExtreme ? "destructive" : "warning" },
    { label: "Demand Spike Risk", value: isExtreme ? "Critical" : "Elevated", pct: isExtreme ? 89 : 55, icon: TrendingUp, color: isExtreme ? "destructive" : "warning" },
    { label: "Cooling Load Surge", value: `+${isExtreme ? 38 : 18}%`, pct: isExtreme ? 85 : 48, icon: Thermometer, color: isExtreme ? "destructive" : "accent" },
    { label: "Grid Stress", value: isExtreme ? "Elevated" : "Normal", pct: isExtreme ? 72 : 30, icon: AlertTriangle, color: isExtreme ? "warning" : "primary" },
  ];

  const actions = [
    "Pre-cool all buildings starting at 6:00 AM to build thermal mass",
    "Reduce compressor cycling frequency by 15% during peak hours (12-4 PM)",
    "Shift 20% of cooling load from critical sites to under-utilized buildings",
    "Enable demand response mode — cap peak demand at 90% of rated capacity",
    "Delay non-essential equipment maintenance to reduce simultaneous shutdowns",
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Alert Banner */}
        {isExtreme && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-destructive/20 border border-destructive/40 p-4 flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-full bg-destructive/30 flex items-center justify-center animate-pulse">
              <Flame className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="font-bold text-destructive text-lg">🔥 Extreme Heat Event Detected</p>
              <p className="text-sm text-foreground">
                Riyadh — {countTemp}°C • Cooling Risk Level: <strong className="text-destructive">CRITICAL</strong>
              </p>
            </div>
          </motion.div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Flame className="h-6 w-6 text-destructive" />
            Heatwave Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Emergency cooling management • Activates when temperature exceeds 42°C
          </p>
        </div>

        {/* Risk Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {riskCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <card.icon className={`h-5 w-5 mb-2 text-${card.color}`} />
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className={`text-xl font-bold text-${card.color} mt-1`}>{card.value}</p>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-${card.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${card.pct}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Map + Stress Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Cooling Stress Levels</CardTitle>
              <CardDescription>Portfolio-wide heat risk distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatRiskMap />
              <div className="flex gap-4 mt-3 justify-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-primary" /> Safe</span>
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-warning" /> Elevated</span>
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-destructive" /> Critical</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-base">Cooling Stress Index</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <StressGaugeMini score={stressScore} />
            </CardContent>
          </Card>
        </div>

        {/* AI Strategy */}
        <Card className="glass-card border-accent/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              AI Recommended Actions
            </CardTitle>
            <CardDescription>Automated mitigation strategies for current conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actions.map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <span className="text-xs font-bold text-accent bg-accent/10 rounded-full h-6 w-6 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground">{action}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
