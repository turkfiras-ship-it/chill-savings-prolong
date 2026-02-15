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
  { month: 'January',   G1: 4784, G2: 3556, G3: 4652, F1: 2714, F2: 3941, F3: 3777, F4: 2957, total: 26380 },
  { month: 'February',  G1: 4140, G2: 3822, G3: 3758, F1: 2022, F2: 3623, F3: 4534, F4: 3707, total: 25607 },
  { month: 'March',     G1: 5912, G2: 6508, G3: 5383, F1: 4657, F2: 5902, F3: 6611, F4: 5747, total: 40720 },
  { month: 'April',     G1: 6919, G2: 8089, G3: 6547, F1: 6975, F2: 8584, F3: 6677, F4: 7456, total: 51248 },
  { month: 'May',       G1: 10096, G2: 9308, G3: 7775, F1: 5313, F2: 8666, F3: 8676, F4: 11385, total: 61220 },
  { month: 'June',      G1: 11510, G2: 9686, G3: 7573, F1: 4145, F2: 9093, F3: 9128, F4: 11700, total: 62835 },
  { month: 'July',      G1: 11665, G2: 9915, G3: 10072, F1: 3555, F2: 8396, F3: 10910, F4: 13824, total: 68338 },
  { month: 'August',    G1: 11511, G2: 10027, G3: 9891, F1: 4021, F2: 12236, F3: 9802, F4: 14098, total: 71586 },
  { month: 'September', G1: 7039, G2: 9227, G3: 7999, F1: 4296, F2: 10021, F3: 7989, F4: 10680, total: 57251 },
  { month: 'October',   G1: 5992, G2: 5785, G3: 5809, F1: 3201, F2: 7261, F3: 5870, F4: 6264, total: 40182 },
  { month: 'November',  G1: 5359, G2: 4590, G3: 5049, F1: 2408, F2: 5880, F3: 5137, F4: 5000, total: 33424 },
  { month: 'December',  G1: 2197, G2: 4248, G3: 3074, F1: 2423, F2: 3145, F3: 3214, F4: 4216, total: 22517 },
];

// Annual totals per unit
export const unitAnnualTotals = {
  G1: 87125,
  G2: 84762,
  G3: 77583,
  F1: 45730,
  F2: 86749,
  F3: 82325,
  F4: 97034,
  total: 561308,
};

// Unit metadata
export const unitInfo: Record<string, { location: string; notes: string }> = {
  G1: { location: 'Ground Floor — Main Entrance', notes: 'Highest load due to frequent door openings. Air curtain recommended.' },
  G2: { location: 'Ground Floor — Central Area', notes: 'Moderate consumption. Fluctuations noted in May/June.' },
  G3: { location: 'Ground Floor — Rear Section', notes: 'Serves same area as F1 on different floor. More efficient than F1.' },
  F1: { location: 'First Floor — Corner Section', notes: 'Lowest consumption after duct optimization. Extra duct line adds ~20,000 kWh/year vs G3.' },
  F2: { location: 'First Floor — Central Area', notes: 'Sensor issue resolved. Consumption spiked in August (12,236 kW).' },
  F3: { location: 'First Floor — Rear Section', notes: 'Consistent performer. Peak in July (10,910 kW).' },
  F4: { location: 'First Floor — Warehouse & Ladies Lounge', notes: 'Highest annual consumption (97,034 kW). Peak in August (14,098 kW).' },
};

export const unitNames = ['G1', 'G2', 'G3', 'F1', 'F2', 'F3', 'F4'] as const;
export type UnitName = typeof unitNames[number];
