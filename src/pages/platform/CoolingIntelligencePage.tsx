import { useMemo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { benchmarkSites } from "@/data/advancedMockData";
import { Globe, BarChart3, TrendingUp, Award, Sparkles } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCountUp } from "@/hooks/useCountUp";
import L from "leaflet";

// ── Efficiency Map ────────────────────────────────────────
function EfficiencyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: [24.0, 44.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 18 }).addTo(map);

    benchmarkSites.forEach((site) => {
      const color = site.efficiencyScore >= 70 ? "#22c55e" : site.efficiencyScore >= 45 ? "#eab308" : "#ef4444";
      const marker = L.circleMarker([site.lat, site.lng], {
        radius: 6 + (site.coolingTons / 100),
        fillColor: color,
        fillOpacity: 0.7,
        color: color,
        weight: 1,
      }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif;color:#fff;background:#1a1a2e;padding:8px 12px;border-radius:8px;min-width:160px">
          <strong>${site.name}</strong><br/>
          <span style="color:${color};font-size:18px;font-weight:bold">${site.efficiencyScore}</span> <span style="opacity:0.7;font-size:12px">Efficiency</span><br/>
          <span style="font-size:12px;opacity:0.7">${site.kwhPerTon} kWh/ton • ${site.coolingTons} TR</span>
        </div>
      `, { className: "dark-popup" });
    });

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  return <div ref={mapRef} className="h-[360px] rounded-lg overflow-hidden border border-border" />;
}

// ── AI Typing Effect ──────────────────────────────────────
function TypingInsight({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <p className="text-sm text-foreground leading-relaxed">
      {displayed}<span className="animate-pulse text-primary">|</span>
    </p>
  );
}

export default function CoolingIntelligencePage() {
  const avgKwhPerTon = useMemo(() => Math.round(benchmarkSites.reduce((a, s) => a + s.kwhPerTon, 0) / benchmarkSites.length), []);
  const top10 = useMemo(() => benchmarkSites.filter(s => s.nationalRank <= 5).length, []);
  const bottom10 = useMemo(() => benchmarkSites.filter(s => s.nationalRank >= 45).length, []);
  const portfolioAvg = useMemo(() => {
    const portfolio = benchmarkSites.filter(s => s.portfolioRank > 0);
    return Math.round(portfolio.reduce((a, s) => a + s.kwhPerTon, 0) / portfolio.length);
  }, []);

  const countAvg = useCountUp({ end: avgKwhPerTon, duration: 1500 });
  const countPortfolio = useCountUp({ end: portfolioAvg, duration: 1500 });

  // Distribution histogram
  const histogram = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (let b = 800; b <= 2000; b += 200) {
      const label = `${b}-${b + 200}`;
      buckets[label] = benchmarkSites.filter(s => s.kwhPerTon >= b && s.kwhPerTon < b + 200).length;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, []);

  const tableData = useMemo(
    () => [...benchmarkSites].sort((a, b) => a.kwhPerTon - b.kwhPerTon).slice(0, 15),
    []
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-accent" />
            National Cooling Intelligence Network
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Saudi Cooling Benchmark — Portfolio vs National Average</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg kWh / Cooling Ton", value: countAvg, icon: BarChart3, gradient: "gradient-energy" },
            { label: "Portfolio Efficiency", value: countPortfolio, sub: "kWh/ton", icon: TrendingUp, gradient: "gradient-savings" },
            { label: "Top 10% Efficient", value: top10, sub: "sites", icon: Award, gradient: "gradient-savings" },
            { label: "Bottom 10% Sites", value: bottom10, sub: "sites", icon: TrendingUp, gradient: "gradient-warning" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${kpi.gradient}`} />
                <CardContent className="pt-5 pb-4 relative">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}{kpi.sub ? ` ${kpi.sub}` : ""}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Map + AI Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Efficiency Clusters — Saudi Arabia</CardTitle>
                <CardDescription>50 buildings • Color-coded by cooling efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <EfficiencyMap />
                <div className="flex gap-4 mt-3 justify-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-green-500" /> Efficient</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-yellow-500" /> Average</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500" /> Inefficient</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-accent/20 glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                AI Benchmark Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TypingInsight text={`Your portfolio operates ${Math.round(((avgKwhPerTon - portfolioAvg) / avgKwhPerTon) * 100)}% more efficiently than the Saudi retail average. Top performers in Riyadh and Jeddah are driving the majority of efficiency gains. Expanding SCC deployment to bottom-quartile sites could unlock an additional 180,000 SAR in annual savings.`} />
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary font-semibold">Portfolio Ranking</p>
                <p className="text-2xl font-bold text-foreground mt-1">Top 12%</p>
                <p className="text-xs text-muted-foreground">vs Saudi commercial benchmark</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cooling Efficiency Distribution</CardTitle>
            <CardDescription>kWh per cooling ton across all Saudi sites</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={histogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Buildings">
                  {histogram.map((_, i) => (
                    <Cell key={i} fill={i < 2 ? "hsl(var(--primary))" : i < 4 ? "hsl(var(--accent))" : "hsl(var(--warning))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Benchmark Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Benchmark Leaderboard</CardTitle>
            <CardDescription>Top 15 most efficient buildings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">kWh/Ton</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                    <TableHead className="text-right">National Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((site, i) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium text-foreground">{site.name}</TableCell>
                      <TableCell className="text-muted-foreground">{site.city}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{site.type}</Badge></TableCell>
                      <TableCell className="text-right font-mono">{site.kwhPerTon}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={site.efficiencyScore >= 70 ? "bg-primary/20 text-primary border-0" : site.efficiencyScore >= 45 ? "bg-warning/20 text-warning border-0" : "bg-destructive/20 text-destructive border-0"}>
                          {site.efficiencyScore}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">#{site.nationalRank}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
