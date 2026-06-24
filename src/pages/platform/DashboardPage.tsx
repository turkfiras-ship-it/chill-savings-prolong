import { Zap, MapPin, Cpu, TrendingUp, DollarSign, Leaf, Bell, FolderKanban, Box, Activity, Shield } from "lucide-react";
import { AnimatedKpiCard } from "@/components/platform/AnimatedKpiCard";
import { portfolioKPIs, monthlyTrends, sites, alerts, projects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { CoolingForecast } from "@/components/platform/CoolingForecast";
import { PortfolioHealthRing } from "@/components/platform/PortfolioHealthRing";
import { SystemUptimeBar } from "@/components/platform/SystemUptimeBar";
import { PageTransition } from "@/components/platform/PageTransition";
import { LockedFinancials } from "@/data/lockedPerformanceModel";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUnitIntel } from "@/hooks/useUnitIntel";
import { useMemo } from "react";

// Generate sparkline data from monthly trends
const consumptionSpark = monthlyTrends.map(m => ({ value: m.consumption }));
const costSpark = monthlyTrends.map(m => ({ value: m.cost }));
const savingsSpark = monthlyTrends.map(m => ({ value: m.savings }));
const demandSpark = monthlyTrends.map(m => ({ value: m.demand }));

// Site type distribution for pie chart
const siteTypeData = Object.entries(
  sites.reduce((acc, s) => { acc[s.type] = (acc[s.type] || 0) + 1; return acc; }, {} as Record<string, number>)
).map(([name, value]) => ({ name, value }));

