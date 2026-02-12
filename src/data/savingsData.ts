// Jarir Showroom Power Savings Data - Extracted from consumption analysis

export interface ShowroomData {
  name: string;
  units: string;
  yearlySavings25: number; // SAR at 25% savings
  yearlySavings30: number; // SAR at 30% savings
  monthlyConsumption: number[]; // KWh per month (Jan-Dec)
  monthlySavings25: number; // Monthly average SAR
  totalConsumption: number; // Total yearly KWh
}

export const showroomsData: ShowroomData[] = [
  {
    name: "Rawdah Showroom",
    units: "7 Units x 25 Tons",
    yearlySavings25: 50812,
    yearlySavings30: 60974,
    monthlyConsumption: [23744, 27807, 33327, 47127, 72335, 91655, 100487, 100487, 80983, 47863, 26887, 24786],
    monthlySavings25: 4234,
    totalConsumption: 677488,
  },
  {
    name: "South Ring Road Showroom",
    units: "10 Units x 25 Tons",
    yearlySavings25: 72810,
    yearlySavings30: 87372,
    monthlyConsumption: [46423, 52907, 58733, 73150, 100117, 112687, 118927, 121167, 104983, 81137, 53987, 46583],
    monthlySavings25: 6068,
    totalConsumption: 970801,
  },
  {
    name: "King Abdulaziz Showroom",
    units: "8 Units x 25 Tons",
    yearlySavings25: 51364,
    yearlySavings30: 61636,
    monthlyConsumption: [25216, 26887, 38111, 48783, 68287, 81351, 87607, 91471, 81351, 63687, 41423, 30674],
    monthlySavings25: 4280,
    totalConsumption: 684848,
  },
  {
    name: "Rubeen Plaza Showroom",
    units: "7 Units x 25 Tons",
    yearlySavings25: 48010,
    yearlySavings30: 57612,
    monthlyConsumption: [18040, 30383, 34983, 55407, 75463, 82455, 88159, 77855, 63319, 44183, 36087, 33802],
    monthlySavings25: 4001,
    totalConsumption: 640136,
  },
  {
    name: "Al Ahsa Showroom",
    units: "10 Units x 20 Tons",
    yearlySavings25: 51636,
    yearlySavings30: 61963,
    monthlyConsumption: [28317, 45107, 46889, 73972, 79779, 75352, 88002, 76502, 60574, 45509, 33971, 34508],
    monthlySavings25: 4303,
    totalConsumption: 688482,
  },
  {
    name: "King Abdullah Showroom",
    units: "8 Units x 25 Tons",
    yearlySavings25: 43705,
    yearlySavings30: 52446,
    monthlyConsumption: [20616, 25967, 37559, 50991, 66079, 75647, 76015, 69943, 55591, 40319, 32223, 31778],
    monthlySavings25: 3642,
    totalConsumption: 582728,
  },
  {
    name: "Khurais 1 Showroom",
    units: "10 Units x 25 Tons",
    yearlySavings25: 79698,
    yearlySavings30: 95637,
    monthlyConsumption: [44398, 59715, 67433, 101431, 124050, 136851, 141631, 128394, 99480, 66028, 45811, 47410],
    monthlySavings25: 6641,
    totalConsumption: 1062632,
  },
  {
    name: "Hail Showroom",
    units: "7 Units x 25 Tons",
    yearlySavings25: 41465,
    yearlySavings30: 49758,
    monthlyConsumption: [18571, 30071, 36474, 41898, 55222, 65117, 70481, 75321, 55697, 42747, 32564, 28710],
    monthlySavings25: 3455,
    totalConsumption: 552873,
  },
  {
    name: "Khurais 2 Showroom",
    units: "8 Units x 25 Tons",
    yearlySavings25: 42782,
    yearlySavings30: 51338,
    monthlyConsumption: [22103, 13992, 23943, 39031, 53015, 119646, 75279, 73623, 63687, 42527, 26151, 17426],
    monthlySavings25: 3565,
    totalConsumption: 570423,
  },
  {
    name: "Hamrah Showroom",
    units: "7 Units x 25 Tons",
    yearlySavings25: 45674,
    yearlySavings30: 54809,
    monthlyConsumption: [41937, 40250, 40940, 47150, 56120, 61985, 66643, 64229, 59743, 49910, 41803, 38276],
    monthlySavings25: 3806,
    totalConsumption: 608986,
  },
  {
    name: "Hayat Showroom",
    units: "2 Units x 30 Tons + 4 Units x 25 Tons",
    yearlySavings25: 64095,
    yearlySavings30: 76914,
    monthlyConsumption: [37145, 67160, 66470, 85100, 104420, 105455, 112355, 99590, 81650, 56465, 38793, 0],
    monthlySavings25: 5827,
    totalConsumption: 854603,
  },
  {
    name: "Al Qassim Showroom",
    units: "8 Units x 25 Tons",
    yearlySavings25: 49411,
    yearlySavings30: 59293,
    monthlyConsumption: [39980, 40695, 41411, 54218, 64417, 72494, 74744, 75638, 65950, 49054, 40900, 39315],
    monthlySavings25: 4118,
    totalConsumption: 658816,
  },
  {
    name: "Unaizah Showroom",
    units: "4 Units x 25 Tons + 2 Units x 20 Tons",
    yearlySavings25: 74506,
    yearlySavings30: 89407,
    monthlyConsumption: [48493, 57456, 62540, 80600, 95280, 102525, 98716, 186346, 85053, 61155, 54282, 60962],
    monthlySavings25: 6209,
    totalConsumption: 993408,
  },
  {
    name: "Othman Showroom",
    units: "8 Units x 25 Tons",
    yearlySavings25: 47603,
    yearlySavings30: 57123,
    monthlyConsumption: [23702, 32717, 36077, 44694, 58916, 68681, 87488, 93368, 71755, 52289, 33749, 31269],
    monthlySavings25: 3967,
    totalConsumption: 634705,
  },
  {
    name: "Rabwa Showroom",
    units: "12 Units x 25 Tons",
    yearlySavings25: 35885,
    yearlySavings30: 43062,
    monthlyConsumption: [22493, 27483, 33881, 49776, 50551, 60863, 65379, 64325, 52505, 29624, 21584, 0],
    monthlySavings25: 3262,
    totalConsumption: 478464,
  },
  {
    name: "Salbouk Showroom",
    units: "8 Units x 25 Tons",
    yearlySavings25: 54665,
    yearlySavings30: 65599,
    monthlyConsumption: [23668, 32010, 35069, 48892, 77069, 90983, 97919, 101742, 85854, 64480, 39661, 31524],
    monthlySavings25: 4555,
    totalConsumption: 728871,
  },
  {
    name: "Panorama Showroom",
    units: "9 Units x 20 Tons",
    yearlySavings25: 53271,
    yearlySavings30: 63926,
    monthlyConsumption: [30138, 39249, 44208, 62201, 77426, 94049, 96569, 88816, 69219, 45951, 31948, 30511],
    monthlySavings25: 4439,
    totalConsumption: 710285,
  },
  {
    name: "Dawadmi Showroom",
    units: "8 Units x 25 Tons",
    yearlySavings25: 45750,
    yearlySavings30: 54900,
    monthlyConsumption: [34139, 43389, 43047, 55333, 64197, 68940, 69541, 61575, 49789, 41557, 36779, 41715],
    monthlySavings25: 3813,
    totalConsumption: 610001,
  },
  {
    name: "Badiah Showroom",
    units: "6 Units x 25 Tons",
    yearlySavings25: 36597,
    yearlySavings30: 43916,
    monthlyConsumption: [27545, 30053, 32037, 40321, 49137, 55364, 61739, 58085, 45562, 34338, 27750, 26028],
    monthlySavings25: 3050,
    totalConsumption: 487959,
  },
  {
    name: "Al Rassi Showroom",
    units: "8 Units x 25 Tons",
    yearlySavings25: 51908,
    yearlySavings30: 62290,
    monthlyConsumption: [39299, 40374, 43464, 56603, 66051, 75352, 76765, 73444, 61344, 45778, 37166, 76472],
    monthlySavings25: 4326,
    totalConsumption: 692112,
  },
];

