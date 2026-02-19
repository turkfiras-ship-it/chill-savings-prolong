import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { EditableText } from "@/components/editor/EditableText";
import {
  monthlyComparisonData,
  yearlyComparisonData,
  summaryStats,
  rawdahInsights,
  comparisonInsights,
  unitPerformanceObservations,
  maintenanceNotes,
  monthlyIssues,
  equipmentRepairs,
  operatingHoursImpact,
  demandSnapshots,
  unitComparisons,
  systemMonitoringNotes,
} from "@/data/rawdahAnalysis";
import { FinancialImpact } from "@/components/FinancialImpact";
import { WeatherComparison } from "@/components/WeatherComparison";
import { useEditableData } from "@/context/EditableDataContext";
import { EditableField } from "@/components/EditableField";
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
  Info,
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
  const { data, updateNested, update, isEditMode } = useEditableData();
  const { bills } = data;

  // Derived from editable bills
  const yoyChangeSAR = bills.totalBill2024 - bills.totalBill2025;
  const yoyChangePct = bills.totalBill2024 > 0 ? ((yoyChangeSAR / bills.totalBill2024) * 100) : 0;
  const yoy2024ChangeSAR = bills.totalBill2024 - bills.totalBill2023;
  const yoy2024ChangePct = bills.totalBill2023 > 0 ? ((yoy2024ChangeSAR / bills.totalBill2023) * 100) : 0;

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
        <div className="flex items-start justify-between mb-2">
          <div>
            <EditableText textKey="rawdah.header.title" defaultValue="Rawdah Showroom - Summary Analysis" as="h2" className="text-2xl font-bold" />
            <EditableText textKey="rawdah.header.subtitle" defaultValue="Comprehensive energy performance review — 2023 to 2025" as="p" className="opacity-90 mt-1" />
          </div>
          {isEditMode && (
            <span className="text-xs bg-amber-400/20 border border-amber-400/40 text-amber-200 rounded-full px-3 py-1 font-medium">
              ✏️ Edit Mode — click any value to edit
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{yoyChangePct.toFixed(2)}%</p>
            <EditableText textKey="rawdah.stat1.label" defaultValue="Raw Bill Reduction (2024→2025)" as="p" className="text-sm opacity-80" />
            <p className="text-xs opacity-60 mt-1">
              <EditableField
                value={yoyChangeSAR}
                onChange={(v) => updateNested('bills', 'totalBill2025', bills.totalBill2024 - v)}
                isEditMode={isEditMode}
                format={(v) => `${v.toLocaleString()} SAR direct bill saving`}
                className="opacity-60 text-xs"
              />
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">
              <EditableField
                value={data.trueSavings}
                onChange={(v) => update('trueSavings', v)}
                isEditMode={isEditMode}
                format={(v) => v.toLocaleString()}
              />
            </p>
            <EditableText textKey="rawdah.stat2.label" defaultValue="True Adjusted Savings (SAR)" as="p" className="text-sm opacity-80" />
            <p className="text-xs opacity-60 mt-1">Weather-normalized vs expected{' '}
              <EditableField
                value={data.expectedBill2025}
                onChange={(v) => update('expectedBill2025', v)}
                isEditMode={isEditMode}
                format={(v) => `${v.toLocaleString()} SAR`}
                className="opacity-60 text-xs"
              />
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <EditableText textKey="rawdah.stat3.value" defaultValue="61.8%" as="p" className="text-3xl font-bold" />
            <EditableText textKey="rawdah.stat3.label" defaultValue="Building Demand Reduction" as="p" className="text-sm opacity-80" />
            <EditableText textKey="rawdah.stat3.sub" defaultValue="495 kW (2023) → 189 kW (2025)" as="p" className="text-xs opacity-60 mt-1" />
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">
              <EditableField
                value={data.systemCfg.numberOfUnits}
                onChange={(v) => updateNested('systemCfg', 'numberOfUnits', Math.round(v))}
                isEditMode={isEditMode}
                format={(v) => `${v}`}
              />
            </p>
            <EditableText textKey="rawdah.stat4.label" defaultValue="SCC-Controlled AC Units" as="p" className="text-sm opacity-80" />
            <EditableText textKey="rawdah.stat4.sub" defaultValue="G1–G3, F1–F4 (175 tons inverter)" as="p" className="text-xs opacity-60 mt-1" />
          </div>
        </div>
      </div>

      {/* Energy Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-muted-foreground">
          <div className="flex items-center justify-between mb-2">
            <EditableText textKey="rawdah.bill2023.label" defaultValue="2023 Total Bill" as="span" className="text-sm text-muted-foreground" />
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">
            <EditableField
              value={bills.totalBill2023}
              onChange={(v) => updateNested('bills', 'totalBill2023', v)}
              isEditMode={isEditMode}
              suffix=" SAR"
            />
          </p>
          <EditableText textKey="rawdah.bill2023.sub" defaultValue="Baseline — pre-SCC installation" as="p" className="text-xs text-muted-foreground mt-1" />
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <EditableText textKey="rawdah.bill2024.label" defaultValue="2024 Total Bill" as="span" className="text-sm text-muted-foreground" />
            <ArrowUp className="h-4 w-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold">
            <EditableField
              value={bills.totalBill2024}
              onChange={(v) => updateNested('bills', 'totalBill2024', v)}
              isEditMode={isEditMode}
              suffix=" SAR"
            />
          </p>
          <p className="text-xs text-destructive mt-1">+{yoy2024ChangePct.toFixed(2)}% (+{yoy2024ChangeSAR.toLocaleString()} SAR vs 2023)</p>
          <EditableText textKey="rawdah.bill2024.sub" defaultValue="SCC active but AC filters damaged + complaints" as="p" className="text-xs text-muted-foreground mt-1" />
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-savings">
          <div className="flex items-center justify-between mb-2">
            <EditableText textKey="rawdah.bill2025.label" defaultValue="2025 Total Bill" as="span" className="text-sm text-muted-foreground" />
            <TrendingDown className="h-4 w-4 text-savings" />
          </div>
          <p className="text-2xl font-bold text-savings">
            <EditableField
              value={bills.totalBill2025}
              onChange={(v) => updateNested('bills', 'totalBill2025', v)}
              isEditMode={isEditMode}
              suffix=" SAR"
              className="text-savings"
            />
          </p>
          <p className="text-xs text-savings mt-1">−{yoyChangePct.toFixed(2)}% ({yoyChangeSAR.toLocaleString()} SAR direct bill reduction vs 2024)</p>
          <p className="text-xs text-muted-foreground mt-1">True adjusted savings: <strong className="text-savings">{data.trueSavings.toLocaleString()} SAR</strong> — see ROI 2 tab</p>
        </div>
      </div>

      {/* Overall Financial Impact */}
      <FinancialImpact />

      {/* G8 — Panel 8 Explanation */}
      <div className="rounded-xl bg-card p-6 card-elevated border border-[hsl(45,60%,50%)]/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white" style={{ backgroundColor: "hsl(45, 60%, 50%)" }}>
            G8
          </div>
          <div>
            <EditableText textKey="rawdah.g8.title" defaultValue="Panel 8 — Multiple AC Units" as="h3" className="text-lg font-bold" />
            <EditableText textKey="rawdah.g8.subtitle" defaultValue="Why G8 is different from G1–G3 & F1–F4" as="p" className="text-sm text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* G8 Composition */}
          <div className="space-y-3">
            <EditableText textKey="rawdah.g8.comp.title" defaultValue="G8 Composition (7 Units on Panel 8)" as="h4" className="font-semibold text-sm uppercase tracking-wide text-muted-foreground" />
            <div className="space-y-2 text-sm">
              {[
                { type: "Cassette", model: "MCCT36HRN2", cap: 3, location: "Basement WH" },
                { type: "Split", model: "RYD25IAVLK", cap: 2, location: "Server Room" },
                { type: "Cassette", model: "MCCT48HRN2", cap: 4, location: "GF – Receiving Area" },
                { type: "Cassette", model: "MCCT48HRN2", cap: 4, location: "GF – WH / Gifts" },
                { type: "Cassette", model: "MCCT48HRN2", cap: 4, location: "Elevator Lobby Roof" },
                { type: "Ducted Split", model: "MHGT60HWNW3", cap: 6, location: "Salesman Lounge Roof" },
                { type: "Cassette", model: "MCCT36HRN2", cap: 3, location: "Salesman Smoking Roof" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-xs text-muted-foreground">({item.cap} ton)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.location}</span>
                </div>
              ))}
            </div>
            <EditableText textKey="rawdah.g8.comp.footer" defaultValue="Total G8 capacity: 26 tons across 7 individual units — all on a single panel" as="p" className="text-xs text-muted-foreground italic" />
          </div>

          {/* Savings Context */}
          <div className="space-y-4">
            <EditableText textKey="rawdah.g8.impact.title" defaultValue="Impact on Savings Calculation" as="h4" className="font-semibold text-sm uppercase tracking-wide text-muted-foreground" />
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/40">
                <EditableText textKey="rawdah.g8.impact.label" defaultValue="Rawdah Showroom" as="p" className="font-semibold text-sm mb-1" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">7 package units</span> on 7 panels + <span className="font-bold text-foreground">8th panel (G8)</span> with 7 smaller units.
                  SCC device saves on <span className="font-bold text-savings">7 out of 8 systems</span> — but all 8 appear on <span className="underline">one electricity bill</span>.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <EditableText textKey="rawdah.g8.impact.note" defaultValue="G8 consumes 90,883 kWh/year (13.9% of total with G8: 652,191 kWh) — comparable to a single large package unit. This dilutes the bill-level savings percentage because G8 consumption is unaffected by the SCC system but still appears on the same meter. The 7 SCC panels represent 81.8% of the effective bill share (consumption-weighted)." as="p" className="text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Comparison */}
      <WeatherComparison />

      {/* 2024 vs 2025 Year Comparison Chart */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <EditableText textKey="rawdah.chart1.title" defaultValue="Energy Cost Comparison - Rawdah 2024 vs 2025" as="h3" className="text-xl font-semibold mb-1" />
        <EditableText textKey="rawdah.chart1.subtitle" defaultValue="Monthly energy cost trends year-over-year" as="p" className="text-sm text-muted-foreground mb-6" />
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
              <Bar dataKey="2025" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-savings/10 border border-savings/20 rounded-lg">
          <EditableText
            textKey="rawdah.chart1.note"
            defaultValue="Raw YoY Result: Direct bill reduction 2024→2025: 6,649 SAR (220,028 − 213,379 = 6,649 SAR / 3.02% reduction). Even with cost increases in early months, net annual performance is positive. Savings are concentrated in mid-to-late year. True adjusted savings = 33,052 SAR — once weather normalization (+12% hotter 2025) is accounted for. See ROI 2 tab for full detail."
            as="p"
            className="text-sm text-muted-foreground"
          />
        </div>
      </div>

      {/* Demand Reduction - Before/After SCC */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-5 w-5 text-savings" />
          <EditableText textKey="rawdah.demand.title" defaultValue="Building Demand Reduction — SCC Installation Impact" as="h3" className="text-xl font-semibold" />
        </div>
        <EditableText textKey="rawdah.demand.subtitle" defaultValue="Full building daily kW demand comparison — same date (Oct 21) across all 3 years" as="p" className="text-sm text-muted-foreground mb-6" />
        
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
                    if (name === 'consumption') return [`${value} kW`, 'Daily Consumption'];
                    return [`${value} kWh`, 'Average'];
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
                    <p className="text-2xl font-bold">{snapshot.totalDailyConsumption} <span className="text-sm font-normal">kW</span></p>
                    <p className="text-xs text-muted-foreground">Total Daily</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{snapshot.avgKwh} <span className="text-sm font-normal">kWh</span></p>
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
            <EditableText textKey="rawdah.demand.reduction.label" defaultValue="61.8% Total Reduction" as="span" className="font-semibold text-savings" />
          </div>
          <EditableText textKey="rawdah.demand.reduction.desc" defaultValue="Daily consumption dropped from 495 kW (2023) to 189 kW (2025) — a reduction of 306 kW per day after SCC installation and filter replacement." as="p" className="text-sm text-muted-foreground" />
        </div>
      </div>

      {/* Unit-Level Comparison */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-5 w-5 text-energy" />
          <EditableText textKey="rawdah.unit.title" defaultValue="Unit-Level Performance (2024 vs 2025)" as="h3" className="text-xl font-semibold" />
        </div>
        <EditableText textKey="rawdah.unit.subtitle" defaultValue="Individual AC unit consumption comparison" as="p" className="text-sm text-muted-foreground mb-6" />
        
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
                  formatter={(value: number) => [`${value} kW`, '']}
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
                    <span>{unit.kw2024} kW ({unit.avgKwh2024} kWh avg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2025:</span>
                    <span className="text-savings font-medium">{unit.kw2025} kW ({unit.avgKwh2025} kWh avg)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights - Rawdah Standalone */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
          <EditableText textKey="rawdah.insights.title" defaultValue="Key Insights — Rawdah Performance (2024 vs 2025)" as="h3" className="text-xl font-semibold" />
        </div>
        <ul className="space-y-3">
          {rawdahInsights.map((insight, idx) => (
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
          <EditableText textKey="rawdah.monitoring.title" defaultValue="System Monitoring & Energy Management" as="h3" className="text-xl font-semibold" />
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
          <EditableText textKey="rawdah.obs.title" defaultValue="Unit Performance Observations" as="h3" className="text-xl font-semibold" />
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
          <EditableText textKey="rawdah.maint.title" defaultValue="Maintenance & Filters" as="h3" className="text-xl font-semibold" />
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
          <EditableText textKey="rawdah.issues.title" defaultValue="Monthly Issues" as="h3" className="text-xl font-semibold" />
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
          <EditableText textKey="rawdah.repairs.title" defaultValue="Equipment & Repairs" as="h3" className="text-xl font-semibold" />
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
          <EditableText textKey="rawdah.hours.title" defaultValue="Operating Hours Impact" as="h3" className="text-xl font-semibold" />
        </div>
        <p className="text-muted-foreground mb-4">{operatingHoursImpact.description}</p>
        
        <div className="mb-4">
          <EditableText textKey="rawdah.hours.fridayLabel" defaultValue="Friday Opening Times in September:" as="h4" className="font-medium mb-2" />
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
            <EditableText textKey="rawdah.hours.impact.title" defaultValue="Additional Consumption Impact" as="p" className="font-medium text-foreground" />
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
            <EditableText textKey="rawdah.ruben.title" defaultValue="Benchmark: Rawdah vs. Ruben" as="h2" className="text-2xl font-bold" />
            <EditableText textKey="rawdah.ruben.subtitle" defaultValue="Side-by-side comparison with Ruben Showroom (2025, Without G8)" as="p" className="text-sm text-muted-foreground" />
          </div>
        </div>

        {/* Benchmark Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-card p-4 card-elevated text-center">
            <p className="text-3xl font-bold text-savings">{summaryStats.avgSavingsPercent}%</p>
            <EditableText textKey="rawdah.ruben.stat1" defaultValue="Avg Savings vs Ruben" as="p" className="text-sm text-muted-foreground" />
          </div>
          <div className="rounded-xl bg-card p-4 card-elevated text-center">
            <p className="text-3xl font-bold text-savings">{summaryStats.totalAnnualSavings.toLocaleString()}</p>
            <EditableText textKey="rawdah.ruben.stat2" defaultValue="Annual Savings (SAR)" as="p" className="text-sm text-muted-foreground" />
          </div>
          <div className="rounded-xl bg-card p-4 card-elevated text-center">
            <p className="text-3xl font-bold">{summaryStats.monthsWonByRawdah}/{summaryStats.totalMonths}</p>
            <EditableText textKey="rawdah.ruben.stat3" defaultValue="Months Won (Rawdah)" as="p" className="text-sm text-muted-foreground" />
          </div>
          <div className="rounded-xl bg-card p-4 card-elevated text-center">
            <p className="text-3xl font-bold text-savings">Rawdah</p>
            <EditableText textKey="rawdah.ruben.stat4" defaultValue="Most Efficient" as="p" className="text-sm text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Monthly Comparison Chart - Rawdah vs Ruben */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <EditableText textKey="rawdah.ruben.chart.title" defaultValue="Monthly Consumption Comparison" as="h3" className="text-xl font-semibold mb-1" />
        <EditableText textKey="rawdah.ruben.chart.subtitle" defaultValue="Rawdah vs. Ruben Showroom (2025, Without G8)" as="p" className="text-sm text-muted-foreground mb-6" />
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
          <EditableText textKey="rawdah.ruben.table.title" defaultValue="Monthly Breakdown - Rawdah vs Ruben" as="h3" className="text-xl font-semibold" />
          <EditableText textKey="rawdah.ruben.table.subtitle" defaultValue="Detailed comparison with savings per month" as="p" className="text-sm text-muted-foreground mt-1" />
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

      {/* Key Insights — Rawdah vs Ruben */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-blue-500" />
          <EditableText textKey="rawdah.ruben.insights.title" defaultValue="Key Insights — Rawdah vs Ruben" as="h3" className="text-xl font-semibold" />
        </div>
        <ul className="space-y-3">
          {comparisonInsights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <span className="text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
