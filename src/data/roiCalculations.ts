// ROI and Operational Cost Savings Data for Rawdah Showroom

// System Configuration
export const systemConfig = {
  numberOfUnits: 7,
  unitCapacity: 25, // tons
  costPerUnit: 18000, // SAR - your cost
  totalSystemCost: 7 * 18000, // 126,000 SAR
  roiTargetYears: 5,
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
  annualSavingsRawdah: 17671.82, // SAR/year — from Excel summary: Rawdah vs Ruben (Without G8)
  annualSavingsPercent: 11.11, // From Excel summary: average savings percentage
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
export const maintenanceSavings: CostSavingCategory[] = [
  {
    category: 'Preventive Maintenance',
    description: 'Quarterly AC servicing, filter cleaning, coil cleaning (7 units)',
    withoutSystem: 1800 * 7, // 1,800 SAR/unit/year — 4 visits × 300 SAR labor + 600 SAR materials
    withSystem: 1200 * 7, // Reduced visits (3/year) + less material needed
    annualSavings: 600 * 7, // 4,200 SAR
    notes: 'Saudi technician rate: 250-350 SAR/visit. Less compressor strain = fewer deep cleans needed',
  },
  {
    category: 'Emergency Repairs',
    description: 'Unplanned breakdowns, after-hours callouts',
    withoutSystem: 2500 * 2, // ~2 emergency calls/year × 2,500 SAR (labor + parts + urgency premium)
    withSystem: 2500 * 0.5, // ~0.5 emergencies with system
    annualSavings: 2500 * 1.5, // 3,750 SAR
    notes: 'Emergency callout in Saudi: 500-800 SAR labor + parts. Stable operation reduces sudden failures by ~75%',
  },
  {
    category: 'Compressor Repairs/Replacement',
    description: 'Compressor burnout, gas leaks, major component failure',
    withoutSystem: 10000 * 0.3, // 30% chance/year — compressor for 25-ton: 8,000-12,000 SAR installed
    withSystem: 10000 * 0.1, // 10% chance with system
    annualSavings: 10000 * 0.2, // 2,000 SAR
    notes: 'Copeland/Danfoss compressor: 6,000-9,000 SAR + 2,000-3,000 SAR installation labor in KSA',
  },
  {
    category: 'Spare Parts Replacement',
    description: 'Thermostats, capacitors, contactors, fan motors, belts',
    withoutSystem: 900 * 7, // 900 SAR/unit/year — thermostats (200-400 SAR), capacitors (80-150 SAR), contactors (150-300 SAR)
    withSystem: 450 * 7, // 50% reduction in parts wear
    annualSavings: 450 * 7, // 3,150 SAR
    notes: 'Local market: Thermostat 250-400 SAR, capacitor 100-150 SAR, fan motor 400-800 SAR',
  },
  {
    category: 'Refrigerant Top-ups',
    description: 'R410A refrigerant refills due to minor leaks',
    withoutSystem: 650 * 7, // 650 SAR/unit — R410A: 400-500 SAR/cylinder + 150-200 SAR labor
    withSystem: 300 * 7, // Stable pressure reduces leak frequency
    annualSavings: 350 * 7, // 2,450 SAR
    notes: 'R410A in Saudi market: 400-550 SAR per 11.3kg cylinder + labor 150-200 SAR',
  },
  {
    category: 'Technician Service Visits',
    description: 'Regular inspection and troubleshooting visits',
    withoutSystem: 250 * 12, // Monthly visits × 250 SAR/visit (Saudi HVAC technician rate)
    withSystem: 250 * 6, // Bi-monthly visits sufficient with remote monitoring
    annualSavings: 250 * 6, // 1,500 SAR
    notes: 'Saudi HVAC technician: 150-300 SAR per standard visit. Remote monitoring halves visit frequency',
  },
];

// Downtime Cost Avoidance
export const downtimeSavings = {
  averageDowntimeHoursWithout: 24, // hours per year
  averageDowntimeHoursWith: 4, // hours per year
  hourlyRevenueLoss: 500, // SAR per hour (showroom revenue impact)
  annualSavings: (24 - 4) * 500, // 10,000 SAR
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
