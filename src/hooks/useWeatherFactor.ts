// ─────────────────────────────────────────────────────────────────────────────
// useWeatherFactor — single shared accessor for the weather-normalization factor.
// Returns BOTH the locked study figure (1.1262 / +1.3 °C, TDE Audit
// 11-MAY-2026, study period May-2025 → Apr-2026) AND the live data-derived
// figure (cooling-season May–Oct mean-temp delta vs 2024 baseline at the
// Rawdah site, ×0.097/°C sensitivity, sourced from `daily_weather_rawdah`).
//
// ROI / report components should DISPLAY the locked study figure as the
// headline (it is the figure the audited study is locked to) and surface the
// live data-derived figure as secondary context so reconciliation is
// transparent.
// ─────────────────────────────────────────────────────────────────────────────
import { ClimateConstants } from "@/data/lockedPerformanceModel";
import {
  useWeatherNormalization,
  LOCKED_STUDY_FACTOR,
  LOCKED_STUDY_DELTA_C,
  TEMP_SENSITIVITY,
} from "@/hooks/useWeatherNormalization";

export interface WeatherFactorReading {
  /** Locked TDE-audited study figure (headline). */
  locked: { factor: number; deltaC: number; label: string };
  /** Live data-derived figure from daily_weather_rawdah (cooling-season basis). */
  live: {
    year: number;
    factor: number | null;
    deltaC: number | null;
    days: number;
    inProgress: boolean;
    throughDate?: string;
    label: string;
  } | null;
  /** 2025 full-season data-derived figure (reconciles to locked 1.1262). */
  live2025: { factor: number | null; deltaC: number | null; days: number } | null;
  sensitivity: number;
  loading: boolean;
}

export function useWeatherFactor(): WeatherFactorReading {
  const { coolingSeason2025, coolingSeasonCurrent, loading } = useWeatherNormalization();

  return {
    locked: {
      factor: LOCKED_STUDY_FACTOR,
      deltaC: LOCKED_STUDY_DELTA_C,
      label: `Locked study (TDE Audit 11-MAY-2026, May-2025 → Apr-2026) — ${ClimateConstants.weatherNormalizationFactor}`,
    },
    live: coolingSeasonCurrent
      ? {
          year: coolingSeasonCurrent.currentYear,
          factor: coolingSeasonCurrent.weatherFactor,
          deltaC: coolingSeasonCurrent.tempDelta,
          days: coolingSeasonCurrent.currentDays,
          inProgress: !!coolingSeasonCurrent.inProgress,
          throughDate: coolingSeasonCurrent.throughDate,
          label: coolingSeasonCurrent.label,
        }
      : null,
    live2025: coolingSeason2025
      ? {
          factor: coolingSeason2025.weatherFactor,
          deltaC: coolingSeason2025.tempDelta,
          days: coolingSeason2025.currentDays,
        }
      : null,
    sensitivity: TEMP_SENSITIVITY,
    loading,
  };
}