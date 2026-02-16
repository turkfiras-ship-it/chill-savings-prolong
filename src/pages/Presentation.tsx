import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Grid3X3,
  X,
} from "lucide-react";
import {
  systemConfig,
  environmentalImpact,
  technologySummary,
  calculateROI,
  calculateTotalSavings,
  calculateReplacementSavings,
  maintenanceSavings,
  downtimeSavings,
  lifespanExtension,
} from "@/data/roiCalculations";
import {
  summaryStats,
  energyCostSummary,
  demandSnapshots,
  unitComparisons,
  keyInsights,
  monthlyComparisonData,
  yearlyComparisonData,
} from "@/data/rawdahAnalysis";
import { monthlyWeatherData, weatherSummary } from "@/data/weatherData";
import { majorSavingMonths, managementConclusion, energyCostComparison } from "@/data/financialImpact";

// ─── Slide Components ───────────────────────────────────

function SlideLayout({ children, bg = "bg-white" }: { children: React.ReactNode; bg?: string }) {
  return (
    <div className={`slide-content w-[1920px] h-[1080px] ${bg} relative overflow-hidden`}>
      {children}
    </div>
  );
}

function Slide1_Title() {
  return (
    <SlideLayout bg="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="absolute inset-0 flex flex-col justify-center px-[140px]">
        <div className="w-[100px] h-[6px] bg-teal-400 mb-[60px] rounded-full" />
        <h1 className="text-[82px] font-bold text-white leading-[1.1] mb-[30px]">
          Power Saving System
        </h1>
        <h2 className="text-[48px] font-light text-slate-300 mb-[50px]">
          Energy Efficiency & ROI Analysis
        </h2>
        <p className="text-[28px] text-slate-400">
          Jarir Bookstore — Rawdah Showroom Case Study
        </p>
        <div className="flex gap-[40px] mt-[80px]">
          {[
            { label: "Units", value: "7 × 25 Ton" },
            { label: "Technology", value: "SCC System" },
            { label: "Data Period", value: "2023–2025" },
          ].map((item) => (
            <div key={item.label} className="px-[30px] py-[16px] border border-slate-600 rounded-xl">
              <p className="text-[18px] text-slate-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-[26px] text-white font-semibold mt-[4px]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-[50px] right-[80px] text-[18px] text-slate-600">
        Confidential — Prepared for Jarir Bookstore
      </div>
    </SlideLayout>
  );
}

function Slide2_ExecSummary() {
  const roi = calculateROI();
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <SectionHeader title="Executive Summary" subtitle="Key Performance Highlights" />
        <div className="grid grid-cols-4 gap-[30px] mt-[60px]">
          {[
            { value: `${summaryStats.avgSavingsPercent}%`, label: "Energy Savings Rate", sub: "vs. Ruben Showroom" },
            { value: `${energyCostSummary.yearlySavings2024vs2025.toLocaleString()}`, label: "SAR Saved in 2025", sub: "Year-over-year (actual)" },
            { value: `${roi.paybackPeriodYears.toFixed(1)} Yrs`, label: "Payback Period", sub: "Operational savings" },
            { value: `62%`, label: "Demand Reduction", sub: "Daily kW consumption" },
          ].map((card) => (
            <div key={card.label} className="bg-slate-50 rounded-2xl p-[40px] border border-slate-100">
              <p className="text-[56px] font-bold text-slate-800">{card.value}</p>
              <p className="text-[22px] font-semibold text-slate-600 mt-[10px]">{card.label}</p>
              <p className="text-[18px] text-slate-400 mt-[4px]">{card.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-[40px] bg-teal-50 rounded-2xl p-[40px] border border-teal-100">
          <p className="text-[20px] text-slate-500 uppercase tracking-wider mb-[16px]">Weather-Adjusted True Savings</p>
          <div className="flex items-center gap-[40px]">
            <div>
              <p className="text-[18px] text-slate-500">Actual Savings</p>
              <p className="text-[32px] font-bold text-slate-700">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()} SAR</p>
            </div>
            <p className="text-[36px] text-slate-400">+</p>
            <div>
              <p className="text-[18px] text-slate-500">Avoided Cooling Cost (8–12%)</p>
              <p className="text-[32px] font-bold text-slate-700">{weatherSummary.additionalCoolingCostLow.toLocaleString()} – {weatherSummary.additionalCoolingCostHigh.toLocaleString()} SAR</p>
            </div>
            <p className="text-[36px] text-slate-400">=</p>
            <div>
              <p className="text-[18px] text-teal-600 font-semibold">True Savings</p>
              <p className="text-[40px] font-bold text-teal-600">{weatherSummary.adjustedSavingsLow.toLocaleString()} – {weatherSummary.adjustedSavingsHigh.toLocaleString()} SAR</p>
            </div>
          </div>
          <p className="text-[17px] text-slate-500 mt-[16px]">2025 was {weatherSummary.avgTempDiff}°C hotter on average — the system saved energy <em>and</em> offset the increased cooling demand.</p>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide3_Technology() {
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <SectionHeader title="Our Technology" subtitle={technologySummary.tagline} />
        <div className="grid grid-cols-2 gap-[60px] mt-[60px]">
          <div>
            <h3 className="text-[32px] font-bold text-slate-800 mb-[30px]">
              {technologySummary.coreTech}
            </h3>
            <p className="text-[22px] text-slate-500 leading-relaxed mb-[40px]">
              The {technologySummary.product} enables any compressor to replicate DC inverter-driven performance,
              achieving <span className="font-bold text-teal-700">{technologySummary.energyReductionRange}</span> energy reduction
              with typical ROI in {technologySummary.roiTypical}.
            </p>
            <div className="space-y-[20px]">
              {technologySummary.features.map((f, i) => (
                <div key={i} className="flex items-start gap-[16px]">
                  <div className="w-[28px] h-[28px] rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-[2px]">
                    <span className="text-[14px] font-bold text-teal-600">{i + 1}</span>
                  </div>
                  <p className="text-[20px] text-slate-600">{f}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-[20px]">
            <h3 className="text-[28px] font-semibold text-slate-800 mb-[10px]">Key Benefits</h3>
            {technologySummary.benefits.map((b, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-[28px] border border-slate-100">
                <p className="text-[20px] font-semibold text-slate-700">{b.category}</p>
                <p className="text-[18px] text-slate-500 mt-[6px]">{b.detail}</p>
              </div>
            ))}
            <div className="bg-slate-800 rounded-xl p-[28px] mt-[20px]">
              <p className="text-[20px] text-white font-medium">{technologySummary.differentiator}</p>
              <p className="text-[16px] text-slate-400 mt-[6px]">{technologySummary.certifications}</p>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide4_FinancialOverview() {
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <SectionHeader title="Financial Overview" subtitle="Energy Cost Trend 2023 → 2025" />
        <div className="grid grid-cols-3 gap-[40px] mt-[60px]">
          {[
            { year: "2023", bill: energyCostSummary.totalBill2023, change: null, label: "Baseline Year" },
            { year: "2024", bill: energyCostSummary.totalBill2024, change: `+${energyCostSummary.yearOverYearIncrease2024}%`, label: "Pre-optimization" },
            { year: "2025", bill: 213379, change: "-3.02%", label: "With SCC System" },
          ].map((item) => (
            <div key={item.year} className={`rounded-2xl p-[50px] border ${item.year === '2025' ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-100'}`}>
              <p className="text-[22px] text-slate-500 uppercase tracking-wider">{item.year}</p>
              <p className="text-[52px] font-bold text-slate-800 mt-[10px]">{item.bill.toLocaleString()}</p>
              <p className="text-[22px] text-slate-500">SAR</p>
              {item.change && (
                <p className={`text-[24px] font-semibold mt-[16px] ${item.change.startsWith('-') ? 'text-teal-600' : 'text-red-500'}`}>
                  {item.change} YoY
                </p>
              )}
              <p className="text-[18px] text-slate-400 mt-[6px]">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-[50px]">
          <h3 className="text-[26px] font-semibold text-slate-800 mb-[24px]">Top Saving Months (2024 vs 2025)</h3>
          <div className="flex gap-[20px]">
            {majorSavingMonths.slice(0, 5).map((m) => (
              <div key={m.month} className="flex-1 bg-slate-50 rounded-xl p-[24px] border border-slate-100 text-center">
                <p className="text-[20px] font-semibold text-slate-700">{m.month}</p>
                <p className="text-[32px] font-bold text-teal-600 mt-[6px]">-{m.costReduction}%</p>
                <p className="text-[18px] text-slate-400">{m.savingsSAR.toLocaleString()} SAR</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide5_WeatherCorrelation() {
  const summerMonths = monthlyWeatherData.filter(m => ['May', 'June', 'July', 'August', 'September'].includes(m.month));
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <SectionHeader title="Weather vs. Efficiency" subtitle="Hotter Climate, Lower Bills" />
        <div className="grid grid-cols-2 gap-[60px] mt-[50px]">
          <div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-[40px] mb-[30px]">
              <p className="text-[48px] font-bold text-red-600">+{weatherSummary.avgTempDiff}°C</p>
              <p className="text-[22px] text-slate-600 mt-[6px]">Average temperature increase in 2025</p>
              <p className="text-[18px] text-slate-400 mt-[4px]">Cooling degree days increased ~{weatherSummary.coolingDegreeIncrease}</p>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-[40px]">
              <p className="text-[48px] font-bold text-teal-600">-13,003 SAR</p>
              <p className="text-[22px] text-slate-600 mt-[6px]">Energy cost savings despite hotter weather</p>
              <p className="text-[18px] text-slate-400 mt-[4px]">Proving real efficiency gains under load</p>
            </div>
          </div>
          <div>
            <h3 className="text-[24px] font-semibold text-slate-800 mb-[20px]">Peak Season Temperatures (°C)</h3>
            <div className="space-y-[16px]">
              {summerMonths.map((m) => (
                <div key={m.month} className="flex items-center gap-[20px]">
                  <span className="w-[120px] text-[20px] text-slate-600 font-medium">{m.month}</span>
                  <div className="flex-1 flex items-center gap-[12px]">
                    <div className="flex-1 bg-slate-100 rounded-full h-[32px] relative">
                      <div className="absolute left-0 top-0 h-full bg-slate-300 rounded-full" style={{ width: `${(m.avgTemp2024 / 50) * 100}%` }} />
                    </div>
                    <span className="text-[18px] text-slate-500 w-[60px]">{m.avgTemp2024}°</span>
                  </div>
                  <div className="flex-1 flex items-center gap-[12px]">
                    <div className="flex-1 bg-red-50 rounded-full h-[32px] relative">
                      <div className="absolute left-0 top-0 h-full bg-red-300 rounded-full" style={{ width: `${(m.avgTemp2025 / 50) * 100}%` }} />
                    </div>
                    <span className="text-[18px] text-red-500 w-[60px]">{m.avgTemp2025}°</span>
                  </div>
                  <span className="text-[18px] font-semibold text-red-500 w-[60px]">+{m.tempDiff}°</span>
                </div>
              ))}
              <div className="flex gap-[30px] mt-[16px]">
                <div className="flex items-center gap-[8px]">
                  <div className="w-[16px] h-[16px] bg-slate-300 rounded" />
                  <span className="text-[16px] text-slate-500">2024</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <div className="w-[16px] h-[16px] bg-red-300 rounded" />
                  <span className="text-[16px] text-slate-500">2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide6_DemandReduction() {
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <SectionHeader title="Demand Reduction" subtitle="Before & After SCC Installation" />
        <div className="flex gap-[40px] mt-[60px]">
          {demandSnapshots.map((s, i) => (
            <div key={i} className={`flex-1 rounded-2xl p-[50px] border ${
              s.status === 'optimized' ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-100'
            }`}>
              <p className="text-[20px] text-slate-500 uppercase tracking-wider">{s.date}</p>
              <p className="text-[18px] text-slate-400 mb-[30px]">{s.label}</p>
              <p className="text-[72px] font-bold text-slate-800">{s.totalDailyConsumption}</p>
              <p className="text-[22px] text-slate-500">kW daily consumption</p>
              <div className="mt-[20px] pt-[20px] border-t border-slate-200">
                <p className="text-[36px] font-semibold text-slate-700">{s.avgKwh} <span className="text-[20px] text-slate-400">kWh avg</span></p>
              </div>
              {s.status === 'optimized' && (
                <div className="mt-[20px] px-[20px] py-[10px] bg-teal-100 rounded-full inline-block">
                  <span className="text-[18px] font-semibold text-teal-700">Best Performance</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-[50px] bg-slate-800 rounded-2xl p-[40px] flex items-center gap-[30px]">
          <p className="text-[56px] font-bold text-teal-400">62%</p>
          <div>
            <p className="text-[24px] text-white font-semibold">Total Reduction in Daily Consumption</p>
            <p className="text-[20px] text-slate-400">From 495 kW (2023) → 189 kW (2025) — saving 306 kW per day</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide7_UnitPerformance() {
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <SectionHeader title="Unit-Level Performance" subtitle="Individual AC Unit Comparison (2024 vs 2025)" />
        <div className="grid grid-cols-4 gap-[30px] mt-[60px]">
          {unitComparisons.map((u) => (
            <div key={u.unit} className="bg-slate-50 rounded-2xl p-[40px] border border-slate-100">
              <p className="text-[36px] font-bold text-slate-800 mb-[20px]">{u.unit}</p>
              <div className="space-y-[16px]">
                <div>
                  <p className="text-[16px] text-slate-400 uppercase">2024</p>
                  <p className="text-[28px] font-semibold text-slate-600">{u.kw2024} kW</p>
                </div>
                <div>
                  <p className="text-[16px] text-slate-400 uppercase">2025</p>
                  <p className="text-[28px] font-semibold text-teal-600">{u.kw2025} kW</p>
                </div>
                <div className="pt-[16px] border-t border-slate-200">
                  <p className="text-[40px] font-bold text-teal-600">-{u.reduction}%</p>
                  <p className="text-[16px] text-slate-400">Reduction</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[50px] grid grid-cols-3 gap-[30px]">
          {keyInsights.slice(0, 3).map((insight, i) => (
            <div key={i} className="flex items-start gap-[12px] bg-slate-50 rounded-xl p-[24px] border border-slate-100">
              <div className="w-[24px] h-[24px] rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-[2px]">
                <span className="text-[12px] font-bold text-teal-600">✓</span>
              </div>
              <p className="text-[17px] text-slate-600 leading-snug">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide8_ROI() {
  const roi = calculateROI();
  const savings = calculateTotalSavings();
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <SectionHeader title="Return on Investment" subtitle="Rawdah Showroom — 7 Units × 25 Tons" />
        <div className="grid grid-cols-2 gap-[60px] mt-[50px]">
          <div>
            <div className="bg-slate-800 rounded-2xl p-[50px] text-white mb-[30px]">
              <p className="text-[20px] text-slate-400 uppercase tracking-wider">Total Investment</p>
              <p className="text-[56px] font-bold mt-[10px]">{systemConfig.totalSystemCost.toLocaleString()} SAR</p>
              <p className="text-[20px] text-slate-400 mt-[6px]">{systemConfig.numberOfUnits} units × {systemConfig.costPerUnit.toLocaleString()} SAR/unit</p>
            </div>
            <div className="grid grid-cols-2 gap-[20px]">
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-[30px]">
                <p className="text-[18px] text-slate-500">Annual Savings</p>
                <p className="text-[32px] font-bold text-teal-600">{Math.round(savings.annualOperationalSavings).toLocaleString()}</p>
                <p className="text-[16px] text-slate-400">SAR/year</p>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-[30px]">
                <p className="text-[18px] text-slate-500">Payback Period</p>
                <p className="text-[32px] font-bold text-teal-600">{roi.paybackPeriodYears.toFixed(1)}</p>
                <p className="text-[16px] text-slate-400">Years</p>
              </div>
            </div>
          </div>
          <div className="space-y-[20px]">
            <h3 className="text-[28px] font-semibold text-slate-800">Savings Projection</h3>
            {[
              { period: "5-Year Savings", value: roi.fiveYearTotalSavings, roi: roi.fiveYearROI, profit: roi.fiveYearNetProfit },
              { period: "10-Year Savings", value: roi.tenYearTotalSavings, roi: roi.tenYearROI, profit: roi.tenYearNetProfit },
            ].map((row) => (
              <div key={row.period} className="bg-slate-50 rounded-xl p-[30px] border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[20px] text-slate-500">{row.period}</p>
                    <p className="text-[40px] font-bold text-slate-800">{Math.round(row.value).toLocaleString()} SAR</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[32px] font-bold text-teal-600">{row.roi.toFixed(0)}%</p>
                    <p className="text-[16px] text-slate-400">ROI</p>
                  </div>
                </div>
                <p className="text-[18px] text-teal-600 mt-[10px]">Net Profit: {Math.round(row.profit).toLocaleString()} SAR</p>
              </div>
            ))}
            <div className="bg-slate-50 rounded-xl p-[30px] border border-slate-100">
              <p className="text-[20px] text-slate-500">AC Replacement Avoided (at Year 10)</p>
              <p className="text-[36px] font-bold text-slate-800">{calculateReplacementSavings().avgTotal.toLocaleString()} SAR</p>
              <p className="text-[18px] text-slate-400">Lifespan extended from {lifespanExtension.normalLifespan} to {lifespanExtension.extendedLifespan} years</p>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide9_Maintenance() {
  const savings = calculateTotalSavings();
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[80px]">
        <SectionHeader title="Operational Cost Savings" subtitle="Annual Maintenance & Repair Reductions" />
        <div className="mt-[40px]">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left text-[20px] text-slate-500 font-semibold pb-[16px] uppercase tracking-wider">Category</th>
                <th className="text-right text-[20px] text-slate-500 font-semibold pb-[16px] uppercase tracking-wider">Without System</th>
                <th className="text-right text-[20px] text-slate-500 font-semibold pb-[16px] uppercase tracking-wider">With System</th>
                <th className="text-right text-[20px] text-slate-500 font-semibold pb-[16px] uppercase tracking-wider">Annual Savings</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceSavings.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-[18px]">
                    <p className="text-[20px] font-medium text-slate-700">{item.category}</p>
                    <p className="text-[16px] text-slate-400">{item.description}</p>
                  </td>
                  <td className="text-right text-[20px] text-red-500 font-medium">{Math.round(item.withoutSystem).toLocaleString()}</td>
                  <td className="text-right text-[20px] text-slate-600">{Math.round(item.withSystem).toLocaleString()}</td>
                  <td className="text-right text-[22px] text-teal-600 font-bold">{Math.round(item.annualSavings).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="border-b border-slate-100">
                <td className="py-[18px]">
                  <p className="text-[20px] font-medium text-slate-700">Downtime Avoidance</p>
                </td>
                <td className="text-right text-[20px] text-red-500 font-medium">{(downtimeSavings.averageDowntimeHoursWithout * downtimeSavings.hourlyRevenueLoss).toLocaleString()}</td>
                <td className="text-right text-[20px] text-slate-600">{(downtimeSavings.averageDowntimeHoursWith * downtimeSavings.hourlyRevenueLoss).toLocaleString()}</td>
                <td className="text-right text-[22px] text-teal-600 font-bold">{downtimeSavings.annualSavings.toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300">
                <td className="py-[20px] text-[24px] font-bold text-slate-800">Total Annual Savings</td>
                <td></td>
                <td></td>
                <td className="text-right text-[28px] font-bold text-teal-600">{Math.round(savings.annualOperationalSavings).toLocaleString()} SAR</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-[18px] text-slate-400 mt-[30px] italic">All costs based on 2025 Saudi market rates for HVAC labor, parts, and refrigerant</p>
      </div>
    </SlideLayout>
  );
}

function Slide10_Environmental() {
  return (
    <SlideLayout bg="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900">
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <div className="mb-[50px]">
          <p className="text-[18px] text-teal-300 uppercase tracking-widest font-medium mb-[10px]">Environmental Impact</p>
          <h2 className="text-[52px] font-bold text-white">CO₂ Reduction & Sustainability</h2>
        </div>
        <div className="grid grid-cols-3 gap-[40px] mt-[40px]">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-[50px] text-center border border-white/10">
            <p className="text-[72px] font-bold text-teal-300">{environmentalImpact.annualCo2SavedTons}</p>
            <p className="text-[24px] text-white mt-[10px]">Tons CO₂ Saved</p>
            <p className="text-[18px] text-teal-200/60 mt-[6px]">Per year</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-[50px] text-center border border-white/10">
            <p className="text-[72px] font-bold text-teal-300">{environmentalImpact.treesEquivalent.toLocaleString()}</p>
            <p className="text-[24px] text-white mt-[10px]">Trees Equivalent</p>
            <p className="text-[18px] text-teal-200/60 mt-[6px]">Annual carbon offset</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-[50px] text-center border border-white/10">
            <p className="text-[72px] font-bold text-teal-300">{environmentalImpact.annualKwhSaved.toLocaleString()}</p>
            <p className="text-[24px] text-white mt-[10px]">kWh Saved</p>
            <p className="text-[18px] text-teal-200/60 mt-[6px]">Annual energy reduction</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[40px] mt-[40px]">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-[40px] border border-white/10">
            <p className="text-[20px] text-teal-200/80 uppercase tracking-wider">5-Year Projection</p>
            <p className="text-[48px] font-bold text-white mt-[10px]">{environmentalImpact.fiveYearCo2Tons} tons CO₂</p>
            <p className="text-[20px] text-teal-200/60 mt-[4px]">≈ {(environmentalImpact.treesEquivalent * 5).toLocaleString()} trees planted</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-[40px] border border-white/10">
            <p className="text-[20px] text-teal-200/80 uppercase tracking-wider">10-Year Projection</p>
            <p className="text-[48px] font-bold text-white mt-[10px]">{environmentalImpact.tenYearCo2Tons} tons CO₂</p>
            <p className="text-[20px] text-teal-200/60 mt-[4px]">≈ {(environmentalImpact.treesEquivalent * 10).toLocaleString()} trees planted</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide11_LifespanExtension() {
  const replacement = calculateReplacementSavings();
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <SectionHeader title="Equipment Lifespan Extension" subtitle="Avoid Costly AC Replacements" />
        <div className="grid grid-cols-2 gap-[60px] mt-[60px]">
          <div className="space-y-[30px]">
            <div className="flex gap-[30px]">
              <div className="flex-1 bg-red-50 border border-red-100 rounded-2xl p-[40px]">
                <p className="text-[20px] text-slate-500 uppercase">Without System</p>
                <p className="text-[56px] font-bold text-red-600">{lifespanExtension.normalLifespan}</p>
                <p className="text-[22px] text-slate-600">Years lifespan</p>
                <p className="text-[18px] text-slate-400 mt-[10px]">Replace every 10 years</p>
              </div>
              <div className="flex-1 bg-teal-50 border border-teal-100 rounded-2xl p-[40px]">
                <p className="text-[20px] text-slate-500 uppercase">With System</p>
                <p className="text-[56px] font-bold text-teal-600">{lifespanExtension.extendedLifespan}</p>
                <p className="text-[22px] text-slate-600">Years lifespan</p>
                <p className="text-[18px] text-teal-600 mt-[10px] font-semibold">+{lifespanExtension.yearsExtended} years gained</p>
              </div>
            </div>
            <div className="bg-slate-800 rounded-2xl p-[40px] text-white">
              <p className="text-[20px] text-slate-400">One Full Replacement Cycle Avoided</p>
              <p className="text-[48px] font-bold text-teal-400 mt-[10px]">{replacement.avgTotal.toLocaleString()} SAR</p>
              <p className="text-[20px] text-slate-400 mt-[6px]">
                Range: {replacement.minTotal.toLocaleString()} – {replacement.maxTotal.toLocaleString()} SAR
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-[28px] font-semibold text-slate-800 mb-[20px]">How It Works</h3>
            <div className="space-y-[20px]">
              {[
                "SCC reduces compressor cycling stress, the #1 cause of wear",
                "Stabilized voltage and current extend motor and capacitor life",
                "Lower operating temperatures reduce refrigerant degradation",
                "Fewer emergency breakdowns mean less cumulative damage",
                "30-year analysis: 2 replacements without → 1 with system",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-[16px] bg-slate-50 rounded-xl p-[24px] border border-slate-100">
                  <div className="w-[32px] h-[32px] rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <span className="text-[16px] font-bold text-teal-600">{i + 1}</span>
                  </div>
                  <p className="text-[20px] text-slate-600">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide12_Summary() {
  const roi = calculateROI();
  const savings = calculateTotalSavings();
  return (
    <SlideLayout bg="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="absolute inset-0 px-[140px] py-[100px]">
        <div className="mb-[50px]">
          <div className="w-[100px] h-[6px] bg-teal-400 mb-[30px] rounded-full" />
          <h2 className="text-[52px] font-bold text-white">Investment Summary</h2>
          <p className="text-[24px] text-slate-400 mt-[10px]">5-Year ROI Projection — Rawdah Showroom</p>
        </div>
        <div className="grid grid-cols-4 gap-[30px]">
          {[
            { label: "Investment", value: `${systemConfig.totalSystemCost.toLocaleString()}`, unit: "SAR" },
            { label: "5-Year Savings", value: `${Math.round(roi.fiveYearTotalSavings).toLocaleString()}`, unit: "SAR" },
            { label: "Net Profit", value: `${Math.round(roi.fiveYearNetProfit).toLocaleString()}`, unit: "SAR" },
            { label: "ROI", value: `${roi.fiveYearROI.toFixed(0)}%`, unit: "" },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-[40px]">
              <p className="text-[18px] text-slate-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-[44px] font-bold text-white mt-[10px]">{item.value}</p>
              {item.unit && <p className="text-[18px] text-slate-500">{item.unit}</p>}
            </div>
          ))}
        </div>
        <div className="mt-[50px] grid grid-cols-3 gap-[30px]">
          <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-[30px]">
            <p className="text-[18px] text-teal-300 uppercase">Annual Savings</p>
            <p className="text-[36px] font-bold text-teal-400">{Math.round(savings.annualOperationalSavings).toLocaleString()} SAR</p>
          </div>
          <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-[30px]">
            <p className="text-[18px] text-teal-300 uppercase">CO₂ Reduction</p>
            <p className="text-[36px] font-bold text-teal-400">{environmentalImpact.fiveYearCo2Tons} tons</p>
            <p className="text-[16px] text-slate-500">Over 5 years</p>
          </div>
          <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-[30px]">
            <p className="text-[18px] text-teal-300 uppercase">Equipment Savings</p>
            <p className="text-[36px] font-bold text-teal-400">{calculateReplacementSavings().avgTotal.toLocaleString()} SAR</p>
            <p className="text-[16px] text-slate-500">Avoided replacement</p>
          </div>
        </div>
        <div className="mt-[50px] flex items-center gap-[20px]">
          <div className="w-[8px] h-[60px] bg-teal-400 rounded-full" />
          <p className="text-[24px] text-slate-300 leading-relaxed">
            {managementConclusion.headline}. Investment fully recovered in <span className="text-teal-400 font-bold">{roi.paybackPeriodYears.toFixed(1)} years</span>, 
            with pure profit every year thereafter.
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide13_TheoreticalSavings() {
  const trendWithout = 8.25; // 2024 increase trend
  const achievedDecrease = 9; // 2025 decrease excl. anomalies
  const theoreticalSavings = trendWithout + achievedDecrease; // 17.25%
  const bill2024 = energyCostSummary.totalBill2024; // 220,028
  const theoreticalCost = Math.round(bill2024 * (1 + trendWithout / 100)); // what 2025 would have cost
  const actualCost = 213379;
  const theoreticalSavingSAR = theoreticalCost - actualCost;

  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[140px] py-[80px]">
        <SectionHeader title="Theoretical Savings Analysis" subtitle="The True Impact: Trend Reversal + Actual Decrease" />
        <div className="grid grid-cols-3 gap-[30px] mt-[40px]">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-[40px]">
            <p className="text-[18px] text-slate-500 uppercase tracking-wider">2024 Trend</p>
            <p className="text-[64px] font-bold text-red-600">+{trendWithout}%</p>
            <p className="text-[20px] text-slate-600 mt-[6px]">Cost increase (2023→2024)</p>
            <p className="text-[16px] text-slate-400 mt-[4px]">203,246 → 220,028 SAR</p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-[40px]">
            <p className="text-[18px] text-slate-500 uppercase tracking-wider">2025 Achieved</p>
            <p className="text-[64px] font-bold text-teal-600">-9%</p>
            <p className="text-[20px] text-slate-600 mt-[6px]">Decrease (excl. Mar/Apr anomalies)</p>
            <p className="text-[16px] text-slate-400 mt-[4px]">Operational issues excluded</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-[40px] text-white">
            <p className="text-[18px] text-slate-400 uppercase tracking-wider">Theoretical Total</p>
            <p className="text-[64px] font-bold text-teal-400">{theoreticalSavings}%</p>
            <p className="text-[20px] text-slate-300 mt-[6px]">True efficiency improvement</p>
            <p className="text-[16px] text-slate-500 mt-[4px]">8.25% + 9% = 17.25%</p>
          </div>
        </div>
        <div className="mt-[40px] bg-slate-50 border border-slate-200 rounded-2xl p-[40px]">
          <h3 className="text-[28px] font-bold text-slate-800 mb-[20px]">How to Read This</h3>
          <div className="grid grid-cols-2 gap-[40px]">
            <div className="space-y-[16px]">
              <div className="flex items-start gap-[14px]">
                <div className="w-[28px] h-[28px] rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-[2px]">
                  <span className="text-[14px] font-bold text-red-600">1</span>
                </div>
                <p className="text-[19px] text-slate-600">Without the SCC system, 2025 costs would have followed the same +8.25% upward trend</p>
              </div>
              <div className="flex items-start gap-[14px]">
                <div className="w-[28px] h-[28px] rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-[2px]">
                  <span className="text-[14px] font-bold text-red-600">2</span>
                </div>
                <p className="text-[19px] text-slate-600">Projected 2025 cost without SCC: <strong>{theoreticalCost.toLocaleString()} SAR</strong></p>
              </div>
            </div>
            <div className="space-y-[16px]">
              <div className="flex items-start gap-[14px]">
                <div className="w-[28px] h-[28px] rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-[2px]">
                  <span className="text-[14px] font-bold text-teal-600">3</span>
                </div>
                <p className="text-[19px] text-slate-600">Instead, actual 2025 cost was <strong>{actualCost.toLocaleString()} SAR</strong> — a decrease</p>
              </div>
              <div className="flex items-start gap-[14px]">
                <div className="w-[28px] h-[28px] rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-[2px]">
                  <span className="text-[14px] font-bold text-teal-600">4</span>
                </div>
                <p className="text-[19px] text-slate-600">True savings vs. projected: <strong className="text-teal-600">{theoreticalSavingSAR.toLocaleString()} SAR</strong></p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[30px] p-[20px] bg-teal-50 border border-teal-200 rounded-xl">
          <p className="text-[18px] text-slate-600"><strong className="text-teal-700">Key Insight:</strong> The SCC system didn't just reduce costs — it reversed an upward cost trajectory of +8.25%, delivering a net 17.25% improvement in energy cost efficiency.</p>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide14_YoYComparisonTable() {
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[100px] py-[70px]">
        <SectionHeader title="Year-over-Year Comparison" subtitle="Rawdah Monthly Cost: 2024 vs 2025 (SAR)" />
        <div className="mt-[30px]">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left text-[18px] text-slate-500 font-semibold pb-[14px]">Month</th>
                <th className="text-right text-[18px] text-slate-500 font-semibold pb-[14px]">2024 (SAR)</th>
                <th className="text-right text-[18px] text-slate-500 font-semibold pb-[14px]">2025 (SAR)</th>
                <th className="text-right text-[18px] text-slate-500 font-semibold pb-[14px]">Change %</th>
                <th className="text-right text-[18px] text-slate-500 font-semibold pb-[14px]">Savings (SAR)</th>
              </tr>
            </thead>
            <tbody>
              {yearlyComparisonData.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="py-[12px] text-[18px] font-medium text-slate-700">{row.month}</td>
                  <td className="py-[12px] text-right text-[18px] text-slate-600 tabular-nums">{row.year2024.toLocaleString()}</td>
                  <td className="py-[12px] text-right text-[18px] text-slate-600 tabular-nums">{row.year2025.toLocaleString()}</td>
                  <td className={`py-[12px] text-right text-[18px] font-semibold tabular-nums ${row.percentDiff > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                    {row.percentDiff > 0 ? '+' : ''}{row.percentDiff.toFixed(1)}%
                  </td>
                  <td className={`py-[12px] text-right text-[18px] font-semibold tabular-nums ${row.savingsSAR > 0 ? 'text-teal-600' : 'text-slate-400'}`}>
                    {row.savingsSAR > 0 ? row.savingsSAR.toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300">
                <td className="py-[14px] text-[20px] font-bold text-slate-800">TOTAL</td>
                <td className="py-[14px] text-right text-[20px] font-bold text-slate-800 tabular-nums">
                  {yearlyComparisonData.reduce((s, r) => s + r.year2024, 0).toLocaleString()}
                </td>
                <td className="py-[14px] text-right text-[20px] font-bold text-slate-800 tabular-nums">
                  {yearlyComparisonData.reduce((s, r) => s + r.year2025, 0).toLocaleString()}
                </td>
                <td className="py-[14px] text-right text-[20px] font-bold text-teal-600">5.91%</td>
                <td className="py-[14px] text-right text-[20px] font-bold text-teal-600 tabular-nums">
                  {energyCostSummary.yearlySavings2024vs2025.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-[20px] p-[16px] bg-teal-50 border border-teal-200 rounded-xl">
          <p className="text-[17px] text-slate-600">
            <strong className="text-teal-700">Result:</strong> 8 out of 12 months showed YoY savings. Total: <strong className="text-teal-700">{energyCostSummary.yearlySavings2024vs2025.toLocaleString()} SAR</strong> saved despite hotter weather.
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide15_RawdahVsRubenTable() {
  return (
    <SlideLayout>
      <div className="absolute inset-0 px-[100px] py-[70px]">
        <SectionHeader title="Rawdah vs Ruben Comparison" subtitle="2025 Monthly Consumption — Without G8 (SAR)" />
        <div className="mt-[30px]">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left text-[18px] text-slate-500 font-semibold pb-[14px]">Month</th>
                <th className="text-right text-[18px] text-slate-500 font-semibold pb-[14px]">Ruben (SAR)</th>
                <th className="text-right text-[18px] text-slate-500 font-semibold pb-[14px]">Rawdah (SAR)</th>
                <th className="text-right text-[18px] text-slate-500 font-semibold pb-[14px]">Diff %</th>
                <th className="text-right text-[18px] text-slate-500 font-semibold pb-[14px]">Savings (SAR)</th>
                <th className="text-center text-[18px] text-slate-500 font-semibold pb-[14px]">Winner</th>
              </tr>
            </thead>
            <tbody>
              {monthlyComparisonData.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="py-[12px] text-[18px] font-medium text-slate-700">{row.month}</td>
                  <td className="py-[12px] text-right text-[18px] text-slate-600 tabular-nums">{row.ruben.toLocaleString()}</td>
                  <td className="py-[12px] text-right text-[18px] text-slate-600 tabular-nums">{row.rawdah.toLocaleString()}</td>
                  <td className={`py-[12px] text-right text-[18px] font-semibold tabular-nums ${row.difference > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                    {row.difference > 0 ? '+' : ''}{row.difference}%
                  </td>
                  <td className={`py-[12px] text-right text-[18px] font-semibold tabular-nums ${row.savingsSAR > 0 ? 'text-teal-600' : 'text-slate-400'}`}>
                    {row.savingsSAR > 0 ? row.savingsSAR.toLocaleString() : '—'}
                  </td>
                  <td className="py-[12px] text-center">
                    <span className={`px-[12px] py-[4px] rounded-full text-[14px] font-semibold ${
                      row.winner === 'RAWDAH' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
                    }`}>{row.winner}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300">
                <td className="py-[14px] text-[20px] font-bold text-slate-800">TOTAL</td>
                <td className="py-[14px] text-right text-[20px] font-bold text-slate-800 tabular-nums">
                  {monthlyComparisonData.reduce((s, r) => s + r.ruben, 0).toLocaleString()}
                </td>
                <td className="py-[14px] text-right text-[20px] font-bold text-slate-800 tabular-nums">
                  {monthlyComparisonData.reduce((s, r) => s + r.rawdah, 0).toLocaleString()}
                </td>
                <td className="py-[14px] text-right text-[20px] font-bold text-teal-600">{summaryStats.avgSavingsPercent}%</td>
                <td className="py-[14px] text-right text-[20px] font-bold text-teal-600 tabular-nums">
                  {summaryStats.totalAnnualSavings.toLocaleString()}
                </td>
                <td className="py-[14px] text-center">
                  <span className="px-[12px] py-[4px] rounded-full text-[14px] font-semibold bg-teal-100 text-teal-700">RAWDAH</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-[20px] grid grid-cols-3 gap-[20px]">
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-[20px] text-center">
            <p className="text-[36px] font-bold text-teal-600">{summaryStats.monthsWonByRawdah}</p>
            <p className="text-[16px] text-slate-500">Months Won by Rawdah</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-[20px] text-center">
            <p className="text-[36px] font-bold text-slate-600">{summaryStats.monthsWonByRuben}</p>
            <p className="text-[16px] text-slate-500">Months Won by Ruben</p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-[20px] text-center">
            <p className="text-[36px] font-bold text-teal-600">{summaryStats.avgSavingsPercent}%</p>
            <p className="text-[16px] text-slate-500">Average Savings Rate</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function Slide16_ThankYou() {
  return (
    <SlideLayout bg="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="w-[100px] h-[6px] bg-teal-400 mb-[50px] rounded-full" />
        <h2 className="text-[72px] font-bold text-white mb-[20px]">Thank You</h2>
        <p className="text-[28px] text-slate-400 max-w-[800px]">
          We look forward to partnering with you on your energy efficiency journey
        </p>
        <div className="mt-[80px] flex gap-[40px]">
          {[
            { label: "Proven Savings", value: "25-45%" },
            { label: "ROI Target", value: "3-5 Years" },
            { label: "Equipment Life", value: "+5 Years" },
          ].map((item) => (
            <div key={item.label} className="px-[40px] py-[20px] border border-slate-600 rounded-xl">
              <p className="text-[32px] font-bold text-teal-400">{item.value}</p>
              <p className="text-[18px] text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}

// ─── Helper Components ──────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="w-[60px] h-[5px] bg-teal-500 mb-[20px] rounded-full" />
      <h2 className="text-[44px] font-bold text-slate-800">{title}</h2>
      <p className="text-[22px] text-slate-400 mt-[6px]">{subtitle}</p>
    </div>
  );
}

// ─── All Slides ─────────────────────────────────────

const slides = [
  Slide1_Title,
  Slide2_ExecSummary,
  Slide3_Technology,
  Slide4_FinancialOverview,
  Slide13_TheoreticalSavings,
  Slide5_WeatherCorrelation,
  Slide6_DemandReduction,
  Slide7_UnitPerformance,
  Slide14_YoYComparisonTable,
  Slide15_RawdahVsRubenTable,
  Slide8_ROI,
  Slide9_Maintenance,
  Slide10_Environmental,
  Slide11_LifespanExtension,
  Slide12_Summary,
  Slide16_ThankYou,
];

// ─── Main Presentation Component ────────────────────

export default function Presentation() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const scaleX = clientWidth / 1920;
    const scaleY = clientHeight / 1080;
    setScale(Math.min(scaleX, scaleY));
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  useEffect(() => {
    const onFS = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFS);
    return () => document.removeEventListener("fullscreenchange", onFS);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((s) => Math.min(s + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((s) => Math.max(s - 1, 0));
      } else if (e.key === "Escape") {
        if (showGrid) setShowGrid(false);
        else if (document.fullscreenElement) document.exitFullscreen();
      } else if (e.key === "f" || e.key === "F5") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "g") {
        setShowGrid((g) => !g);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showGrid]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const CurrentSlideComponent = slides[currentSlide];

  if (showGrid) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-700">All Slides ({slides.length})</h2>
          <button onClick={() => setShowGrid(false)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">
            Close Grid
          </button>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {slides.map((SlideComp, i) => (
            <button
              key={i}
              onClick={() => { setCurrentSlide(i); setShowGrid(false); }}
              className={`relative rounded-lg overflow-hidden border-2 transition-all hover:border-teal-400 ${
                i === currentSlide ? "border-teal-500 ring-2 ring-teal-200" : "border-slate-200"
              }`}
            >
              <div className="w-full aspect-video relative overflow-hidden">
                <div
                  className="absolute origin-top-left"
                  style={{ transform: "scale(0.15)", width: 1920, height: 1080 }}
                >
                  <SlideComp />
                </div>
              </div>
              <div className="bg-white p-2 text-center">
                <span className="text-sm font-medium text-slate-600">{i + 1}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-screen w-screen bg-slate-950 relative overflow-hidden select-none">
      {/* Scaled slide */}
      <div
        className="absolute"
        style={{
          width: 1920,
          height: 1080,
          left: "50%",
          top: "50%",
          marginLeft: -960,
          marginTop: -540,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <CurrentSlideComponent />
      </div>

      {/* Controls — hidden in fullscreen after a delay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-center justify-between opacity-100 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide((s) => Math.max(s - 1, 0))}
            disabled={currentSlide === 0}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-white text-sm font-medium min-w-[80px] text-center">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={() => setCurrentSlide((s) => Math.min(s + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Grid view (G)"
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
          <button
            onClick={() => navigate("/")}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Exit presentation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Slide progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/10">
        <div
          className="h-full bg-teal-400 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
