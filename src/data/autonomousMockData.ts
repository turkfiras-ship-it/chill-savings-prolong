// ═══════════════════════════════════════════════════════════════
// MOCK DATA — Autonomous Intelligence Layer
// ═══════════════════════════════════════════════════════════════
import { sites } from "@/data/mockData";
import { unitMonthlyData2025, unitAnnualTotals, unitInfo } from "@/data/unitMonthlyData";
import { LockedFinancials } from "@/data/lockedPerformanceModel";
import { monthlyWeatherData } from "@/data/weatherData";
import { unitWeatherFits, buildSevenDayForecast, months2025 } from "@/data/unitWeatherIntel";

// Real per-kWh conversions (locked model)
const SAR_PER_KWH = LockedFinancials.directEnergySavingsSAR / LockedFinancials.conservativePresentationKwh;
const KSA_GRID = 0.5825; // kg CO₂ / kWh — Saudi grid factor
const sarFor = (kwh: number) => Math.round(kwh * SAR_PER_KWH);
const carbonFor = (kwh: number) => Math.round(kwh * KSA_GRID / 1000); // tons

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ── 1. Optimization Opportunities ─────────────────────────
export interface OptimizationOpp {
  id: string;
  strategy: string;
  description: string;
  potentialSavings: number;
  confidence: number;
  complexity: "Low" | "Medium" | "High";
  energyReduction: number;
  costSavings: number;
  carbonReduction: number;
  icon: string;
}

// Real opportunities — every SAR figure derives from Rawdah kWh × locked rate.
export const optimizationOpps: OptimizationOpp[] = [
  {
    id: "OPT-G8", strategy: "Meter & control G8 residual loads",
    description: `G8 is a DERIVED residual (SCECO bill total − 7 metered SCC panels), not a single asset. It accounted for ${unitAnnualTotals.G8.toLocaleString()} kWh in 2025 — all uncontrolled non-SCC loads (cassettes, ducted splits, plug loads). Adding meters and SCC control here unlocks the next major savings tranche.`,
    potentialSavings: sarFor(Math.round(unitAnnualTotals.G8 * 0.14)),
    confidence: 88, complexity: "Medium", energyReduction: 14,
    costSavings: sarFor(Math.round(unitAnnualTotals.G8 * 0.14)),
    carbonReduction: Math.round(unitAnnualTotals.G8 * 0.14 * KSA_GRID / 1000),
    icon: "⚡",
  },
  {
    id: "OPT-F1", strategy: "Re-engineer F1 duct overhead",
    description: "F1 carries an extra duct serving warehouse + ladies lounge — adds ~20,000 kWh/yr load (peak Aug 14,098 kWh). Duct rework or dedicated zone unit recovers most of that overhead.",
    potentialSavings: sarFor(15000), confidence: 76, complexity: "High",
    energyReduction: 8, costSavings: sarFor(15000), carbonReduction: carbonFor(15000), icon: "🌬️",
  },
  {
    id: "OPT-MAR-APR", strategy: "Eliminate Mar/Apr operational anomaly",
    description: "March/April 2025 spiked +59% then +26% MoM beyond what weather explains. Operational guardrail prevents recurrence (~9,200 kWh avoidable).",
    potentialSavings: sarFor(9200), confidence: 82, complexity: "Low",
    energyReduction: 4, costSavings: sarFor(9200), carbonReduction: carbonFor(9200), icon: "🚨",
  },
  {
    id: "OPT-SETPOINT", strategy: "Setpoint optimization (+1.0 °C off-peak)",
    description: "Raise SCC setpoint by 1.0 °C post-22:00. Each +1 °C ≈ 6% HVAC reduction on the 7 SCC units.",
    potentialSavings: sarFor(Math.round(unitAnnualTotals.total * 0.04)),
    confidence: 90, complexity: "Low", energyReduction: 4,
    costSavings: sarFor(Math.round(unitAnnualTotals.total * 0.04)),
    carbonReduction: carbonFor(Math.round(unitAnnualTotals.total * 0.04)),
    icon: "🌡️",
  },
  {
    id: "OPT-PRECOOL", strategy: "Night pre-cooling May–Sep",
    description: "Pre-cool 04:00–06:00 during peak summer using thermal mass. Shifts ~3% of annual kWh out of peak tariff window.",
    potentialSavings: sarFor(Math.round(unitAnnualTotals.total * 0.03)),
    confidence: 78, complexity: "Medium", energyReduction: 3,
    costSavings: sarFor(Math.round(unitAnnualTotals.total * 0.03)),
    carbonReduction: carbonFor(Math.round(unitAnnualTotals.total * 0.03)),
    icon: "🌙",
  },
  {
    id: "OPT-F4-LEAD", strategy: "Use F4 as lead unit (book area)",
    description: `F4 has the lowest annual draw (${unitAnnualTotals.F4.toLocaleString()} kWh) and the most stable profile. Promoting it to lead in adjacent zones reduces high-cycle wear on F1/F2.`,
    potentialSavings: sarFor(4500), confidence: 70, complexity: "Low",
    energyReduction: 2, costSavings: sarFor(4500), carbonReduction: carbonFor(4500), icon: "⚙️",
  },
];

