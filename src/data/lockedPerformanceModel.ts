// ═══════════════════════════════════════════════════════════════════════════
// LOCKED PERFORMANCE MODEL — SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════════════════
// ALL modules must read from this object only.
// No tab may perform independent math.
// Source: TDE Audit "Rawdah_Bills_Savings_2024_to_26_TDE_Audited" — sheet 11MAY26
// Period basis: rolling 12-month billing cycle (May → Apr), not calendar year.
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
  adoptedNormalizationPct: 12.62, // % — IPMVP CDD-derived (TDE audit)
  weatherNormalizationFactor: 1.1262, // READ ONLY — TDE-audited (CDD-derived)
});

// ─── Grid Emission Factor — SINGLE SOURCE OF TRUTH ────────────────────────
// Saudi grid CO₂ intensity. Credible range:
//   • IEA ≈ 0.52 kgCO₂/kWh
//   • Operational baseline ≈ 0.65–0.651 kgCO₂/kWh (SEC fuel mix, conservative)
// We use 0.651 kgCO₂/kWh site-wide. Change here to update every module.
export const GridEmissionConstants = Object.freeze({
  kgCo2PerKwh: 0.651,
  source: 'Saudi grid operational baseline (SEC fuel-mix; conservative). IEA reports ~0.52 kgCO₂/kWh.',
});

// ─── SECTION 4: Weather Normalization Engine ──────────────────────────────
// Expected_2025_kWh = Measured_2025_kWh × WeatherNormalizationFactor
// TrueSavings_kWh = Expected_2025_kWh − Measured_2025_kWh
// All energy savings originate from this equation. No alternate formulas allowed.

// ─── SECTION 6: Financial Model Lock ──────────────────────────────────────
export const LockedFinancials = Object.freeze({
  // ─── TDE-Audited Billing Totals (12-month rolling, May → Apr, w/o VAT) ───
  baselineYearLabel: 'May-2024 → Apr-2025',
  performanceYearLabel: 'May-2025 → Apr-2026',
  actualBill2024: 177550, // SAR — baseline year (w/o VAT)
  actualBill2025: 181913, // SAR — performance year (w/o VAT, tariff +10%)
  baselineKwh: 613832, // kWh — TDE-audited baseline (May-24 → Apr-25)
  performanceKwh: 589104, // kWh — TDE-audited actual (May-25 → Apr-26)
  expectedKwhWithoutSCC: 691298, // kWh — weather-adjusted expected (613,832 × 1.1262)

  // Weather-adjusted expected bill (locked, not re-derived in UI)
  get expectedBillWithoutSCC() {
    return this.actualBill2025 + this.directEnergySavingsSAR;
  }, // ~214,615 SAR
  // Back-compat alias
  get expectedBill2025WithoutSCC() {
    return this.expectedBillWithoutSCC;
  },

  // ─── Direct Energy Savings (TDE-Verified, IPMVP Option C) ───────────────
  directEnergySavingsSAR: 32702, // SAR/year — TDE-verified avoided cost (w/o VAT)
  weatherAdjustedEnergyAvoided: 102194, // kWh — TDE-verified avoided (7 SCC panels)
  efficiencyImprovement: 17.3, // % of 613,832 kWh baseline

  // Conservative presentation kWh (for monthly alignment)
  conservativePresentationKwh: 102194,

  // Bill-based all-in avoided rate
  get avoidedRateSarPerKwh() {
    return this.directEnergySavingsSAR / this.conservativePresentationKwh;
  }, // ~0.32 SAR/kWh (w/o VAT, tariff-blended)

  // Apparent (raw) YoY bill movement — note: bills rose +4,363 SAR due to tariff hike
  apparentYoYSavingsSAR: -4363, // SAR — raw bill delta (181,913 − 177,550); negative = bill increase
  sameTariffSavingsSAR: 7913, // SAR — if-same-tariff savings (TDE audit row)
  sameTariffSavingsKwh: 24729, // kWh — gross consumed-kWh savings YoY

  // System Investment
  systemInvestment: 175000, // SAR
  numberOfUnits: 7,
  costPerUnit: 25000, // SAR
  unitCapacity: 25, // tons

  // ─── Indirect Operational Benefits (TDE A.1 + B.2) ──────────────────────
  maintenanceSavings: 10440, // SAR/year — TDE R&M table (7 line items)
  capitalDeferralSavings: 12833, // SAR/year — annualised 10→15 yr lifespan extension
  downtimeAvoidance: 0, // folded into R&M

  // Total recurring indirect
  get indirectTotal() {
    return this.maintenanceSavings + this.capitalDeferralSavings + this.downtimeAvoidance;
  }, // 23,273 SAR

  get annualRecurringSavings() {
    return this.directEnergySavingsSAR + this.indirectTotal;
  }, // 55,975 SAR (32,702 + 23,273)

  // Payback — energy only
  get paybackYearsEnergyOnly() {
    return this.systemInvestment / this.directEnergySavingsSAR;
  }, // ~5.3 years

  // Combined payback
  get paybackYearsCombined() {
    return this.systemInvestment / this.annualRecurringSavings;
  }, // ~3.1 years

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

  // Demand reduction (TDE audit band)
  peakDemandReductionMin: 33, // %
  peakDemandReductionMax: 55, // %
  peakDemandReduction: 44, // % — midpoint of audited 33–55% band

  // CO₂ & qualitative — DERIVED from locked kWh avoided × grid factor.
  // 102,194 kWh × 0.651 kgCO₂/kWh / 1000 ≈ 66.5 tCO₂/year
  get co2AvoidedTons() {
    return +((this.weatherAdjustedEnergyAvoided * GridEmissionConstants.kgCo2PerKwh) / 1000).toFixed(2);
  },
  treeEquivalent: 2914, // trees
  complaintReductionPct: 90, // % — non-F1 units

  // Network roll-out (TDE C.1)
  network: Object.freeze({
    showroomsInScope: 20,
    capexPerSite: 175000,
    totalCapex: 3500000,
    annualSavingsPerSite: 43142, // SAR (32,702 energy + 10,440 R&M)
    networkAnnualSavings: 862840,
    networkCo2Tons: 1282,
  }),
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
      name: 'WeatherNormalizationFactor = 1.1262 (TDE-audited)',
      passed: ClimateConstants.weatherNormalizationFactor === 1.1262,
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
