// ROI and Operational Cost Savings Data for Rawdah Showroom

// System Configuration
export const systemConfig = {
  numberOfUnits: 7,
  unitCapacity: 25, // tons
  costPerUnit: 18000, // SAR
  totalSystemCost: 7 * 18000, // 126,000 SAR
  roiTargetYears: 5,
};

// Energy Savings (from analysis)
export const energySavings = {
  annualSavingsRawdah: 17671.82, // SAR/year from analysis
  annualSavingsPercent: 11.11,
  projectedAnnualSavings25: 50812, // at 25% efficiency (from original data)
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

export const maintenanceSavings: CostSavingCategory[] = [
  {
    category: 'Preventive Maintenance',
    description: 'Regular AC servicing, filter cleaning, coil cleaning',
    withoutSystem: 2500 * 7, // 2,500 SAR per unit annually
    withSystem: 1800 * 7, // Reduced due to less strain
    annualSavings: 700 * 7,
    notes: 'Reduced compressor strain means less frequent deep cleaning required',
  },
  {
    category: 'Emergency Repairs',
    description: 'Unplanned breakdowns, after-hours callouts',
    withoutSystem: 4000 * 2, // ~2 emergency repairs per year average
    withSystem: 4000 * 0.5, // ~0.5 emergency repairs with system
    annualSavings: 4000 * 1.5,
    notes: 'Stable operation reduces sudden failures by ~75%',
  },
  {
    category: 'Compressor Repairs/Replacement',
    description: 'Compressor burnout, gas leaks, major component failure',
    withoutSystem: 15000 * 0.3, // 30% chance per year of needing major repair
    withSystem: 15000 * 0.1, // 10% chance with system
    annualSavings: 15000 * 0.2,
    notes: 'Soft start and optimized operation extends compressor life significantly',
  },
  {
    category: 'Spare Parts Replacement',
    description: 'Thermostats, capacitors, contactors, fan motors, belts',
    withoutSystem: 1200 * 7, // 1,200 SAR per unit for parts annually
    withSystem: 600 * 7, // 50% reduction
    annualSavings: 600 * 7,
    notes: 'Reduced wear and tear on components extends their lifespan',
  },
  {
    category: 'Refrigerant Top-ups',
    description: 'R410A refrigerant refills due to minor leaks',
    withoutSystem: 800 * 7, // 800 SAR per unit
    withSystem: 400 * 7, // Stable pressure reduces leak risk
    annualSavings: 400 * 7,
    notes: 'Consistent pressure and reduced cycling minimizes refrigerant loss',
  },
  {
    category: 'Technician Service Visits',
    description: 'Regular inspection and troubleshooting visits',
    withoutSystem: 500 * 12, // Monthly visits @ 500 SAR
    withSystem: 500 * 6, // Bi-monthly visits sufficient
    annualSavings: 500 * 6,
    notes: 'Remote monitoring reduces need for physical inspections',
  },
];

// AC Lifespan Extension Savings
export const lifespanSavings = {
  normalLifespan: 10, // years
  extendedLifespan: 17.5, // average of 15-20 years
  replacementCostPerUnit: 45000, // SAR for 25-ton package unit
  numberOfUnits: 7,
  // Over 20 years: Without system = 2 replacements, With system = ~1.14 replacements
  replacementsWithout: 2,
  replacementsWith: 1.14,
  totalSavingsOver20Years: (2 - 1.14) * 7 * 45000, // ~270,900 SAR over 20 years
  annualizedSavings: ((2 - 1.14) * 7 * 45000) / 20, // ~13,545 SAR per year
};

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
  const lifespanAnnual = lifespanSavings.annualizedSavings;
  const downtimeAnnual = downtimeSavings.annualSavings;
  const energyAnnual = energySavings.annualSavingsRawdah;

  return {
    energySavings: energyAnnual,
    maintenanceSavings: maintenanceTotal,
    lifespanSavings: lifespanAnnual,
    downtimeSavings: downtimeAnnual,
    totalAnnualSavings: energyAnnual + maintenanceTotal + lifespanAnnual + downtimeAnnual,
  };
};

// ROI Calculations
export const calculateROI = () => {
  const savings = calculateTotalSavings();
  const systemCost = systemConfig.totalSystemCost;
  const years = systemConfig.roiTargetYears;
  
  return {
    systemCost,
    annualSavings: savings.totalAnnualSavings,
    fiveYearSavings: savings.totalAnnualSavings * years,
    paybackPeriodYears: systemCost / savings.totalAnnualSavings,
    fiveYearROI: ((savings.totalAnnualSavings * years - systemCost) / systemCost) * 100,
    tenYearROI: ((savings.totalAnnualSavings * 10 - systemCost) / systemCost) * 100,
    netProfitFiveYears: savings.totalAnnualSavings * years - systemCost,
    netProfitTenYears: savings.totalAnnualSavings * 10 - systemCost,
    breakdownByCategory: {
      energy: { annual: savings.energySavings, fiveYear: savings.energySavings * 5 },
      maintenance: { annual: savings.maintenanceSavings, fiveYear: savings.maintenanceSavings * 5 },
      lifespan: { annual: savings.lifespanSavings, fiveYear: savings.lifespanSavings * 5 },
      downtime: { annual: savings.downtimeSavings, fiveYear: savings.downtimeSavings * 5 },
    },
  };
};
