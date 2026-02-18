// ROI and Operational Cost Savings Data for Rawdah Showroom

// System Configuration
export const systemConfig = {
  numberOfUnits: 7,
  unitCapacity: 25, // tons
  internalCost: 18000, // SAR - your cost
  sellingPrice: 25000, // SAR - client selling price
  costPerUnit: 25000, // SAR - what the client pays
  totalSystemCost: 7 * 25000, // 175,000 SAR
  grossMargin: ((25000 - 18000) / 25000) * 100, // 28%
  profitPerUnit: 25000 - 18000, // 7,000 SAR
  totalProfit: 7 * (25000 - 18000), // 49,000 SAR
  roiTargetYears: 5,
};

// CO2 & Environmental Impact
export const environmentalImpact = {
  electricityRate: 0.30, // SAR/kWh
  co2FactorKgPerKwh: 0.7, // Saudi grid CO2 intensity (kg CO2/kWh)
  treeCo2AbsorptionKgPerYear: 22, // kg CO2 absorbed per mature tree per year
  
  // Calculated from energy savings
  get annualKwhSaved() {
    return Math.round(energySavings.annualSavingsRawdah / this.electricityRate);
  },
  get annualCo2SavedKg() {
    return Math.round(this.annualKwhSaved * this.co2FactorKgPerKwh);
  },
  get annualCo2SavedTons() {
    return +(this.annualCo2SavedKg / 1000).toFixed(1);
  },
  get treesEquivalent() {
    return Math.round(this.annualCo2SavedKg / this.treeCo2AbsorptionKgPerYear);
  },
  get fiveYearCo2Tons() {
    return +(this.annualCo2SavedTons * 5).toFixed(1);
  },
  get tenYearCo2Tons() {
    return +(this.annualCo2SavedTons * 10).toFixed(1);
  },
  get fiveYearTrees() {
    return this.treesEquivalent * 5;
  },
};

// Technology Summary (white-labeled)
export const technologySummary = {
  tagline: 'Advanced Energy Efficiency Technology',
  coreTech: 'Smart Compressor Control (SCC) Technology',
  product: 'SCC System',
  energyReductionRange: '25-45%',
  roiTypical: '3 years or less',
  features: [
    'AI-driven control algorithms that optimize compressor performance in real time',
    'Proven track record across commercial projects for over five years',
    'Retrofit solution — no need to replace existing HVAC equipment',
    'Replicates DC inverter-driven performance on any compressor',
    'Controls compressor, condenser fan motor, and evaporator fan motor',
  ],
  benefits: [
    { category: 'Environmental', detail: 'Lower greenhouse gas (GHG) emissions and decreased CO₂ levels through increased efficiency' },
    { category: 'Economic', detail: 'Lower utility bills and stabilized electricity costs by reducing volatile kW demand' },
    { category: 'Grid Impact', detail: 'Reduces overall electricity demand, decreasing need for new generation and transmission infrastructure' },
    { category: 'Risk Management', detail: 'Diversifies energy portfolio and hedges against fuel price volatility' },
  ],
  certifications: 'Featured on Bloomberg TV — Advancements segment',
  differentiator: 'Say no to replacing and yes to upgrading your HVAC-R equipment',
};

// AC Replacement Cost Range
export const acReplacementCosts = {
  minCostPerUnit: 45000, // SAR
  maxCostPerUnit: 65000, // SAR
  avgCostPerUnit: 55000, // SAR (average)
};

// Lifespan Extension Details
export const lifespanExtension = {
  normalLifespan: 10, // years - client's current replacement cycle
  extendedLifespan: 15, // years - with power saving system
  yearsExtended: 5, // additional years gained
  
  // Calculate replacement savings
  // In 30 years: Without system = 2 replacements (year 10, 20), With system = 1 replacement (year 15)
  // This means 1 full replacement cycle is avoided
  replacementsWithoutOver30Years: 2, // at year 10 and year 20
  replacementsWithOver30Years: 1, // at year 15
  replacementsSaved: 1, // one full cycle saved
};

// Calculate AC Replacement Savings
export const calculateReplacementSavings = () => {
  const unitsCount = systemConfig.numberOfUnits;
  const avgCost = acReplacementCosts.avgCostPerUnit;
  const minCost = acReplacementCosts.minCostPerUnit;
  const maxCost = acReplacementCosts.maxCostPerUnit;
  
  // One full replacement cycle saved over the lifespan
  const totalSavingsMin = unitsCount * minCost; // 7 × 45,000 = 315,000 SAR
  const totalSavingsMax = unitsCount * maxCost; // 7 × 65,000 = 455,000 SAR
  const totalSavingsAvg = unitsCount * avgCost; // 7 × 55,000 = 385,000 SAR
  
  // Annualized over 30 years (the calculation period)
  const annualizedSavings = totalSavingsAvg / 30;
  
  // But more relevant: This savings is realized when you DON'T replace at year 10
  // So by year 10, you've "saved" the full replacement cost
  // For 5-year ROI calculation, we can prorate: 5/10 of the savings = 50%
  const fiveYearProrated = totalSavingsAvg * 0.5;
  
  return {
    minTotal: totalSavingsMin,
    maxTotal: totalSavingsMax,
    avgTotal: totalSavingsAvg,
    annualized: annualizedSavings,
    fiveYearProrated,
    perUnit: {
      min: minCost,
      max: maxCost,
      avg: avgCost,
    },
  };
};

