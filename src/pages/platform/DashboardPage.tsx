import { Zap, MapPin, Cpu, TrendingUp, DollarSign, Leaf, Bell, FolderKanban, Box, Activity } from "lucide-react";
import { AnimatedKpiCard } from "@/components/platform/AnimatedKpiCard";
import { portfolioKPIs, monthlyTrends, sites, alerts, projects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CoolingForecast } from "@/components/platform/CoolingForecast";

export default function DashboardPage() {
  const kpis = portfolioKPIs;
  const topSites = [...sites].filter(s => s.savings_sar > 0).sort((a, b) => b.savings_sar - a.savings_sar).slice(0, 5);
  const topConsuming = [...sites].sort((a, b) => b.consumption_kwh - a.consumption_kwh).slice(0, 5);
  const recentAlerts = [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Portfolio overview — {kpis.activeSites} active sites monitored</p>
      </div>

      {/* Animated KPI row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <AnimatedKpiCard title="Total Consumption" value={Number((kpis.totalConsumption / 1e6).toFixed(1))} suffix="M kWh" decimals={1} icon={Zap} variant="energy" trend={{ value: "4.2% vs last year", positive: false }} delay={0} />
        <AnimatedKpiCard title="Total Cost" value={Number((kpis.totalCost / 1e6).toFixed(2))} suffix="M SAR" decimals={2} icon={DollarSign} subtitle="Annual portfolio cost" delay={100} />
        <AnimatedKpiCard title="Total Savings" value={Number((kpis.totalSavings / 1000).toFixed(0))} suffix="K SAR" icon={TrendingUp} variant="savings" trend={{ value: "12.3% improvement", positive: true }} delay={200} />
        <AnimatedKpiCard title="Active Sites" value={kpis.activeSites} suffix={` / ${kpis.totalSites}`} icon={MapPin} subtitle={`${kpis.totalSites - kpis.activeSites} pending`} delay={300} />
        <AnimatedKpiCard title="Active Alerts" value={kpis.activeAlerts} icon={Bell} variant={kpis.criticalAlerts > 0 ? 'danger' : 'warning'} subtitle={`${kpis.criticalAlerts} critical`} delay={400} />
      </div>

      {/* Animated KPI row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnimatedKpiCard title="Connected Devices" value={kpis.onlineDevices} suffix={` / ${kpis.totalDevices}`} icon={Cpu} delay={500} />
        <AnimatedKpiCard title="Assets Optimized" value={kpis.optimizedAssets} suffix={` / ${kpis.totalAssets}`} icon={Box} variant="savings" delay={600} />
        <AnimatedKpiCard title="Carbon Reduced" value={kpis.carbonReduction} suffix=" tCO₂" decimals={2} icon={Leaf} variant="energy" delay={700} />
        <AnimatedKpiCard title="Open Projects" value={kpis.openProjects} icon={FolderKanban} delay={800} />
      </div>

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

        {/* Predictive Cooling Forecast */}
        <CoolingForecast />
      </div>

      {/* Cost trend */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Monthly Cost Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="cost" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} name="Cost (SAR)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Saving Sites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSites.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <span className="truncate">{s.name}</span>
                </div>
                <span className="text-savings font-mono text-xs font-medium">{s.savings_sar.toLocaleString()} SAR</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Consuming Sites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topConsuming.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <span className="truncate">{s.name}</span>
                </div>
                <span className="text-energy font-mono text-xs font-medium">{(s.consumption_kwh / 1000).toFixed(0)}K kWh</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Recent Alerts
              <Badge variant="destructive" className="text-[9px] h-4">{alerts.filter(a => !a.acknowledged).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map(a => (
              <div key={a.id} className="flex items-start gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${a.severity === 'critical' ? 'bg-destructive' : a.severity === 'warning' ? 'bg-warning' : 'bg-energy'}`} />
                <div className="min-w-0">
                  <p className="text-xs truncate">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground">{a.siteName}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
