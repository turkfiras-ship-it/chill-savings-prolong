import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  systemConfig,
  maintenanceSavings,
  lifespanSavings,
  downtimeSavings,
  energySavings,
  calculateTotalSavings,
  calculateROI,
} from "@/data/roiCalculations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Zap,
  Wrench,
  Clock,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export function ROIAnalysis() {
  const savings = calculateTotalSavings();
  const roi = calculateROI();

  // Pie chart data for savings breakdown
  const pieData = [
    { name: 'Energy Savings', value: savings.energySavings, color: 'hsl(152, 60%, 40%)' },
    { name: 'Maintenance Savings', value: savings.maintenanceSavings, color: 'hsl(220, 70%, 50%)' },
    { name: 'Lifespan Savings', value: savings.lifespanSavings, color: 'hsl(38, 92%, 50%)' },
    { name: 'Downtime Avoidance', value: savings.downtimeSavings, color: 'hsl(280, 60%, 55%)' },
  ];

  // ROI timeline data
  const roiTimelineData = Array.from({ length: 11 }, (_, year) => ({
    year,
    cumulativeSavings: year * savings.totalAnnualSavings,
    investment: systemConfig.totalSystemCost,
    netProfit: (year * savings.totalAnnualSavings) - systemConfig.totalSystemCost,
  }));

  // Maintenance savings chart data
  const maintenanceChartData = maintenanceSavings.map(item => ({
    name: item.category.split(' ')[0],
    without: item.withoutSystem,
    with: item.withSystem,
    savings: item.annualSavings,
  }));

  return (
    <div className="space-y-8">
      {/* ROI Header Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-6 w-6" />
          <h2 className="text-2xl font-bold">ROI Analysis - Rawdah Showroom</h2>
        </div>
        <p className="opacity-90 mb-6">Power Saving System Investment Return (7 Units × 25 Tons)</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">System Investment</p>
            <p className="text-2xl font-bold">{systemConfig.totalSystemCost.toLocaleString()} SAR</p>
            <p className="text-xs opacity-70">{systemConfig.numberOfUnits} units × {systemConfig.costPerUnit.toLocaleString()} SAR</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Annual Savings</p>
            <p className="text-2xl font-bold">{Math.round(savings.totalAnnualSavings).toLocaleString()} SAR</p>
            <p className="text-xs opacity-70">Total operational savings</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Payback Period</p>
            <p className="text-2xl font-bold">{roi.paybackPeriodYears.toFixed(1)} Years</p>
            <p className="text-xs opacity-70">~{Math.round(roi.paybackPeriodYears * 12)} months</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">5-Year ROI</p>
            <p className="text-2xl font-bold">{roi.fiveYearROI.toFixed(0)}%</p>
            <p className="text-xs opacity-70">Net profit: {Math.round(roi.netProfitFiveYears).toLocaleString()} SAR</p>
          </div>
        </div>
      </div>

      {/* Key ROI Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-savings">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">5-Year Total Savings</span>
            <Calendar className="h-4 w-4 text-savings" />
          </div>
          <p className="text-3xl font-bold text-savings">{Math.round(roi.fiveYearSavings).toLocaleString()} SAR</p>
          <p className="text-sm text-muted-foreground mt-1">
            Net Profit: <span className="text-savings font-medium">{Math.round(roi.netProfitFiveYears).toLocaleString()} SAR</span>
          </p>
        </div>
        
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-energy">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">10-Year Total Savings</span>
            <TrendingUp className="h-4 w-4 text-energy" />
          </div>
          <p className="text-3xl font-bold text-energy">{Math.round(savings.totalAnnualSavings * 10).toLocaleString()} SAR</p>
          <p className="text-sm text-muted-foreground mt-1">
            ROI: <span className="text-energy font-medium">{roi.tenYearROI.toFixed(0)}%</span>
          </p>
        </div>
        
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Monthly Savings</span>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-500">{Math.round(savings.totalAnnualSavings / 12).toLocaleString()} SAR</p>
          <p className="text-sm text-muted-foreground mt-1">
            Average per month
          </p>
        </div>
      </div>

      {/* Savings Breakdown - Pie Chart & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="rounded-xl bg-card p-6 card-elevated">
          <h3 className="text-xl font-semibold mb-1">Annual Savings Breakdown</h3>
          <p className="text-sm text-muted-foreground mb-4">Distribution by category</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} SAR/year`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Categories */}
        <div className="rounded-xl bg-card p-6 card-elevated">
          <h3 className="text-xl font-semibold mb-4">Savings by Category</h3>
          <div className="space-y-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{Math.round(item.value).toLocaleString()} SAR</p>
                  <p className="text-xs text-muted-foreground">
                    {((item.value / savings.totalAnnualSavings) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-lg bg-savings/10 border border-savings/20 mt-4">
              <span className="font-semibold text-savings">Total Annual Savings</span>
              <span className="font-bold text-savings text-lg">
                {Math.round(savings.totalAnnualSavings).toLocaleString()} SAR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Timeline Chart */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-xl font-semibold mb-1">ROI Timeline - Cumulative Savings</h3>
        <p className="text-sm text-muted-foreground mb-6">Investment recovery and profit projection over 10 years</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={roiTimelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="year" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                label={{ value: 'Years', position: 'bottom', offset: -5 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${Math.round(value).toLocaleString()} SAR`, '']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cumulativeSavings"
                name="Cumulative Savings"
                stroke="hsl(152, 60%, 40%)"
                strokeWidth={3}
                dot={{ fill: "hsl(152, 60%, 40%)", strokeWidth: 0, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="investment"
                name="Initial Investment"
                stroke="hsl(0, 72%, 51%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Payback highlight */}
        <div className="mt-4 p-4 bg-savings/10 border border-savings/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-savings" />
            <span className="font-semibold text-savings">Investment Recovery</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The system investment of <strong>{systemConfig.totalSystemCost.toLocaleString()} SAR</strong> will be 
            fully recovered in approximately <strong>{roi.paybackPeriodYears.toFixed(1)} years</strong>. 
            After year {Math.ceil(roi.paybackPeriodYears)}, all savings are pure profit.
          </p>
        </div>
      </div>

      {/* Maintenance & Repair Savings Detailed Table */}
      <div className="rounded-xl bg-card card-elevated overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-semibold">Maintenance & Operational Cost Savings</h3>
          </div>
          <p className="text-sm text-muted-foreground">Detailed breakdown of annual operational cost reductions</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="text-right font-semibold">Without System</TableHead>
                <TableHead className="text-right font-semibold">With System</TableHead>
                <TableHead className="text-right font-semibold">Annual Savings</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceSavings.map((item, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-destructive">
                    {Math.round(item.withoutSystem).toLocaleString()} SAR
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Math.round(item.withSystem).toLocaleString()} SAR
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-savings font-medium">
                    {Math.round(item.annualSavings).toLocaleString()} SAR
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                    {item.notes}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Additional savings rows */}
              <TableRow className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div>
                    <p className="font-medium">Equipment Lifespan Extension</p>
                    <p className="text-xs text-muted-foreground">Avoided AC replacements over 20 years</p>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-destructive">
                  ~{Math.round(lifespanSavings.replacementsWithout * 7 * 45000 / 20).toLocaleString()} SAR/yr
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  ~{Math.round(lifespanSavings.replacementsWith * 7 * 45000 / 20).toLocaleString()} SAR/yr
                </TableCell>
                <TableCell className="text-right tabular-nums text-savings font-medium">
                  {Math.round(lifespanSavings.annualizedSavings).toLocaleString()} SAR
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                  Extends AC life from 10 to 15-20 years
                </TableCell>
              </TableRow>
              
              <TableRow className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div>
                    <p className="font-medium">Downtime Avoidance</p>
                    <p className="text-xs text-muted-foreground">Reduced store disruption from AC failures</p>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-destructive">
                  {Math.round(downtimeSavings.averageDowntimeHoursWithout * downtimeSavings.hourlyRevenueLoss).toLocaleString()} SAR
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {Math.round(downtimeSavings.averageDowntimeHoursWith * downtimeSavings.hourlyRevenueLoss).toLocaleString()} SAR
                </TableCell>
                <TableCell className="text-right tabular-nums text-savings font-medium">
                  {downtimeSavings.annualSavings.toLocaleString()} SAR
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                  {downtimeSavings.notes}
                </TableCell>
              </TableRow>

              {/* Energy Savings Row */}
              <TableRow className="hover:bg-muted/30 transition-colors border-t">
                <TableCell>
                  <div>
                    <p className="font-medium">Energy Cost Reduction</p>
                    <p className="text-xs text-muted-foreground">Direct electricity bill savings</p>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-destructive">
                  —
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  —
                </TableCell>
                <TableCell className="text-right tabular-nums text-savings font-medium">
                  {Math.round(energySavings.annualSavingsRawdah).toLocaleString()} SAR
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                  {energySavings.annualSavingsPercent}% reduction in consumption
                </TableCell>
              </TableRow>

              {/* Total Row */}
              <TableRow className="bg-muted/70 font-bold border-t-2">
                <TableCell>TOTAL ANNUAL SAVINGS</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right tabular-nums text-savings text-lg">
                  {Math.round(savings.totalAnnualSavings).toLocaleString()} SAR
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 5-Year Projection Summary */}
      <div className="gradient-savings rounded-xl p-6 text-primary-foreground">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-6 w-6" />
          <h3 className="text-xl font-bold">5-Year Investment Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Total Investment</p>
            <p className="text-2xl font-bold">{systemConfig.totalSystemCost.toLocaleString()} SAR</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">5-Year Savings</p>
            <p className="text-2xl font-bold">{Math.round(roi.fiveYearSavings).toLocaleString()} SAR</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Net Profit (5 Years)</p>
            <p className="text-2xl font-bold">{Math.round(roi.netProfitFiveYears).toLocaleString()} SAR</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Return on Investment</p>
            <p className="text-2xl font-bold">{roi.fiveYearROI.toFixed(0)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
          <CheckCircle className="h-8 w-8" />
          <div>
            <p className="font-semibold">Investment Fully Recovered in {roi.paybackPeriodYears.toFixed(1)} Years</p>
            <p className="text-sm opacity-90">
              After payback, you gain <strong>{Math.round(savings.totalAnnualSavings).toLocaleString()} SAR</strong> in pure profit every year
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
