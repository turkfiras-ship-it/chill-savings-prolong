// Rawdah Showroom — Per-Unit Monthly kW Consumption (2025)
// Units: G1, G2, G3, F1, F2, F3, F4, G8

export interface UnitMonthlyData {
  month: string;
  G1: number;
  G2: number;
  G3: number;
  F1: number;
  F2: number;
  F3: number;
  F4: number;
  G8: number;
  total: number;
  totalWithG8: number;
}

// Monthly consumption per unit (kW) — from Excel monthly tabs
// NOTE: F1 and F4 corrected to match Excel row assignments
export const unitMonthlyData2025: UnitMonthlyData[] = [
  { month: 'January',   G1: 4784, G2: 3556, G3: 4652, F1: 2957, F2: 3941, F3: 3777, F4: 2714, G8: 776,   total: 26380, totalWithG8: 27157 },
  { month: 'February',  G1: 4140, G2: 3822, G3: 3758, F1: 3707, F2: 3623, F3: 4534, F4: 2021, G8: 1374,  total: 25607, totalWithG8: 26981 },
  { month: 'March',     G1: 5912, G2: 6508, G3: 5383, F1: 5747, F2: 5902, F3: 6611, F4: 4657, G8: 4208,  total: 40720, totalWithG8: 44928 },
  { month: 'April',     G1: 6919, G2: 8089, G3: 6547, F1: 7456, F2: 8584, F3: 6677, F4: 6975, G8: 8605,  total: 51248, totalWithG8: 59853 },
  { month: 'May',       G1: 10096, G2: 9308, G3: 7775, F1: 11385, F2: 8666, F3: 8676, F4: 5313, G8: 10828, total: 61220, totalWithG8: 72048 },
  { month: 'June',      G1: 11510, G2: 9686, G3: 7573, F1: 11700, F2: 9093, F3: 9128, F4: 4145, G8: 12543, total: 62835, totalWithG8: 75378 },
  { month: 'July',      G1: 11665, G2: 9915, G3: 10072, F1: 13824, F2: 8396, F3: 10910, F4: 3555, G8: 14667, total: 68338, totalWithG8: 83005 },
  { month: 'August',    G1: 11511, G2: 10027, G3: 9891, F1: 14098, F2: 12236, F3: 9802, F4: 4021, G8: 13308, total: 71586, totalWithG8: 84894 },
  { month: 'September', G1: 7039, G2: 9227, G3: 7999, F1: 10680, F2: 10021, F3: 7989, F4: 4296, G8: 9813,  total: 57251, totalWithG8: 67064 },
  { month: 'October',   G1: 5992, G2: 5785, G3: 5809, F1: 6264, F2: 7261, F3: 5870, F4: 3201, G8: 5757,  total: 40182, totalWithG8: 45939 },
  { month: 'November',  G1: 5359, G2: 4590, G3: 5049, F1: 5000, F2: 5880, F3: 5137, F4: 2408, G8: 3454,  total: 33424, totalWithG8: 36878 },
  { month: 'December',  G1: 2197, G2: 4248, G3: 3074, F1: 4216, F2: 3145, F3: 3214, F4: 2423, G8: 1750,  total: 22517, totalWithG8: 24267 },
];

// Annual totals per unit (corrected F1/F4 swap)
export const unitAnnualTotals = {
  G1: 87125,
  G2: 84762,
  G3: 77583,
  F1: 97034,
  F2: 86749,
  F3: 82325,
  F4: 45730,
  G8: 87083,
  total: 561308,       // Without G8
  totalWithG8: 648391, // With G8
};

// Unit metadata
export const unitInfo: Record<string, { location: string; notes: string }> = {
  G1: { location: 'Ground Floor — Main Entrance', notes: 'High load due to frequent door openings. Air curtain recommended.' },
  G2: { location: 'Ground Floor — Central Area', notes: 'Moderate consumption. Good improvement after SCC installation (62% daily reduction).' },
  G3: { location: 'Ground Floor — Rear Section', notes: 'Serves same area as F1 on different floor. More efficient than F1.' },
  F1: { location: 'First Floor — Warehouse & Ladies Lounge', notes: 'Highest consumption unit (97,034 kWh/year). Extra duct line adds ~20,000 kWh/year to total building load. Peak in August (14,098 kW). Evaluate duct layout.' },
  F2: { location: 'First Floor — Central Area', notes: 'Sensor issue resolved. Consumption spiked in August (12,236 kW).' },
  F3: { location: 'First Floor — Rear Section', notes: 'Consistent performer. Peak in July (10,910 kW).' },
  F4: { location: 'First Floor — Book Area', notes: 'Lowest consumption unit (45,730 kWh/year). Consistent low load with peak in April (6,975 kW).' },
  G8: { location: 'Ground Floor — 8th Panel', notes: 'Consists of cassettes, ducted split, and split units. Not part of SCC system. 87,083 kWh/year. 3–18% of total building consumption depending on season.' },
};

// G8 consumption as percentage of total building
export const g8PercentOfTotal = [3, 5, 9, 14, 15, 17, 18, 16, 15, 13, 9, 7]; // Jan-Dec

// G8 monthly cost (SAR)
export const g8MonthlyCost = [268, 474, 1452, 2969, 3736, 4327, 5060, 4591, 3386, 1986, 1192, 604];

export const unitNames = ['G1', 'G2', 'G3', 'F1', 'F2', 'F3', 'F4'] as const;
export const unitNamesWithG8 = ['G1', 'G2', 'G3', 'F1', 'F2', 'F3', 'F4', 'G8'] as const;
export type UnitName = typeof unitNames[number];
export type UnitNameWithG8 = typeof unitNamesWithG8[number];
