// Overall Financial Impact Data — from Excel Summary Analysis tab

export const overallFinancialImpact = {
  totalCostSavings2025: 6649, // SAR — actual YoY bill reduction (220,028 − 213,379 = 6,649)
  trueAdjustedSavings2025: 33286, // SAR — weather-normalised true savings (factor 1.126, bill-verified)
  trueAdjustedSavingsKwh: 102000, // kWh — true adjusted kWh saved (7 SCC panels, weather-normalised)
  trueAdjustedSavingsPct: 17.3, // % of 2024 baseline (574,713 kWh) — per tdeksa.com
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
  headline: 'Rawdah achieved 33,286 SAR in true energy savings in 2025 (weather-normalized, factor 1.126)',
  apparentHeadline: 'Direct bill reduction: 6,649 SAR (220,028 → 213,379 SAR) — understates true value',
  details: [
    'True adjusted savings: 33,286 SAR — bill-verified + weather-normalized at 1.126',
    'True adjusted kWh saved: 102,000 kWh (17.3% of 2024 baseline) — from the 7 SCC-controlled panels only',
    'In a ~12.6% hotter year, electricity cost decreased. All values derived from actual SCECO invoices (VAT included)',
    'Additional savings potential through early-season optimization',
  ],
};

export const energyCostComparison = {
  year2023: { totalBill: 203246, label: '2023 Total Bill' },
  year2024: { totalBill: 220028, label: '2024 Total Bill', changePercent: 8.25, changeSAR: 16782, direction: 'increase' as const },
  year2025: { totalBill: 213379, label: '2025 Total Bill', changePercent: -3.02, changeSAR: -6649, direction: 'decrease' as const },
  expected2025WithoutSCC: 246665, // SAR — 220,028 × 1.126 (weather-normalised)
  trueSavings: 33286, // SAR — 246,665 − 213,379
  trueAdjustedKwh: 102000, // kWh saved (weather-normalised at 1.126, 7 SCC panels)
  anomalyNote: 'During 2025, two months (March and April) experienced operational issues that temporarily inflated consumption. Weather-normalised avoided cost: 33,286 SAR. Efficiency improvement: 17.3% of 2024 baseline.',
};