// ── 2. Portfolio ROI Ranking ──────────────────────────────
export interface PortfolioROI {
  siteId: string;
  siteName: string;
  city: string;
  wasteScore: number;
  investmentRequired: number;
  projectedSavings: number;
  roiMonths: number;
  priorityRank: number;
}

export const portfolioROI: PortfolioROI[] = (() => {
  const rand = seeded(77);
  return sites
    .filter(s => s.status === "active")
    .map(s => {
      const waste = Math.round(20 + rand() * 60);
      const invest = Math.round(50000 + rand() * 300000);
      const savings = Math.round(s.savings_sar > 0 ? s.savings_sar * (1.2 + rand() * 0.5) : s.cost_sar * 0.15);
      const roi = Math.round((invest / (savings / 12)));
      return { siteId: s.id, siteName: s.name, city: s.city, wasteScore: waste, investmentRequired: invest, projectedSavings: savings, roiMonths: roi, priorityRank: 0 };
    })
    .sort((a, b) => a.roiMonths - b.roiMonths)
    .map((s, i) => ({ ...s, priorityRank: i + 1 }));
})();

// ── 3. Contract Simulator Defaults ────────────────────────
export const contractDefaults = {
  capex: 500000,
  savingsPercent: 15,
  durationYears: 7,
  revenueSplit: 70, // % to ESCO
};

// ── 4. Predictive Maintenance ─────────────────────────────
export interface EquipmentRisk {
  id: string;
  name: string;
  type: "Compressor" | "Condenser" | "Evaporator" | "Refrigerant";
  site: string;
  failureRisk: number;
  daysToFailure: number;
  degradationTrend: { day: string; health: number }[];
  lastMaintenance: string;
  runHours: number;
}

// ── Derived from REAL Rawdah per-unit kWh (unitMonthlyData2025) ──
// Stress / risk model (transparent, no random numbers):
//   - runHoursEquivalent  = annual_kWh / 30 kW  (25-ton RTU at avg 30 kW load when running)
//   - peakRatio           = peakMonth_kWh / meanMonth_kWh  (cycling stress)
//   - loadShare           = annual_kWh / max(unit annual)  (relative duty share)
//   - failureRisk (0–95)  = round( 60 * loadShare + 35 * normalize(peakRatio) )
//   - daysToFailure       = round( 365 * (1 - failureRisk/100) )  (linear proxy)
// Degradation trend = inverted, normalized monthly consumption (high consumption month = lower health %).
export const equipmentRisks: EquipmentRisk[] = (() => {
  const SCC_UNITS: { id: keyof typeof unitAnnualTotals; type: EquipmentRisk["type"]; component: string; lastMaint: string }[] = [
    { id: "G1", type: "Compressor",  component: "Compressor (Lead)", lastMaint: "2025-12-01" },
    { id: "G2", type: "Compressor",  component: "Compressor (Lead)", lastMaint: "2025-10-02" },
    { id: "G3", type: "Condenser",   component: "Condenser Coil",    lastMaint: "2025-11-15" },
    { id: "F1", type: "Compressor",  component: "Compressor + Duct", lastMaint: "2025-11-28" },
    { id: "F2", type: "Evaporator",  component: "Evaporator Coil",   lastMaint: "2025-09-20" },
    { id: "F3", type: "Condenser",   component: "Condenser Fan Motor", lastMaint: "2025-10-18" },
    { id: "F4", type: "Refrigerant", component: "Refrigerant Loop",  lastMaint: "2026-01-10" },
  ];

  const months = unitMonthlyData2025.filter(m =>
    !m.month.includes("2024") && !m.month.includes("2026")
  ); // 12 months of 2025

  const annualMax = Math.max(...SCC_UNITS.map(u => unitAnnualTotals[u.id] as number));

  // peakRatio range across units, used to normalize 0..1
  const peakRatios = SCC_UNITS.map(u => {
    const vals = months.map(m => (m as any)[u.id] as number);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.max(...vals) / mean;
  });
  const prMin = Math.min(...peakRatios);
  const prMax = Math.max(...peakRatios);

  return SCC_UNITS.map((u, idx) => {
    const annual = unitAnnualTotals[u.id] as number;
    const vals = months.map(m => (m as any)[u.id] as number);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const peak = Math.max(...vals);
    const peakRatio = peak / mean;

    const loadShare = annual / annualMax;                          // 0..1
    const peakNorm  = (peakRatio - prMin) / (prMax - prMin || 1);  // 0..1
    const failureRisk = Math.min(95, Math.round(60 * loadShare + 35 * peakNorm));
    const daysToFailure = Math.max(14, Math.round(365 * (1 - failureRisk / 100)));
    const runHours = Math.round(annual / 30); // kWh ÷ avg 30 kW

    // Health trend: month-by-month, inverted & rebased so heaviest month ≈ lowest health
    const maxV = Math.max(...vals);
    const degradationTrend = vals.map((v, i) => ({
      day: months[i].month.slice(0, 3),
      health: Math.max(20, Math.round(100 - (v / maxV) * (failureRisk + 15))),
    }));

    return {
      id: `EQ-${String(idx + 1).padStart(3, "0")}`,
      name: `${u.id} ${u.component}`,
      type: u.type,
      site: "Jarir — Rawdah",
      failureRisk,
      daysToFailure,
      degradationTrend,
      lastMaintenance: u.lastMaint,
      runHours,
    };
  }).sort((a, b) => b.failureRisk - a.failureRisk);
})();

