// Rawdah Showroom Detailed Analysis Data - Enhanced from Summary Analysis Tab

export interface MonthlyComparison {
  month: string;
  ruben: number;
  rawdah: number;
  difference: number;
  savingsSAR: number;
  winner: 'RAWDAH' | 'RUBEN';
}

// 2025 Comparison: Rawdah vs Ruben (Without G8)
export const monthlyComparisonData: MonthlyComparison[] = [
  { month: 'January', ruben: 8899.44, rawdah: 8330.6, difference: 6.4, savingsSAR: 568.84, winner: 'RAWDAH' },
  { month: 'February', ruben: 10174.19, rawdah: 8178.88, difference: 19.6, savingsSAR: 1995.31, winner: 'RAWDAH' },
  { month: 'March', ruben: 14228, rawdah: 13398.56, difference: -7.8, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'April', ruben: 18933.66, rawdah: 17024.72, difference: -14.2, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'May', ruben: 23569.02, rawdah: 20465.06, difference: 13.2, savingsSAR: 3103.96, winner: 'RAWDAH' },
  { month: 'June', ruben: 25850.43, rawdah: 21022.77, difference: 18.7, savingsSAR: 4827.66, winner: 'RAWDAH' },
  { month: 'July', ruben: 24744.78, rawdah: 22920.65, difference: 7.4, savingsSAR: 1824.13, winner: 'RAWDAH' },
  { month: 'August', ruben: 27216.82, rawdah: 24019.07, difference: 11.7, savingsSAR: 3197.75, winner: 'RAWDAH' },
  { month: 'September', ruben: 19054.4, rawdah: 19072.58, difference: -0.1, savingsSAR: 0, winner: 'RUBEN' },
  { month: 'October', ruben: 13489.5, rawdah: 13207.52, difference: 2.1, savingsSAR: 281.98, winner: 'RAWDAH' },
  { month: 'November', ruben: 10919.02, rawdah: 10852.55, difference: 0.6, savingsSAR: 66.47, winner: 'RAWDAH' },
  { month: 'December', ruben: 8895.4, rawdah: 7089.68, difference: 20.3, savingsSAR: 1805.72, winner: 'RAWDAH' },
];

// NEW: 2024 vs 2025 Year-over-Year Comparison
export interface YearlyComparison {
  month: string;
  year2024: number;
  year2025: number;
  percentDiff: number;
  actualDiff: number;
  savingsSAR: number;
}

export const yearlyComparisonData: YearlyComparison[] = [
  { month: 'January', year2024: 8282.3, year2025: 8598.6, percentDiff: -3.82, actualDiff: -3.60, savingsSAR: 0 },
  { month: 'February', year2024: 12040.5, year2025: 8652.88, percentDiff: 28.14, actualDiff: 27.72, savingsSAR: 3387.62 },
  { month: 'March', year2024: 13302.37, year2025: 14845.66, percentDiff: -11.60, actualDiff: -12.33, savingsSAR: 0 },
  { month: 'April', year2024: 15845.44, year2025: 19993.72, percentDiff: -26.18, actualDiff: -30.65, savingsSAR: 0 },
  { month: 'May', year2024: 23852.75, year2025: 24201.06, percentDiff: -1.46, actualDiff: -1.68, savingsSAR: 0 },
  { month: 'June', year2024: 23474.42, year2025: 25349.77, percentDiff: 7.73, actualDiff: 8.93, savingsSAR: 2124.65 },
  { month: 'July', year2024: 29544.57, year2025: 27989.65, percentDiff: 5.29, actualDiff: 6.22, savingsSAR: 1564.32 },
  { month: 'August', year2024: 30436.45, year2025: 27691.22, percentDiff: 9.02, actualDiff: 10.30, savingsSAR: 2745.23 },
  { month: 'September', year2024: 23550.8, year2025: 21854.71, percentDiff: 7.20, actualDiff: 8.10, savingsSAR: 1696.09 },
  { month: 'October', year2024: 16136.34, year2025: 15193.52, percentDiff: 5.84, actualDiff: 6.27, savingsSAR: 942.82 },
  { month: 'November', year2024: 11937.78, year2025: 11649.4, percentDiff: 2.41, actualDiff: 2.52, savingsSAR: 287.38 },
  { month: 'December', year2024: 7623.95, year2025: 7369.27, percentDiff: 3.34, actualDiff: 2.41, savingsSAR: 254.68 },
];

// Energy Cost Summary
export const energyCostSummary = {
  totalBill2023: 203246,
  totalBill2024: 220028,
  yearOverYearIncrease: 8.25,
  increaseAmount: 16782,
  overallSavingsExcludingIssueMonths: 9, // 9% decrease when excluding March/April
  yearlySavings2024vs2025: 13003.29,
  yearlySavingsPercent: 9.06,
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
  avgSavingsPercent: 11.11,
  totalAnnualSavings: 17671.82,
  mostEfficientShowroom: 'Rawdah',
  monthsWon: 9,
  totalMonths: 12,
};

export const keyInsights = [
  'The largest savings were achieved in June (18.7%) and December (20.3%)',
  'Rawdah Showroom consistently outperformed Ruben in energy efficiency, recording lower consumption in 9 out of 12 months',
  'Only March and April saw higher RAWDAH consumption due to maintenance issues, system updates and operational differences',
  'During high-load summer months (May-August), Rawdah consistently demonstrated stronger energy performance, highlighting better operational efficiency under peak demand conditions',
  'Rawdah remains the more energy-efficient showroom, delivering meaningful cost savings and more stable performance throughout the year—particularly during peak cooling periods',
  'Continued monitoring and adopting RAWDAH\'s operational strategies could further enhance RUBEN\'s performance and overall cost efficiency',
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
