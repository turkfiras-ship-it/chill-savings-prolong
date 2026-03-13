import { useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { portfolioROI } from "@/data/autonomousMockData";
import { Target, TrendingUp, MapPin } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { sites } from "@/data/mockData";
import L from "leaflet";

function OpportunityMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, { center: [24.5, 44.0], zoom: 5, zoomControl: false, attributionControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 18 }).addTo(map);

    portfolioROI.forEach(roi => {
      const site = sites.find(s => s.id === roi.siteId);
      if (!site) return;
      const color = roi.priorityRank <= 3 ? "#22c55e" : roi.priorityRank <= 7 ? "#eab308" : "#64748b";
      const r = roi.priorityRank <= 3 ? 12 : 8;
      L.circleMarker([site.lat, site.lng], { radius: r, fillColor: color, fillOpacity: 0.7, color, weight: 2 })
        .addTo(map)
        .bindPopup(`<div style="font-family:sans-serif;color:#fff;background:#1a1a2e;padding:8px 12px;border-radius:8px"><strong>${roi.siteName}</strong><br/><span style="color:${color};font-weight:bold">#${roi.priorityRank}</span> Priority • ROI ${roi.roiMonths}mo</div>`, { className: "dark-popup" });
    });

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  return <div ref={mapRef} className="h-[300px] rounded-lg overflow-hidden border border-border" />;
}

export default function PortfolioAIPage() {
  const chartData = portfolioROI.slice(0, 10).map(r => ({
    name: r.siteName.substring(0, 15),
    roi: r.roiMonths,
    savings: r.projectedSavings / 1000,
  }));

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Portfolio Optimization AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Investment deployment prioritization across all sites</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Opportunity Map</CardTitle>
              <CardDescription>Deployment priority locations</CardDescription>
            </CardHeader>
            <CardContent><OpportunityMap /></CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ROI by Site</CardTitle>
              <CardDescription>Projected savings vs ROI timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={110} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="savings" radius={[0, 4, 4, 0]} name="Savings (K SAR)">
                    {chartData.map((_, i) => <Cell key={i} fill={i < 3 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Priority Ranking</CardTitle>
            <CardDescription>Sites ranked by deployment ROI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Rank</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Waste Score</TableHead>
                    <TableHead className="text-right">Investment</TableHead>
                    <TableHead className="text-right">Projected Savings</TableHead>
                    <TableHead className="text-right">ROI (months)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolioROI.map((r, i) => (
                    <motion.tr key={r.siteId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-border">
                      <TableCell><Badge className={r.priorityRank <= 3 ? "bg-primary/20 text-primary border-0" : "bg-secondary text-muted-foreground border-0"}>#{r.priorityRank}</Badge></TableCell>
                      <TableCell className="font-medium text-foreground">{r.siteName}</TableCell>
                      <TableCell className="text-muted-foreground">{r.city}</TableCell>
                      <TableCell className="text-right"><span className={r.wasteScore >= 60 ? "text-destructive" : r.wasteScore >= 40 ? "text-warning" : "text-primary"}>{r.wasteScore}</span></TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{(r.investmentRequired / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-right font-mono text-primary">{(r.projectedSavings / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-right font-bold">{r.roiMonths}</TableCell>
                    </motion.tr>
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
