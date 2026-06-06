// Overall Financial Impact Data — TDE Audit 11-MAY-2026 (sheet 11MAY26)
// Period basis: rolling May→Apr (not calendar year). w/o VAT.

export const overallFinancialImpact = {
  totalCostSavings2025: -4363, // SAR — raw YoY bill movement (177,550 → 181,913, w/o VAT) — bill rose due to +10% tariff
  sameTariffSavingsSAR: 7913, // SAR — if-same-tariff savings (TDE audit)
  trueAdjustedSavings2025: 32702, // SAR/year — TDE-verified avoided cost (w/o VAT, IPMVP Option C)
  trueAdjustedSavingsKwh: 102194, // kWh — TDE-verified avoided (7 SCC panels, weather-normalised)
  trueAdjustedSavingsPct: 17.3, // % of 613,832 kWh baseline (May-24 → Apr-25)
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
  headline: 'Rawdah achieved 32,702 SAR in TDE-verified energy savings (May-25 → Apr-26, weather-normalized at 1.1262, w/o VAT)',
  apparentHeadline: 'Raw bill movement: +4,363 SAR (177,550 → 181,913 SAR w/o VAT) — masked by +10% SCECO tariff hike in May-25',
  details: [
    'TDE-verified avoided cost: 32,702 SAR/yr — IPMVP Option C, weather-normalized at factor 1.1262',
    'Verified kWh avoided: 102,194 kWh (17.3% of 613,832 kWh baseline) — from the 7 SCC-controlled panels only',
    'In a +1.3°C hotter year (12.62% more cooling demand), the SCC system absorbed the load and reduced bills vs the same-tariff counterfactual by 7,913 SAR',
    'Additional savings potential through early-season optimization',
  ],
};

export const energyCostComparison = {
  // Legacy 2023 entry kept for back-compat with older charts (TDE audit drops it).
  year2023: { totalBill: 203246, label: '2023 Total Bill (legacy, w/ VAT)' },
  year2024: { totalBill: 177550, label: 'May-24 → Apr-25 (Baseline, w/o VAT)', changePercent: 0, changeSAR: 0, direction: 'flat' as const },
  year2025: { totalBill: 181913, label: 'May-25 → Apr-26 (Performance, w/o VAT)', changePercent: 2.46, changeSAR: 4363, direction: 'increase' as const },
  expected2025WithoutSCC: 214615, // SAR — 181,913 + 32,702 (avoided)
  trueSavings: 32702, // SAR/yr — TDE-verified
  trueAdjustedKwh: 102194, // kWh saved (TDE-audited, factor 1.1262)
  anomalyNote: 'Bills rose +4,363 SAR YoY due to the +10% SCECO tariff hike (May-25). On a like-for-like tariff basis, savings were 7,913 SAR. IPMVP-normalized avoided cost: 32,702 SAR. Efficiency improvement: 17.3% of 613,832 kWh baseline.',
};
