import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sites, portfolioKPIs } from "@/data/mockData";
import { DollarSign, TrendingUp, Building2, Leaf, Target, Sparkles, BarChart3, Landmark } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCountUp } from "@/hooks/useCountUp";

function ValueCard({ icon: Icon, label, value, sub, gradient, delay = 0 }: {
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

export default function PortfolioValuePage() {
  const activeSites = sites.filter(s => s.status === "active");
  const totalSpend = portfolioKPIs.totalCost;
  const totalSavings = portfolioKPIs.totalSavings;
  const optimizationPct = Math.round((totalSavings / totalSpend) * 100 * 10) / 10;

  // 10-year projection
  const annualGrowthRate = 0.15; // 15% portfolio growth
  const savingsEscalation = 0.05; // 5% savings escalation
  const tenYearData = useMemo(() => {
    let cumSavings = 0;
    let cumValue = 0;
    return Array.from({ length: 10 }, (_, i) => {
      const year = 2025 + i;
      const portfolioSize = Math.round(activeSites.length * Math.pow(1 + annualGrowthRate, i));
      const annualSav = Math.round(totalSavings * Math.pow(1 + savingsEscalation, i) * Math.pow(1 + annualGrowthRate, i));
      cumSavings += annualSav;
      const multiplier = 5; // ESCO value multiplier
      cumValue = cumSavings * multiplier;
      return { year: String(year), savings: annualSav, cumSavings, escoValue: cumValue, sites: portfolioSize };
    });
  }, [totalSavings, activeSites.length]);

  const totalTenYearSavings = tenYearData[9].cumSavings;
  const totalEscoValue = tenYearData[9].escoValue;

  // Per-site value contribution
  const siteValues = useMemo(
    () => activeSites
      .map(s => ({
        name: s.name.replace(/—/g, "–").substring(0, 20),
        annualSavings: s.savings_sar,
        tenYearValue: s.savings_sar * 5 * 10,
        type: s.type,
      }))
      .sort((a, b) => b.annualSavings - a.annualSavings),
    [activeSites]
  );

  // Carbon value
  const carbonTons = Math.round(totalSavings / 0.3 * 0.000727);
  const carbonPricePerTon = 80; // SAR estimate
  const carbonValue = carbonTons * carbonPricePerTon;

  // Sector distribution
  const sectorData = useMemo(() => {
    const map = new Map<string, number>();
    activeSites.forEach(s => map.set(s.type, (map.get(s.type) || 0) + s.savings_sar));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [activeSites]);

  const sectorColors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--chart-purple))", "hsl(var(--chart-blue))", "hsl(var(--chart-teal))"];

  const countTotal = useCountUp(totalTenYearSavings, 2000);
  const countEsco = useCountUp(totalEscoValue, 2000);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            Energy Portfolio Value
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Translating energy optimization into financial asset value • Investor-grade projections
          </p>
        </div>

        {/* Hero KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ValueCard icon={DollarSign} label="Annual Portfolio Spend" value={`${(totalSpend / 1e6).toFixed(1)}M SAR`} sub={`${activeSites.length} active sites`} gradient="gradient-energy" delay={0} />
          <ValueCard icon={TrendingUp} label="Annual Optimization" value={`${(totalSavings / 1e3).toFixed(0)}K SAR`} sub={`${optimizationPct}% of total spend`} gradient="gradient-savings" delay={0.1} />
          <ValueCard icon={Sparkles} label="10-Year Cumulative Savings" value={`${(countTotal / 1e6).toFixed(1)}M SAR`} sub="With 15% portfolio growth" gradient="gradient-savings" delay={0.2} />
          <ValueCard icon={Landmark} label="ESCO Value Created" value={`${(countEsco / 1e6).toFixed(0)}M SAR`} sub="5× savings multiplier" gradient="gradient-warning" delay={0.3} />
        </div>

        {/* 10-Year Projection Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              10-Year Value Projection
            </CardTitle>
            <CardDescription>Cumulative savings and ESCO enterprise value growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={tenYearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => `${(v / 1e6).toFixed(2)}M SAR`} />
                <defs>
                  <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cumSavings" stroke="hsl(var(--primary))" fill="url(#savGrad)" strokeWidth={2} name="Cumulative Savings" />
                <Area type="monotone" dataKey="escoValue" stroke="hsl(var(--warning))" fill="url(#valGrad)" strokeWidth={2} name="ESCO Value" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Site Contributions + Sector Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Sites */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Site Value Contributions</CardTitle>
              <CardDescription>Annual savings by site</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={siteValues.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${(v / 1e3).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={130} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => `${v.toLocaleString()} SAR`} />
                  <Bar dataKey="annualSavings" radius={[0, 4, 4, 0]} name="Annual Savings (SAR)">
                    {siteValues.slice(0, 10).map((_, i) => (
                      <Cell key={i} fill={i < 3 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sector Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Savings by Sector</CardTitle>
              <CardDescription>Annual savings distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={sectorData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {sectorData.map((_, i) => (
                      <Cell key={i} fill={sectorColors[i % sectorColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => `${(v / 1e3).toFixed(0)}K SAR`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <CardContent className="pt-0 pb-4 flex flex-wrap gap-2 justify-center">
              {sectorData.map((s, i) => (
                <Badge key={s.name} variant="outline" className="text-xs gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: sectorColors[i % sectorColors.length] }} />
                  {s.name}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Carbon + Investor Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl gradient-savings flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carbon Credits Value</p>
                  <p className="text-2xl font-bold text-foreground">{carbonValue.toLocaleString()} SAR/yr</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xl font-bold text-primary">{carbonTons}</p>
                  <p className="text-xs text-muted-foreground">Tons CO₂ reduced</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xl font-bold text-primary">{Math.round(carbonTons * 1000 / 22)}</p>
                  <p className="text-xs text-muted-foreground">Trees equivalent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/20 glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl gradient-warning flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Investor Summary</p>
                  <p className="text-lg font-bold text-foreground">Portfolio Valuation Model</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ["Annual Energy Spend", `${(totalSpend / 1e6).toFixed(1)}M SAR`],
                  ["Proven Savings Rate", `${optimizationPct}%`],
                  ["10-Yr Savings Projection", `${(totalTenYearSavings / 1e6).toFixed(1)}M SAR`],
                  ["ESCO Enterprise Value", `${(totalEscoValue / 1e6).toFixed(0)}M SAR`],
                  ["Carbon Credits (Annual)", `${carbonValue.toLocaleString()} SAR`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
