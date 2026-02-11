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
  { month: 'January', ruben: 8899.44, rawdah: 8598.6, difference: 3.4, savingsSAR: 300.84, winner: 'RAWDAH' },
  { month: 'February', ruben: 10174.19, rawdah: 8652.88, difference: 15.0, savingsSAR: 1521.31, winner: 'RAWDAH' },
  { month: 'March', ruben: 12428, rawdah: 14845.66, difference: -19.5, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'April', ruben: 14913.66, rawdah: 19993.72, difference: -34.1, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'May', ruben: 23569.02, rawdah: 24201.06, difference: -2.7, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'June', ruben: 25850.44, rawdah: 25349.77, difference: 1.9, savingsSAR: 500.67, winner: 'RAWDAH' },
  { month: 'July', ruben: 24744.78, rawdah: 27980.65, difference: -13.1, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'August', ruben: 27170.82, rawdah: 28610.07, difference: -5.3, savingsSAR: 0, winner: 'RUBEN' },
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
  { month: 'March', year2024: 13302.37, year2025: 14844.66, percentDiff: -11.59, actualDiff: -1542.29, savingsSAR: 0 },
  { month: 'April', year2024: 15845.44, year2025: 19993.72, percentDiff: -26.18, actualDiff: -4148.28, savingsSAR: 0 },
  { month: 'May', year2024: 23852.75, year2025: 25084.85, percentDiff: -5.16, actualDiff: -1232.1, savingsSAR: 0 },
  { month: 'June', year2024: 27474.42, year2025: 27083.45, percentDiff: 1.42, actualDiff: 390.97, savingsSAR: 390.97 },
  { month: 'July', year2024: 29544.97, year2025: 29890.27, percentDiff: -1.17, actualDiff: -345.3, savingsSAR: 0 },
  { month: 'August', year2024: 30436.45, year2025: 30562.64, percentDiff: -0.41, actualDiff: -126.19, savingsSAR: 0 },
  { month: 'September', year2024: 23550.8, year2025: 24001.05, percentDiff: -1.91, actualDiff: -450.25, savingsSAR: 0 },
  { month: 'October', year2024: 16136.34, year2025: 16250.12, percentDiff: -0.70, actualDiff: -113.78, savingsSAR: 0 },
  { month: 'November', year2024: 11937.28, year2025: 12892.75, percentDiff: -8.00, actualDiff: -955.47, savingsSAR: 0 },
  { month: 'December', year2024: 7623.95, year2025: 8251.83, percentDiff: -8.24, actualDiff: -627.88, savingsSAR: 0 },
];

// Energy Cost Summary — Updated with 2025 full year
export const energyCostSummary = {
  totalBill2023: 203246,
  totalBill2024: 220028,
  totalBill2025: 226107,
  yearOverYearIncrease2024: 8.26, // 2023 → 2024
  yearOverYearIncrease2025: 2.76, // 2024 → 2025
  increaseAmount2024: 16782,
  increaseAmount2025: 6079,
  // Only Feb and Jun showed YoY savings in 2025
  yearlySavings2024vs2025: 3778.59,
  yearlySavingsPercent: 1.72,
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
  { unit: 'F4', date2024: 'Oct 20 2024', date2025: 'Oct 20 2025', kw2024: 465, avgKwh2024: 31, kw2025: 290, avgKwh2025: 20, reduction: 37.6 },
];

export const summaryStats = {
  avgSavingsPercent: -2.63, // Updated: Rawdah consumed more overall vs Ruben in 2025
  totalAnnualSavings: 4476.99, // Updated: Only months where Rawdah outperformed
  mostEfficientShowroom: 'Ruben', // Updated: Ruben won 6 of 12 months
  monthsWonByRawdah: 6,
  monthsWonByRuben: 6,
  totalMonths: 12,
  // However, demand reduction data still shows 55-62% reduction in kWh at unit level
  demandReductionPercent: 44.3, // Average across G1, G3, F3, F4
};

export const keyInsights = [
  'Updated 2025 data shows Rawdah and Ruben each won 6 out of 12 months in the energy efficiency comparison',
  'Rawdah showed strongest performance in February (15.0% savings) and December (20.3% savings)',
  'March and April saw significant spikes in Rawdah consumption (-19.5% and -34.1%) due to thermostat misuse, door issues, and system updates',
  'Summer months (May-August) showed Rawdah consuming more than Ruben, likely due to extended operating hours and the F1 duct line issue',
  'Despite the comparison results, unit-level demand snapshots still show 55-62% reduction in kWh consumption after SCC installation',
  'The 2025 total bill (226,107 SAR) increased 2.76% over 2024 (220,028 SAR), compared to the 8.26% increase from 2023 to 2024 — indicating the rate of cost increase has slowed significantly',
  'Continued monitoring, resolving the F1 duct issue, and enforcing thermostat policies could significantly improve future performance',
];

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
