// Rawdah Showroom Detailed Analysis Data - Updated from Excel (Feb 2026)

export interface MonthlyComparison {
  month: string;
  ruben: number;
  rawdah: number;
  difference: number;
  savingsSAR: number;
  winner: 'RAWDAH' | 'RUBEN';
}

// 2025 Comparison: Rawdah vs Ruben (Without G8) — Updated from Excel comparison table
export const monthlyComparisonData: MonthlyComparison[] = [
  { month: 'January', ruben: 8899.44, rawdah: 8330.6, difference: 6.4, savingsSAR: 568.84, winner: 'RAWDAH' },
  { month: 'February', ruben: 10174.19, rawdah: 8178.88, difference: 19.6, savingsSAR: 1995.31, winner: 'RAWDAH' },
  { month: 'March', ruben: 12428, rawdah: 13393.66, difference: -7.8, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'April', ruben: 14913.66, rawdah: 17024.72, difference: -14.2, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'May', ruben: 23569.02, rawdah: 20465.06, difference: 13.2, savingsSAR: 3103.96, winner: 'RAWDAH' },
  { month: 'June', ruben: 25850.43, rawdah: 21022.77, difference: 18.7, savingsSAR: 4827.66, winner: 'RAWDAH' },
  { month: 'July', ruben: 24744.78, rawdah: 22920.65, difference: 7.4, savingsSAR: 1824.13, winner: 'RAWDAH' },
  { month: 'August', ruben: 27216.82, rawdah: 24019.07, difference: 11.7, savingsSAR: 3197.75, winner: 'RAWDAH' },
  { month: 'September', ruben: 19054.4, rawdah: 19072.58, difference: -0.1, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'October', ruben: 13489.5, rawdah: 13207.52, difference: 2.1, savingsSAR: 281.98, winner: 'RAWDAH' },
  { month: 'November', ruben: 10919.02, rawdah: 10852.55, difference: 0.6, savingsSAR: 66.47, winner: 'RAWDAH' },
  { month: 'December', ruben: 8895.4, rawdah: 7089.68, difference: 20.3, savingsSAR: 1805.72, winner: 'RAWDAH' },
];

// 2024 vs 2025 Year-over-Year Comparison (Full meter readings)
export interface YearlyComparison {
  month: string;
  year2024: number;
  year2025: number;
  percentDiff: number;
  actualDiff: number;
  savingsSAR: number;
}

export const yearlyComparisonData: YearlyComparison[] = [
  { month: 'January', year2024: 8282.3, year2025: 8598.6, percentDiff: -3.82, actualDiff: -316.3, savingsSAR: 0 },
  { month: 'February', year2024: 12040.5, year2025: 8652.88, percentDiff: 28.14, actualDiff: 3387.62, savingsSAR: 3387.62 },
  { month: 'March', year2024: 13302.37, year2025: 14845.66, percentDiff: -11.60, actualDiff: -1543.29, savingsSAR: 0 },
  { month: 'April', year2024: 15845.44, year2025: 19993.72, percentDiff: -26.18, actualDiff: -4148.28, savingsSAR: 0 },
  { month: 'May', year2024: 23852.75, year2025: 24201.06, percentDiff: -1.46, actualDiff: -348.31, savingsSAR: 0 },
  { month: 'June', year2024: 27474.42, year2025: 25349.77, percentDiff: 7.73, actualDiff: 2124.65, savingsSAR: 2124.65 },
  { month: 'July', year2024: 29544.97, year2025: 27980.65, percentDiff: 5.29, actualDiff: 1564.32, savingsSAR: 1564.32 },
  { month: 'August', year2024: 30436.45, year2025: 27691.22, percentDiff: 9.02, actualDiff: 2745.23, savingsSAR: 2745.23 },
  { month: 'September', year2024: 23550.8, year2025: 21854.71, percentDiff: 7.20, actualDiff: 1696.09, savingsSAR: 1696.09 },
  { month: 'October', year2024: 16136.34, year2025: 15193.52, percentDiff: 5.84, actualDiff: 942.82, savingsSAR: 942.82 },
  { month: 'November', year2024: 11937.28, year2025: 11649.4, percentDiff: 2.41, actualDiff: 287.88, savingsSAR: 287.88 },
  { month: 'December', year2024: 7623.95, year2025: 7369.27, percentDiff: 3.34, actualDiff: 254.68, savingsSAR: 254.68 },
];

// Energy Cost Summary — Updated with 2025 full year (using Actual 2025 adjusted values)
export const energyCostSummary = {
  totalBill2023: 203246,
  totalBill2024: 220028,
  totalBill2025: 213379, // Actual 2025 annual bill (verified from SCECO)
  totalBillActual2025: 213379, // Actual 2025 bill
  yearOverYearIncrease2024: 8.25, // 2023 → 2024: (220,028 − 203,246) / 203,246
  yearOverYearIncrease2025: -3.02, // 2024 → 2025: (220,028 − 213,379) / 220,028 = 3.02%
  increaseAmount2024: 16782,
  increaseAmount2025: 6649,
  // 220,028 − 213,379 = 6,649 SAR actual bill reduction
  yearlySavings2024vs2025: 6649,
  yearlySavingsPercent: 3.02, // Actual YoY bill reduction: 6,649 / 220,028 = 3.02%
  savingsGoodMonthsSum: 13003, // Sum of months where 2025 < 2024 (not the net bill diff)
  rawdahVsRubenSavingsPercent: 9.06, // From Excel: Rawdah vs Ruben savings (without G8)
};