// Energy Savings (from analysis)
export const energySavings = {
  annualSavingsRawdah: 13003, // SAR/year — Actual YoY bill savings 2024 vs 2025 (220,028 − 213,379)
  annualSavingsPercent: 6.09, // YoY cost reduction percentage (13,003 / 213,379 ≈ 6.09%)
  rawdahVsRubenSavings: 17671.82, // SAR/year — Rawdah vs Ruben comparison (Without G8)
  rawdahVsRubenPercent: 11.11, // Average savings vs Ruben
  projectedAnnualSavings25: 50812, // at 25% efficiency (from original 20-showroom projection)
  projectedAnnualSavings30: 60974, // at 30% efficiency
};

// Maintenance & Repair Cost Savings
export interface CostSavingCategory {
  category: string;
  description: string;
  withoutSystem: number; // Annual cost without power saving system
  withSystem: number; // Annual cost with power saving system
  annualSavings: number;
  notes: string;
}

// Saudi Arabia realistic labor & parts costs (2025 market rates)
// Technician labor: 150-300 SAR/visit, Senior technician: 300-500 SAR/visit
// Parts sourced locally from Riyadh HVAC suppliers
// 10% reduction applied to make maintenance figures more conservative/realistic
export const maintenanceSavings: CostSavingCategory[] = [
  {
    category: 'Preventive Maintenance',
    description: 'Quarterly AC servicing, filter cleaning, coil cleaning (7 units)',
    withoutSystem: 1650 * 7, // 1,650 SAR/unit/year (adjusted)
    withSystem: 1120 * 7, // Reduced visits (3/year)
    annualSavings: 530 * 7, // 3,710 SAR
    notes: 'Saudi technician rate: 250-350 SAR/visit. Less compressor strain = fewer deep cleans needed',
  },
  {
    category: 'Emergency Repairs',
    description: 'Unplanned breakdowns, after-hours callouts',
    withoutSystem: 2200 * 2, // ~2 emergency calls/year × 2,200 SAR
    withSystem: 2200 * 0.5,
    annualSavings: 2200 * 1.5, // 3,300 SAR
    notes: 'Emergency callout in Saudi: 500-800 SAR labor + parts. Stable operation reduces failures by ~75%',
  },
  {
    category: 'Compressor Repairs/Replacement',
    description: 'Compressor burnout, gas leaks, major component failure',
    withoutSystem: 9000 * 0.3, // 30% chance/year — compressor for 25-ton: 7,000-11,000 SAR installed
    withSystem: 9000 * 0.1,
    annualSavings: 9000 * 0.2, // 1,800 SAR
    notes: 'Copeland/Danfoss compressor: 5,500-8,500 SAR + 1,500-2,500 SAR installation labor in KSA',
  },
  {
    category: 'Spare Parts Replacement',
    description: 'Thermostats, capacitors, contactors, fan motors, belts',
    withoutSystem: 800 * 7, // 800 SAR/unit/year
    withSystem: 400 * 7, // 50% reduction in parts wear
    annualSavings: 400 * 7, // 2,800 SAR
    notes: 'Local market: Thermostat 200-350 SAR, capacitor 80-130 SAR, fan motor 350-700 SAR',
  },
  {
    category: 'Refrigerant Top-ups',
    description: 'R410A refrigerant refills due to minor leaks',
    withoutSystem: 580 * 7, // 580 SAR/unit
    withSystem: 270 * 7,
    annualSavings: 310 * 7, // 2,170 SAR
    notes: 'R410A in Saudi market: 350-500 SAR per 11.3kg cylinder + labor 130-180 SAR',
  },
  {
    category: 'Technician Service Visits',
    description: 'Regular inspection and troubleshooting visits',
    withoutSystem: 230 * 12, // Monthly visits × 230 SAR/visit
    withSystem: 230 * 6,
    annualSavings: 230 * 6, // 1,380 SAR
    notes: 'Saudi HVAC technician: 150-280 SAR per standard visit. Remote monitoring halves visit frequency',
  },
];

