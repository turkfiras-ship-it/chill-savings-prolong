import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area,
} from "recharts";
import {
  monthlyComparisonData,
  yearlyComparisonData,
  summaryStats,
  keyInsights,
  unitPerformanceObservations,
  maintenanceNotes,
  monthlyIssues,
  equipmentRepairs,
  operatingHoursImpact,
  demandSnapshots,
  unitComparisons,
  energyCostSummary,
  systemMonitoringNotes,
} from "@/data/rawdahAnalysis";
import { FinancialImpact } from "@/components/FinancialImpact";
import { WeatherComparison } from "@/components/WeatherComparison";
import { 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Clock, 
  Lightbulb, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Zap,
  Activity,
  BarChart3,
  ArrowDown,
  ArrowUp,
  GitCompareArrows,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RawdahAnalysis() {
  const vsRubenChartData = monthlyComparisonData.map(d => ({
    month: d.month.substring(0, 3),
    Ruben: d.ruben,
    Rawdah: d.rawdah,
  }));

  const yearComparisonChartData = yearlyComparisonData.map(d => ({
    month: d.month.substring(0, 3),
    '2024': d.year2024,
    '2025': d.year2025,
  }));

  const demandChartData = demandSnapshots.map(d => ({
    year: d.year.toString(),
    consumption: d.totalDailyConsumption,
    avgKwh: d.avgKwh,
    label: d.label,
  }));

  const unitChartData = unitComparisons.map(u => ({
    unit: u.unit,
    '2024': u.kw2024,
    '2025': u.kw2025,
    reduction: u.reduction,
  }));

  return (
    <div className="space-y-8">
      {/* Header Summary - Rawdah Focused */}
      <div className="gradient-savings rounded-xl p-6 text-primary-foreground">
        <h2 className="text-2xl font-bold mb-2">Rawdah Showroom - Summary Analysis</h2>
        <p className="opacity-90 mb-4">Comprehensive energy performance review — 2023 to 2025</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{energyCostSummary.yearlySavingsPercent}%</p>
            <p className="text-sm opacity-80">Cost Reduction (2024→2025)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()}</p>
            <p className="text-sm opacity-80">Annual Savings (SAR)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">62%</p>
            <p className="text-sm opacity-80">G2 Demand Reduction</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">7</p>
            <p className="text-sm opacity-80">AC Units Monitored</p>
          </div>
        </div>
      </div>

      {/* Energy Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-muted-foreground">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">2023 Total Bill</span>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{energyCostSummary.totalBill2023.toLocaleString()} SAR</p>
          <p className="text-xs text-muted-foreground mt-1">Baseline year</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">2024 Total Bill</span>
            <ArrowUp className="h-4 w-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold">{energyCostSummary.totalBill2024.toLocaleString()} SAR</p>
          <p className="text-xs text-destructive mt-1">+{energyCostSummary.yearOverYearIncrease2024}% (+{energyCostSummary.increaseAmount2024.toLocaleString()} SAR)</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-savings">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">2024 vs 2025 Savings</span>
            <TrendingDown className="h-4 w-4 text-savings" />
          </div>
          <p className="text-2xl font-bold text-savings">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()} SAR</p>
          <p className="text-xs text-savings mt-1">{energyCostSummary.yearlySavingsPercent}% reduction</p>
        </div>
      </div>

      {/* Overall Financial Impact */}
      <FinancialImpact />

      {/* Weather Comparison */}
      <WeatherComparison />

      {/* 2024 vs 2025 Year Comparison Chart */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-xl font-semibold mb-1">Energy Cost Comparison - Rawdah 2024 vs 2025</h3>
        <p className="text-sm text-muted-foreground mb-6">Monthly energy cost trends year-over-year</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearComparisonChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value.toLocaleString()} SAR`, ""]}
              />
              <Legend />
              <Bar dataKey="2024" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="2025" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-savings/10 border border-savings/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-savings">Result:</strong> Total cost savings in 2025: <strong className="text-savings">13,003 SAR</strong>. Even with cost increases in early months (Jan, Mar, Apr, May), net annual performance is positive. Savings are concentrated in mid-to-late year, when tariffs and HVAC load hurt the most — strong evidence of cost-aware energy management.
          </p>
        </div>
      </div>

      {/* Demand Reduction - Before/After SCC */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-5 w-5 text-savings" />
          <h3 className="text-xl font-semibold">Demand Reduction - SCC Installation Impact (G2 Unit)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">G2 unit daily consumption comparison before and after system installation</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'consumption') return [`${value} Kw`, 'Daily Consumption'];
                    return [`${value} Kwh`, 'Average'];
                  }}
                />
                <Bar dataKey="consumption" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} name="consumption" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {demandSnapshots.map((snapshot, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border ${
                  snapshot.status === 'baseline' ? 'bg-muted/30 border-muted' :
                  snapshot.status === 'improved' ? 'bg-blue-500/10 border-blue-500/20' :
                  'bg-savings/10 border-savings/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{snapshot.date}</p>
                    <p className="text-xs text-muted-foreground">{snapshot.label}</p>
                  </div>
                  {snapshot.status === 'optimized' && (
                    <span className="px-2 py-0.5 bg-savings/20 text-savings text-xs rounded-full font-medium">Best</span>
                  )}
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-2xl font-bold">{snapshot.totalDailyConsumption} <span className="text-sm font-normal">Kw</span></p>
                    <p className="text-xs text-muted-foreground">Total Daily</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{snapshot.avgKwh} <span className="text-sm font-normal">Kwh</span></p>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-savings/10 border border-savings/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="h-5 w-5 text-savings" />
            <span className="font-semibold text-savings">62% Total Reduction</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Daily consumption dropped from <strong>495 Kw</strong> (2023) to <strong>189 Kw</strong> (2025) - a reduction of <strong>306 Kw</strong> per day after SCC installation and filter replacement.
          </p>
        </div>
      </div>

      {/* Unit-Level Comparison */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-5 w-5 text-energy" />
          <h3 className="text-xl font-semibold">Unit-Level Performance (2024 vs 2025)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Individual AC unit consumption comparison</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="unit" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value} Kw`, '']}
                />
                <Legend />
                <Bar dataKey="2024" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="2025" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {unitComparisons.map((unit, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{unit.unit}</span>
                  <span className="px-2 py-0.5 bg-savings/20 text-savings text-xs rounded-full font-medium">
                    -{unit.reduction}%
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2024:</span>
                    <span>{unit.kw2024} Kw ({unit.avgKwh2024} avg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2025:</span>
                    <span className="text-savings font-medium">{unit.kw2025} Kw ({unit.avgKwh2025} avg)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Key Insights</h3>
        </div>
        <ul className="space-y-3">
          {keyInsights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-savings shrink-0 mt-0.5" />
              <span className="text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* System Monitoring Notes */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="text-xl font-semibold">System Monitoring & Energy Management</h3>
        </div>
        <ul className="space-y-2">
          {systemMonitoringNotes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Unit Performance Observations */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Unit Performance Observations</h3>
        </div>
        <div className="space-y-4">
          {unitPerformanceObservations.map((obs, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-2">{obs.unit}</h4>
              <p className="text-muted-foreground text-sm mb-3">{obs.issue}</p>
              {obs.recommendation && (
                <div className="bg-savings/10 border border-savings/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-savings mb-1">Recommendation:</p>
                  <p className="text-sm">{obs.recommendation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance & Filters */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-5 w-5 text-blue-500" />
          <h3 className="text-xl font-semibold">Maintenance & Filters</h3>
        </div>
        <div className="space-y-6">
          {maintenanceNotes.map((note, idx) => (
            <div key={idx}>
              <h4 className="font-semibold mb-2">{note.category}</h4>
              <ul className="space-y-2">
                {note.notes.map((n, nIdx) => (
                  <li key={nIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-muted-foreground mt-1.5">•</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Issues */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Monthly Issues</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {monthlyIssues.map((issue, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-3">{issue.month}</h4>
              <ul className="space-y-2">
                {issue.issues.map((i, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2 text-sm">
                    <span className="text-destructive mt-1">•</span>
                    <span className="text-muted-foreground">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment & Repairs */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-5 w-5 text-purple-500" />
          <h3 className="text-xl font-semibold">Equipment & Repairs</h3>
        </div>
        <div className="space-y-3">
          {equipmentRepairs.map((repair, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <Wrench className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">{repair.item}</p>
                <p className="text-sm text-muted-foreground">{repair.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operating Hours Impact */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-500" />
          <h3 className="text-xl font-semibold">Operating Hours Impact</h3>
        </div>
        <p className="text-muted-foreground mb-4">{operatingHoursImpact.description}</p>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Friday Opening Times in September:</h4>
          <div className="grid grid-cols-5 gap-2">
            {operatingHoursImpact.fridayOpeningTimes.map((time, idx) => (
              <div key={idx} className="text-center p-2 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">{time.week}</p>
                <p className="text-sm font-medium">{time.time}</p>
                <p className="text-xs text-muted-foreground">{time.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium text-foreground">Additional Consumption Impact</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Opening earlier led to additional consumption of <strong>{operatingHoursImpact.additionalConsumption.toLocaleString()} kWh</strong> = <strong>SAR {operatingHoursImpact.additionalCost.toLocaleString()}</strong>
          </p>
        </div>
      </div>

      {/* ===== RUBEN COMPARISON SECTION ===== */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <GitCompareArrows className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Benchmark: Rawdah vs. Ruben</h2>
            <p className="text-sm text-muted-foreground">Side-by-side comparison with Ruben Showroom (2025, Without G8)</p>
          </div>
        </div>

        {/* Benchmark Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-card p-4 card-elevated text-center">
            <p className="text-3xl font-bold text-savings">{summaryStats.avgSavingsPercent}%</p>
            <p className="text-sm text-muted-foreground">Avg Savings vs Ruben</p>
          </div>
          <div className="rounded-xl bg-card p-4 card-elevated text-center">
            <p className="text-3xl font-bold text-savings">{summaryStats.totalAnnualSavings.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Annual Savings (SAR)</p>
          </div>
          <div className="rounded-xl bg-card p-4 card-elevated text-center">
            <p className="text-3xl font-bold">{summaryStats.monthsWonByRawdah}/{summaryStats.totalMonths}</p>
            <p className="text-sm text-muted-foreground">Months Won (Rawdah)</p>
          </div>
          <div className="rounded-xl bg-card p-4 card-elevated text-center">
            <p className="text-3xl font-bold text-savings">Rawdah</p>
            <p className="text-sm text-muted-foreground">Most Efficient</p>
          </div>
        </div>
      </div>

      {/* Monthly Comparison Chart - Rawdah vs Ruben */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-xl font-semibold mb-1">Monthly Consumption Comparison</h3>
        <p className="text-sm text-muted-foreground mb-6">Rawdah vs. Ruben Showroom (2025, Without G8)</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vsRubenChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value.toLocaleString()} SAR`, ""]}
              />
              <Legend />
              <Bar dataKey="Ruben" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Rawdah" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="rounded-xl bg-card card-elevated overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Monthly Breakdown - Rawdah vs Ruben</h3>
          <p className="text-sm text-muted-foreground mt-1">Detailed comparison with savings per month</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Month</TableHead>
                <TableHead className="text-right font-semibold">Ruben (SAR)</TableHead>
                <TableHead className="text-right font-semibold">Rawdah (SAR)</TableHead>
                <TableHead className="text-right font-semibold">% Difference</TableHead>
                <TableHead className="text-right font-semibold">Savings (SAR)</TableHead>
                <TableHead className="text-center font-semibold">Winner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyComparisonData.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.ruben.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.rawdah.toLocaleString()}</TableCell>
                  <TableCell className={`text-right tabular-nums font-medium ${row.difference > 0 ? 'text-savings' : 'text-destructive'}`}>
                    {row.difference > 0 ? '+' : ''}{row.difference}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-savings font-medium">
                    {row.savingsSAR > 0 ? row.savingsSAR.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      row.winner === 'RAWDAH' 
                        ? 'bg-savings/20 text-savings' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {row.winner}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/70 font-bold border-t-2">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right tabular-nums">
                  {monthlyComparisonData.reduce((s, r) => s + r.ruben, 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {monthlyComparisonData.reduce((s, r) => s + r.rawdah, 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums text-savings">{summaryStats.avgSavingsPercent}%</TableCell>
                <TableCell className="text-right tabular-nums text-savings">
                  {summaryStats.totalAnnualSavings.toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-savings/20 text-savings">
                    RAWDAH
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
