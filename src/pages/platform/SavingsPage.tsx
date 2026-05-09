import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/platform/KpiCard";
import { TrendingUp, DollarSign, Zap, Leaf, Clock, Target, Building2, Wrench } from "lucide-react";
import { sites, monthlyTrends } from "@/data/mockData";
import { LockedFinancials, ClimateConstants } from "@/data/lockedPerformanceModel";
import { maintenanceSavings, downtimeSavings, calculateROI, energySavings, systemConfig, lifespanExtension, acReplacementCosts, environmentalImpact } from "@/data/roiCalculations";
import { showroomsData, totalYearlySavings25, totalYearlySavings30, totalConsumption, totalUnits } from "@/data/savingsData";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const chartTooltipStyle = { background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(215, 20%, 16%)";
const tickStyle = { fontSize: 10, fill: 'hsl(215, 15%, 55%)' };

export default function SavingsPage() {
  const totalSavings = LockedFinancials.directEnergySavingsSAR;
  const totalBaseline = sites.reduce((a, s) => a + s.baseline_kwh, 0);
  const totalActual = sites.reduce((a, s) => a + s.consumption_kwh, 0);
  const totalKwhSaved = LockedFinancials.weatherAdjustedEnergyAvoided;
  const avgEfficiency = LockedFinancials.efficiencyImprovement;
  const totalInvestment = LockedFinancials.systemInvestment;
  const annualRecurring = LockedFinancials.annualRecurringSavings;
  const payback = Math.round(totalInvestment / annualRecurring * 10) / 10;
  const carbonSaved = Math.round(totalKwhSaved * 0.000727 * 100) / 100;

  const roi = calculateROI();

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

  const showroomChartData = showroomsData.map(s => ({
    name: s.name.replace(' Showroom', '').slice(0, 12),
    savings25: s.yearlySavings25,
    savings30: s.yearlySavings30,
    consumption: Math.round(s.totalConsumption / 1000),
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

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="bg-secondary h-9">
          <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
          <TabsTrigger value="showrooms" className="text-xs">Showroom Fleet (20)</TabsTrigger>
          <TabsTrigger value="rawdah-roi" className="text-xs">Rawdah ROI</TabsTrigger>
          <TabsTrigger value="maintenance" className="text-xs">Maintenance Savings</TabsTrigger>
          <TabsTrigger value="environmental" className="text-xs">Environmental</TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
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
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={chartTooltipStyle} />
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
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <YAxis dataKey="site" type="category" tick={{ fontSize: 9, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="savings" fill="hsl(152, 60%, 48%)" radius={[0, 4, 4, 0]} name="Savings (SAR)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Showroom Fleet Tab */}
        <TabsContent value="showrooms" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="Total Showrooms" value="20" icon={Building2} />
            <KpiCard title="Total AC Units" value={String(totalUnits)} icon={Zap} variant="energy" />
            <KpiCard title="Savings @25%" value={`${(totalYearlySavings25 / 1000).toFixed(0)}K SAR`} icon={DollarSign} variant="savings" />
            <KpiCard title="Savings @30%" value={`${(totalYearlySavings30 / 1000).toFixed(0)}K SAR`} icon={TrendingUp} variant="savings" />
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Showroom Projected Savings (25% vs 30%)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={showroomChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="savings25" fill="hsl(152, 60%, 48%)" radius={[3, 3, 0, 0]} name="Savings @25% (SAR)" />
                  <Bar dataKey="savings30" fill="hsl(192, 70%, 50%)" radius={[3, 3, 0, 0]} name="Savings @30% (SAR)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Full Showroom Fleet Data</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sticky top-0 bg-card">#</TableHead>
                      <TableHead className="text-xs sticky top-0 bg-card">Showroom</TableHead>
                      <TableHead className="text-xs sticky top-0 bg-card">Units</TableHead>
                      <TableHead className="text-xs text-right sticky top-0 bg-card">Consumption</TableHead>
                      <TableHead className="text-xs text-right sticky top-0 bg-card">Savings @25%</TableHead>
                      <TableHead className="text-xs text-right sticky top-0 bg-card">Savings @30%</TableHead>
                      <TableHead className="text-xs text-right sticky top-0 bg-card">Monthly Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {showroomsData.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="text-xs font-medium">{s.name}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{s.units}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{(s.totalConsumption / 1000).toFixed(0)}K kWh</TableCell>
                        <TableCell className="text-xs text-right font-mono text-savings">{s.yearlySavings25.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-mono text-savings">{s.yearlySavings30.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{s.monthlySavings25.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold border-t-2">
                      <TableCell></TableCell>
                      <TableCell className="text-xs">TOTAL</TableCell>
                      <TableCell className="text-[10px]">{totalUnits} units</TableCell>
                      <TableCell className="text-xs text-right font-mono">{(totalConsumption / 1e6).toFixed(1)}M kWh</TableCell>
                      <TableCell className="text-xs text-right font-mono text-savings">{totalYearlySavings25.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-savings">{totalYearlySavings30.toLocaleString()}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rawdah ROI Tab */}
        <TabsContent value="rawdah-roi" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="Investment" value={`${systemConfig.totalSystemCost.toLocaleString()} SAR`} icon={DollarSign} />
            <KpiCard title="Annual Recurring" value={`${LockedFinancials.annualRecurringSavings.toLocaleString()} SAR`} icon={TrendingUp} variant="savings" />
            <KpiCard title="Payback" value={`${LockedFinancials.paybackYearsCombined.toFixed(1)} yrs`} icon={Clock} variant="energy" />
            <KpiCard title="10-Year ROI" value={`${LockedFinancials.tenYearROI.toFixed(0)}%`} icon={Target} variant="savings" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Energy Savings', value: roi.breakdownByCategory.energy.annual, sub: `${LockedFinancials.efficiencyImprovement}% efficiency` },
              { label: 'Maintenance Savings', value: roi.breakdownByCategory.maintenance.annual, sub: '6 categories' },
              { label: 'Downtime Avoidance', value: roi.breakdownByCategory.downtime.annual, sub: '15 hrs/yr avoided' },
            ].map((item, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold text-savings">{item.value.toLocaleString()} SAR</p>
                  <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">5-Year Projection</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Operational Savings</span><span className="font-mono font-bold">{roi.fiveYearOperationalSavings.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Replacement Savings (prorated)</span><span className="font-mono font-bold">{roi.fiveYearReplacementSavings.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Investment</span><span className="font-mono">−{roi.systemCost.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-xs border-t border-border pt-2"><span className="font-medium">Net Profit</span><span className="font-mono font-bold text-savings">{roi.fiveYearNetProfit.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-xs"><span className="font-medium">ROI</span><span className="font-mono font-bold text-savings">{roi.fiveYearROI.toFixed(0)}%</span></div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">10-Year Projection</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Operational Savings</span><span className="font-mono font-bold">{roi.tenYearOperationalSavings.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Replacement Savings (full)</span><span className="font-mono font-bold">{roi.tenYearReplacementSavings.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Investment</span><span className="font-mono">−{roi.systemCost.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-xs border-t border-border pt-2"><span className="font-medium">Net Profit</span><span className="font-mono font-bold text-savings">{roi.tenYearNetProfit.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-xs"><span className="font-medium">ROI</span><span className="font-mono font-bold text-savings">{roi.tenYearROI.toFixed(0)}%</span></div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">AC Replacement Savings</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-secondary rounded-lg p-3"><p className="text-[10px] text-muted-foreground">Normal Lifespan</p><p className="text-sm font-bold">{lifespanExtension.normalLifespan} yrs</p></div>
                <div className="bg-secondary rounded-lg p-3"><p className="text-[10px] text-muted-foreground">Extended Lifespan</p><p className="text-sm font-bold text-savings">{lifespanExtension.extendedLifespan} yrs</p></div>
                <div className="bg-secondary rounded-lg p-3"><p className="text-[10px] text-muted-foreground">Cost per Replacement</p><p className="text-sm font-bold">{acReplacementCosts.minCostPerUnit.toLocaleString()}–{acReplacementCosts.maxCostPerUnit.toLocaleString()} SAR</p></div>
                <div className="bg-secondary rounded-lg p-3"><p className="text-[10px] text-muted-foreground">Total Avoided</p><p className="text-sm font-bold text-savings">{roi.replacementDetails.totalSavingsAvg.toLocaleString()} SAR</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" />Maintenance Cost Breakdown (Rawdah — 7 Units)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs text-right">Without SCC</TableHead>
                  <TableHead className="text-xs text-right">With SCC</TableHead>
                  <TableHead className="text-xs text-right">Savings</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {maintenanceSavings.map(m => (
                    <TableRow key={m.category}>
                      <TableCell className="text-xs font-medium">{m.category}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[200px]">{m.description}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{m.withoutSystem.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{m.withSystem.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-savings">{m.annualSavings.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell className="text-xs" colSpan={2}>Total</TableCell>
                    <TableCell className="text-xs text-right font-mono">{maintenanceSavings.reduce((a, m) => a + m.withoutSystem, 0).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{maintenanceSavings.reduce((a, m) => a + m.withSystem, 0).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-savings">{maintenanceSavings.reduce((a, m) => a + m.annualSavings, 0).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Maintenance Notes</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {maintenanceSavings.map(m => (
                <div key={m.category} className="bg-secondary rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary">{m.category}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{m.notes}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environmental Tab */}
        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="Annual CO₂ Saved" value={`${environmentalImpact.annualCo2SavedTons} t`} icon={Leaf} variant="savings" />
            <KpiCard title="5-Year CO₂" value={`${environmentalImpact.fiveYearCo2Tons} t`} icon={Leaf} variant="energy" />
            <KpiCard title="Trees Equivalent" value={String(environmentalImpact.treesEquivalent)} icon={Leaf} variant="savings" />
            <KpiCard title="kWh Saved/yr" value={`${environmentalImpact.annualKwhSaved.toLocaleString()}`} icon={Zap} variant="energy" />
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="bg-secondary rounded-lg p-4 space-y-2">
                <p className="text-sm font-bold">Environmental Impact Summary</p>
                <p className="text-xs text-muted-foreground">CO₂ factor: {environmentalImpact.co2FactorKgPerKwh} kg/kWh (Saudi grid) · Tree absorption: {environmentalImpact.treeCo2AbsorptionKgPerYear} kg/year</p>
                <p className="text-xs text-muted-foreground">Annual energy saved: {environmentalImpact.annualKwhSaved.toLocaleString()} kWh → {environmentalImpact.annualCo2SavedKg.toLocaleString()} kg CO₂ → equivalent to {environmentalImpact.treesEquivalent} mature trees</p>
                <p className="text-xs text-muted-foreground">10-year projection: {environmentalImpact.tenYearCo2Tons} tonnes CO₂ avoided</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}