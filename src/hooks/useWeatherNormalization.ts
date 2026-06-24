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
}

export interface UseWeatherNormalizationResult {
  loading: boolean;
  error: string | null;
  rows: DailyWeatherRow[];
  today: DailyWeatherRow | null;
  mtd: WeatherFactorPeriod | null;
  ytd: WeatherFactorPeriod | null;
  annual2025: WeatherFactorPeriod | null;
  refresh: () => Promise<void>;
}

function buildPeriod(
  label: string,
  currentRows: DailyWeatherRow[],
  baselineRows: DailyWeatherRow[],
  currentYear: number,
  baselineYear: number,
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
  };
}

export function useWeatherNormalization(): UseWeatherNormalizationResult {
  const [rows, setRows] = useState<DailyWeatherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("daily_weather" as any)
      .select("date,max_temp_c,min_temp_c,mean_temp_c,cdd,source")
      .order("date", { ascending: true });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const computed = useMemo(() => {
    if (!rows.length) {
      return { today: null, mtd: null, ytd: null, annual2025: null };
    }
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const baselineYear = 2024;

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

    return { today: todayRow, mtd, ytd, annual2025 };
  }, [rows]);

  return {
    loading,
    error,
    rows,
    ...computed,
    refresh: load,
  };
}