import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  monthlyComparisonData,
  summaryStats,
  keyInsights,
  unitPerformanceObservations,
  maintenanceNotes,
  monthlyIssues,
  equipmentRepairs,
  operatingHoursImpact,
} from "@/data/rawdahAnalysis";
import { AlertTriangle, CheckCircle, Wrench, Clock, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RawdahAnalysis() {
  const chartData = monthlyComparisonData.map(d => ({
    month: d.month.substring(0, 3),
    Ruben: d.ruben,
    Rawdah: d.rawdah,
  }));

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="gradient-savings rounded-xl p-6 text-primary-foreground">
        <h2 className="text-2xl font-bold mb-2">Rawdah Showroom - Summary Analysis</h2>
        <p className="opacity-90 mb-4">Energy Consumption Comparison 2025 (With G8 System)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{summaryStats.avgSavingsPercent}%</p>
            <p className="text-sm opacity-80">Average Savings</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{summaryStats.totalAnnualSavings.toLocaleString()}</p>
            <p className="text-sm opacity-80">Total Annual Savings (SAR)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{summaryStats.monthsWon}/{summaryStats.totalMonths}</p>
            <p className="text-sm opacity-80">Months Won</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">Rawdah</p>
            <p className="text-sm opacity-80">Most Efficient</p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="text-xl font-semibold">Key Insights</h3>
        </div>
        <ul className="space-y-2">
          {keyInsights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-savings shrink-0 mt-0.5" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Monthly Comparison Chart */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-xl font-semibold mb-1">Monthly Consumption Comparison</h3>
        <p className="text-sm text-muted-foreground mb-6">Rawdah vs. Ruben Showroom (2025, Without G8)</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          <h3 className="text-xl font-semibold">Monthly Breakdown</h3>
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

      {/* Unit Performance Observations */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-xl font-semibold">Unit Performance Observations</h3>
        </div>
        <div className="space-y-4">
          {unitPerformanceObservations.map((obs, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-2">{obs.unit}</h4>
              <p className="text-muted-foreground mb-3">{obs.issue}</p>
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
          <AlertCircle className="h-5 w-5 text-orange-500" />
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

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <p className="font-medium text-amber-600">Additional Consumption Impact</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Opening earlier led to additional consumption of <strong>{operatingHoursImpact.additionalConsumption.toLocaleString()} kWh</strong> = <strong>SAR {operatingHoursImpact.additionalCost.toLocaleString()}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
