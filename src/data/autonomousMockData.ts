// ═══════════════════════════════════════════════════════════════
// MOCK DATA — Autonomous Intelligence Layer
// ═══════════════════════════════════════════════════════════════
import { sites } from "@/data/mockData";
import { unitMonthlyData2025, unitAnnualTotals, unitInfo } from "@/data/unitMonthlyData";

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

export const optimizationOpps: OptimizationOpp[] = [
  { id: "OPT-1", strategy: "Setpoint Optimization", description: "Raise cooling setpoints by 1.5°C during low-occupancy periods without comfort impact", potentialSavings: 42000, confidence: 92, complexity: "Low", energyReduction: 12, costSavings: 42000, carbonReduction: 29, icon: "🌡️" },
  { id: "OPT-2", strategy: "Compressor Sequencing", description: "Optimize compressor staging order to maximize COP during part-load conditions", potentialSavings: 38000, confidence: 85, complexity: "Medium", energyReduction: 10, costSavings: 38000, carbonReduction: 24, icon: "⚙️" },
  { id: "OPT-3", strategy: "Load Shifting", description: "Pre-cool buildings during off-peak hours to reduce peak demand charges by 22%", potentialSavings: 67000, confidence: 78, complexity: "High", energyReduction: 8, costSavings: 67000, carbonReduction: 18, icon: "⚡" },
  { id: "OPT-4", strategy: "Night Pre-Cooling", description: "Leverage thermal mass to pre-cool structures between 2-6 AM at lower tariff rates", potentialSavings: 31000, confidence: 88, complexity: "Low", energyReduction: 7, costSavings: 31000, carbonReduction: 15, icon: "🌙" },
  { id: "OPT-5", strategy: "Demand Response", description: "Curtail non-essential cooling loads during grid peak events for demand rebates", potentialSavings: 55000, confidence: 72, complexity: "Medium", energyReduction: 15, costSavings: 55000, carbonReduction: 35, icon: "📊" },
  { id: "OPT-6", strategy: "Refrigerant Optimization", description: "Switch to low-GWP refrigerants on aging units for efficiency and compliance gains", potentialSavings: 28000, confidence: 65, complexity: "High", energyReduction: 5, costSavings: 28000, carbonReduction: 42, icon: "❄️" },
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

// ── 5. Cooling Demand Forecast ────────────────────────────
export const coolingForecast7Day = (() => {
  const rand = seeded(123);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => {
    const temp = 38 + Math.round(rand() * 12);
    const humidity = 30 + Math.round(rand() * 40);
    const baseLoad = 3200 + Math.round(rand() * 2000);
    const predicted = Math.round(baseLoad * (1 + (temp - 35) * 0.06));
    return { day, temp, humidity, predicted, actual: i < 3 ? Math.round(predicted * (0.92 + rand() * 0.16)) : null, confidence: Math.round(85 + rand() * 12) };
  });
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

export const energyScenarios: EnergyScenario[] = [
  {
    id: "ES-1", strategy: "Pre-Cool Buildings", description: "Start cooling at 5 AM to build thermal mass before peak hours",
    demandReduction: 18, costImpact: -34000, gridLoadReduction: 15,
    timeline: Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, baseline: 200 + (h >= 10 && h <= 16 ? 300 + (h - 10) * 40 : 50), optimized: 200 + (h >= 4 && h <= 8 ? 250 : h >= 10 && h <= 16 ? 180 + (h - 10) * 20 : 40) })),
  },
  {
    id: "ES-2", strategy: "Shift Cooling Load", description: "Redistribute cooling demand across portfolio to flatten peaks",
    demandReduction: 22, costImpact: -45000, gridLoadReduction: 20,
    timeline: Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, baseline: 200 + (h >= 10 && h <= 16 ? 320 + (h - 10) * 35 : 60), optimized: 200 + (h >= 8 && h <= 20 ? 200 + Math.abs(h - 14) * 5 : 50) })),
  },
  {
    id: "ES-3", strategy: "Reduce Peak Demand", description: "Cap compressor staging to 85% during 12-4 PM to avoid demand charges",
    demandReduction: 15, costImpact: -28000, gridLoadReduction: 12,
    timeline: Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, baseline: 200 + (h >= 10 && h <= 16 ? 350 + (h - 10) * 30 : 50), optimized: 200 + (h >= 10 && h <= 16 ? Math.min(350, 250 + (h - 10) * 15) : 45) })),
  },
];

// ── 7. Carbon Data ────────────────────────────────────────
export const carbonData = {
  todayEmitted: 128.4,
  todayAvoided: 34.2,
  monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    emitted: Math.round(3200 + Math.random() * 1800),
    avoided: Math.round(400 + Math.random() * 600),
  })),
  perBuilding: sites.filter(s => s.status === "active").map(s => ({
    site: s.name,
    intensity: Math.round((s.consumption_kwh * 0.0007) / (s.assets || 1)),
    total: Math.round(s.consumption_kwh * 0.0007),
  })).sort((a, b) => b.total - a.total),
};
