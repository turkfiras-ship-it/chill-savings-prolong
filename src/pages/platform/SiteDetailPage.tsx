import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/platform/KpiCard";
import { sites } from "@/data/mockData";
import { yearlyComparisonData, energyCostSummary, demandSnapshots, unitComparisons, monthlyComparisonData, unitPerformanceObservations, maintenanceNotes, monthlyIssues, equipmentRepairs, rawdahInsights, comparisonInsights } from "@/data/rawdahAnalysis";
import { unitMonthlyData2025, unitAnnualTotals, unitInfo, unitNames, g8MonthlyCost } from "@/data/unitMonthlyData";
import { monthlyWeatherData, weatherSummary } from "@/data/weatherData";
import { overallFinancialImpact, majorSavingMonths, energyCostComparison, managementConclusion } from "@/data/financialImpact";
import { LockedFinancials, ClimateConstants } from "@/data/lockedPerformanceModel";
import { maintenanceSavings, downtimeSavings, calculateROI, energySavings, systemConfig } from "@/data/roiCalculations";
import { ArrowLeft, MapPin, Zap, DollarSign, TrendingUp, Activity, Thermometer, Wrench, AlertTriangle, BarChart3, Building2, Target } from "lucide-react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const chartTooltipStyle = { background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(215, 20%, 16%)";
const tickStyle = { fontSize: 10, fill: 'hsl(215, 15%, 55%)' };

