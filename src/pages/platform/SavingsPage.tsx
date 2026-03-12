import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/platform/KpiCard";
import { TrendingUp, DollarSign, Zap, Leaf, Clock, Target } from "lucide-react";
import { sites, monthlyTrends } from "@/data/mockData";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

export default function SavingsPage() {
  const totalSavings = sites.reduce((a, s) => a + s.savings_sar, 0);
  const totalBaseline = sites.reduce((a, s) => a + s.baseline_kwh, 0);
  const totalActual = sites.reduce((a, s) => a + s.consumption_kwh, 0);
  const totalKwhSaved = totalBaseline - totalActual;
  const avgEfficiency = Math.round(sites.filter(s => s.savings_pct > 0).reduce((a, s) => a + s.savings_pct, 0) / Math.max(1, sites.filter(s => s.savings_pct > 0).length) * 10) / 10;
  const totalInvestment = sites.filter(s => s.savings_pct > 0).length * 175000;
  const annualRecurring = totalSavings + sites.filter(s => s.savings_pct > 0).length * 22660;
  const payback = Math.round(totalInvestment / annualRecurring * 10) / 10;
  const carbonSaved = Math.round(totalKwhSaved * 0.000727 * 100) / 100;

  const cumulativeData = monthlyTrends.map((m, i) => ({
    month: m.month,
    savings: m.savings,
    cumulative: monthlyTrends.slice(0, i + 1).reduce((a, x) => a + x.savings, 0),
  }));

  const siteComparison = sites.filter(s => s.savings_sar > 0).sort((a, b) => b.savings_sar - a.savings_sar).slice(0, 10).map(s => ({
    site: s.name.split('—')[1]?.trim() || s.name.slice(0, 15),
    savings: s.savings_sar,
    efficiency: s.savings_pct,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Savings & ROI Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Financial analysis — baseline vs actual, ROI, payback, carbon impact</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total Savings" value={`${(totalSavings / 1000).toFixed(0)}K SAR`} icon={DollarSign} variant="savings" />
        <KpiCard title="Energy Avoided" value={`${(totalKwhSaved / 1e6).toFixed(2)}M kWh`} icon={Zap} variant="energy" />
        <KpiCard title="Avg Efficiency" value={`${avgEfficiency}%`} icon={Target} variant="savings" />
        <KpiCard title="Payback Period" value={`${payback} yrs`} icon={Clock} />
        <KpiCard title="5-Year ROI" value={`${Math.round((annualRecurring * 5 - totalInvestment) / totalInvestment * 100)}%`} icon={TrendingUp} variant="savings" />
        <KpiCard title="Carbon Reduced" value={`${carbonSaved} tCO₂`} icon={Leaf} variant="energy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Cumulative Savings</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="cumulative" stroke="hsl(152, 60%, 48%)" fill="url(#cumGrad)" strokeWidth={2} name="Cumulative Savings (SAR)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Site Savings Comparison</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={siteComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <YAxis dataKey="site" type="category" tick={{ fontSize: 9, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="savings" fill="hsl(152, 60%, 48%)" radius={[0, 4, 4, 0]} name="Savings (SAR)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