// Calculated totals
export const totalYearlySavings25 = showroomsData.reduce((sum, s) => sum + s.yearlySavings25, 0);
export const totalYearlySavings30 = showroomsData.reduce((sum, s) => sum + s.yearlySavings30, 0);
export const totalConsumption = showroomsData.reduce((sum, s) => sum + s.totalConsumption, 0);
export const totalUnits = 164; // Sum of all AC units across showrooms

// Monthly names
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Aggregated monthly consumption across all showrooms
export const aggregatedMonthlyConsumption = months.map((_, idx) =>
  showroomsData.reduce((sum, s) => sum + s.monthlyConsumption[idx], 0)
);

// ROI Calculation data
export const systemCost = totalUnits * 25000; // 164 units × 25,000 SAR = 4,100,000 SAR
export const electricityRate = 0.30; // SAR per KWh
export const acReplacementCostPerUnit = 55000; // SAR per AC unit replacement (average)
export const normalLifespan = 10; // Years
export const extendedLifespan = 15; // Years with power saving system

// Calculate savings
export const yearlySavingsConservative = totalYearlySavings25;
export const yearlySavingsOptimistic = totalYearlySavings30;

// AC Replacement Savings Calculation
export const acReplacementSavings = totalUnits * acReplacementCostPerUnit * ((extendedLifespan - normalLifespan) / extendedLifespan); // 1 fewer replacement cycle over 30 years

// Simple payback period in months
export const paybackPeriodMonths25 = Math.ceil((systemCost / yearlySavingsConservative) * 12);
export const paybackPeriodMonths30 = Math.ceil((systemCost / yearlySavingsOptimistic) * 12);

// 10-year total savings
export const tenYearSavings25 = yearlySavingsConservative * 10;
export const tenYearSavings30 = yearlySavingsOptimistic * 10;

// Total ROI percentage over 10 years
export const roi10Years25 = ((tenYearSavings25 - systemCost) / systemCost) * 100;
export const roi10Years30 = ((tenYearSavings30 - systemCost) / systemCost) * 100;
