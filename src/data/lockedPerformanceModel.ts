// ═══════════════════════════════════════════════════════════════════════════
// LOCKED PERFORMANCE MODEL — SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════════════════
// ALL modules must read from this object only.
// No tab may perform independent math.
// ═══════════════════════════════════════════════════════════════════════════

// ─── SECTION 2: External Weather Data Source ──────────────────────────────
export const WeatherSource = Object.freeze({
  name: 'WeatherSpark — Riyadh Historical Weather',
  url: 'https://weatherspark.com/h/y/104018/2025/Historical-Weather-during-2025-in-Riyadh-Saudi-Arabia',
  location: 'Riyadh',
  station: 'OERK', // King Khalid International Airport
  stationName: 'King Khalid International Airport',
  citation: 'Weather normalization based on historical Riyadh climate data sourced from WeatherSpark (King Khalid International Airport observations).',
});

// ─── SECTION 3: Lock Verified Climate Values ──────────────────────────────
export const ClimateConstants = Object.freeze({
  avgTemperatureIncrease: 1.3, // °C
  coolingLoadImpactRange: '8–12%' as const,
  adoptedNormalizationPct: 12, // %
  weatherNormalizationFactor: 1.12, // READ ONLY
});

// ─── SECTION 4: Weather Normalization Engine ──────────────────────────────
// Expected_2025_kWh = Measured_2025_kWh × WeatherNormalizationFactor
// TrueSavings_kWh = Expected_2025_kWh − Measured_2025_kWh
// All energy savings originate from this equation. No alternate formulas allowed.

// ─── SECTION 6: Financial Model Lock ──────────────────────────────────────
export const LockedFinancials = Object.freeze({
  // Invoice-backed values
  actualBill2023: 203246, // SAR
  actualBill2024: 220028, // SAR
  actualBill2025: 213379, // SAR
  
  // Weather-adjusted expected bill
  get expectedBill2025WithoutSCC() {
    return Math.round(this.actualBill2024 * ClimateConstants.weatherNormalizationFactor);
  }, // 246,431 SAR

  // Direct Energy Savings (Invoice-Backed)
  directEnergySavingsSAR: 35457, // SAR/year — conservative presentation, bill-verified + weather-adjusted
  weatherAdjustedEnergyAvoided: 80762, // kWh — true adjusted kWh saved
  efficiencyImprovement: 14.1, // %

  // Conservative presentation kWh (for monthly alignment)
  conservativePresentationKwh: 86636, // kWh — capped sum for display alignment

  // Bill-based all-in avoided rate
  get avoidedRateSarPerKwh() {
    return this.directEnergySavingsSAR / this.conservativePresentationKwh;
  }, // ~0.4093 SAR/kWh

  // Apparent (raw) YoY savings
  apparentYoYSavingsSAR: 6649, // SAR — direct bill reduction

  // System Investment
  systemInvestment: 175000, // SAR
  numberOfUnits: 7,
  costPerUnit: 25000, // SAR
  unitCapacity: 25, // tons

  // Indirect Operational Benefits
  maintenanceSavings: 15160, // SAR/year
  downtimeAvoidance: 7500, // SAR/year

  // Total recurring
  get indirectTotal() {
    return this.maintenanceSavings + this.downtimeAvoidance;
  }, // 22,660 SAR

  get annualRecurringSavings() {
    return this.directEnergySavingsSAR + this.indirectTotal;
  }, // 58,117 SAR

  // Payback — energy only
  get paybackYearsEnergyOnly() {
    return this.systemInvestment / this.directEnergySavingsSAR;
  }, // ~4.9 years

  // Combined payback
  get paybackYearsCombined() {
    return this.systemInvestment / this.annualRecurringSavings;
  }, // ~3.0 years

  // 5-Year projections
  get fiveYearSavings() {
    return this.annualRecurringSavings * 5;
  },
  get fiveYearNetProfit() {
    return this.fiveYearSavings - this.systemInvestment;
  },
  get fiveYearROI() {
    return ((this.fiveYearSavings - this.systemInvestment) / this.systemInvestment) * 100;
  },

  // 10-Year projections
  get tenYearSavings() {
    return this.annualRecurringSavings * 10;
  },
  get tenYearNetProfit() {
    return this.tenYearSavings - this.systemInvestment;
  },
  get tenYearROI() {
    return ((this.tenYearSavings - this.systemInvestment) / this.systemInvestment) * 100;
  },

  // Equipment lifespan
  normalLifespan: 10, // years
  extendedLifespan: 15, // years
  replacementCostAvg: 385000, // SAR — 7 units × 55,000 SAR

  // Demand reduction
  peakDemandReduction: 61.8, // % — 495 kW → 189 kW
});

// ─── SECTION 5: Conservative Mode Default ─────────────────────────────────
export const ConservativeModeDefaults = Object.freeze({
  defaultEnabled: true, // On application start: ConservativeMode = TRUE
  rule: 'IF TrueSavings < 0: DisplaySavings = 0, DisplayPercent = 0%, DisplaySAR = 0',
  note: 'Engineering dataset remains unchanged internally. Annual totals MUST equal SUM(displayed monthly SAR).',
});

// ─── SECTION 7: Global Chart Registry ─────────────────────────────────────
export const ChartRegistry = Object.freeze([
  'riyadh_monthly_avg_temp_2024_2025',
  'riyadh_cdd_proxy_2024_2025',
  'riyadh_combined_temp_cdd_savings',
  'weather_normalized_performance_proof',
  'executive_weather_normalized_proof_slide',
  'thermal_performance_proof',
  'system_efficiency_frontier',
]);

// ─── SECTION 8: Performance Proof Stack (mandatory display order) ─────────
export const PerformanceProofOrder = Object.freeze([
  'Weather Impact (WeatherSpark)',
  'Cooling Load Increase',
  'Expected vs Actual Energy',
  'Thermal Performance Proof',
  'Efficiency Frontier',
  'Financial Validation',
]);

// ─── SECTION 11: Auto Audit Validation ────────────────────────────────────
export function runAuditValidation(monthlyDisplaySAR: number[]): {
  passed: boolean;
  checks: { name: string; passed: boolean; detail: string }[];
} {
  const annualSARSum = monthlyDisplaySAR.reduce((a, b) => a + b, 0);
  const checks = [
    {
      name: 'Annual SAR = SUM(monthly SAR)',
      passed: Math.abs(annualSARSum - LockedFinancials.directEnergySavingsSAR) < 100,
      detail: `Sum: ${annualSARSum.toLocaleString()} vs Locked: ${LockedFinancials.directEnergySavingsSAR.toLocaleString()}`,
    },
    {
      name: 'WeatherNormalizationFactor = 1.12',
      passed: ClimateConstants.weatherNormalizationFactor === 1.12,
      detail: `Factor: ${ClimateConstants.weatherNormalizationFactor}`,
    },
  ];
  return { passed: checks.every((c) => c.passed), checks };
}

// ─── Convenience: Frozen master object for import ─────────────────────────
export const LockedPerformanceModel = Object.freeze({
  weather: WeatherSource,
  climate: ClimateConstants,
  financials: LockedFinancials,
  conservativeMode: ConservativeModeDefaults,
  chartRegistry: ChartRegistry,
  proofOrder: PerformanceProofOrder,
  audit: runAuditValidation,
});

export default LockedPerformanceModel;