export default function SiteDetailPage() {
  const { id } = useParams();
  const site = sites.find(s => s.id === id);
  const isRawdah = id === 'S001';

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold">Site Not Found</h2>
        <Link to="/sites"><Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" />Back to Sites</Button></Link>
      </div>
    );
  }

  const roi = isRawdah ? calculateROI() : null;

  const yoyChartData = isRawdah ? yearlyComparisonData.map(d => ({
    month: d.month.slice(0, 3),
    '2024': Math.round(d.year2024),
    '2025': Math.round(d.year2025),
    savings: Math.max(0, Math.round(d.savingsSAR)),
  })) : [];

  const unitChartData = isRawdah ? unitMonthlyData2025.map(d => ({
    month: d.month.slice(0, 3),
    G1: d.G1, G2: d.G2, G3: d.G3, F1: d.F1, F2: d.F2, F3: d.F3, F4: d.F4,
  })) : [];

  const demandChartData = isRawdah ? demandSnapshots.map(d => ({
    label: d.year.toString(),
    consumption: d.totalDailyConsumption,
    avgKwh: d.avgKwh,
  })) : [];

  const weatherChartData = isRawdah ? monthlyWeatherData.map(d => ({
    month: d.month.slice(0, 3),
    '2024': d.avgTemp2024,
    '2025': d.avgTemp2025,
    diff: d.tempDiff,
  })) : [];

  const rubenVsRawdah = isRawdah ? monthlyComparisonData.map(d => ({
    month: d.month.slice(0, 3),
    Ruben: Math.round(d.ruben),
    Rawdah: Math.round(d.rawdah),
  })) : [];

  const unitColors = ['hsl(192, 70%, 50%)', 'hsl(152, 60%, 48%)', 'hsl(210, 80%, 55%)', 'hsl(38, 92%, 50%)', 'hsl(280, 60%, 55%)', 'hsl(0, 70%, 55%)', 'hsl(160, 50%, 60%)'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/sites"><Button variant="ghost" size="sm" className="h-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{site.name}</h1>
            <Badge className={site.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'}>{site.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{site.city} · {site.customer} · {site.projectStage}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiCard title="Consumption" value={`${(site.consumption_kwh / 1000).toFixed(0)}K kWh`} icon={Zap} variant="energy" />
        <KpiCard title="Annual Cost" value={`${site.cost_sar.toLocaleString()} SAR`} icon={DollarSign} />
        <KpiCard title="Savings" value={`${site.savings_sar.toLocaleString()} SAR`} icon={TrendingUp} variant="savings" />
        <KpiCard title="Efficiency" value={`${site.savings_pct}%`} icon={Target} variant="savings" />
        <KpiCard title="Peak Demand" value={`${site.peak_kw} kW`} icon={Activity} variant="warning" />
        <KpiCard title="Current Demand" value={`${site.demand_kw} kW`} icon={Activity} variant="energy" />
      </div>

      {isRawdah ? (
        <Tabs defaultValue="yoy" className="space-y-4">
          <TabsList className="bg-secondary h-9">
            <TabsTrigger value="yoy" className="text-xs">YoY Billing</TabsTrigger>
            <TabsTrigger value="units" className="text-xs">Unit Performance</TabsTrigger>
            <TabsTrigger value="demand" className="text-xs">Demand Analysis</TabsTrigger>
            <TabsTrigger value="weather" className="text-xs">Weather Impact</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs">Rawdah vs Ruben</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">Maintenance</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs">Financial Summary</TabsTrigger>
          </TabsList>

          {/* YoY Billing Tab */}
          <TabsContent value="yoy" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="bg-card border-border"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground mb-1">2023 Bill</p><p className="text-lg font-bold">{energyCostSummary.totalBill2023.toLocaleString()} SAR</p></CardContent></Card>
              <Card className="bg-card border-border"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground mb-1">2024 Bill</p><p className="text-lg font-bold">{energyCostSummary.totalBill2024.toLocaleString()} SAR</p><p className="text-[10px] text-destructive">+{energyCostSummary.yearOverYearIncrease2024}%</p></CardContent></Card>
              <Card className="bg-card border-border"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground mb-1">2025 Bill</p><p className="text-lg font-bold">{energyCostSummary.totalBill2025.toLocaleString()} SAR</p><p className="text-[10px] text-savings">-{energyCostSummary.yearlySavingsPercent}%</p></CardContent></Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Monthly Cost — 2024 vs 2025</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={yoyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="2024" fill="hsl(210, 80%, 55%)" radius={[3, 3, 0, 0]} opacity={0.6} />
                    <Bar dataKey="2025" fill="hsl(152, 60%, 48%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">YoY Monthly Comparison</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Month</TableHead>
                      <TableHead className="text-xs text-right">2024 (SAR)</TableHead>
                      <TableHead className="text-xs text-right">2025 (SAR)</TableHead>
                      <TableHead className="text-xs text-right">Diff %</TableHead>
                      <TableHead className="text-xs text-right">Savings (SAR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyComparisonData.map(d => (
                      <TableRow key={d.month}>
                        <TableCell className="text-xs">{d.month}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{d.year2024.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{d.year2025.toLocaleString()}</TableCell>
                        <TableCell className={`text-xs text-right font-mono ${d.percentDiff > 0 ? 'text-savings' : 'text-destructive'}`}>{d.percentDiff > 0 ? '+' : ''}{d.percentDiff.toFixed(1)}%</TableCell>
                        <TableCell className="text-xs text-right font-mono text-savings">{d.savingsSAR > 0 ? d.savingsSAR.toLocaleString() : '—'}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold border-t-2">
                      <TableCell className="text-xs">Total</TableCell>
                      <TableCell className="text-xs text-right font-mono">{energyCostSummary.totalBill2024.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{energyCostSummary.totalBill2025.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-savings">-{energyCostSummary.yearlySavingsPercent}%</TableCell>
                      <TableCell className="text-xs text-right font-mono text-savings">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Key Insights</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {rawdahInsights.map((ins, i) => (
                  <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <p>{ins}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unit Performance Tab */}
          <TabsContent value="units" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Unit Monthly Consumption (kWh) — G1 to F4</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={unitChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    {unitNames.map((u, i) => (
                      <Area key={u} type="monotone" dataKey={u} stroke={unitColors[i]} fill={unitColors[i]} fillOpacity={0.1} strokeWidth={1.5} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Annual Totals by Unit (kWh)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={unitNames.map(u => ({ unit: u, kwh: unitAnnualTotals[u as keyof typeof unitAnnualTotals] as number }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis dataKey="unit" tick={tickStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="kwh" fill="hsl(192, 70%, 50%)" radius={[4, 4, 0, 0]} name="Annual kWh" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Unit Info & Notes</CardTitle></CardHeader>
                <CardContent className="space-y-3 max-h-[250px] overflow-auto">
                  {unitNames.map(u => (
                    <div key={u} className="border-b border-border pb-2 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">{u}</span>
                        <span className="text-[10px] text-muted-foreground">{unitInfo[u]?.location}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{unitInfo[u]?.notes}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Unit YoY Reduction (Oct Snapshots)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Unit</TableHead>
                      <TableHead className="text-xs text-right">2024 kW</TableHead>
                      <TableHead className="text-xs text-right">2025 kW</TableHead>
                      <TableHead className="text-xs text-right">Reduction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unitComparisons.map(u => (
                      <TableRow key={u.unit}>
                        <TableCell className="text-xs font-medium">{u.unit}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{u.kw2024}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{u.kw2025}</TableCell>
                        <TableCell className="text-xs text-right font-mono text-savings">{u.reduction}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" />Unit Performance Observations</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {unitPerformanceObservations.map((o, i) => (
                  <div key={i} className="bg-secondary rounded-lg p-3">
                    <p className="text-xs font-semibold text-primary mb-1">{o.unit}</p>
                    <p className="text-xs text-muted-foreground">{o.issue}</p>
                    {o.recommendation && <p className="text-xs text-savings mt-1">→ {o.recommendation}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demand Analysis Tab */}
          <TabsContent value="demand" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Peak Demand Reduction — Before/After SCC</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={demandChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} unit=" kW" />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="consumption" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Daily Peak (kW)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {demandSnapshots.map(d => (
                <Card key={d.date} className={`bg-card border-border ${d.status === 'optimized' ? 'border-primary/30' : ''}`}>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="text-[9px] mb-2">{d.label}</Badge>
                    <p className="text-2xl font-bold">{d.totalDailyConsumption} kW</p>
                    <p className="text-xs text-muted-foreground">Avg: {d.avgKwh} kWh · {d.date}</p>
                    {d.status === 'optimized' && <p className="text-xs text-savings mt-1 font-medium">61.8% reduction from baseline</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Weather Impact Tab */}
          <TabsContent value="weather" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <KpiCard title="Avg Temp Increase" value={`+${weatherSummary.avgTempDiff}°C`} icon={Thermometer} variant="warning" />
              <KpiCard title="Normalization Factor" value={`×${ClimateConstants.weatherNormalizationFactor}`} icon={BarChart3} variant="energy" />
              <KpiCard title="True Adjusted Savings" value={`${LockedFinancials.directEnergySavingsSAR.toLocaleString()} SAR`} icon={DollarSign} variant="savings" />
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Temperature Comparison — 2024 vs 2025</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weatherChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} unit="°C" />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="2024" stroke="hsl(210, 80%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="2024 (°C)" />
                    <Line type="monotone" dataKey="2025" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="2025 (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Weather Normalization Logic</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="bg-secondary rounded-lg p-3 space-y-2 text-xs">
                  <p><span className="text-primary font-medium">Expected 2025 Bill (without SCC):</span> {LockedFinancials.actualBill2024.toLocaleString()} × {ClimateConstants.weatherNormalizationFactor} = <span className="font-bold">{LockedFinancials.expectedBill2025WithoutSCC.toLocaleString()} SAR</span></p>
                  <p><span className="text-primary font-medium">Actual 2025 Bill:</span> <span className="font-bold">{LockedFinancials.actualBill2025.toLocaleString()} SAR</span></p>
                  <p><span className="text-savings font-medium">True Adjusted Savings:</span> {LockedFinancials.expectedBill2025WithoutSCC.toLocaleString()} − {LockedFinancials.actualBill2025.toLocaleString()} = <span className="font-bold text-savings">{LockedFinancials.directEnergySavingsSAR.toLocaleString()} SAR</span></p>
                  <p><span className="text-savings font-medium">Efficiency Improvement:</span> <span className="font-bold text-savings">{LockedFinancials.efficiencyImprovement}%</span> ({LockedFinancials.weatherAdjustedEnergyAvoided.toLocaleString()} kWh avoided)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Monthly Temperature Data</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Month</TableHead>
                    <TableHead className="text-xs text-right">2024 °C</TableHead>
                    <TableHead className="text-xs text-right">2025 °C</TableHead>
                    <TableHead className="text-xs text-right">Diff °C</TableHead>
                    <TableHead className="text-xs">Note</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {monthlyWeatherData.map(d => (
                      <TableRow key={d.month}>
                        <TableCell className="text-xs">{d.month}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{d.avgTemp2024}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{d.avgTemp2025}</TableCell>
                        <TableCell className="text-xs text-right font-mono text-warning">+{d.tempDiff}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{d.note || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rawdah vs Ruben Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Rawdah vs Ruben — Monthly Consumption (SAR)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rubenVsRawdah}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Ruben" fill="hsl(210, 80%, 55%)" opacity={0.5} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Rawdah" fill="hsl(152, 60%, 48%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Comparison Table</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Month</TableHead>
                    <TableHead className="text-xs text-right">Ruben (SAR)</TableHead>
                    <TableHead className="text-xs text-right">Rawdah (SAR)</TableHead>
                    <TableHead className="text-xs text-right">Diff %</TableHead>
                    <TableHead className="text-xs text-right">Savings</TableHead>
                    <TableHead className="text-xs">Winner</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {monthlyComparisonData.map(d => (
                      <TableRow key={d.month}>
                        <TableCell className="text-xs">{d.month}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{d.ruben.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{d.rawdah.toLocaleString()}</TableCell>
                        <TableCell className={`text-xs text-right font-mono ${d.difference > 0 ? 'text-savings' : 'text-destructive'}`}>{d.difference > 0 ? '+' : ''}{d.difference}%</TableCell>
                        <TableCell className="text-xs text-right font-mono text-savings">{d.savingsSAR > 0 ? d.savingsSAR.toLocaleString() : '—'}</TableCell>
                        <TableCell><Badge variant="outline" className={`text-[9px] ${d.winner === 'RAWDAH' ? 'border-primary/50 text-savings' : 'text-muted-foreground'}`}>{d.winner}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Comparison Insights</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {comparisonInsights.map((ins, i) => (
                  <div key={i} className="flex gap-2 text-xs text-muted-foreground"><span className="text-savings mt-0.5">•</span><p>{ins}</p></div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" />Maintenance Cost Breakdown</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs text-right">Without SCC</TableHead>
                    <TableHead className="text-xs text-right">With SCC</TableHead>
                    <TableHead className="text-xs text-right">Savings</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {maintenanceSavings.map(m => (
                      <TableRow key={m.category}>
                        <TableCell className="text-xs"><p className="font-medium">{m.category}</p><p className="text-[10px] text-muted-foreground">{m.description}</p></TableCell>
                        <TableCell className="text-xs text-right font-mono">{m.withoutSystem.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{m.withSystem.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-mono text-savings">{m.annualSavings.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold border-t-2">
                      <TableCell className="text-xs">Total Maintenance</TableCell>
                      <TableCell className="text-xs text-right font-mono">{maintenanceSavings.reduce((a, m) => a + m.withoutSystem, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{maintenanceSavings.reduce((a, m) => a + m.withSystem, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-savings">{maintenanceSavings.reduce((a, m) => a + m.annualSavings, 0).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold">
                      <TableCell className="text-xs">Downtime Avoidance</TableCell>
                      <TableCell className="text-xs text-right font-mono">{(downtimeSavings.averageDowntimeHoursWithout * downtimeSavings.hourlyRevenueLoss).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{(downtimeSavings.averageDowntimeHoursWith * downtimeSavings.hourlyRevenueLoss).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-savings">{downtimeSavings.annualSavings.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Maintenance Notes</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {maintenanceNotes.map((mn, i) => (
                    <div key={i} className="bg-secondary rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">{mn.category}</p>
                      {mn.notes.map((n, j) => <p key={j} className="text-[10px] text-muted-foreground">• {n}</p>)}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Equipment Repairs</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {equipmentRepairs.map((r, i) => (
                    <div key={i} className="bg-secondary rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary">{r.item}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{r.details}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" />Monthly Operational Issues</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {monthlyIssues.map((mi, i) => (
                  <div key={i} className="bg-secondary rounded-lg p-3">
                    <p className="text-xs font-bold text-warning mb-1">{mi.month}</p>
                    {mi.issues.map((iss, j) => <p key={j} className="text-[10px] text-muted-foreground">• {iss}</p>)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Summary Tab */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard title="System Investment" value={`${systemConfig.totalSystemCost.toLocaleString()} SAR`} icon={DollarSign} />
              <KpiCard title="Annual Recurring" value={`${LockedFinancials.annualRecurringSavings.toLocaleString()} SAR`} icon={TrendingUp} variant="savings" />
              <KpiCard title="Payback Period" value={`${LockedFinancials.paybackYearsCombined.toFixed(1)} yrs`} icon={Target} variant="energy" />
              <KpiCard title="5-Year ROI" value={`${LockedFinancials.fiveYearROI.toFixed(0)}%`} icon={TrendingUp} variant="savings" />
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Savings Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Direct Energy Savings', value: LockedFinancials.directEnergySavingsSAR, detail: `${LockedFinancials.efficiencyImprovement}% efficiency · ${LockedFinancials.weatherAdjustedEnergyAvoided.toLocaleString()} kWh avoided` },
                    { label: 'Maintenance Savings', value: LockedFinancials.maintenanceSavings, detail: '6 categories: preventive, emergency, compressor, parts, refrigerant, visits' },
                    { label: 'Downtime Avoidance', value: LockedFinancials.downtimeAvoidance, detail: `${downtimeSavings.averageDowntimeHoursWithout - downtimeSavings.averageDowntimeHoursWith} hrs/year avoided × ${downtimeSavings.hourlyRevenueLoss} SAR/hr` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-secondary rounded-lg p-3">
                      <div>
                        <p className="text-xs font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                      </div>
                      <p className="text-sm font-bold text-savings">{item.value.toLocaleString()} SAR</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <p className="text-sm font-bold">Total Annual Recurring</p>
                    <p className="text-lg font-bold text-savings">{LockedFinancials.annualRecurringSavings.toLocaleString()} SAR</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">5-Year Projection</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Savings</span><span className="font-mono font-bold">{LockedFinancials.fiveYearSavings.toLocaleString()} SAR</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Investment</span><span className="font-mono">−{LockedFinancials.systemInvestment.toLocaleString()} SAR</span></div>
                  <div className="flex justify-between text-xs border-t border-border pt-2"><span className="font-medium">Net Profit</span><span className="font-mono font-bold text-savings">{LockedFinancials.fiveYearNetProfit.toLocaleString()} SAR</span></div>
                  <div className="flex justify-between text-xs"><span className="font-medium">ROI</span><span className="font-mono font-bold text-savings">{LockedFinancials.fiveYearROI.toFixed(0)}%</span></div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">10-Year Projection</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Savings</span><span className="font-mono font-bold">{LockedFinancials.tenYearSavings.toLocaleString()} SAR</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Investment</span><span className="font-mono">−{LockedFinancials.systemInvestment.toLocaleString()} SAR</span></div>
                  <div className="flex justify-between text-xs border-t border-border pt-2"><span className="font-medium">Net Profit</span><span className="font-mono font-bold text-savings">{LockedFinancials.tenYearNetProfit.toLocaleString()} SAR</span></div>
                  <div className="flex justify-between text-xs"><span className="font-medium">ROI</span><span className="font-mono font-bold text-savings">{LockedFinancials.tenYearROI.toFixed(0)}%</span></div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Major Saving Months</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {majorSavingMonths.map(m => (
                    <div key={m.month} className="bg-secondary rounded-lg p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">{m.month}</p>
                      <p className="text-sm font-bold text-savings">{m.savingsSAR.toLocaleString()}</p>
                      <p className="text-[10px] text-savings">-{m.costReduction}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Management Conclusion</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-bold text-savings">{managementConclusion.headline}</p>
                {managementConclusion.details.map((d, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {d}</p>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">Site Overview</h3>
            <p className="text-xs text-muted-foreground">Detailed analytics will appear here once monitoring data is collected for this site.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 text-left">
              <div className="bg-secondary rounded-lg p-3"><p className="text-[10px] text-muted-foreground">Type</p><p className="text-xs font-medium">{site.type}</p></div>
              <div className="bg-secondary rounded-lg p-3"><p className="text-[10px] text-muted-foreground">Tariff</p><p className="text-xs font-medium">{site.tariff}</p></div>
              <div className="bg-secondary rounded-lg p-3"><p className="text-[10px] text-muted-foreground">Hours</p><p className="text-xs font-medium">{site.operating_hours}</p></div>
              <div className="bg-secondary rounded-lg p-3"><p className="text-[10px] text-muted-foreground">Solutions</p><p className="text-xs font-medium">{site.solutions.join(', ') || 'None'}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}