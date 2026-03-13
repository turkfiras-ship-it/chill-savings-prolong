import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { carbonData } from "@/data/autonomousMockData";
import { Leaf, Factory, TrendingDown, Printer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCountUp } from "@/hooks/useCountUp";

export default function CarbonIntelligencePage() {
  const countEmitted = useCountUp({ end: Math.round(carbonData.todayEmitted), duration: 1500 });
  const countAvoided = useCountUp({ end: Math.round(carbonData.todayAvoided), duration: 1500 });
  const totalAvoided = carbonData.monthlyTrend.reduce((a, m) => a + m.avoided, 0);
  const countTotal = useCountUp({ end: totalAvoided, duration: 1800 });

  const handleExport = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>ESG Carbon Report</title><style>body{font-family:system-ui;padding:40px;max-width:800px;margin:0 auto}h1{color:#22c55e;border-bottom:2px solid #22c55e;padding-bottom:8px}.kpi{display:flex;gap:24px;margin:20px 0}.kpi-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;flex:1}.kpi-value{font-size:24px;font-weight:800;color:#22c55e}.kpi-label{font-size:12px;color:#64748b}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0}th{background:#f1f5f9;font-size:12px;text-transform:uppercase;color:#64748b}.footer{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center}</style></head><body><h1>🌿 ESG Carbon Intelligence Report</h1><p style="color:#64748b">Generated: ${new Date().toLocaleDateString()} • Thermo Dynamics Engineering</p><div class="kpi"><div class="kpi-card"><div class="kpi-value">${carbonData.todayEmitted} t</div><div class="kpi-label">CO₂ Emitted Today</div></div><div class="kpi-card"><div class="kpi-value">${carbonData.todayAvoided} t</div><div class="kpi-label">CO₂ Avoided Today</div></div><div class="kpi-card"><div class="kpi-value">${totalAvoided} t</div><div class="kpi-label">Total CO₂ Avoided (Annual)</div></div></div><h2>Carbon Intensity by Building</h2><table><tr><th>Site</th><th>Total CO₂ (t)</th><th>Intensity</th></tr>${carbonData.perBuilding.slice(0, 10).map(b => `<tr><td>${b.site}</td><td>${b.total}</td><td>${b.intensity}</td></tr>`).join("")}</table><div class="footer">ESCO Command Center — ESG Compliance Report — Vision 2030</div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              Carbon Intelligence
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time emissions tracking and ESG compliance</p>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2"><Printer className="h-4 w-4" /> Export ESG Report</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "CO₂ Emitted Today", value: `${countEmitted} tons`, icon: Factory, gradient: "gradient-warning" },
            { label: "CO₂ Avoided Today", value: `${countAvoided} tons`, icon: Leaf, gradient: "gradient-savings" },
            { label: "Annual CO₂ Avoided", value: `${countTotal} tons`, icon: TrendingDown, gradient: "gradient-savings" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${kpi.gradient}`} />
                <CardContent className="pt-5 pb-4 relative">
                  <kpi.icon className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carbon Reduction Trend</CardTitle>
            <CardDescription>Monthly emissions emitted vs avoided</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={carbonData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="emitted" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="CO₂ Emitted (t)" opacity={0.5} />
                <Bar dataKey="avoided" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="CO₂ Avoided (t)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carbon Intensity by Building</CardTitle>
            <CardDescription>Top buildings by total CO₂ emissions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={carbonData.perBuilding.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis type="category" dataKey="site" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={150} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => `${v} tons CO₂`} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Total CO₂ (t)">
                  {carbonData.perBuilding.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={i < 3 ? "hsl(var(--warning))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
