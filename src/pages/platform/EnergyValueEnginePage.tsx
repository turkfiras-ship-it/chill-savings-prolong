import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { valueEngineData } from "@/data/advancedMockData";
import { portfolioKPIs, sites } from "@/data/mockData";
import { DollarSign, Zap, TrendingUp, Landmark, Printer, BarChart3, Sparkles } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCountUp } from "@/hooks/useCountUp";

function ValueKPI({ icon: Icon, label, value, sub, gradient, delay = 0 }: {
  icon: any; label: string; value: string; sub: string; gradient: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform">
        <div className={`absolute inset-0 opacity-10 ${gradient}`} />
        <CardContent className="pt-5 pb-4 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${gradient}`}>
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function EnergyValueEnginePage() {
  const countKwh = useCountUp({ end: valueEngineData.todayKwh, duration: 1800 });
  const countSavings = useCountUp({ end: valueEngineData.todaySavings, duration: 1800 });
  const countYtd = useCountUp({ end: valueEngineData.ytdValue, duration: 2000 });
  const countTenYear = useCountUp({ end: valueEngineData.tenYearProjection, duration: 2200 });

  // 10-year projection
  const tenYearData = useMemo(() => {
    const totalSavings = portfolioKPIs.totalSavings;
    let cum = 0;
    return Array.from({ length: 10 }, (_, i) => {
      const annual = Math.round(totalSavings * Math.pow(1.126, i));
      cum += annual;
      return { year: String(2025 + i), annual, cumulative: cum };
    });
  }, []);

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>ESCO Energy Value Report</title>
      <style>
        body{font-family:system-ui;padding:40px;color:#1a1a2e;max-width:800px;margin:0 auto}
        h1{color:#0ea5e9;border-bottom:2px solid #0ea5e9;padding-bottom:8px}
        .kpi{display:flex;gap:24px;margin:20px 0}
        .kpi-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;flex:1}
        .kpi-value{font-size:24px;font-weight:800;color:#0ea5e9}
        .kpi-label{font-size:12px;color:#64748b;margin-top:4px}
        table{width:100%;border-collapse:collapse;margin:20px 0}
        th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0}
        th{background:#f1f5f9;font-size:12px;text-transform:uppercase;color:#64748b}
        .footer{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center}
      </style></head><body>
      <h1>⚡ ESCO Energy Value Report</h1>
      <p style="color:#64748b">Generated: ${new Date().toLocaleDateString()} • Thermo Dynamics Engineering</p>
      <div class="kpi">
        <div class="kpi-card"><div class="kpi-value">${valueEngineData.todayKwh.toLocaleString()} kWh</div><div class="kpi-label">Energy Saved Today</div></div>
        <div class="kpi-card"><div class="kpi-value">${valueEngineData.todaySavings.toLocaleString()} SAR</div><div class="kpi-label">Money Saved Today</div></div>
        <div class="kpi-card"><div class="kpi-value">${(valueEngineData.ytdValue/1e6).toFixed(1)}M SAR</div><div class="kpi-label">YTD Value Created</div></div>
      </div>
      <h2>10-Year Value Projection</h2>
      <table>
        <tr><th>Year</th><th>Annual Savings (SAR)</th><th>Cumulative (SAR)</th></tr>
        ${tenYearData.map(d => `<tr><td>${d.year}</td><td>${d.annual.toLocaleString()}</td><td>${d.cumulative.toLocaleString()}</td></tr>`).join("")}
      </table>
      <h2>Site Contributions</h2>
      <table>
        <tr><th>Site</th><th>Annual Value (SAR)</th><th>% of Portfolio</th></tr>
        ${valueEngineData.siteContributions.map(s => `<tr><td>${s.site}</td><td>${s.value.toLocaleString()}</td><td>${s.pct}%</td></tr>`).join("")}
      </table>
      <div class="footer"><div class="footer">DC Evolve — Confidential Investor Document</div></div>
      </body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Energy Value Creation Engine
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Translating energy optimization into financial value</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Export Investor Report
          </Button>
        </div>

        {/* Hero KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ValueKPI icon={Zap} label="Energy Saved Today" value={`${countKwh.toLocaleString()} kWh`} sub="Across all active sites" gradient="gradient-energy" delay={0} />
          <ValueKPI icon={DollarSign} label="Money Saved Today" value={`${countSavings.toLocaleString()} SAR`} sub="Real-time tracked" gradient="gradient-savings" delay={0.1} />
          <ValueKPI icon={TrendingUp} label="Portfolio Value YTD" value={`${(countYtd / 1e6).toFixed(1)}M SAR`} sub={`${sites.filter(s => s.status === "active").length} active sites`} gradient="gradient-savings" delay={0.2} />
          <ValueKPI icon={Landmark} label="10-Year Projection" value={`${(countTenYear / 1e6).toFixed(1)}M SAR`} sub="With 12% annual growth" gradient="gradient-warning" delay={0.3} />
        </div>

        {/* Cumulative Value Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Cumulative Financial Value Over Time
            </CardTitle>
            <CardDescription>30-day rolling savings trajectory</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={valueEngineData.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={4} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${(v / 1e3).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => `${v.toLocaleString()} SAR`} />
                <defs>
                  <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" fill="url(#cumGrad)" strokeWidth={2} name="Cumulative Value" />
                <Area type="monotone" dataKey="savings" stroke="hsl(var(--accent))" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Daily Savings" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Site Contributions + 10 Year */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Site Value Contributions</CardTitle>
              <CardDescription>Annual value generated per site</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={valueEngineData.siteContributions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${(v / 1e3).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="site" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={140} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => `${v.toLocaleString()} SAR`} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Annual Value (SAR)">
                    {valueEngineData.siteContributions.map((_, i) => (
                      <Cell key={i} fill={i < 3 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-warning/20 glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="h-4 w-4 text-warning" />
                10-Year Value Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-warning">{(valueEngineData.tenYearProjection / 1e6).toFixed(1)}M SAR</p>
                <p className="text-sm text-muted-foreground mt-1">Total projected enterprise value</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={tenYearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => `${v.toLocaleString()} SAR`} />
                  <defs>
                    <linearGradient id="tenYrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--warning))" fill="url(#tenYrGrad)" strokeWidth={2} name="Cumulative Value" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
