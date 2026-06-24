import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DailyWeatherRow {
  date: string;
  max_temp_c: number | null;
  min_temp_c: number | null;
  mean_temp_c: number | null;
  cdd: number | null;
  source: string | null;
}

// Locked sensitivity: 9.7% per °C above the 2024 baseline
export const TEMP_SENSITIVITY = 0.097;

// Official normalization basis: cooling season = May–October (months 5–10)
export const COOLING_MONTHS = [5, 6, 7, 8, 9, 10];
export const BASELINE_YEAR = 2024;

// Locked study reference (TDE Audit 11-MAY-2026)
export const LOCKED_STUDY_FACTOR = 1.1262;
export const LOCKED_STUDY_DELTA_C = 1.3;

function avgMeanTemp(rows: DailyWeatherRow[]): number | null {
  const vals = rows.map(r => r.mean_temp_c).filter((v): v is number => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function sumCdd(rows: DailyWeatherRow[]): number {
  return rows.reduce((s, r) => s + (r.cdd ?? 0), 0);
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export interface WeatherFactorPeriod {
  label: string;
  currentYear: number;
  baselineYear: number;
  currentDays: number;
  baselineDays: number;
  currentAvg: number | null;
  baselineAvg: number | null;
  tempDelta: number | null; // °C
  weatherFactor: number | null; // 1 + delta*0.097
  currentCdd: number;
  baselineCdd: number;
  basis?: "cooling-season" | "full-year" | "mtd" | "ytd" | "today";
  inProgress?: boolean;
  throughDate?: string;
}

export interface UseWeatherNormalizationResult {
  loading: boolean;
  error: string | null;
  rows: DailyWeatherRow[];
  today: DailyWeatherRow | null;
  mtd: WeatherFactorPeriod | null;
  ytd: WeatherFactorPeriod | null;
  annual2025: WeatherFactorPeriod | null;
  /** OFFICIAL: full May–Oct 2025 vs full May–Oct 2024. Reproduces locked ~1.12 figure. */
  coolingSeason2025: WeatherFactorPeriod | null;
  /** OFFICIAL (in progress): cooling-season days elapsed so far in current year vs same elapsed days in 2024. */
  coolingSeasonCurrent: WeatherFactorPeriod | null;
  /** Source tag: which underlying series these factors came from. */
  series: "rawdah" | "airport";
  /** Frozen factors per year, keyed by year. */
  lockedFactors: Record<number, { factor: number; delta_c: number; finalized_at: string; source: string }>;
  /** True once Oct 31 of the current year has passed AND a locked row exists for the current year. */
  currentYearFinalized: boolean;
  refresh: () => Promise<void>;
}

function buildPeriod(
  label: string,
  currentRows: DailyWeatherRow[],
  baselineRows: DailyWeatherRow[],
  currentYear: number,
  baselineYear: number,
  extras: Partial<WeatherFactorPeriod> = {},
): WeatherFactorPeriod {
  const cAvg = avgMeanTemp(currentRows);
  const bAvg = avgMeanTemp(baselineRows);
  const delta = cAvg != null && bAvg != null ? cAvg - bAvg : null;
  return {
    label,
    currentYear,
    baselineYear,
    currentDays: currentRows.length,
    baselineDays: baselineRows.length,
    currentAvg: cAvg,
    baselineAvg: bAvg,
    tempDelta: delta,
    weatherFactor: delta != null ? 1 + delta * TEMP_SENSITIVITY : null,
    currentCdd: sumCdd(currentRows),
    baselineCdd: sumCdd(baselineRows),
    ...extras,
  };
}

function inMonths(date: string, months: number[]) {
  const m = Number(date.slice(5, 7));
  return months.includes(m);
}

export function useWeatherNormalization(): UseWeatherNormalizationResult {
  const [rows, setRows] = useState<DailyWeatherRow[]>([]);
  const [lockedFactors, setLockedFactors] = useState<Record<number, { factor: number; delta_c: number; finalized_at: string; source: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    // OFFICIAL series of record: Rawdah site coordinates (24.7316, 46.7545)
    const [w, lf] = await Promise.all([
      supabase
        .from("daily_weather_rawdah" as any)
        .select("date,max_temp_c,min_temp_c,mean_temp_c,cdd,source")
        .order("date", { ascending: true }),
      supabase
        .from("locked_factors" as any)
        .select("year,basis,delta_c,factor,finalized_at,source")
        .eq("basis", "cooling_season_may_oct"),
    ]);
    if (w.error) {
      setError(w.error.message);
      setLoading(false);
      return;
    }
    setRows((w.data as any) || []);
    const map: Record<number, any> = {};
    ((lf.data as any[]) || []).forEach((r: any) => {
      map[r.year] = { factor: Number(r.factor), delta_c: Number(r.delta_c), finalized_at: r.finalized_at, source: r.source };
    });
    setLockedFactors(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const computed = useMemo(() => {
    if (!rows.length) {
      return { today: null, mtd: null, ytd: null, annual2025: null, coolingSeason2025: null, coolingSeasonCurrent: null };
    }
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const baselineYear = BASELINE_YEAR;

    const todayStr = ymd(now);
    const todayRow = rows.find(r => r.date === todayStr)
      ?? rows[rows.length - 1] // fallback: latest available
      ?? null;

    // MTD this year vs same MTD window in 2024
    const m = now.getUTCMonth(); // 0-based
    const day = now.getUTCDate();
    const monthStart = new Date(Date.UTC(currentYear, m, 1));
    const baseMtdStart = new Date(Date.UTC(baselineYear, m, 1));
    const baseMtdEnd = new Date(Date.UTC(baselineYear, m, day));
    const mtdCurrent = rows.filter(r => r.date >= ymd(monthStart) && r.date <= todayStr);
    const mtdBase = rows.filter(r => r.date >= ymd(baseMtdStart) && r.date <= ymd(baseMtdEnd));
    const mtd = buildPeriod("MTD", mtdCurrent, mtdBase, currentYear, baselineYear);

    // YTD current year vs same YTD window in 2024
    const ytdCurrent = rows.filter(r => r.date >= `${currentYear}-01-01` && r.date <= todayStr);
    const lastDate = ytdCurrent[ytdCurrent.length - 1]?.date || todayStr;
    const lastMD = lastDate.slice(5); // MM-DD
    const ytdBase = rows.filter(r => r.date >= `${baselineYear}-01-01` && r.date <= `${baselineYear}-${lastMD}`);
    const ytd = buildPeriod(`YTD ${currentYear}`, ytdCurrent, ytdBase, currentYear, baselineYear);

    // Full-year 2025 vs 2024 (sanity check)
    const c2025 = rows.filter(r => r.date >= "2025-01-01" && r.date <= "2025-12-31");
    const b2024 = rows.filter(r => r.date >= "2024-01-01" && r.date <= "2024-12-31");
    const annual2025 = buildPeriod("Annual 2025 vs 2024", c2025, b2024, 2025, 2024);

    // OFFICIAL — full cooling season May–Oct 2025 vs 2024
    const cs2025c = rows.filter(r => r.date.startsWith("2025-") && inMonths(r.date, COOLING_MONTHS));
    const cs2025b = rows.filter(r => r.date.startsWith("2024-") && inMonths(r.date, COOLING_MONTHS));
    const coolingSeason2025 = buildPeriod(
      "Cooling 2025 (May–Oct)",
      cs2025c, cs2025b, 2025, 2024,
      { basis: "cooling-season" },
    );

    // OFFICIAL (in progress) — current-year cooling season days elapsed
    let coolingSeasonCurrent: WeatherFactorPeriod | null = null;
    if (currentYear >= 2025) {
      const csCurRows = rows.filter(r =>
        r.date.startsWith(`${currentYear}-`) &&
        inMonths(r.date, COOLING_MONTHS) &&
        r.date <= todayStr,
      );
      const lastCsDate = csCurRows[csCurRows.length - 1]?.date;
      let csBaseRows: DailyWeatherRow[] = [];
      if (lastCsDate) {
        const md = lastCsDate.slice(5);
        csBaseRows = rows.filter(r =>
          r.date.startsWith(`${baselineYear}-`) &&
          inMonths(r.date, COOLING_MONTHS) &&
          r.date.slice(5) <= md,
        );
      }
      const incomplete = !(lastCsDate && lastCsDate.endsWith("-10-31"));
      coolingSeasonCurrent = buildPeriod(
        `Cooling ${currentYear} (May–Oct, in progress)`,
        csCurRows, csBaseRows, currentYear, baselineYear,
        { basis: "cooling-season", inProgress: incomplete, throughDate: lastCsDate ?? undefined },
      );
    }

    return { today: todayRow, mtd, ytd, annual2025, coolingSeason2025, coolingSeasonCurrent };
  }, [rows]);

  const currentYearFinalized = useMemo(() => {
    const y = new Date().getUTCFullYear();
    const pastOct31 = new Date() > new Date(Date.UTC(y, 9, 31, 23, 59, 59));
    return pastOct31 && !!lockedFactors[y];
  }, [lockedFactors]);

  return {
    loading,
    error,
    rows,
    ...computed,
    series: "rawdah",
    lockedFactors,
    currentYearFinalized,
    refresh: load,
  };
}