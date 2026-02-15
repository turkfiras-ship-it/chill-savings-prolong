// Rawdah Showroom — Per-Unit Monthly kW Consumption (2025)
// Units: G1, G2, G3, F1, F2, F3, F4

export interface UnitMonthlyData {
  month: string;
  G1: number;
  G2: number;
  G3: number;
  F1: number;
  F2: number;
  F3: number;
  F4: number;
  total: number;
}

// Monthly consumption per unit (kW) — from Excel monthly tabs
export const unitMonthlyData2025: UnitMonthlyData[] = [
  { month: 'January',   G1: 4784, G2: 3556, G3: 4652, F1: 2957, F2: 3941, F3: 3777, F4: 2714, total: 26380 },
  { month: 'February',  G1: 4140, G2: 3822, G3: 3758, F1: 3707, F2: 3623, F3: 4534, F4: 2022, total: 25607 },
  { month: 'March',     G1: 5912, G2: 6508, G3: 5383, F1: 5747, F2: 5902, F3: 6611, F4: 4657, total: 40720 },
  { month: 'April',     G1: 6919, G2: 8089, G3: 6547, F1: 7456, F2: 8584, F3: 6677, F4: 6975, total: 51248 },
  { month: 'May',       G1: 10096, G2: 9308, G3: 7775, F1: 11385, F2: 8666, F3: 8676, F4: 5313, total: 61220 },
  { month: 'June',      G1: 11510, G2: 9686, G3: 7573, F1: 11700, F2: 9093, F3: 9128, F4: 4145, total: 62835 },
  { month: 'July',      G1: 11665, G2: 9915, G3: 10072, F1: 13824, F2: 8396, F3: 10910, F4: 3555, total: 68338 },
  { month: 'August',    G1: 11511, G2: 10027, G3: 9891, F1: 14098, F2: 12236, F3: 9802, F4: 4021, total: 71586 },
  { month: 'September', G1: 7039, G2: 9227, G3: 7999, F1: 10680, F2: 10021, F3: 7989, F4: 4296, total: 57251 },
  { month: 'October',   G1: 5992, G2: 5785, G3: 5809, F1: 6264, F2: 7261, F3: 5870, F4: 3201, total: 40182 },
  { month: 'November',  G1: 5359, G2: 4590, G3: 5049, F1: 5000, F2: 5880, F3: 5137, F4: 2408, total: 33424 },
  { month: 'December',  G1: 2197, G2: 4248, G3: 3074, F1: 4216, F2: 3145, F3: 3214, F4: 2423, total: 22517 },
];

// Annual totals per unit
export const unitAnnualTotals = {
  G1: 87125,
  G2: 84762,
  G3: 77583,
  F1: 97034,
  F2: 86749,
  F3: 82325,
  F4: 45730,
  total: 561308,
};

// Unit metadata
export const unitInfo: Record<string, { location: string; notes: string }> = {
  G1: { location: 'Ground Floor — Main Entrance', notes: 'Highest load due to frequent door openings. Air curtain recommended.' },
  G2: { location: 'Ground Floor — Central Area', notes: 'Moderate consumption. Fluctuations noted in May/June.' },
  G3: { location: 'Ground Floor — Rear Section', notes: 'Serves same area as F1 on different floor. More efficient than F1.' },
  F1: { location: 'First Floor — Warehouse & Ladies Lounge', notes: 'Highest annual consumption (97,034 kW). Extra duct line adds ~20,000 kWh/year. Peak in August (14,098 kW).' },
  F2: { location: 'First Floor — Central Area', notes: 'Sensor issue resolved. Consumption spiked in August (12,236 kW).' },
  F3: { location: 'First Floor — Rear Section', notes: 'Consistent performer. Peak in July (10,910 kW).' },
  F4: { location: 'First Floor — Book Area', notes: 'Lowest consumption unit. Efficient layout with minimal heat gain.' },
};

export const unitNames = ['G1', 'G2', 'G3', 'F1', 'F2', 'F3', 'F4'] as const;
export type UnitName = typeof unitNames[number];