// Ruben Showroom Yearly Bills (for reference)
export const rubenYearlyBills = {
  totalBill2023: 192041,
  totalBill2024: 198514,
  totalBill2025: 210437,
  yearOverYearIncrease2024: 3.37,
  yearOverYearIncrease2025: 6.01,
};

// Demand Comparison - Before/After SCC Installation
export interface DemandSnapshot {
  date: string;
  year: number;
  label: string;
  totalDailyConsumption: number;
  avgKwh: number;
  status: string;
}

export const demandSnapshots: DemandSnapshot[] = [
  { date: '21-Oct-23', year: 2023, label: 'Prior to SCC Installation', totalDailyConsumption: 495, avgKwh: 33, status: 'baseline' },
  { date: '21-Oct-24', year: 2024, label: 'After SCC Installation (Old Filters)', totalDailyConsumption: 218, avgKwh: 15, status: 'improved' },
  { date: '21-Oct-25', year: 2025, label: 'New Filters + Better Efficiency', totalDailyConsumption: 189, avgKwh: 12.5, status: 'optimized' },
];

// Unit-Level Comparisons (G1, G3, F3, F4)
export interface UnitComparison {
  unit: string;
  date2024: string;
  date2025: string;
  kw2024: number;
  avgKwh2024: number;
  kw2025: number;
  avgKwh2025: number;
  reduction: number;
}

export const unitComparisons: UnitComparison[] = [
  { unit: 'G1', date2024: 'Oct 12 2024', date2025: 'Oct 12 2025', kw2024: 478, avgKwh2024: 33, kw2025: 214, avgKwh2025: 15, reduction: 55.2 },
  { unit: 'G3', date2024: 'Oct 12 2024', date2025: 'Oct 12 2025', kw2024: 327, avgKwh2024: 22.5, kw2025: 217, avgKwh2025: 15, reduction: 33.6 },
  { unit: 'F3', date2024: 'Oct 16 2024', date2025: 'Oct 16 2025', kw2024: 477, avgKwh2024: 33, kw2025: 234, avgKwh2025: 15, reduction: 50.9 },
  { unit: 'F1', date2024: 'Oct 20 2024', date2025: 'Oct 20 2025', kw2024: 465, avgKwh2024: 31, kw2025: 290, avgKwh2025: 20, reduction: 37.6 },
];

export const summaryStats = {
  avgSavingsPercent: 11.11, // From Excel summary: Rawdah vs Ruben (Without G8)
  totalAnnualSavings: 17671.82, // From Excel summary: total annual savings SAR (Rawdah vs Ruben)
  trueAdjustedSavingsSAR: 33052, // Weather-normalised true savings (246,431 expected − 213,379 actual)
  trueAdjustedSavingsKwh: 93819, // True kWh saved (weather-corrected, 7 SCC panels only, without G8)
  trueAdjustedSavingsPct: 16.3, // % of 574,713 kWh 2024 baseline
  apparentYoYSavingsSAR: 6649, // Direct bill reduction (220,028 − 213,379)
  mostEfficientShowroom: 'Rawdah', // Rawdah won 9 of 12 months
  monthsWonByRawdah: 9,
  monthsWonByRuben: 3, // Only March, April, and September
  totalMonths: 12,
  demandReductionPercent: 61.8, // 495 kW (Oct 2023) → 189 kW (Oct 2025) = 61.8% reduction
};

// Rawdah-specific insights (standalone performance)
export const rawdahInsights = [
  'Rawdah achieved 6,649 SAR in direct bill savings in 2025 (YoY: 220,028 → 213,379 SAR). True adjusted savings are 33,052 SAR once weather normalization is applied — reflecting the full value of the SCC system',
  'True adjusted kWh savings: 93,819 kWh (16.3% of 2024 baseline) — accounting for 2025 being 1.3°C hotter, which required 12% more cooling demand that the system absorbed without increasing the bill',
  'Major cost-saving months (YoY): February (28.1%, 3,387 SAR), August (9.0%, 2,745 SAR), June (7.7%, 2,125 SAR), July (5.3%, 1,564 SAR), September (7.2%, 1,696 SAR)',
  'Q1 cost increases (Jan +3.8%, Mar +11.6%, Apr +26.2%) were driven by early-season inefficiencies, thermostat misuse, and system updates — these represent clear opportunities for further optimization',
  'During high-load summer months (May–August), Rawdah demonstrated consistent improvement over 2024, proving cost control measures are effective under peak tariff conditions',
  'Expected 2025 bill without SCC (weather-normalised): 246,431 SAR. Actual: 213,379 SAR. Gap = 33,052 SAR in true savings — all delivered from the 81.8% of the bill the SCC controls',
];

