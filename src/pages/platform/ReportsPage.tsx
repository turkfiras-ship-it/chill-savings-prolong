import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Calendar, Mail, BarChart3, Building2, DollarSign, Leaf, Thermometer } from "lucide-react";
import { monthlyWeatherData, weatherSummary } from "@/data/weatherData";
import { overallFinancialImpact, majorSavingMonths, energyCostComparison, seasonalCostBehavior, managementConclusion } from "@/data/financialImpact";
import { LockedFinancials, ClimateConstants } from "@/data/lockedPerformanceModel";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const chartTooltipStyle = { background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(215, 20%, 16%)";
const tickStyle = { fontSize: 10, fill: 'hsl(215, 15%, 55%)' };

const reportTypes = [
  { name: 'Monthly Energy Report', icon: BarChart3, frequency: 'Monthly', lastGenerated: '2025-02-01', status: 'ready' },
  { name: 'Site Performance Report', icon: Building2, frequency: 'Weekly', lastGenerated: '2025-03-10', status: 'ready' },
  { name: 'Savings Verification (M&V)', icon: DollarSign, frequency: 'Quarterly', lastGenerated: '2025-01-15', status: 'ready' },
  { name: 'Portfolio Summary', icon: BarChart3, frequency: 'Monthly', lastGenerated: '2025-02-28', status: 'ready' },
  { name: 'Demand Analysis Report', icon: BarChart3, frequency: 'Monthly', lastGenerated: '2025-03-01', status: 'ready' },
  { name: 'Billing / Tenant Report', icon: DollarSign, frequency: 'Monthly', lastGenerated: '2025-03-01', status: 'ready' },
  { name: 'Carbon Impact Report', icon: Leaf, frequency: 'Quarterly', lastGenerated: '2025-01-15', status: 'ready' },
  { name: 'Daily Consumption Log', icon: FileText, frequency: 'Daily', lastGenerated: '2025-03-12', status: 'generating' },
];

export default function ReportsPage() {
  const weatherChartData = monthlyWeatherData.map(d => ({
    month: d.month.slice(0, 3),
    '2024': d.avgTemp2024,
    '2025': d.avgTemp2025,
    diff: d.tempDiff,
  }));

  const billComparisonData = [
    { year: '2023', bill: energyCostComparison.year2023.totalBill },
    { year: '2024', bill: energyCostComparison.year2024.totalBill },
    { year: '2025 (Actual)', bill: energyCostComparison.year2025.totalBill },
    { year: '2025 (Expected)', bill: energyCostComparison.expected2025WithoutSCC },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Data reports, weather analysis, and financial summaries</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs"><Calendar className="h-3.5 w-3.5 mr-1.5" />Schedule</Button>
          <Button size="sm" className="h-8 text-xs"><Mail className="h-3.5 w-3.5 mr-1.5" />Email Setup</Button>
        </div>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="bg-secondary h-9">
          <TabsTrigger value="reports" className="text-xs">Report Library</TabsTrigger>
          <TabsTrigger value="weather" className="text-xs">Weather Analysis</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs">Financial Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((r, i) => (
              <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                      <r.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Badge variant="outline" className="text-[9px]">{r.frequency}</Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{r.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">Last: {r.lastGenerated}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1"><Download className="h-3 w-3 mr-1" />PDF</Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1"><Download className="h-3 w-3 mr-1" />CSV</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-card border-border"><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Avg Temp Increase</p><p className="text-lg font-bold text-warning">+{weatherSummary.avgTempDiff}°C</p></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Hottest Month</p><p className="text-lg font-bold">{weatherSummary.hottestMonth2025}</p><p className="text-[10px] text-muted-foreground">{weatherSummary.hottestTemp2025}°C</p></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Cooling Load Impact</p><p className="text-lg font-bold text-warning">{ClimateConstants.coolingLoadImpactRange}</p></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Normalization Factor</p><p className="text-lg font-bold text-energy">×{ClimateConstants.weatherNormalizationFactor}</p></CardContent></Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Thermometer className="h-4 w-4 text-warning" />Riyadh Temperature — 2024 vs 2025</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weatherChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} unit="°C" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="2024" stroke="hsl(210, 80%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="2024 Avg High (°C)" />
                  <Line type="monotone" dataKey="2025" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="2025 Avg High (°C)" />
                </LineChart>
              </ResponsiveContainer>
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

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{weatherSummary.insight}</p>
              <p className="text-[10px] text-muted-foreground mt-2">Source: WeatherSpark — King Khalid International Airport (OERK) · Cooling degree increase: {weatherSummary.coolingDegreeIncrease}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Annual Bill Comparison — Rawdah</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={billComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="year" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `${v.toLocaleString()} SAR`} />
                  <Bar dataKey="bill" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} name="Annual Bill (SAR)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-card border-border"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground">Apparent YoY Savings</p><p className="text-xl font-bold">{overallFinancialImpact.totalCostSavings2025.toLocaleString()} SAR</p><p className="text-[10px] text-muted-foreground">Direct bill reduction</p></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground">True Adjusted Savings</p><p className="text-xl font-bold text-savings">{overallFinancialImpact.trueAdjustedSavings2025.toLocaleString()} SAR</p><p className="text-[10px] text-muted-foreground">Weather-normalised</p></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground">kWh Saved</p><p className="text-xl font-bold text-energy">{overallFinancialImpact.trueAdjustedSavingsKwh.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">{overallFinancialImpact.trueAdjustedSavingsPct}% efficiency</p></CardContent></Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Top Saving Months (YoY)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {majorSavingMonths.map(m => (
                  <div key={m.month} className="bg-secondary rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">{m.month}</p>
                    <p className="text-sm font-bold text-savings">{m.savingsSAR.toLocaleString()} SAR</p>
                    <p className="text-[10px] text-savings">-{m.costReduction}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Seasonal Cost Behavior</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs"><span className="text-primary font-medium">Peak Cost Period:</span> {seasonalCostBehavior.peakCostPeriod} — {seasonalCostBehavior.peak2025VsPeak2024}</p>
              {seasonalCostBehavior.indicators.map((ind, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {ind}</p>
              ))}
              <p className="text-xs text-savings font-medium mt-2">{seasonalCostBehavior.conclusion}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Management Conclusion</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-bold text-savings">{managementConclusion.headline}</p>
              <p className="text-xs text-muted-foreground">{managementConclusion.apparentHeadline}</p>
              {managementConclusion.details.map((d, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {d}</p>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground">{energyCostComparison.anomalyNote}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}