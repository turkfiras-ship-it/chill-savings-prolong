import { useRef } from "react";
import { Printer, Zap, TrendingDown, Activity, BarChart3, Lightbulb, Thermometer, Target, CheckCircle, Wind, Clock, Wrench, AlertTriangle, Info } from "lucide-react";
import { unitMonthlyData2025, unitAnnualTotals, unitInfo, unitNames } from "@/data/unitMonthlyData";
import { energyCostSummary, summaryStats, monthlyComparisonData, yearlyComparisonData, demandSnapshots, unitComparisons } from "@/data/rawdahAnalysis";
import { majorSavingMonths, managementConclusion } from "@/data/financialImpact";
import { weatherSummary } from "@/data/weatherData";
import { calculateROI, calculateTotalSavings, systemConfig, calculateReplacementSavings, lifespanExtension, environmentalImpact } from "@/data/roiCalculations";

export function PrintBooklet() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const roi = calculateROI();
  const savings = calculateTotalSavings();
  const totalAnnual = unitAnnualTotals.total;
  const avgPerUnit = Math.round(totalAnnual / 7);

  const unitEfficiency = unitNames.map(name => ({
    unit: name,
    annual: unitAnnualTotals[name],
    location: unitInfo[name].location,
    peakMonth: unitMonthlyData2025.reduce((max, m) =>
      m[name] > (max?.value || 0) ? { month: m.month, value: m[name] } : max,
      { month: '', value: 0 }
    ),
    lowestMonth: unitMonthlyData2025.reduce((min, m) =>
      m[name] < (min?.value || Infinity) ? { month: m.month, value: m[name] } : min,
      { month: '', value: Infinity }
    ),
  })).sort((a, b) => b.annual - a.annual);

  return (
    <div className="space-y-6">
      {/* Print Button */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold">Print Booklet</h2>
          <p className="text-sm text-muted-foreground">Print-ready version of all analysis data for client presentation</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
        >
          <Printer className="h-5 w-5" />
          Print Booklet
        </button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="print-booklet space-y-8 print:space-y-0">
        
        {/* Page 1: Cover */}
        <div className="print-page rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-10 text-white print:rounded-none print:min-h-[100vh] print:flex print:flex-col print:justify-center">
          <div className="w-16 h-1.5 bg-teal-400 mb-8 rounded-full" />
          <h1 className="text-4xl font-bold mb-4">Power Saving System</h1>
          <h2 className="text-2xl font-light text-slate-300 mb-6">Energy Efficiency & ROI Analysis</h2>
          <p className="text-lg text-slate-400 mb-10">Jarir Bookstore — Rawdah Showroom Case Study</p>
          <div className="flex gap-6">
            {[
              { label: "Units", value: "7 × 25 Ton" },
              { label: "Technology", value: "SCC System" },
              { label: "Data Period", value: "2023–2025" },
            ].map((item) => (
              <div key={item.label} className="px-5 py-3 border border-slate-600 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-auto pt-10 text-sm text-slate-600 print:mt-auto">Confidential — Prepared for Jarir Bookstore</p>
        </div>

        {/* Page 2: Executive Summary */}
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:break-before-page print:border-0">
          <div className="w-10 h-1 bg-teal-500 mb-4 rounded-full" />
          <h2 className="text-2xl font-bold mb-1">Executive Summary</h2>
          <p className="text-sm text-muted-foreground mb-6">Key Performance Highlights</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-5 text-center">
              <p className="text-3xl font-bold">{summaryStats.avgSavingsPercent}%</p>
              <p className="text-sm text-muted-foreground mt-1">Energy Savings Rate</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-5 text-center">
              <p className="text-3xl font-bold">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">SAR Saved in 2025</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-5 text-center">
              <p className="text-3xl font-bold">62%</p>
              <p className="text-sm text-muted-foreground mt-1">Demand Reduction</p>
            </div>
          </div>

          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-6">
            <p className="text-sm font-semibold text-teal-700 mb-1">Weather-Adjusted True Savings</p>
            <p className="text-sm text-muted-foreground">
              2025 was {weatherSummary.avgTempDiff}°C hotter — true savings range: <strong className="text-teal-700">{weatherSummary.adjustedSavingsLow.toLocaleString()} – {weatherSummary.adjustedSavingsHigh.toLocaleString()} SAR</strong> | 
              Efficiency Gain: <strong className="text-teal-700">17.25%</strong> | 
              ROI: <strong className="text-teal-700">{roi.paybackPeriodYears.toFixed(1)} years</strong>
            </p>
          </div>

          <h3 className="text-lg font-semibold mb-3">Financial Overview</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground">2023 Baseline</p>
              <p className="text-xl font-bold">{energyCostSummary.totalBill2023.toLocaleString()} SAR</p>
            </div>
            <div className="p-4 rounded-lg border border-red-200 bg-red-50/50">
              <p className="text-xs text-muted-foreground">2024 (+{energyCostSummary.yearOverYearIncrease2024}%)</p>
              <p className="text-xl font-bold">{energyCostSummary.totalBill2024.toLocaleString()} SAR</p>
            </div>
            <div className="p-4 rounded-lg border border-teal-200 bg-teal-50/50">
              <p className="text-xs text-muted-foreground">2025 (With SCC)</p>
              <p className="text-xl font-bold">213,379 SAR</p>
              <p className="text-xs text-teal-600">-3.02% YoY</p>
            </div>
          </div>
        </div>

        {/* Page 3: Year-over-Year Comparison */}
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:break-before-page print:border-0">
          <div className="w-10 h-1 bg-teal-500 mb-4 rounded-full" />
          <h2 className="text-2xl font-bold mb-1">Year-over-Year Comparison</h2>
          <p className="text-sm text-muted-foreground mb-4">2024 vs 2025 Monthly Cost (SAR)</p>
          
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 font-semibold">Month</th>
                <th className="text-right py-2 font-semibold">2024 (SAR)</th>
                <th className="text-right py-2 font-semibold">2025 (SAR)</th>
                <th className="text-right py-2 font-semibold">Change %</th>
                <th className="text-right py-2 font-semibold">Savings</th>
              </tr>
            </thead>
            <tbody>
              {yearlyComparisonData.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium">{row.month}</td>
                  <td className="py-1.5 text-right tabular-nums">{row.year2024.toLocaleString()}</td>
                  <td className="py-1.5 text-right tabular-nums">{row.year2025.toLocaleString()}</td>
                  <td className={`py-1.5 text-right font-semibold ${row.percentDiff > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                    {row.percentDiff > 0 ? '+' : ''}{row.percentDiff.toFixed(1)}%
                  </td>
                  <td className="py-1.5 text-right font-semibold text-teal-600">
                    {row.savingsSAR > 0 ? row.savingsSAR.toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-bold">
                <td className="py-2">TOTAL</td>
                <td className="py-2 text-right">{yearlyComparisonData.reduce((s, r) => s + r.year2024, 0).toLocaleString()}</td>
                <td className="py-2 text-right">{yearlyComparisonData.reduce((s, r) => s + r.year2025, 0).toLocaleString()}</td>
                <td className="py-2 text-right text-teal-600">5.91%</td>
                <td className="py-2 text-right text-teal-600">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Page 4: Rawdah vs Ruben */}
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:break-before-page print:border-0">
          <div className="w-10 h-1 bg-teal-500 mb-4 rounded-full" />
          <h2 className="text-2xl font-bold mb-1">Rawdah vs Ruben Comparison</h2>
          <p className="text-sm text-muted-foreground mb-4">2025 Monthly Consumption — Without G8 (SAR)</p>
          
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 font-semibold">Month</th>
                <th className="text-right py-2 font-semibold">Ruben</th>
                <th className="text-right py-2 font-semibold">Rawdah</th>
                <th className="text-right py-2 font-semibold">Diff %</th>
                <th className="text-right py-2 font-semibold">Savings</th>
                <th className="text-center py-2 font-semibold">Winner</th>
              </tr>
            </thead>
            <tbody>
              {monthlyComparisonData.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium">{row.month}</td>
                  <td className="py-1.5 text-right tabular-nums">{row.ruben.toLocaleString()}</td>
                  <td className="py-1.5 text-right tabular-nums">{row.rawdah.toLocaleString()}</td>
                  <td className={`py-1.5 text-right font-semibold ${row.difference > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                    {row.difference > 0 ? '+' : ''}{row.difference}%
                  </td>
                  <td className="py-1.5 text-right font-semibold text-teal-600">
                    {row.savingsSAR > 0 ? row.savingsSAR.toLocaleString() : '—'}
                  </td>
                  <td className="py-1.5 text-center">
                    <span className={`text-xs font-semibold ${row.winner === 'RAWDAH' ? 'text-teal-600' : 'text-slate-400'}`}>{row.winner}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-bold">
                <td className="py-2">TOTAL</td>
                <td className="py-2 text-right">{monthlyComparisonData.reduce((s, r) => s + r.ruben, 0).toLocaleString()}</td>
                <td className="py-2 text-right">{monthlyComparisonData.reduce((s, r) => s + r.rawdah, 0).toLocaleString()}</td>
                <td className="py-2 text-right text-teal-600">{summaryStats.avgSavingsPercent}%</td>
                <td className="py-2 text-right text-teal-600">{summaryStats.totalAnnualSavings.toLocaleString()}</td>
                <td className="py-2 text-center text-teal-600 text-xs font-semibold">RAWDAH</td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-teal-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-teal-600">{summaryStats.monthsWonByRawdah}</p>
              <p className="text-xs text-muted-foreground">Months Won by Rawdah</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold">{summaryStats.monthsWonByRuben}</p>
              <p className="text-xs text-muted-foreground">Months Won by Ruben</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-teal-600">{summaryStats.avgSavingsPercent}%</p>
              <p className="text-xs text-muted-foreground">Avg Savings Rate</p>
            </div>
          </div>
        </div>

        {/* Page 5: Demand Reduction & Unit Performance */}
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:break-before-page print:border-0">
          <div className="w-10 h-1 bg-teal-500 mb-4 rounded-full" />
          <h2 className="text-2xl font-bold mb-1">Demand Reduction</h2>
          <p className="text-sm text-muted-foreground mb-4">G2 Unit — Before & After SCC Installation</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {demandSnapshots.map((s) => (
              <div key={s.date} className={`p-4 rounded-lg border ${s.status === 'optimized' ? 'border-teal-200 bg-teal-50/50' : 'bg-muted/20'}`}>
                <p className="text-xs text-muted-foreground">{s.date}</p>
                <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
                <p className="text-2xl font-bold">{s.totalDailyConsumption} <span className="text-sm font-normal">kW</span></p>
                <p className="text-sm text-muted-foreground">{s.avgKwh} kWh avg</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-8">
            <p className="font-semibold text-teal-700">62% Total Reduction</p>
            <p className="text-sm text-muted-foreground">495 kW (2023) → 189 kW (2025) — saving 306 kW per day</p>
          </div>

          <h3 className="text-lg font-semibold mb-3">Unit-Level Performance (2024 vs 2025)</h3>
          <div className="grid grid-cols-4 gap-3">
            {unitComparisons.map((u) => (
              <div key={u.unit} className="p-3 rounded-lg border bg-muted/20 text-center">
                <p className="font-bold text-lg mb-1">{u.unit}</p>
                <p className="text-sm text-muted-foreground">{u.kw2024} → {u.kw2025} kW</p>
                <p className="text-lg font-bold text-teal-600">-{u.reduction}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Page 6: Unit Monthly Data */}
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:break-before-page print:border-0">
          <div className="w-10 h-1 bg-teal-500 mb-4 rounded-full" />
          <h2 className="text-2xl font-bold mb-1">Unit-Level Monthly Consumption (2025)</h2>
          <p className="text-sm text-muted-foreground mb-4">kWh per unit per month</p>
          
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 font-semibold">Month</th>
                {unitNames.map(n => <th key={n} className="text-right py-2 font-semibold">{n}</th>)}
                <th className="text-right py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {unitMonthlyData2025.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="py-1 font-medium">{row.month.substring(0, 3)}</td>
                  {unitNames.map(n => (
                    <td key={n} className="py-1 text-right tabular-nums">{row[n].toLocaleString()}</td>
                  ))}
                  <td className="py-1 text-right font-semibold tabular-nums">{row.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-bold">
                <td className="py-2">Annual</td>
                {unitNames.map(n => (
                  <td key={n} className="py-2 text-right tabular-nums">{unitAnnualTotals[n].toLocaleString()}</td>
                ))}
                <td className="py-2 text-right tabular-nums">{unitAnnualTotals.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Page 7: Unit Optimization */}
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:break-before-page print:border-0">
          <div className="w-10 h-1 bg-teal-500 mb-4 rounded-full" />
          <h2 className="text-2xl font-bold mb-1">Unit-Specific Analysis</h2>
          <p className="text-sm text-muted-foreground mb-4">Ranked by annual consumption</p>
          
          <div className="space-y-3">
            {unitEfficiency.map((unit, idx) => {
              const isHigh = unit.annual > avgPerUnit;
              const ratio = ((unit.annual / avgPerUnit) * 100 - 100);
              return (
                <div key={unit.unit} className={`p-3 rounded-lg border ${isHigh ? 'border-amber-300/50 bg-amber-50/30' : 'border-teal-300/50 bg-teal-50/30'} print:bg-transparent`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-muted">{idx + 1}</span>
                      <span className="font-bold">{unit.unit}</span>
                      <span className="text-xs text-muted-foreground">{unit.location}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm">{unit.annual.toLocaleString()} kWh</span>
                      <span className={`text-xs ml-2 ${isHigh ? 'text-amber-600' : 'text-teal-600'}`}>
                        {isHigh ? `+${ratio.toFixed(0)}%` : `${Math.abs(ratio).toFixed(0)}% below`} avg
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Peak:</span> {unit.peakMonth.month}: {unit.peakMonth.value.toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Lowest:</span> {unit.lowestMonth.month}: {unit.lowestMonth.value.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Page 8: Recommendations */}
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:break-before-page print:border-0">
          <div className="w-10 h-1 bg-teal-500 mb-4 rounded-full" />
          <h2 className="text-2xl font-bold mb-1">Top Recommendations</h2>
          <p className="text-sm text-muted-foreground mb-4">Actionable steps to maximize savings</p>

          <div className="space-y-3">
            {[
              { title: 'Lock Thermostats at 22–24°C', savings: '8,000–12,000 SAR/year', priority: 'high' },
              { title: 'Air Curtain for G1 Entrance', savings: '5,000–8,000 SAR/year', priority: 'high' },
              { title: 'F1 Duct Line & Insulation Optimization', savings: '7,000–12,000 SAR/year', priority: 'high' },
              { title: 'G3/F1 Alternating Operation', savings: '2,000–3,000 SAR/year', priority: 'medium' },
              { title: 'Quarterly Preventive Maintenance', savings: '3,000–5,000 SAR/year', priority: 'high' },
              { title: 'Seasonal Fan Speed Adjustment', savings: '2,000–3,500 SAR/year', priority: 'medium' },
              { title: 'F2 Monthly Sensor Monitoring', savings: '1,500–2,500 SAR/year', priority: 'low' },
            ].map((rec, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-muted">{idx + 1}</span>
                  <span className="font-semibold text-sm">{rec.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                    rec.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-teal-100 text-teal-600'
                  }`}>{rec.priority}</span>
                  <span className="text-sm font-medium text-teal-600">{rec.savings}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-center">
              <p className="text-xs text-muted-foreground mb-1">Conservative</p>
              <p className="text-xl font-bold text-teal-700">25,000+ SAR</p>
              <p className="text-xs text-muted-foreground">per year</p>
            </div>
            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-center">
              <p className="text-xs text-muted-foreground mb-1">Optimistic</p>
              <p className="text-xl font-bold text-teal-700">45,000+ SAR</p>
              <p className="text-xs text-muted-foreground">per year</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800 text-center text-white">
              <p className="text-xs opacity-80 mb-1">Combined with SCC</p>
              <p className="text-xl font-bold">60,000+ SAR</p>
              <p className="text-xs opacity-70">total annual</p>
            </div>
          </div>
        </div>

        {/* Page 9: ROI & Investment Summary */}
        <div className="print-page rounded-xl bg-card p-8 border print:rounded-none print:break-before-page print:border-0">
          <div className="w-10 h-1 bg-teal-500 mb-4 rounded-full" />
          <h2 className="text-2xl font-bold mb-1">Return on Investment</h2>
          <p className="text-sm text-muted-foreground mb-4">Rawdah Showroom — 7 Units × 25 Tons</p>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-5 rounded-lg bg-slate-800 text-white">
              <p className="text-xs text-slate-400 uppercase">Total Investment</p>
              <p className="text-3xl font-bold mt-1">{systemConfig.totalSystemCost.toLocaleString()} SAR</p>
              <p className="text-sm text-slate-400">{systemConfig.numberOfUnits} units × {systemConfig.costPerUnit.toLocaleString()} SAR/unit</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
                <p className="text-xs text-muted-foreground">Annual Savings</p>
                <p className="text-xl font-bold text-teal-700">{Math.round(savings.annualOperationalSavings).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
                <p className="text-xs text-muted-foreground">Payback</p>
                <p className="text-xl font-bold text-teal-700">{roi.paybackPeriodYears.toFixed(1)} yrs</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { period: "5-Year", value: roi.fiveYearTotalSavings, roiPct: roi.fiveYearROI, profit: roi.fiveYearNetProfit },
              { period: "10-Year", value: roi.tenYearTotalSavings, roiPct: roi.tenYearROI, profit: roi.tenYearNetProfit },
            ].map((row) => (
              <div key={row.period} className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">{row.period} Savings</p>
                <p className="text-2xl font-bold">{Math.round(row.value).toLocaleString()} SAR</p>
                <p className="text-sm text-teal-600">ROI: {row.roiPct.toFixed(0)}% | Net: {Math.round(row.profit).toLocaleString()} SAR</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border text-center">
              <p className="text-2xl font-bold text-teal-600">{environmentalImpact.annualCo2SavedTons}</p>
              <p className="text-xs text-muted-foreground">Tons CO₂ Saved/yr</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <p className="text-2xl font-bold text-teal-600">{lifespanExtension.extendedLifespan} yrs</p>
              <p className="text-xs text-muted-foreground">Extended Lifespan</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <p className="text-2xl font-bold text-teal-600">{calculateReplacementSavings().avgTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">SAR Replacement Avoided</p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-slate-800 text-white">
            <p className="text-sm">
              <strong className="text-teal-400">Conclusion:</strong> {managementConclusion.headline}. Investment fully recovered in {roi.paybackPeriodYears.toFixed(1)} years, with pure profit every year thereafter.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-booklet, .print-booklet * {
            visibility: visible !important;
          }
          .print-booklet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-page {
            page-break-after: always;
            page-break-inside: avoid;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