// Rawdah vs Ruben comparison insights
export const comparisonInsights = [
  'Rawdah consistently outperformed Ruben in energy efficiency, recording lower consumption in 9 out of 12 months in 2025',
  'Average savings vs Ruben: 11.11% — total annual savings: 17,671.82 SAR (without G8)',
  'The largest savings vs Ruben were achieved in June (18.7%, 4,827.66 SAR) and December (20.3%, 1,805.72 SAR)',
  'Ruben outperformed Rawdah only in March, April, and September — with marginal difference in September (-0.1%)',
  'Rawdah remains the more energy-efficient showroom, delivering meaningful cost savings and more stable performance throughout the year—particularly during peak cooling periods',
  'Continued monitoring and adopting Rawdah\'s operational strategies could further enhance Ruben\'s performance and overall cost efficiency',
];

// Combined for backward compatibility
export const keyInsights = [...rawdahInsights, ...comparisonInsights];

export interface UnitObservation {
  unit: string;
  issue: string;
  recommendation?: string;
}

export const unitPerformanceObservations: UnitObservation[] = [
  {
    unit: 'G1 Unit',
    issue: 'G1 is used more than other units because it is located at the main entrance, where doors frequently open and cool air escapes.',
    recommendation: 'Install air curtains at the entrance to retain cool air inside the showroom and improve system efficiency.',
  },
  {
    unit: 'F1 and G3 Comparison',
    issue: 'F1 and G3 serve the same area on different floors. However, F1 has an additional duct line that also services the warehouse and ladies lounge. This causes F1 to consume approximately 20,000 kWh more per year than G3, resulting in an additional SAR 5,800 annually.',
    recommendation: 'Cancel the back duct line completely. Install a wall split unit in the ladies lounge. Add an opening in the warehouse for better air circulation.',
  },
  {
    unit: 'F2 Unit',
    issue: 'An issue was found with the internal sensor not responding to thermostat commands. The sensor was replaced and the issue was resolved.',
  },
];

export interface MaintenanceNote {
  category: string;
  notes: string[];
}

export const maintenanceNotes: MaintenanceNote[] = [
  {
    category: 'Filters',
    notes: [
      'After fixing the filter issues, energy savings improved noticeably.',
      'However, full AC cleaning and maintenance were performed insufficiently (only 3 times this year).',
      'Preventive maintenance must be done quarterly without exception.',
      'If systems are not properly maintained or filters are not cleaned regularly, energy consumption can exceed that of old fixed-speed systems regardless of energy-saving technologies.',
    ],
  },
  {
    category: 'Year-Round Issues',
    notes: [
      'F1 continues to consume above average due to additional duct openings.',
      'We added an opening grill above the ladies lounge to improve air circulation (completed by Jarir team).',
      'Despite this, F1 still operates near maximum capacity, meaning potential savings will remain minimal.',
    ],
  },
];

export interface MonthlyIssue {
  month: string;
  issues: string[];
}

export const monthlyIssues: MonthlyIssue[] = [
  {
    month: 'March',
    issues: [
      'Staff manually reduced thermostats to 18°C without notice, causing a consumption spike.',
      'Store front door frequently left open or jammed.',
      'Some AC units failed to shut off automatically from the central controller (now corrected).',
    ],
  },
  {
    month: 'April',
    issues: [
      'Post-Ramadan temperature set at 22°C, later reduced to 21°C due to staff comfort.',
      'System software update completed.',
      'Store front door still frequently left open or jammed.',
      'Staff (Manoush and Ithari) started receiving training on using the central controller and thermostats.',
    ],
  },
];

export interface EquipmentRepair {
  item: string;
  details: string;
}

export const equipmentRepairs: EquipmentRepair[] = [
  { item: 'Thermostats', details: 'Replaced 2 thermostats (June and July) due to malfunction.' },
  { item: 'AC Filters', details: 'AC filters were damaged before the project; finally replaced in July 2025 after multiple attempts.' },
  { item: 'Control Boxes', details: 'New control boxes installed after staff-adjusted thermostat changes (early September).' },
];

export const operatingHoursImpact = {
  description: 'Operating hours were extended due to the back-to-school period.',
  fridayOpeningTimes: [
    { week: 'Week 1', date: 'Sept 19', time: '6:30 AM' },
    { week: 'Week 2', date: 'Sept 26', time: '9:00 AM' },
    { week: 'Week 3', date: 'Oct 3', time: '9:00 AM' },
    { week: 'Week 4', date: 'Oct 10', time: '9:00 AM' },
    { week: 'Week 5', date: 'Oct 17', time: '9:00 AM' },
  ],
  additionalConsumption: 3004, // kWh
  additionalCost: 1000, // SAR
};

// System Monitoring Notes
export const systemMonitoringNotes = [
  'We monitor the system daily for any irregularities and carry out preventive maintenance.',
  'We also maintain a quick response time to rectify issues before being reported by staff at the location.',
  'We actively implement smart energy-saving tactics.',
];