// ── 5. Cooling Demand Forecast — derived from per-unit weather fits ─
// Uses real linear regression of each unit's monthly kWh vs Riyadh
// avg high °C. Anchored at the current month's Riyadh temp.
export const coolingForecast7Day = (() => {
  const currentMonthIdx = new Date().getMonth();
  const baseTemp = monthlyWeatherData[currentMonthIdx]?.avgTemp2025 ?? 41;
  const days = buildSevenDayForecast(baseTemp);
  return days.map((d, i) => ({
    day: d.day,
    temp: d.tempC,
    humidity: 25 + ((i * 7) % 30),
    predicted: d.predictedKwh,
    actual: i < 3 ? Math.round(d.predictedKwh * 0.96) : null,
    confidence: d.confidence,
  }));
})();

// ── 6. Energy Strategy Scenarios ──────────────────────────
export interface EnergyScenario {
  id: string;
  strategy: string;
  description: string;
  demandReduction: number;
  costImpact: number;
  gridLoadReduction: number;
  timeline: { hour: string; baseline: number; optimized: number }[];
}

// ── 6. Energy Scenarios — sized to real Rawdah daily peak load ───
// Aug 2025 peak month ≈ 84,894 kWh / 31 ≈ 2,738 kWh/day → peak ~280 kW.
const PEAK_KW = 280;
const BASE_KW = 70;
const sinPeak = (h: number) => Math.max(0, Math.sin(((h - 6) / 12) * Math.PI));
const buildHour = (h: number, baseShape: number, optShape: number) => ({
  hour: `${String(h).padStart(2, "0")}:00`,
  baseline: Math.round(BASE_KW + (PEAK_KW - BASE_KW) * baseShape),
  optimized: Math.round(BASE_KW + (PEAK_KW - BASE_KW) * optShape),
});

export const energyScenarios: EnergyScenario[] = [
  {
    id: "ES-1", strategy: "Pre-Cool Showroom 04:00–06:00",
    description: "Build thermal mass before peak tariff window. Shifts ~15% of midday compressor load into off-peak.",
    demandReduction: 15, costImpact: -sarFor(Math.round(unitAnnualTotals.total * 0.03)), gridLoadReduction: 12,
    timeline: Array.from({ length: 24 }, (_, h) => buildHour(h, sinPeak(h), h >= 4 && h <= 6 ? 0.55 : sinPeak(h) * 0.78)),
  },
  {
    id: "ES-2", strategy: "Cap F1 + F2 staging during 12:00–16:00",
    description: "F1/F2 carry the heaviest summer load (Jul+Aug ≈ 49,158 kWh combined). Capping stage-2 during peak removes ~22% of demand.",
    demandReduction: 22, costImpact: -sarFor(Math.round(unitAnnualTotals.total * 0.05)), gridLoadReduction: 18,
    timeline: Array.from({ length: 24 }, (_, h) => buildHour(h, sinPeak(h), h >= 12 && h <= 16 ? sinPeak(h) * 0.78 : sinPeak(h))),
  },
  {
    id: "ES-3", strategy: "Lead-lag rotation G1↔G2↔G3",
    description: "Rotate lead unit hourly across ground floor zones. Flattens compressor concurrency. Real impact ≈ 8% on ground-floor kWh.",
    demandReduction: 8, costImpact: -sarFor(Math.round((unitAnnualTotals.G1 + unitAnnualTotals.G2 + unitAnnualTotals.G3) * 0.04)), gridLoadReduction: 6,
    timeline: Array.from({ length: 24 }, (_, h) => buildHour(h, sinPeak(h), sinPeak(h) * 0.92)),
  },
];

// ── 7. Carbon Data — real Rawdah kWh × Saudi grid factor ────────
export const carbonData = {
  todayEmitted: Math.round((unitAnnualTotals.totalWithG8 / 365) * KSA_GRID * 10) / 10,
  todayAvoided: Math.round((LockedFinancials.weatherAdjustedEnergyAvoided / 365) * KSA_GRID * 10) / 10,
  monthlyTrend: months2025.map((m) => ({
    month: m.month.slice(0, 3),
    emitted: Math.round(m.totalWithG8 * KSA_GRID),
    avoided: Math.round((m.total / unitAnnualTotals.total) * LockedFinancials.weatherAdjustedEnergyAvoided * KSA_GRID),
  })),
  perBuilding: [
    {
      site: "Jarir — Rawdah",
      intensity: Math.round((unitAnnualTotals.totalWithG8 * KSA_GRID) / 8),
      total: Math.round(unitAnnualTotals.totalWithG8 * KSA_GRID),
    },
  ],
};
