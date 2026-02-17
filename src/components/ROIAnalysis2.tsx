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
  ReferenceLine,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// RAW DATA FROM EXCEL (Page 3 & 4 – CONSUMPTION JARIR RAWDAH EXIT 12)
// ─────────────────────────────────────────────────────────────────────────────

// 2024 KW (without G8) — from Excel "Diff last year" row
const kw2024 = [25490, 34926, 36668, 40952, 60362, 67968, 72070, 75996, 59952, 42573, 33081, 22267];
// 2025 KW (without G8) — from Excel "Diff this year" row
const kw2025 = [26407, 25107, 41139, 52976, 61372, 61810, 67537, 68039, 55035, 39840, 32246, 21728];

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ─────────────────────────────────────────────────────────────────────────────
// WEATHER / COOLING LOAD ADJUSTMENT
// 2025 was hotter than 2024 (1.3°C hotter on average).
// We apply a 12% extra cooling load factor to 2025 figures
// (user-specified upper bound based on the temperature delta).
// This means the REAL 2025 demand — at 2024 temperatures — would be
// 2025_kw / 1.12  →  the "adjusted" baseline we compare against 2024.
// ─────────────────────────────────────────────────────────────────────────────
const COOLING_LOAD_FACTOR = 0.12; // 12% extra load in 2025

// Monthly breakdown
const monthlyData = months.map((month, i) => {
  const raw2024 = kw2024[i];
  const raw2025 = kw2025[i];

  // Adjusted 2025: strip out the extra 12% heat-driven load
  const adjusted2025 = Math.round(raw2025 / (1 + COOLING_LOAD_FACTOR));

  // Raw savings (uncompensated)
  const rawSavingsKw = raw2024 - raw2025;
  const rawSavingsPct = ((rawSavingsKw / raw2024) * 100);

  // True adjusted savings (comparing fair like-for-like)
  const trueSavingsKw = raw2024 - adjusted2025;
  const trueSavingsPct = ((trueSavingsKw / raw2024) * 100);

  // Financial impact @ 0.30 SAR/kWh
  const trueSavingsSAR = Math.round(trueSavingsKw * 0.30);

  return {
    month,
    raw2024,
    raw2025,
    adjusted2025,
    rawSavingsKw: Math.round(rawSavingsKw),
    rawSavingsPct: parseFloat(rawSavingsPct.toFixed(1)),
    trueSavingsKw: Math.round(trueSavingsKw),
    trueSavingsPct: parseFloat(trueSavingsPct.toFixed(1)),
    trueSavingsSAR,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// ANNUAL TOTALS
// ─────────────────────────────────────────────────────────────────────────────
const totalKw2024 = kw2024.reduce((a, b) => a + b, 0);
const totalKw2025 = kw2025.reduce((a, b) => a + b, 0);
const totalAdjusted2025 = monthlyData.reduce((a, m) => a + m.adjusted2025, 0);
const totalTrueSavingsKw = totalKw2024 - totalAdjusted2025;
const totalTrueSavingsPct = ((totalTrueSavingsKw / totalKw2024) * 100);
const totalTrueSavingsSAR = Math.round(totalTrueSavingsKw * 0.30);

// Raw (unadjusted) for comparison
const totalRawSavingsKw = totalKw2024 - totalKw2025;
const totalRawSavingsPct = ((totalRawSavingsKw / totalKw2024) * 100);

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-LEVEL DAILY DEMAND (from Excel demand comparison snapshots)
// ─────────────────────────────────────────────────────────────────────────────
const unitDemandData = [
  { unit: 'G1', kw2024: 478, kwh2024: 33, kw2025: 214, kwh2025: 15, reduction: 55.2 },
  { unit: 'G3', kw2024: 327, kwh2024: 22.5, kw2025: 217, kwh2025: 15, reduction: 33.6 },
  { unit: 'F3', kw2024: 477, kwh2024: 33, kw2025: 234, kwh2025: 15, reduction: 50.9 },
  { unit: 'F4 (F1)', kw2024: 465, kwh2024: 31, kw2025: 290, kwh2025: 20, reduction: 37.6 },
];

// Building-wide demand snapshots
const demandSnapshots = [
  { label: 'Oct 2023\n(Pre-SCC)', totalKw: 495, avgKwh: 33, fill: '#ef4444' },
  { label: 'Oct 2024\n(Old Filters)', totalKw: 218, avgKwh: 15, fill: '#f59e0b' },
  { label: 'Oct 2025\n(New Filters)', totalKw: 189, avgKwh: 12.5, fill: '#22c55e' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
const KwTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-sm shadow-lg">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{p.value.toLocaleString()} kWh</span>
        </p>
      ))}
    </div>
  );
};

const SavingsTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-sm shadow-lg">
      <p className="font-semibold mb-2">{label}</p>
      <p className="text-muted-foreground">True Adjusted Savings: <span className="text-savings font-bold">{d.trueSavingsKw.toLocaleString()} kWh</span></p>
      <p className="text-muted-foreground">Raw Savings: <span className="font-medium">{d.rawSavingsKw.toLocaleString()} kWh</span></p>
      <p className="text-muted-foreground">Financial Value: <span className="text-savings font-bold">{d.trueSavingsSAR.toLocaleString()} SAR</span></p>
      <p className="text-xs text-muted-foreground mt-1">Adjusted %: {d.trueSavingsPct}%</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function ROIAnalysis2() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl bg-card p-6 card-elevated border-l-4 border-l-savings">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-savings/10 mt-1">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">True Adjusted KW Savings Analysis</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
              This analysis is based on <strong>actual KW consumption data</strong> from the Excel meter readings (without G8). 
              A <strong>12% extra cooling load correction</strong> is applied to 2025 figures to account for the hotter climate 
              (2025 was ~1.3°C warmer than 2024). By normalizing to the same weather baseline, we reveal the <em>true energy 
              efficiency gains</em> delivered by the SCC system — not distorted by external temperature factors.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Box */}
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Adjustment Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-savings font-bold mt-0.5">①</span>
            <div>
              <p className="font-medium">Raw 2025 KW</p>
              <p className="text-muted-foreground">Actual meter-recorded consumption (without G8 panel)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-energy font-bold mt-0.5">②</span>
            <div>
              <p className="font-medium">÷ 1.12 Adjustment</p>
              <p className="text-muted-foreground">Strip out 12% extra load caused by 2025's hotter climate to get a fair comparison</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-chart-blue font-bold mt-0.5">③</span>
            <div>
              <p className="font-medium">True Savings = 2024 − Adjusted 2025</p>
              <p className="text-muted-foreground">Difference reveals actual efficiency gains at equivalent weather conditions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-card card-elevated p-5 text-center border-t-4 border-t-savings">
          <p className="text-3xl font-bold text-savings">{totalTrueSavingsKw.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">True Adjusted kWh Saved</p>
          <p className="text-xs text-muted-foreground">(2024 vs 2025, weather corrected)</p>
        </div>
        <div className="rounded-xl bg-card card-elevated p-5 text-center border-t-4 border-t-savings">
          <p className="text-3xl font-bold text-savings">{totalTrueSavingsPct.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">True Adjusted Savings %</p>
          <p className="text-xs text-muted-foreground">Weather-normalized efficiency gain</p>
        </div>
        <div className="rounded-xl bg-card card-elevated p-5 text-center border-t-4 border-t-chart-blue">
          <p className="text-3xl font-bold">{totalRawSavingsPct.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Raw Savings % (unadjusted)</p>
          <p className="text-xs text-muted-foreground">Before weather correction</p>
        </div>
        <div className="rounded-xl bg-card card-elevated p-5 text-center border-t-4 border-t-energy">
          <p className="text-3xl font-bold text-energy">{totalTrueSavingsSAR.toLocaleString()} SAR</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Financial Value</p>
          <p className="text-xs text-muted-foreground">@ 0.30 SAR/kWh true adjusted</p>
        </div>
      </div>

      {/* KW Comparison Chart — 2024 vs 2025 vs Adjusted */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-lg font-semibold mb-1">Monthly KW Consumption: 2024 vs 2025 vs Adjusted 2025</h3>
        <p className="text-sm text-muted-foreground mb-4">
          "Adjusted 2025" removes the 12% extra cooling load — showing what 2025 would have consumed at 2024 temperatures.
        </p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<KwTooltip />} />
              <Legend />
              <Bar dataKey="raw2024" name="2024 KWh" fill="hsl(var(--chart-blue))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="raw2025" name="2025 KWh (Raw)" fill="hsl(var(--energy))" radius={[2, 2, 0, 0]} opacity={0.7} />
              <Bar dataKey="adjusted2025" name="2025 KWh (Adjusted −12%)" fill="hsl(var(--savings))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* True Savings KW per month */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-lg font-semibold mb-1">Monthly True Adjusted KW Savings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Positive = Rawdah consumed less in 2025 (weather-corrected). Negative = 2025 consumed more even after adjustment.
        </p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v.toLocaleString()}`} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
              <Tooltip content={<SavingsTooltip />} />
              <Bar
                dataKey="trueSavingsKw"
                name="True Adjusted Savings (kWh)"
                radius={[3, 3, 0, 0]}
                fill="hsl(var(--savings))"
                // Red for negative bars
                isAnimationActive
              >
                {monthlyData.map((entry, index) => (
                  <rect
                    key={index}
                    fill={entry.trueSavingsKw >= 0 ? 'hsl(var(--savings))' : 'hsl(0, 72%, 51%)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="rounded-xl bg-card p-6 card-elevated overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Full Monthly Breakdown</h3>
        <table className="w-full text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Month</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">2024 kWh</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">2025 kWh (Raw)</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">2025 Adjusted (÷1.12)</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Raw Savings kWh</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">True Savings kWh</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">True %</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">SAR Value</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="py-2 pr-4 font-medium">{months[i]}</td>
                <td className="text-right py-2 px-3">{row.raw2024.toLocaleString()}</td>
                <td className="text-right py-2 px-3 text-muted-foreground">{row.raw2025.toLocaleString()}</td>
                <td className="text-right py-2 px-3 font-medium">{row.adjusted2025.toLocaleString()}</td>
                <td className={`text-right py-2 px-3 ${row.rawSavingsKw >= 0 ? 'text-savings' : 'text-destructive'}`}>
                  {row.rawSavingsKw >= 0 ? '+' : ''}{row.rawSavingsKw.toLocaleString()}
                </td>
                <td className={`text-right py-2 px-3 font-semibold ${row.trueSavingsKw >= 0 ? 'text-savings' : 'text-destructive'}`}>
                  {row.trueSavingsKw >= 0 ? '+' : ''}{row.trueSavingsKw.toLocaleString()}
                </td>
                <td className={`text-right py-2 px-3 font-semibold ${row.trueSavingsPct >= 0 ? 'text-savings' : 'text-destructive'}`}>
                  {row.trueSavingsPct >= 0 ? '+' : ''}{row.trueSavingsPct.toFixed(1)}%
                </td>
                <td className={`text-right py-2 px-3 font-semibold ${row.trueSavingsSAR >= 0 ? 'text-savings' : 'text-destructive'}`}>
                  {row.trueSavingsSAR >= 0 ? '+' : ''}{row.trueSavingsSAR.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/30 font-bold">
              <td className="py-3 pr-4">ANNUAL TOTAL</td>
              <td className="text-right py-3 px-3">{totalKw2024.toLocaleString()}</td>
              <td className="text-right py-3 px-3 text-muted-foreground">{totalKw2025.toLocaleString()}</td>
              <td className="text-right py-3 px-3">{totalAdjusted2025.toLocaleString()}</td>
              <td className={`text-right py-3 px-3 ${totalRawSavingsKw >= 0 ? 'text-savings' : 'text-destructive'}`}>
                {totalRawSavingsKw >= 0 ? '+' : ''}{totalRawSavingsKw.toLocaleString()}
              </td>
              <td className="text-right py-3 px-3 text-savings">{totalTrueSavingsKw >= 0 ? '+' : ''}{totalTrueSavingsKw.toLocaleString()}</td>
              <td className="text-right py-3 px-3 text-savings">{totalTrueSavingsPct.toFixed(1)}%</td>
              <td className="text-right py-3 px-3 text-savings">{totalTrueSavingsSAR.toLocaleString()} SAR</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Unit-Level Daily Demand Reduction */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-lg font-semibold mb-1">Unit-Level Daily Demand Reduction (kW)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Spot measurements on the same date in Oct 2024 vs Oct 2025 confirm dramatic load reduction per unit.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {unitDemandData.map((unit) => (
            <div key={unit.unit} className="rounded-lg border border-border p-4 bg-muted/20">
              <p className="font-bold text-base mb-3">{unit.unit}</p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Oct 2024</span>
                <span className="font-semibold text-destructive">{unit.kw2024} kW</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Oct 2025</span>
                <span className="font-semibold text-savings">{unit.kw2025} kW</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div
                  className="bg-savings h-2 rounded-full"
                  style={{ width: `${unit.reduction}%` }}
                />
              </div>
              <p className="text-center text-savings font-bold text-lg">{unit.reduction}% ↓</p>
              <p className="text-center text-xs text-muted-foreground">Avg: {unit.kwh2024} → {unit.kwh2025} kWh</p>
            </div>
          ))}
        </div>
      </div>

      {/* Building-Level Demand Snapshot */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-lg font-semibold mb-1">Building Total Daily Demand Snapshot (Oct 21 each year)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Full-building demand measured on the same date over 3 years — shows the compounding effect of SCC + new filters.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {demandSnapshots.map((snap) => (
            <div key={snap.label} className="text-center p-4 rounded-xl border border-border bg-muted/20">
              <p className="text-3xl font-bold mb-1" style={{ color: snap.fill }}>{snap.totalKw} kW</p>
              <p className="text-sm font-medium">{snap.label.replace('\n', ' ')}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg {snap.avgKwh} kWh/unit</p>
            </div>
          ))}
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandSnapshots} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit=" kW" />
              <Tooltip formatter={(v: number) => [`${v} kW`, 'Total Demand']} />
              <Bar dataKey="totalKw" name="Total Daily Demand (kW)" radius={[4, 4, 0, 0]}>
                {demandSnapshots.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-savings/10 border border-savings/30">
          <p className="text-sm font-semibold text-savings">
            📉 Building demand dropped from 495 kW → 189 kW = <strong>61.8% reduction</strong> since SCC installation + new filters
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This is the most powerful evidence of system effectiveness — measured on the exact same date each year.
          </p>
        </div>
      </div>

      {/* Summary Conclusion */}
      <div className="rounded-xl p-6 bg-gradient-to-br from-savings/10 to-savings/5 border border-savings/30">
        <h3 className="text-lg font-bold mb-4">📋 True Adjusted Savings — Conclusion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-2">What the raw numbers say</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Raw KW consumed in 2024: <strong>{totalKw2024.toLocaleString()} kWh</strong></li>
              <li>• Raw KW consumed in 2025: <strong>{totalKw2025.toLocaleString()} kWh</strong></li>
              <li>• Unadjusted saving: <strong>{totalRawSavingsKw.toLocaleString()} kWh ({totalRawSavingsPct.toFixed(1)}%)</strong></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">After 12% cooling load correction</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Adjusted 2025 baseline: <strong>{totalAdjusted2025.toLocaleString()} kWh</strong></li>
              <li>• True adjusted saving: <span className="text-savings font-bold">{totalTrueSavingsKw.toLocaleString()} kWh ({totalTrueSavingsPct.toFixed(1)}%)</span></li>
              <li>• Financial value @ 0.30 SAR/kWh: <span className="text-savings font-bold">{totalTrueSavingsSAR.toLocaleString()} SAR/year</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-savings/30">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Key takeaway:</strong> Even though 2025 was hotter (requiring 12% more cooling energy by nature), 
            the building still consumed significantly less power — confirming that the SCC system and improved filters are delivering 
            <strong className="text-savings"> genuine, measurable efficiency gains</strong> beyond what climate alone would explain.
            The unit-level measurements (G1: −55%, F3: −51%) further validate these savings at the individual AC level.
          </p>
        </div>
      </div>
    </div>
  );
}
