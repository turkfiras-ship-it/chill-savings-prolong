import { useRef } from "react";
import { Printer } from "lucide-react";
import { unitMonthlyData2025, unitAnnualTotals, unitInfo, unitNames, unitNamesWithG8 } from "@/data/unitMonthlyData";
import {
  energyCostSummary, summaryStats, monthlyComparisonData, yearlyComparisonData,
  demandSnapshots, unitComparisons, rawdahInsights, comparisonInsights,
  unitPerformanceObservations, maintenanceNotes, monthlyIssues, equipmentRepairs,
  operatingHoursImpact, systemMonitoringNotes,
} from "@/data/rawdahAnalysis";
import { majorSavingMonths, managementConclusion, seasonalCostBehavior, energyCostComparison, overallFinancialImpact } from "@/data/financialImpact";
import { monthlyWeatherData, weatherSummary } from "@/data/weatherData";
import {
  calculateROI, calculateTotalSavings, systemConfig, calculateReplacementSavings,
  lifespanExtension, environmentalImpact, technologySummary, maintenanceSavings,
  downtimeSavings, energySavings, acReplacementCosts,
} from "@/data/roiCalculations";

function PageBreak() {
  return <div className="hidden print:block print:break-before-page" />;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="w-10 h-1 bg-teal-500 mb-3 rounded-full print:bg-teal-600" />
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function PrintBooklet() {
  const printRef = useRef<HTMLDivElement>(null);
  const roi = calculateROI();
  const savings = calculateTotalSavings();
  const replacement = calculateReplacementSavings();
  const totalAnnual = unitAnnualTotals.total;
  const avgPerUnit = Math.round(totalAnnual / 7);

  const unitEfficiency = unitNames.map(name => ({
    unit: name,
    annual: unitAnnualTotals[name],
    location: unitInfo[name].location,
    notes: unitInfo[name].notes,
    peakMonth: unitMonthlyData2025.reduce((max, m) =>
      m[name] > (max?.value || 0) ? { month: m.month, value: m[name] } : max,
      { month: '', value: 0 }
    ),
    lowestMonth: unitMonthlyData2025.reduce((min, m) =>
      m[name] < (min?.value || Infinity) ? { month: m.month, value: m[name] } : min,
      { month: '', value: Infinity }
    ),
    summerAvg: Math.round(
      unitMonthlyData2025
        .filter(m => ['May', 'June', 'July', 'August', 'September'].includes(m.month))
        .reduce((sum, m) => sum + m[name], 0) / 5
    ),
    winterAvg: Math.round(
      unitMonthlyData2025
        .filter(m => ['January', 'February', 'November', 'December'].includes(m.month))
        .reduce((sum, m) => sum + m[name], 0) / 4
    ),
  })).sort((a, b) => b.annual - a.annual);

  const adjustedEnergyLow = weatherSummary.adjustedSavingsLow;
  const adjustedEnergyHigh = weatherSummary.adjustedSavingsHigh;
  const adjustedAnnualLow = adjustedEnergyLow + savings.maintenanceSavings + savings.downtimeSavings;
  const adjustedAnnualHigh = adjustedEnergyHigh + savings.maintenanceSavings + savings.downtimeSavings;
  const adjustedAnnualMid = (adjustedAnnualLow + adjustedAnnualHigh) / 2;
  const adjustedPayback = systemConfig.totalSystemCost / adjustedAnnualMid;

  return (
    <div className="space-y-6">
      {/* Print Button */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold">Print Booklet</h2>
          <p className="text-sm text-muted-foreground">Complete analysis — all tabs, tables, and data in print-ready format</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
        >
          <Printer className="h-5 w-5" />
          Print Booklet
        </button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="print-booklet space-y-6 print:space-y-0 text-sm">

        {/* ═══════════ PAGE 1: COVER ═══════════ */}
        <div className="print-page rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-10 text-white print:rounded-none print:min-h-[100vh] print:flex print:flex-col print:justify-center">
          <div className="w-16 h-1.5 bg-teal-400 mb-8 rounded-full" />
          <h1 className="text-4xl font-bold mb-3">Power Saving System</h1>
          <h2 className="text-2xl font-light text-slate-300 mb-4">Energy Efficiency & ROI Analysis</h2>
          <p className="text-lg text-slate-400 mb-8">Jarir Bookstore — Rawdah Showroom Case Study</p>
          <div className="flex gap-5 mb-10">
            {[
              { label: "Units", value: "7 × 25 Ton" },
              { label: "Technology", value: "SCC System" },
              { label: "Data Period", value: "2023–2025" },
            ].map(item => (
              <div key={item.label} className="px-5 py-3 border border-slate-600 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{energyCostSummary.yearlySavingsPercent}%</p>
              <p className="text-xs opacity-80">Cost Reduction</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()}</p>
              <p className="text-xs opacity-80">SAR Saved (2025)</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">62%</p>
              <p className="text-xs opacity-80">Demand Reduction</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{roi.paybackPeriodYears.toFixed(1)}</p>
              <p className="text-xs opacity-80">ROI (Years)</p>
            </div>
          </div>
          <p className="mt-auto pt-8 text-xs text-slate-600">Confidential — Prepared for Jarir Bookstore</p>
        </div>

        {/* ═══════════ PAGE 2: EXECUTIVE SUMMARY ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Executive Summary" subtitle="Key Performance Highlights" />
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { v: `${summaryStats.avgSavingsPercent}%`, l: "Energy Savings Rate", s: "vs. Ruben Showroom" },
              { v: `${energyCostSummary.yearlySavings2024vs2025.toLocaleString()}`, l: "SAR Saved in 2025", s: "Year-over-year" },
              { v: "62%", l: "Demand Reduction", s: "Daily kW consumption" },
              { v: `${roi.paybackPeriodYears.toFixed(1)} yrs`, l: "Payback Period", s: "Investment recovery" },
            ].map(c => (
              <div key={c.l} className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold">{c.v}</p>
                <p className="text-xs font-medium mt-1">{c.l}</p>
                <p className="text-xs text-muted-foreground">{c.s}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-4">
            <p className="font-semibold text-xs text-teal-700 mb-1">Weather-Adjusted True Savings (2025 was {weatherSummary.avgTempDiff}°C hotter)</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div><strong>Actual:</strong> {energyCostSummary.yearlySavings2024vs2025.toLocaleString()} SAR</div>
              <div><strong>Avoided Load:</strong> {weatherSummary.additionalCoolingCostLow.toLocaleString()}–{weatherSummary.additionalCoolingCostHigh.toLocaleString()} SAR</div>
              <div><strong>True Savings:</strong> <span className="text-teal-700 font-bold">{adjustedEnergyLow.toLocaleString()}–{adjustedEnergyHigh.toLocaleString()} SAR</span></div>
              <div><strong>Efficiency Gain:</strong> <span className="text-teal-700 font-bold">17.25%</span></div>
            </div>
          </div>

          <h3 className="font-semibold mb-2">Energy Cost Comparison</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg border"><p className="text-xs text-muted-foreground">2023 Baseline</p><p className="text-lg font-bold">{energyCostComparison.year2023.totalBill.toLocaleString()} SAR</p></div>
            <div className="p-3 rounded-lg border border-red-200"><p className="text-xs text-muted-foreground">2024 (+{energyCostSummary.yearOverYearIncrease2024}%)</p><p className="text-lg font-bold">{energyCostComparison.year2024.totalBill.toLocaleString()} SAR</p></div>
            <div className="p-3 rounded-lg border border-teal-200"><p className="text-xs text-muted-foreground">2025 With SCC (-6.09%)</p><p className="text-lg font-bold text-teal-700">{energyCostComparison.year2025.totalBill.toLocaleString()} SAR</p></div>
          </div>

          <h3 className="font-semibold mb-2">Top Saving Months (2024 vs 2025)</h3>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {majorSavingMonths.map(m => (
              <div key={m.month} className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="font-medium text-xs">{m.month}</p>
                <p className="text-lg font-bold text-teal-600">-{m.costReduction}%</p>
                <p className="text-xs text-muted-foreground">{m.savingsSAR.toLocaleString()} SAR</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-800 text-white rounded-lg">
            <p className="font-semibold text-xs mb-1">Management Conclusion</p>
            <p className="text-xs opacity-90">{managementConclusion.headline}</p>
            <ul className="mt-1 space-y-0.5">
              {managementConclusion.details.map((d, i) => <li key={i} className="text-xs opacity-80">• {d}</li>)}
            </ul>
          </div>
        </div>

        {/* ═══════════ PAGE 3: YEAR-OVER-YEAR TABLE ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Year-over-Year Comparison" subtitle="2024 vs 2025 Monthly Cost (SAR)" />
          <table className="w-full text-xs border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-1.5 font-semibold">Month</th>
                <th className="text-right py-1.5 font-semibold">2024 (SAR)</th>
                <th className="text-right py-1.5 font-semibold">2025 (SAR)</th>
                <th className="text-right py-1.5 font-semibold">Change %</th>
                <th className="text-right py-1.5 font-semibold">Savings</th>
              </tr>
            </thead>
            <tbody>
              {yearlyComparisonData.map(row => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="py-1 font-medium">{row.month}</td>
                  <td className="py-1 text-right tabular-nums">{row.year2024.toLocaleString()}</td>
                  <td className="py-1 text-right tabular-nums">{row.year2025.toLocaleString()}</td>
                  <td className={`py-1 text-right font-semibold ${row.percentDiff > 0 ? 'text-teal-600' : 'text-red-500'}`}>{row.percentDiff > 0 ? '+' : ''}{row.percentDiff.toFixed(1)}%</td>
                  <td className="py-1 text-right font-semibold text-teal-600">{row.savingsSAR > 0 ? row.savingsSAR.toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t-2 font-bold"><td className="py-1.5">TOTAL</td><td className="py-1.5 text-right">{yearlyComparisonData.reduce((s, r) => s + r.year2024, 0).toLocaleString()}</td><td className="py-1.5 text-right">{yearlyComparisonData.reduce((s, r) => s + r.year2025, 0).toLocaleString()}</td><td className="py-1.5 text-right text-teal-600">6.09%</td><td className="py-1.5 text-right text-teal-600">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()}</td></tr></tfoot>
          </table>

          <p className="text-xs text-muted-foreground mb-4 p-2 bg-teal-50 rounded border border-teal-200">
            <strong className="text-teal-700">Result:</strong> 8 out of 12 months showed YoY savings. Total: <strong className="text-teal-700">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()} SAR</strong> saved despite hotter weather.
          </p>

          <h3 className="font-semibold mb-2">Seasonal Cost Behavior</h3>
          <p className="text-xs text-muted-foreground mb-1">Peak costs: {seasonalCostBehavior.peakCostPeriod}. 2025 peaks are {seasonalCostBehavior.peak2025VsPeak2024} than 2024.</p>
          <ul className="text-xs space-y-0.5 mb-2">
            {seasonalCostBehavior.indicators.map((ind, i) => <li key={i}>✓ {ind}</li>)}
          </ul>
          <p className="text-xs font-semibold text-teal-600">{seasonalCostBehavior.conclusion}</p>
        </div>

        {/* ═══════════ PAGE 4: WEATHER IMPACT ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Weather Impact Analysis" subtitle="2024 vs 2025 — Riyadh Temperatures & Energy Correlation" />
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200"><p className="text-xl font-bold text-red-600">+{weatherSummary.avgTempDiff}°C</p><p className="text-xs">Avg Increase</p></div>
            <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200"><p className="text-xl font-bold text-red-600">{weatherSummary.hottestTemp2025}°C</p><p className="text-xs">Peak ({weatherSummary.hottestMonth2025})</p></div>
            <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-xl font-bold">{weatherSummary.peakMonths.length}</p><p className="text-xs">Months Above 40°C</p></div>
            <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-xl font-bold">{weatherSummary.coolingDegreeIncrease}</p><p className="text-xs">More Cooling Load</p></div>
          </div>

          <table className="w-full text-xs border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-1.5">Month</th>
                <th className="text-right py-1.5">2024 Temp</th>
                <th className="text-right py-1.5">2025 Temp</th>
                <th className="text-right py-1.5">Temp Δ</th>
                <th className="text-right py-1.5">2024 Cost</th>
                <th className="text-right py-1.5">2025 Cost</th>
                <th className="text-right py-1.5">Cost Savings</th>
              </tr>
            </thead>
            <tbody>
              {monthlyWeatherData.map((w, idx) => {
                const yoy = yearlyComparisonData[idx];
                const saved = yoy ? yoy.year2024 - yoy.year2025 : 0;
                return (
                  <tr key={w.month} className="border-b border-slate-100">
                    <td className="py-1 font-medium">{w.month}</td>
                    <td className="py-1 text-right">{w.avgTemp2024}°C</td>
                    <td className="py-1 text-right text-red-500">{w.avgTemp2025}°C</td>
                    <td className="py-1 text-right text-red-500">+{w.tempDiff}°C</td>
                    <td className="py-1 text-right">{yoy?.year2024.toLocaleString()}</td>
                    <td className="py-1 text-right">{yoy?.year2025.toLocaleString()}</td>
                    <td className={`py-1 text-right font-medium ${saved > 0 ? 'text-teal-600' : 'text-red-500'}`}>{saved > 0 ? `${Math.round(saved).toLocaleString()} ✓` : Math.round(saved).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200"><p className="text-xs text-muted-foreground">Expected Extra Cost</p><p className="text-lg font-bold text-red-600">{weatherSummary.additionalCoolingCostLow.toLocaleString()}–{weatherSummary.additionalCoolingCostHigh.toLocaleString()}</p><p className="text-xs">SAR</p></div>
            <div className="p-3 bg-teal-50 rounded-lg text-center border border-teal-200"><p className="text-xs text-muted-foreground">Actual Savings</p><p className="text-lg font-bold text-teal-600">{weatherSummary.actualSavings.toLocaleString()}</p><p className="text-xs">SAR</p></div>
            <div className="p-3 bg-teal-50 rounded-lg text-center border-2 border-teal-300"><p className="text-xs text-muted-foreground">True Adjusted Value</p><p className="text-lg font-bold text-teal-600">{adjustedEnergyLow.toLocaleString()}–{adjustedEnergyHigh.toLocaleString()}</p><p className="text-xs">SAR (Savings + Avoided)</p></div>
          </div>
          <p className="text-xs text-muted-foreground">{weatherSummary.insight}</p>
        </div>

        {/* ═══════════ PAGE 5: RAWDAH VS RUBEN ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Rawdah vs Ruben Comparison" subtitle="2025 Monthly Consumption — Without G8 (SAR)" />
          <table className="w-full text-xs border-collapse mb-4">
            <thead>
              <tr className="border-b-2"><th className="text-left py-1.5">Month</th><th className="text-right py-1.5">Ruben</th><th className="text-right py-1.5">Rawdah</th><th className="text-right py-1.5">Diff %</th><th className="text-right py-1.5">Savings</th><th className="text-center py-1.5">Winner</th></tr>
            </thead>
            <tbody>
              {monthlyComparisonData.map(row => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="py-1 font-medium">{row.month}</td>
                  <td className="py-1 text-right tabular-nums">{row.ruben.toLocaleString()}</td>
                  <td className="py-1 text-right tabular-nums">{row.rawdah.toLocaleString()}</td>
                  <td className={`py-1 text-right font-semibold ${row.difference > 0 ? 'text-teal-600' : 'text-red-500'}`}>{row.difference > 0 ? '+' : ''}{row.difference}%</td>
                  <td className="py-1 text-right text-teal-600">{row.savingsSAR > 0 ? row.savingsSAR.toLocaleString() : '—'}</td>
                  <td className="py-1 text-center"><span className={`text-xs font-semibold ${row.winner === 'RAWDAH' ? 'text-teal-600' : 'text-slate-400'}`}>{row.winner}</span></td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t-2 font-bold"><td className="py-1.5">TOTAL</td><td className="py-1.5 text-right">{monthlyComparisonData.reduce((s, r) => s + r.ruben, 0).toLocaleString()}</td><td className="py-1.5 text-right">{monthlyComparisonData.reduce((s, r) => s + r.rawdah, 0).toLocaleString()}</td><td className="py-1.5 text-right text-teal-600">{summaryStats.avgSavingsPercent}%</td><td className="py-1.5 text-right text-teal-600">{summaryStats.totalAnnualSavings.toLocaleString()}</td><td className="py-1.5 text-center text-teal-600 text-xs font-bold">RAWDAH</td></tr></tfoot>
          </table>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-2 bg-teal-50 rounded text-center"><p className="text-xl font-bold text-teal-600">{summaryStats.monthsWonByRawdah}</p><p className="text-xs">Months Won (Rawdah)</p></div>
            <div className="p-2 bg-muted/30 rounded text-center"><p className="text-xl font-bold">{summaryStats.monthsWonByRuben}</p><p className="text-xs">Months Won (Ruben)</p></div>
            <div className="p-2 bg-teal-50 rounded text-center"><p className="text-xl font-bold text-teal-600">{summaryStats.avgSavingsPercent}%</p><p className="text-xs">Avg Savings Rate</p></div>
          </div>
          <h3 className="font-semibold mb-1 text-xs">Key Comparison Insights</h3>
          <ul className="text-xs space-y-0.5">{comparisonInsights.map((ins, i) => <li key={i}>✓ {ins}</li>)}</ul>
        </div>

        {/* ═══════════ PAGE 6: DEMAND REDUCTION & UNIT PERFORMANCE ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Demand Reduction & Unit Performance" subtitle="Before & After SCC Installation" />
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {demandSnapshots.map(s => (
              <div key={s.date} className={`p-3 rounded-lg border ${s.status === 'optimized' ? 'border-teal-200 bg-teal-50/50' : 'bg-muted/20'}`}>
                <p className="text-xs text-muted-foreground">{s.date} — {s.label}</p>
                <p className="text-xl font-bold">{s.totalDailyConsumption} <span className="text-xs font-normal">kW daily</span></p>
                <p className="text-xs text-muted-foreground">{s.avgKwh} kWh avg</p>
              </div>
            ))}
          </div>
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-4">
            <p className="font-bold text-teal-700 text-xs">62% Total Reduction — 495 kW (2023) → 189 kW (2025), saving 306 kW per day</p>
          </div>

          <h3 className="font-semibold mb-2">Unit-Level Performance (2024 vs 2025)</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {unitComparisons.map(u => (
              <div key={u.unit} className="p-3 rounded-lg border text-center">
                <p className="font-bold text-lg">{u.unit}</p>
                <p className="text-xs">{u.kw2024} → {u.kw2025} kW</p>
                <p className="text-lg font-bold text-teal-600">-{u.reduction}%</p>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-1">Key Insights — Rawdah Performance</h3>
          <ul className="text-xs space-y-0.5">{rawdahInsights.map((ins, i) => <li key={i}>• {ins}</li>)}</ul>
        </div>

        {/* ═══════════ PAGE 7: G8 PANEL & OPERATIONAL NOTES ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="G8 Panel & Operational Notes" />
          
          <div className="mb-4 p-3 rounded-lg border border-amber-300/50 bg-amber-50/30">
            <p className="font-bold text-xs mb-1">G8 — Panel 8 (7 Units, 26 Tons Total — NOT covered by SCC)</p>
            <p className="text-xs text-muted-foreground mb-2">G8 consumes 90,883 kWh/year (13.9% of total building) but is NOT optimized by SCC. This dilutes bill-level savings.</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "Cassette MCCT36 (3 ton) — Basement WH",
                "Split RYD25 (2 ton) — Server Room",
                "Cassette MCCT48 (4 ton) — GF Receiving",
                "Cassette MCCT48 (4 ton) — GF WH/Gifts",
                "Cassette MCCT48 (4 ton) — Elevator Lobby",
                "Ducted Split MHGT60 (6 ton) — Salesman Lounge",
                "Cassette MCCT36 (3 ton) — Smoking Area",
              ].map((item, i) => <p key={i}>• {item}</p>)}
            </div>
          </div>

          <h3 className="font-semibold mb-1">Unit Performance Observations</h3>
          <div className="space-y-2 mb-4">
            {unitPerformanceObservations.map((obs, i) => (
              <div key={i} className="p-2 rounded border text-xs">
                <p className="font-semibold">{obs.unit}</p>
                <p className="text-muted-foreground">{obs.issue}</p>
                {obs.recommendation && <p className="text-teal-700 mt-0.5"><strong>Rec:</strong> {obs.recommendation}</p>}
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-1">Maintenance & Filters</h3>
          {maintenanceNotes.map((note, i) => (
            <div key={i} className="mb-2">
              <p className="text-xs font-semibold">{note.category}</p>
              <ul className="text-xs">{note.notes.map((n, j) => <li key={j}>• {n}</li>)}</ul>
            </div>
          ))}

          <h3 className="font-semibold mb-1 mt-3">Monthly Issues</h3>
          <div className="grid grid-cols-2 gap-2">
            {monthlyIssues.map((issue, i) => (
              <div key={i} className="p-2 rounded border text-xs">
                <p className="font-semibold">{issue.month}</p>
                <ul>{issue.issues.map((iss, j) => <li key={j}>• {iss}</li>)}</ul>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-1 mt-3">Equipment Repairs</h3>
          <div className="text-xs space-y-0.5">
            {equipmentRepairs.map((r, i) => <p key={i}>• <strong>{r.item}:</strong> {r.details}</p>)}
          </div>

          <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
            <p className="font-semibold">Operating Hours Impact:</p>
            <p>{operatingHoursImpact.description} Additional: {operatingHoursImpact.additionalConsumption.toLocaleString()} kWh = {operatingHoursImpact.additionalCost.toLocaleString()} SAR</p>
          </div>
        </div>

        {/* ═══════════ PAGE 8: UNIT MONTHLY DATA TABLE ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Unit-Level Monthly Consumption (2025)" subtitle="kWh per unit per month" />
          <table className="w-full text-[10px] border-collapse mb-4">
            <thead>
              <tr className="border-b-2"><th className="text-left py-1">Month</th>{unitNamesWithG8.map(n => <th key={n} className="text-right py-1">{n}</th>)}<th className="text-right py-1">Total</th></tr>
            </thead>
            <tbody>
              {unitMonthlyData2025.map(row => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="py-0.5 font-medium">{row.month.substring(0, 3)}</td>
                  {unitNamesWithG8.map(n => <td key={n} className="py-0.5 text-right tabular-nums">{row[n].toLocaleString()}</td>)}
                  <td className="py-0.5 text-right font-semibold tabular-nums">{row.totalWithG8.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold">
                <td className="py-1">Annual</td>
                {unitNamesWithG8.map(n => <td key={n} className="py-1 text-right tabular-nums">{unitAnnualTotals[n].toLocaleString()}</td>)}
                <td className="py-1 text-right tabular-nums">{unitAnnualTotals.totalWithG8.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <h3 className="font-semibold mb-2">Unit Info Cards</h3>
          <div className="grid grid-cols-2 gap-2">
            {unitNamesWithG8.map(u => (
              <div key={u} className="p-2 rounded border text-xs">
                <div className="flex justify-between"><span className="font-bold">{u}</span><span className="font-bold tabular-nums">{unitAnnualTotals[u].toLocaleString()} kWh/yr</span></div>
                <p className="text-muted-foreground">{unitInfo[u].location}</p>
                <p className="text-muted-foreground italic">{unitInfo[u].notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ PAGE 9: UNIT-SPECIFIC OPTIMIZATION ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Unit-Specific Optimization" subtitle="Ranked by annual consumption with targeted recommendations" />
          <div className="space-y-2">
            {unitEfficiency.map((unit, idx) => {
              const isHigh = unit.annual > avgPerUnit;
              const ratio = ((unit.annual / avgPerUnit) * 100 - 100);
              return (
                <div key={unit.unit} className={`p-2 rounded border text-xs ${isHigh ? 'border-amber-300/50' : 'border-teal-300/50'}`}>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-muted">{idx + 1}</span>
                      <span className="font-bold">{unit.unit}</span>
                      <span className="text-muted-foreground">{unit.location}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{unit.annual.toLocaleString()} kWh</span>
                      <span className={`ml-1 ${isHigh ? 'text-amber-600' : 'text-teal-600'}`}>({isHigh ? `+${ratio.toFixed(0)}%` : `-${Math.abs(ratio).toFixed(0)}%`})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] mb-1">
                    <span>Peak: {unit.peakMonth.month} ({unit.peakMonth.value.toLocaleString()})</span>
                    <span>Low: {unit.lowestMonth.month} ({unit.lowestMonth.value.toLocaleString()})</span>
                    <span>Summer Avg: {unit.summerAvg.toLocaleString()}</span>
                    <span>Winter Avg: {unit.winterAvg.toLocaleString()}</span>
                  </div>
                  <p className="text-muted-foreground">{unit.notes}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════ PAGE 10: RECOMMENDATIONS ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Top Actionable Recommendations" subtitle="Optimization steps to maximize savings" />
          <div className="space-y-2 mb-4">
            {[
              { title: 'Lock Thermostats at 22–24°C', desc: 'Install tamper-proof covers or smart thermostats with locked ranges. March data confirmed 18°C misuse causing 15–20% spike.', savings: '8,000–12,000 SAR/yr', p: 'high' },
              { title: 'Air Curtain for G1 Entrance', desc: 'G1 loses 60–80% cooling through door openings. Install commercial air curtain + fix auto-closing mechanism.', savings: '5,000–8,000 SAR/yr', p: 'high' },
              { title: 'F1 Duct Line & Insulation', desc: 'F1 highest consumer (97,034 kWh/yr). Cancel back duct, install wall split for ladies lounge, add warehouse ventilation.', savings: '7,000–12,000 SAR/yr', p: 'high' },
              { title: 'G3/F1 Alternating Operation', desc: 'Overlapping zones across floors. Alternate during low-traffic hours to reduce combined load ~10%.', savings: '2,000–3,000 SAR/yr', p: 'medium' },
              { title: 'Quarterly Preventive Maintenance', desc: 'Only 3 cleanings in 2025 — below quarterly target. Dirty filters increase consumption 5–15%.', savings: '3,000–5,000 SAR/yr', p: 'high' },
              { title: 'Seasonal Fan Speed Adjustment', desc: 'Reduce fan speed to medium during winter (Nov–Feb). Pre-cool before opening in summer.', savings: '2,000–3,500 SAR/yr', p: 'medium' },
              { title: 'F2 Monthly Sensor Monitoring', desc: 'August spike (53% above avg) from faulty sensor. Implement monthly calibration checks & backup sensors.', savings: '1,500–2,500 SAR/yr', p: 'low' },
            ].map((rec, i) => (
              <div key={i} className="p-2 rounded border text-xs flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold">{i + 1}. {rec.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${rec.p === 'high' ? 'bg-red-100 text-red-600' : rec.p === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'}`}>{rec.p}</span>
                  </div>
                  <p className="text-muted-foreground">{rec.desc}</p>
                </div>
                <span className="text-teal-600 font-bold whitespace-nowrap">{rec.savings}</span>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-2">Estimated Total Savings from Recommendations</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-teal-50 rounded-lg text-center border border-teal-200"><p className="text-xs">Conservative</p><p className="text-xl font-bold text-teal-700">25,000+ SAR</p><p className="text-xs text-muted-foreground">per year</p></div>
            <div className="p-3 bg-teal-50 rounded-lg text-center border border-teal-200"><p className="text-xs">Optimistic</p><p className="text-xl font-bold text-teal-700">45,000+ SAR</p><p className="text-xs text-muted-foreground">per year</p></div>
            <div className="p-3 bg-slate-800 rounded-lg text-center text-white"><p className="text-xs opacity-80">Combined with SCC</p><p className="text-xl font-bold">60,000+ SAR</p><p className="text-xs opacity-70">total annual</p></div>
          </div>

          <div className="mt-3 p-2 rounded border text-xs">
            <p className="font-semibold mb-1">Optimal Temperature Settings</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><span className="text-blue-600 font-bold text-lg">24°C</span><br/>Winter (Nov–Feb)</div>
              <div><span className="text-amber-500 font-bold text-lg">23°C</span><br/>Transition (Mar–Apr, Oct)</div>
              <div><span className="text-red-500 font-bold text-lg">22°C</span><br/>Summer (May–Sep) — NOT below</div>
            </div>
          </div>
        </div>

        {/* ═══════════ PAGE 11: ROI ANALYSIS ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Return on Investment" subtitle="Rawdah Showroom — 7 Units × 25 Tons" />
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-slate-800 text-white rounded-lg"><p className="text-xs text-slate-400">Investment</p><p className="text-xl font-bold">{systemConfig.totalSystemCost.toLocaleString()} SAR</p><p className="text-xs text-slate-400">{systemConfig.numberOfUnits} × {systemConfig.costPerUnit.toLocaleString()}</p></div>
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200"><p className="text-xs">Annual Savings</p><p className="text-xl font-bold text-teal-700">{Math.round(savings.annualOperationalSavings).toLocaleString()}</p></div>
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200"><p className="text-xs">Payback</p><p className="text-xl font-bold text-teal-700">{roi.paybackPeriodYears.toFixed(1)} yrs</p></div>
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200"><p className="text-xs">5-Year ROI</p><p className="text-xl font-bold text-teal-700">{roi.fiveYearROI.toFixed(0)}%</p></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded border"><p className="text-xs">5-Year Total Savings</p><p className="text-lg font-bold">{Math.round(roi.fiveYearTotalSavings).toLocaleString()} SAR</p><p className="text-xs text-teal-600">Net: {Math.round(roi.fiveYearNetProfit).toLocaleString()} SAR | ROI: {roi.fiveYearROI.toFixed(0)}%</p></div>
            <div className="p-3 rounded border"><p className="text-xs">10-Year Total Savings</p><p className="text-lg font-bold">{Math.round(roi.tenYearTotalSavings).toLocaleString()} SAR</p><p className="text-xs text-teal-600">Net: {Math.round(roi.tenYearNetProfit).toLocaleString()} SAR | ROI: {roi.tenYearROI.toFixed(0)}%</p></div>
          </div>

          <h3 className="font-semibold mb-1">Weather-Adjusted True ROI</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded border"><p className="text-xs">Adjusted Annual Savings</p><p className="text-lg font-bold text-teal-600">{Math.round(adjustedAnnualLow).toLocaleString()}–{Math.round(adjustedAnnualHigh).toLocaleString()} SAR</p></div>
            <div className="p-3 rounded border"><p className="text-xs">Adjusted Payback</p><p className="text-lg font-bold text-teal-600">{adjustedPayback.toFixed(1)} years</p></div>
            <div className="p-3 rounded border"><p className="text-xs">Adjusted 5-Year</p><p className="text-lg font-bold text-teal-600">{Math.round(adjustedAnnualMid * 5).toLocaleString()} SAR</p></div>
          </div>

          <h3 className="font-semibold mb-1">Savings Breakdown (Annual)</h3>
          <table className="w-full text-xs border-collapse mb-4">
            <thead><tr className="border-b-2"><th className="text-left py-1">Category</th><th className="text-right py-1">Annual</th><th className="text-right py-1">% of Total</th></tr></thead>
            <tbody>
              {[
                { name: 'Energy Savings', value: savings.energySavings },
                { name: 'Maintenance Savings', value: savings.maintenanceSavings },
                { name: 'Downtime Avoidance', value: savings.downtimeSavings },
                { name: 'Lifespan Extension (annualized)', value: savings.replacementSavingsAnnualized },
              ].map(item => (
                <tr key={item.name} className="border-b"><td className="py-1">{item.name}</td><td className="py-1 text-right">{Math.round(item.value).toLocaleString()} SAR</td><td className="py-1 text-right">{((item.value / savings.totalAnnualSavingsWithReplacement) * 100).toFixed(1)}%</td></tr>
              ))}
              <tr className="border-t-2 font-bold"><td className="py-1">Total (incl. annualized lifespan)</td><td className="py-1 text-right text-teal-600">{Math.round(savings.totalAnnualSavingsWithReplacement).toLocaleString()} SAR</td><td></td></tr>
            </tbody>
          </table>

          <h3 className="font-semibold mb-1">AC Lifespan Extension</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-2 rounded border text-center"><p className="text-xs">Without SCC</p><p className="text-lg font-bold text-red-600">{lifespanExtension.normalLifespan} yrs</p></div>
            <div className="p-2 rounded border text-center"><p className="text-xs">With SCC</p><p className="text-lg font-bold text-teal-600">{lifespanExtension.extendedLifespan} yrs</p></div>
            <div className="p-2 rounded border text-center"><p className="text-xs">Replacement Avoided</p><p className="text-lg font-bold">{replacement.avgTotal.toLocaleString()} SAR</p></div>
          </div>
        </div>

        {/* ═══════════ PAGE 12: MAINTENANCE TABLE & ENVIRONMENT ═══════════ */}
        <PageBreak />
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:border-0">
          <SectionTitle title="Maintenance & Operational Cost Savings" subtitle="Detailed annual breakdown" />
          <table className="w-full text-[10px] border-collapse mb-4">
            <thead><tr className="border-b-2"><th className="text-left py-1">Category</th><th className="text-right py-1">Without</th><th className="text-right py-1">With</th><th className="text-right py-1">Savings</th><th className="text-left py-1 pl-2">Notes</th></tr></thead>
            <tbody>
              {maintenanceSavings.map((item, i) => (
                <tr key={i} className="border-b"><td className="py-0.5"><strong>{item.category}</strong><br/><span className="text-muted-foreground">{item.description}</span></td><td className="py-0.5 text-right text-red-500">{Math.round(item.withoutSystem).toLocaleString()}</td><td className="py-0.5 text-right">{Math.round(item.withSystem).toLocaleString()}</td><td className="py-0.5 text-right text-teal-600 font-semibold">{Math.round(item.annualSavings).toLocaleString()}</td><td className="py-0.5 pl-2 text-muted-foreground">{item.notes}</td></tr>
              ))}
              <tr className="border-b"><td className="py-0.5"><strong>Downtime Avoidance</strong></td><td className="py-0.5 text-right text-red-500">{(downtimeSavings.averageDowntimeHoursWithout * downtimeSavings.hourlyRevenueLoss).toLocaleString()}</td><td className="py-0.5 text-right">{(downtimeSavings.averageDowntimeHoursWith * downtimeSavings.hourlyRevenueLoss).toLocaleString()}</td><td className="py-0.5 text-right text-teal-600 font-semibold">{downtimeSavings.annualSavings.toLocaleString()}</td><td className="py-0.5 pl-2 text-muted-foreground">{downtimeSavings.notes}</td></tr>
              <tr className="border-b"><td className="py-0.5"><strong>Energy Cost Reduction</strong></td><td className="py-0.5 text-right">—</td><td className="py-0.5 text-right">—</td><td className="py-0.5 text-right text-teal-600 font-semibold">{Math.round(energySavings.annualSavingsRawdah).toLocaleString()}</td><td className="py-0.5 pl-2 text-muted-foreground">{energySavings.annualSavingsPercent}% reduction</td></tr>
              <tr className="border-t-2 font-bold"><td className="py-1">TOTAL ANNUAL OPERATIONAL</td><td></td><td></td><td className="py-1 text-right text-teal-600">{Math.round(savings.annualOperationalSavings).toLocaleString()} SAR</td><td className="py-1 pl-2 text-xs font-normal">+ {replacement.avgTotal.toLocaleString()} SAR at yr 10</td></tr>
            </tbody>
          </table>

          <h3 className="font-semibold mb-2">Environmental Impact — CO₂ Reduction</h3>
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="p-2 rounded bg-teal-50 border border-teal-200 text-center"><p className="text-lg font-bold text-teal-600">{environmentalImpact.annualCo2SavedTons}</p><p className="text-[10px]">Tons CO₂/yr</p></div>
            <div className="p-2 rounded bg-teal-50 border border-teal-200 text-center"><p className="text-lg font-bold text-teal-600">{environmentalImpact.treesEquivalent.toLocaleString()}</p><p className="text-[10px]">Trees equiv/yr</p></div>
            <div className="p-2 rounded border text-center"><p className="text-lg font-bold">{environmentalImpact.fiveYearCo2Tons}</p><p className="text-[10px]">5-Year CO₂ (tons)</p></div>
            <div className="p-2 rounded border text-center"><p className="text-lg font-bold">{environmentalImpact.tenYearCo2Tons}</p><p className="text-[10px]">10-Year CO₂ (tons)</p></div>
          </div>

          <h3 className="font-semibold mb-1">Technology Overview</h3>
          <p className="text-xs text-muted-foreground mb-2">{technologySummary.tagline} — {technologySummary.coreTech}. {technologySummary.energyReductionRange} energy reduction, ROI in {technologySummary.roiTypical}.</p>
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div>
              <p className="font-semibold text-[10px]">Features:</p>
              <ul>{technologySummary.features.map((f, i) => <li key={i}>✓ {f}</li>)}</ul>
            </div>
            <div>
              <p className="font-semibold text-[10px]">Benefits:</p>
              {technologySummary.benefits.map((b, i) => <p key={i}>✓ <strong>{b.category}:</strong> {b.detail}</p>)}
            </div>
          </div>

          <div className="p-3 bg-slate-800 text-white rounded-lg mt-3">
            <p className="text-xs"><strong className="text-teal-400">Final Conclusion:</strong> {managementConclusion.headline}. Investment fully recovered in {roi.paybackPeriodYears.toFixed(1)} years, with {Math.round(savings.annualOperationalSavings).toLocaleString()} SAR pure profit every year thereafter, plus {replacement.avgTotal.toLocaleString()} SAR avoided at year 10.</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-booklet, .print-booklet * { visibility: visible !important; }
          .print-booklet { position: absolute; left: 0; top: 0; width: 100%; }
          .print-page { page-break-inside: avoid; }
          .print\\:hidden { display: none !important; }
          @page { margin: 0.4in; size: A4; }
          /* Force background colors in print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