// Downtime Cost Avoidance
export const downtimeSavings = {
  averageDowntimeHoursWithout: 24, // hours per year
  averageDowntimeHoursWith: 9,  // hours per year (conservative estimate)
  hourlyRevenueLoss: 500, // SAR per hour (showroom revenue impact)
  annualSavings: (24 - 9) * 500, // 7,500 SAR
  notes: 'Reduced AC failures means less store closures and customer discomfort',
};

// Calculate totals
export const calculateTotalSavings = () => {
  const maintenanceTotal = maintenanceSavings.reduce((sum, item) => sum + item.annualSavings, 0);
  const replacementSavings = calculateReplacementSavings();
  const downtimeAnnual = downtimeSavings.annualSavings;
  const energyAnnual = energySavings.annualSavingsRawdah;

  // Annual operational savings (excluding the one-time replacement savings)
  const annualOperationalSavings = energyAnnual + maintenanceTotal + downtimeAnnual;
  
  // The replacement savings is a major one-time benefit
  const replacementBenefit = replacementSavings.avgTotal;

  return {
    energySavings: energyAnnual,
    maintenanceSavings: maintenanceTotal,
    downtimeSavings: downtimeAnnual,
    annualOperationalSavings, // recurring yearly savings
    replacementSavingsTotal: replacementBenefit, // one-time savings (avoided at year 10)
    replacementSavingsAnnualized: replacementSavings.annualized,
    totalAnnualSavingsWithReplacement: annualOperationalSavings + replacementSavings.annualized,
  };
};

// ROI Calculations
export const calculateROI = () => {
  const savings = calculateTotalSavings();
  const replacement = calculateReplacementSavings();
  const systemCost = systemConfig.totalSystemCost;
  const years = systemConfig.roiTargetYears;
  
  // 5-Year Calculation
  // Annual operational savings × 5 years + prorated replacement savings
  const fiveYearOperational = savings.annualOperationalSavings * years;
  const fiveYearWithReplacement = fiveYearOperational + replacement.fiveYearProrated;
  
  // 10-Year Calculation  
  // By year 10, you've avoided the full replacement cost
  const tenYearOperational = savings.annualOperationalSavings * 10;
  const tenYearWithReplacement = tenYearOperational + replacement.avgTotal;
  
  return {
    systemCost,
    
    // Annual savings (operational only)
    annualOperationalSavings: savings.annualOperationalSavings,
    
    // 5-Year projections
    fiveYearOperationalSavings: fiveYearOperational,
    fiveYearReplacementSavings: replacement.fiveYearProrated,
    fiveYearTotalSavings: fiveYearWithReplacement,
    fiveYearNetProfit: fiveYearWithReplacement - systemCost,
    fiveYearROI: ((fiveYearWithReplacement - systemCost) / systemCost) * 100,
    
    // 10-Year projections (includes full replacement cost avoided)
    tenYearOperationalSavings: tenYearOperational,
    tenYearReplacementSavings: replacement.avgTotal,
    tenYearTotalSavings: tenYearWithReplacement,
    tenYearNetProfit: tenYearWithReplacement - systemCost,
    tenYearROI: ((tenYearWithReplacement - systemCost) / systemCost) * 100,
    
    // Payback calculation
    paybackPeriodYears: systemCost / savings.annualOperationalSavings,
    paybackPeriodMonths: (systemCost / savings.annualOperationalSavings) * 12,
    
    // Breakdown by category
    breakdownByCategory: {
      energy: { annual: savings.energySavings, fiveYear: savings.energySavings * 5, tenYear: savings.energySavings * 10 },
      maintenance: { annual: savings.maintenanceSavings, fiveYear: savings.maintenanceSavings * 5, tenYear: savings.maintenanceSavings * 10 },
      downtime: { annual: savings.downtimeSavings, fiveYear: savings.downtimeSavings * 5, tenYear: savings.downtimeSavings * 10 },
      replacement: { 
        total: replacement.avgTotal, 
        fiveYearProrated: replacement.fiveYearProrated, 
        tenYear: replacement.avgTotal,
        range: `${replacement.minTotal.toLocaleString()} - ${replacement.maxTotal.toLocaleString()} SAR`,
      },
    },
    
    // Replacement details
    replacementDetails: {
      unitsCount: systemConfig.numberOfUnits,
      normalLifespan: lifespanExtension.normalLifespan,
      extendedLifespan: lifespanExtension.extendedLifespan,
      yearsExtended: lifespanExtension.yearsExtended,
      costPerUnitMin: acReplacementCosts.minCostPerUnit,
      costPerUnitMax: acReplacementCosts.maxCostPerUnit,
      costPerUnitAvg: acReplacementCosts.avgCostPerUnit,
      totalSavingsMin: replacement.minTotal,
      totalSavingsMax: replacement.maxTotal,
      totalSavingsAvg: replacement.avgTotal,
    },
  };
};
