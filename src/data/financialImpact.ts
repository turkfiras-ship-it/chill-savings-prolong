// Overall Financial Impact Data — from Excel Summary Analysis tab

export const overallFinancialImpact = {
  totalCostSavings2025: 6649, // SAR — actual YoY bill reduction (220,028 − 213,379 = 6,649)
  trueAdjustedSavings2025: 33052, // SAR — weather-normalised true savings (246,431 expected − 213,379 actual)
  trueAdjustedSavingsKwh: 93819, // kWh — true adjusted kWh saved (7 SCC panels, weather-corrected)
  trueAdjustedSavingsPct: 16.3, // % of 574,713 kWh 2024 baseline
  netAnnualPerformance: 'positive',
  savingsConcentration: 'mid-to-late year',
  savingsConcentrationReason: 'when tariffs and HVAC load hurt the most',
  excludingAnomalies: {
    monthsExcluded: ['March', 'April'],
    overallDecrease: 9, // percent
    reason: 'operational issues temporarily inflated consumption',
  },
};

export interface MajorSavingMonth {
  month: string;
  costReduction: number; // percent
  savingsSAR: number;
}

export const majorSavingMonths: MajorSavingMonth[] = [
  { month: 'February', costReduction: 28.1, savingsSAR: 3387 },
  { month: 'August', costReduction: 9.0, savingsSAR: 2745 },
  { month: 'June', costReduction: 7.7, savingsSAR: 2125 },
  { month: 'September', costReduction: 7.2, savingsSAR: 1696 },
  { month: 'July', costReduction: 5.3, savingsSAR: 1564 },
];

export const seasonalCostBehavior = {
  peakCostPeriod: 'May–August',
  peak2025VsPeak2024: 'consistently lower',
  indicators: [
    'Improved HVAC staging',
    'Better response to demand charges',
    'Smarter energy use during high-tariff periods',
  ],
  conclusion: 'This is strong evidence of cost-aware energy management.',
};

export const managementConclusion = {
  headline: 'Rawdah achieved 33,052 SAR in true adjusted savings in 2025 (expected 246,431 SAR → actual 213,379 SAR)',
  apparentHeadline: 'Direct bill reduction: 6,649 SAR (220,028 → 213,379 SAR) — understates true value',
  details: [
    'True adjusted savings: 33,052 SAR — accounting for 2025 being 1.3°C hotter than 2024 (12% extra cooling demand)',
    'True adjusted kWh saved: 93,819 kWh (16.3% of 2024 baseline) — from the 7 SCC-controlled panels only',
    'While Q1 costs increased year-on-year due to system updates and operational differences, sustained improvements from June onward demonstrate effective energy cost control',
    'Additional savings potential through early-season optimization',
  ],
};

export const energyCostComparison = {
  year2023: { totalBill: 203246, label: '2023 Total Bill' },
  year2024: { totalBill: 220028, label: '2024 Total Bill', changePercent: 8.25, changeSAR: 16782, direction: 'increase' as const },
  year2025: { totalBill: 213379, label: '2025 Total Bill', changePercent: -3.02, changeSAR: -6649, direction: 'decrease' as const },
  expected2025WithoutSCC: 246431, // SAR — weather-normalised expected bill without SCC
  trueSavings: 33052, // SAR — 246,431 − 213,379
  trueAdjustedKwh: 93819, // kWh saved (weather-corrected, 7 SCC panels)
  anomalyNote: 'During 2025, two months (March and April) experienced operational issues that temporarily inflated consumption. When excluding these months, the data indicates a 9% overall decrease. Combined with the 8.25% upward cost trend from 2024, this represents a theoretical 17.25% improvement in energy cost efficiency — reflecting improved efficiency and better consumption management.',
};
