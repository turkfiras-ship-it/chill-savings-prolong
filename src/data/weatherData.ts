// ─────────────────────────────────────────────────────────────────────────────
// LOCKED STUDY REFERENCE — TDE Audit 11-MAY-2026
// ─────────────────────────────────────────────────────────────────────────────
// This file is the STUDY REFERENCE for the May-2024 → Apr-2026 measurement
// period. It now derives its summary numbers from `LockedFinancials` and
// `ClimateConstants` (the single source of truth), so any consumer that still
// imports `weatherSummary` automatically reconciles with the locked 1.1262
// / +1.3 °C / 32,702 SAR / 102,194 kWh figures.
//
// The LIVE data-derived figures (cooling-season basis, +1.20 °C / ~1.117 for
// 2025, in-progress 2026) come from `useWeatherNormalization()` which reads
// `daily_weather_rawdah`. UI surfaces should display the locked study figure
// as the headline and the live data-derived figure as secondary context.
//
// The monthly temperature table below is the locked study monthly profile
// (OERK observations from WeatherSpark) used by historical comparison charts.
// It is NOT the live engine input and should not be edited without a study
// re-issue.
// ─────────────────────────────────────────────────────────────────────────────
import { ClimateConstants, LockedFinancials, WeatherSource } from "@/data/lockedPerformanceModel";

export interface MonthlyWeather {
  month: string;
  avgTemp2024: number;
  avgTemp2025: number;
  avgTemp2026?: number; // populated as 2026 months close out (Open-Meteo archive)
  tempDiff: number; // positive = 2025 hotter
  tempDiff2026vs2025?: number; // positive = 2026 hotter than 2025
  note?: string;
}

// Riyadh average high temperatures (°C) by month
export const monthlyWeatherData: MonthlyWeather[] = [
  { month: 'January',   avgTemp2024: 20.1, avgTemp2025: 21.3, avgTemp2026: 21.3, tempDiff: 1.2, tempDiff2026vs2025: 0.0, note: 'Jan-2026 nearly identical to Jan-2025; kWh dropped 16% — efficiency gain, not weather' },
  { month: 'February',  avgTemp2024: 23.0, avgTemp2025: 23.8, avgTemp2026: 27.4, tempDiff: 0.8, tempDiff2026vs2025: 3.6, note: 'Feb-2026 ran +3.6°C hotter than Feb-2025; explains +10% kWh load' },
  { month: 'March',     avgTemp2024: 28.2, avgTemp2025: 30.1, tempDiff: 1.9, note: 'Early heat wave in 2025' },
  { month: 'April',     avgTemp2024: 33.5, avgTemp2025: 35.4, tempDiff: 1.9, note: 'Above-average heat' },
  { month: 'May',       avgTemp2024: 39.8, avgTemp2025: 41.2, tempDiff: 1.4 },
  { month: 'June',      avgTemp2024: 43.1, avgTemp2025: 44.6, tempDiff: 1.5 },
  { month: 'July',      avgTemp2024: 44.5, avgTemp2025: 45.8, tempDiff: 1.3, note: 'Peak summer — highest AC demand' },
  { month: 'August',    avgTemp2024: 44.0, avgTemp2025: 45.3, tempDiff: 1.3 },
  { month: 'September', avgTemp2024: 40.2, avgTemp2025: 41.5, tempDiff: 1.3 },
  { month: 'October',   avgTemp2024: 35.0, avgTemp2025: 36.2, tempDiff: 1.2 },
  { month: 'November',  avgTemp2024: 27.4, avgTemp2025: 28.5, tempDiff: 1.1 },
  { month: 'December',  avgTemp2024: 21.8, avgTemp2025: 22.6, tempDiff: 0.8 },
];

// Derived from the locked engine (do NOT hardcode numbers here).
// - avgTempDiff: ClimateConstants.avgTemperatureIncrease (1.3 °C, locked study)
// - coolingDegreeIncrease: ClimateConstants.coolingLoadImpactRange ("8–12%")
// - additionalCoolingCostLow/High: derived from locked baseline bill × low/high
//   bound of the cooling-load impact range.
// - actualSavings: LockedFinancials.directEnergySavingsSAR (32,702 SAR)
// - adjustedSavingsLow/High: actualSavings + additionalCost range
const COOLING_LOW_PCT = 0.08;  // low bound of ClimateConstants.coolingLoadImpactRange
const COOLING_HIGH_PCT = ClimateConstants.adoptedNormalizationPct / 100; // 0.1262 (TDE-adopted)
const _baselineBill = LockedFinancials.actualBill2024;
const _additionalLow = Math.round(_baselineBill * COOLING_LOW_PCT);
const _additionalHigh = Math.round(_baselineBill * COOLING_HIGH_PCT);
const _actual = LockedFinancials.directEnergySavingsSAR;

export const weatherSummary = Object.freeze({
  avgTempDiff: ClimateConstants.avgTemperatureIncrease, // 1.3 °C — locked study
  hottestMonth2025: 'July',
  hottestTemp2025: 45.8,
  peakMonths: ['May', 'June', 'July', 'August', 'September'],
  insight: `Despite 2025 being ${ClimateConstants.avgTemperatureIncrease}°C hotter on average than 2024 (locked study basis), the SCC system delivered ${_actual.toLocaleString()} SAR in TDE-verified direct energy savings — proving real efficiency gains under increased thermal load.`,
  coolingDegreeIncrease: ClimateConstants.coolingLoadImpactRange, // "8–12%"
  additionalCoolingCostLow: _additionalLow,
  additionalCoolingCostHigh: _additionalHigh,
  actualSavings: _actual,
  adjustedSavingsLow: _actual + _additionalLow,
  adjustedSavingsHigh: _actual + _additionalHigh,
  // Provenance
  source: WeatherSource.citation,
  weatherNormalizationFactor: ClimateConstants.weatherNormalizationFactor, // 1.1262 (locked study)
  basis: 'TDE Audit 11-MAY-2026 — cooling-season normalization, locked study reference. See useWeatherNormalization() for live data-derived figures.' as const,
});
