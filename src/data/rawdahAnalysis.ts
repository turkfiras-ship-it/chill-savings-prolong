// Rawdah Showroom Detailed Analysis Data - Summary Analysis & Comparison Tab

export interface MonthlyComparison {
  month: string;
  ruben: number;
  rawdah: number;
  difference: number;
  savingsSAR: number;
  winner: 'RAWDAH' | 'RUBEN';
}

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

export const summaryStats = {
  avgSavingsPercent: 11.11,
  totalAnnualSavings: 17671.82,
  mostEfficientShowroom: 'Rawdah',
  monthsWon: 9,
  totalMonths: 12,
};

export const keyInsights = [
  'The largest savings were achieved in June (18.7%) and December (20.3%)',
  'Rawdah Showroom consistently outperformed Ruben in energy efficiency',
  'Recorded lower consumption in 9 out of 12 months',
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