const PIE_COLORS = [
  'hsl(152, 60%, 48%)', 'hsl(192, 70%, 50%)', 'hsl(210, 80%, 55%)',
  'hsl(38, 92%, 50%)', 'hsl(270, 60%, 55%)', 'hsl(175, 70%, 45%)',
  'hsl(0, 72%, 51%)', 'hsl(25, 95%, 53%)',
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const kpis = portfolioKPIs;
  const topSites = [...sites].filter(s => s.savings_sar > 0).sort((a, b) => b.savings_sar - a.savings_sar).slice(0, 5);
  const topConsuming = [...sites].sort((a, b) => b.consumption_kwh - a.consumption_kwh).slice(0, 5);
  const intel = useUnitIntel();

  // Live alerts derived from the real statistical anomaly engine (|z| >= 2 on daily_unit_readings).
  const liveAlerts = useMemo(() => {
    return [...intel.anomalies]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map(a => ({
        id: `${a.unit}-${a.date}`,
        severity: a.severity === "Critical" ? "critical" : a.severity === "High" ? "warning" : "info",
        message: `${a.unit}: ${a.kwh.toFixed(0)} kWh vs expected ${a.expected.toFixed(0)} (${a.sigma.toFixed(1)}σ) — ${a.reason}`,
        siteName: "Jarir — Rawdah",
        timestamp: `${a.date}T12:00:00Z`,
      }));
  }, [intel.anomalies]);
  const activeAlertsCount = intel.anomalies.length;
  const criticalAlertsCount = intel.anomalies.filter(a => a.severity === "Critical").length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Jarir Rawdah overview — {kpis.activeSites} active site monitored</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-savings pulse-dot" />
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
        </div>

        {/* Animated KPI row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <AnimatedKpiCard title="Total Consumption" value={Number((kpis.totalConsumption / 1e6).toFixed(1))} suffix="M kWh" decimals={1} icon={Zap} variant="energy" trend={{ value: "4.2% vs last year", positive: false }} delay={0} sparkline={consumptionSpark} />
          <AnimatedKpiCard title="Total Cost" value={Number((kpis.totalCost / 1e6).toFixed(2))} suffix="M SAR" decimals={2} icon={DollarSign} subtitle="Annual portfolio cost" delay={100} sparkline={costSpark} />
          <AnimatedKpiCard title="Total Savings" value={Number((kpis.totalSavings / 1000).toFixed(0))} suffix="K SAR" icon={TrendingUp} variant="savings" trend={{ value: `${LockedFinancials.efficiencyImprovement}% savings`, positive: true }} delay={200} sparkline={savingsSpark} />
          <AnimatedKpiCard title="Active Sites" value={kpis.activeSites} suffix={` / ${kpis.totalSites}`} icon={MapPin} subtitle={`${kpis.totalSites - kpis.activeSites} pending`} delay={300} />
          <AnimatedKpiCard title="Active Alerts" value={activeAlertsCount} icon={Bell} variant={criticalAlertsCount > 0 ? 'danger' : 'warning'} subtitle={intel.loading ? 'scanning…' : `${criticalAlertsCount} critical`} delay={400} />
        </div>

        {/* Animated KPI row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AnimatedKpiCard title="Units Monitored" value={kpis.onlineDevices} suffix={` / ${kpis.totalDevices}`} icon={Cpu} delay={500} />
          <AnimatedKpiCard title="Assets Optimized" value={kpis.optimizedAssets} suffix={` / ${kpis.totalAssets}`} icon={Box} variant="savings" delay={600} />
          <AnimatedKpiCard title="Carbon Reduced" value={kpis.carbonReduction} suffix=" tCO₂" decimals={2} icon={Leaf} variant="energy" delay={700} />
          <AnimatedKpiCard title="Open Projects" value={kpis.openProjects} icon={FolderKanban} delay={800} />
        </div>

        {/* System Uptime */}
        <SystemUptimeBar />

        {/* Charts + Cooling Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Consumption & Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(192, 70%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(192, 70%, 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="consumption" stroke="hsl(192, 70%, 50%)" fill="url(#cGrad)" strokeWidth={2} name="Consumption (kWh)" />
                  <Area type="monotone" dataKey="savings" stroke="hsl(152, 60%, 48%)" fill="url(#sGrad)" strokeWidth={2} name="Savings (SAR)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <CoolingForecast />
        </div>

        {/* Health Ring + Site Type Distribution + Cost Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PortfolioHealthRing />

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Site Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={siteTypeData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} strokeWidth={0}>
                      {siteTypeData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {siteTypeData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-foreground">{d.name}</span>
                      <span className="text-muted-foreground font-mono ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="cost" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} name="Cost (SAR)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboards + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-savings" />
                Top Saving Sites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topSites.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between text-sm cursor-pointer hover:bg-secondary/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
                  onClick={() => navigate(`/sites/${s.id}`)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="h-1.5 rounded-full bg-savings/30 flex-1 max-w-[60px]">
                      <motion.div
                        className="h-full rounded-full bg-savings"
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.savings_sar / topSites[0].savings_sar) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      />
                    </div>
                    <span className="truncate text-xs">{s.name}</span>
                  </div>
                  <span className="text-savings font-mono text-xs font-medium">{s.savings_sar.toLocaleString()} SAR</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-energy" />
                Top Consuming Sites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topConsuming.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between text-sm cursor-pointer hover:bg-secondary/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
                  onClick={() => navigate(`/sites/${s.id}`)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="h-1.5 rounded-full bg-energy/30 flex-1 max-w-[60px]">
                      <motion.div
                        className="h-full rounded-full bg-energy"
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.consumption_kwh / topConsuming[0].consumption_kwh) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      />
                    </div>
                    <span className="truncate text-xs">{s.name}</span>
                  </div>
                  <span className="text-energy font-mono text-xs font-medium">{(s.consumption_kwh / 1000).toFixed(0)}K kWh</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Recent Alerts
                <Badge variant="destructive" className="text-[9px] h-4">{activeAlertsCount}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {liveAlerts.length === 0 && (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  {intel.loading ? 'Scanning unit readings…' : 'No anomalies detected (|z| ≥ 2)'}
                </div>
              )}
              {liveAlerts.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 text-sm hover:bg-secondary/50 rounded-md px-2 py-1.5 -mx-2 transition-colors cursor-pointer"
                >
                  <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${a.severity === 'critical' ? 'bg-destructive animate-pulse' : a.severity === 'warning' ? 'bg-warning' : 'bg-energy'}`} />
                  <div className="min-w-0">
                    <p className="text-xs truncate">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground">{a.siteName} · {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
