import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Site coordinates (Jarir Rawdah / Exit 11)
export const RAWDAH_LAT = 24.7316;
export const RAWDAH_LON = 46.7545;
export const CDD_BASE_C = 18;
export const SAR_PER_KWH = 0.368; // observed avg from daily_unit_readings (post-savings tariff)

export interface WeatherRow {
  date: string;
  max_temp_c: number | null;
  min_temp_c: number | null;
  mean_temp_c: number | null;
  cdd: number | null;
}

export interface ReadingRow {
  reading_date: string;
  fleet_total: number | null;
  fleet_sar: number | null;
}

export interface ForecastDay {
  date: string;
  tMax: number;
  tMin: number;
  tMean: number;
  solar: number;
  cdd: number;
  projectedKwh: number;
  projectedSar: number;
}

export interface CoolingIntel {
  loading: boolean;
  error: string | null;
  weather: WeatherRow[];                 // all daily_weather_rawdah, asc
  readings: ReadingRow[];                // distinct-by-date daily_unit_readings, asc
  baseline2024: {                         // May–Oct 2024 distribution stats
    avgMax: number; avgMean: number; p50Max: number; p90Max: number; n: number;
  } | null;
  kwhPerCdd: number;                      // historical site ratio
  forecast: ForecastDay[];                // 7 days from Open-Meteo
  fetchedAt: string;
}

function pct(sorted: number[], p: number): number {
  if (!sorted.length) return NaN;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function useCoolingIntel(): CoolingIntel {
  const [state, setState] = useState<CoolingIntel>({
    loading: true, error: null,
    weather: [], readings: [], baseline2024: null,
    kwhPerCdd: 0, forecast: [], fetchedAt: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [wRes, rRes, fRes] = await Promise.all([
          supabase.from("daily_weather_rawdah")
            .select("date,max_temp_c,min_temp_c,mean_temp_c,cdd")
            .order("date", { ascending: true })
            .limit(2000),
          supabase.from("daily_unit_readings")
            .select("reading_date,fleet_total,fleet_sar")
            .order("reading_date", { ascending: true })
            .limit(5000),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${RAWDAH_LAT}&longitude=${RAWDAH_LON}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,shortwave_radiation_sum&timezone=Asia%2FRiyadh&forecast_days=7`)
            .then(r => r.json()).catch(() => null),
        ]);

        if (wRes.error) throw wRes.error;
        if (rRes.error) throw rRes.error;

        const weather = (wRes.data ?? []) as WeatherRow[];

        // Distinct by reading_date (rows are duplicated per unit but share fleet_total)
        const seen = new Set<string>();
        const readings: ReadingRow[] = [];
        for (const row of (rRes.data ?? []) as ReadingRow[]) {
          if (seen.has(row.reading_date)) continue;
          seen.add(row.reading_date);
          readings.push(row);
        }

        // 2024 May–Oct baseline
        const base = weather.filter(w => w.date >= "2024-05-01" && w.date <= "2024-10-31" && w.max_temp_c != null && w.mean_temp_c != null);
        const maxes = base.map(b => Number(b.max_temp_c)).sort((a, b) => a - b);
        const means = base.map(b => Number(b.mean_temp_c));
        const baseline2024 = base.length ? {
          n: base.length,
          avgMax: maxes.reduce((a, b) => a + b, 0) / maxes.length,
          avgMean: means.reduce((a, b) => a + b, 0) / means.length,
          p50Max: pct(maxes, 0.5),
          p90Max: pct(maxes, 0.9),
        } : null;

        // kWh/CDD historical ratio (site-specific, from real readings joined to weather)
        const wByDate = new Map(weather.map(w => [w.date, w]));
        const ratios: number[] = [];
        for (const r of readings) {
          const w = wByDate.get(r.reading_date);
          if (w && w.cdd && Number(w.cdd) > 0 && r.fleet_total) {
            ratios.push(Number(r.fleet_total) / Number(w.cdd));
          }
        }
        const kwhPerCdd = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;

        // 7-day forecast → CDD → projected kWh
        const forecast: ForecastDay[] = [];
        if (fRes?.daily?.time?.length) {
          const d = fRes.daily;
          for (let i = 0; i < d.time.length; i++) {
            const tMean = Number(d.temperature_2m_mean[i]);
            const cdd = Math.max(0, tMean - CDD_BASE_C);
            const projectedKwh = cdd * kwhPerCdd;
            forecast.push({
              date: d.time[i],
              tMax: Number(d.temperature_2m_max[i]),
              tMin: Number(d.temperature_2m_min[i]),
              tMean,
              solar: Number(d.shortwave_radiation_sum?.[i] ?? 0),
              cdd,
              projectedKwh,
              projectedSar: projectedKwh * SAR_PER_KWH,
            });
          }
        }

        if (cancelled) return;
        setState({
          loading: false, error: null,
          weather, readings, baseline2024, kwhPerCdd, forecast,
          fetchedAt: new Date().toISOString(),
        });
      } catch (e: any) {
        if (cancelled) return;
        setState(s => ({ ...s, loading: false, error: e?.message ?? "Failed to load cooling intel" }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

// ── Cooling Stress score for one day ─────────────────────────
// Components (each 0–100, equal weight):
//   A) Temperature percentile: where today's max sits in the 2024 May–Oct max distribution
//   B) Load efficiency: today's kWh/CDD vs historical avg kWh/CDD (clamped 50–150% → 0–100)
// Final = round((A + B) / 2)
export function stressScore(
  maxTemp: number | null | undefined,
  kwh: number | null | undefined,
  cdd: number | null | undefined,
  baseline: CoolingIntel["baseline2024"],
  kwhPerCdd: number,
): { score: number; tempPct: number; loadPct: number } | null {
  if (maxTemp == null || !baseline) return null;
  // tempPct: linear from (avgMax - 5) → 0  to  (p90Max + 2) → 100
  const lo = baseline.avgMax - 5;
  const hi = baseline.p90Max + 2;
  const tempPct = Math.max(0, Math.min(100, ((maxTemp - lo) / (hi - lo)) * 100));
  let loadPct = 50; // neutral if no kWh
  if (kwh != null && cdd != null && cdd > 0 && kwhPerCdd > 0) {
    const ratio = (Number(kwh) / Number(cdd)) / kwhPerCdd; // 1.0 = average
    loadPct = Math.max(0, Math.min(100, ((ratio - 0.5) / (1.5 - 0.5)) * 100));
  }
  const score = Math.round((tempPct + loadPct) / 2);
  return { score, tempPct, loadPct };
}

export function stressLevel(score: number) {
  if (score >= 80) return { label: "Critical", color: "hsl(var(--destructive))", text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" };
  if (score >= 60) return { label: "High",     color: "hsl(var(--warning))",     text: "text-warning",     bg: "bg-warning/10",     border: "border-warning/30" };
  if (score >= 40) return { label: "Moderate", color: "hsl(var(--chart-blue))",  text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30" };
  return            { label: "Low",      color: "hsl(var(--primary))",     text: "text-primary",     bg: "bg-primary/10",     border: "border-primary/30" };
}

// Heatwave detection: trailing consecutive days with max_temp >= threshold (p90 of 2024 May–Oct)
export function detectHeatwave(weather: WeatherRow[], threshold: number) {
  const desc = [...weather].reverse(); // newest first
  let streak = 0;
  const streakDays: WeatherRow[] = [];
  for (const w of desc) {
    if (w.max_temp_c != null && Number(w.max_temp_c) >= threshold) {
      streak++;
      streakDays.push(w);
    } else break;
  }
  // Also surface any 3+ run in the last 30 days for context
  const last30 = weather.slice(-30);
  const events: { start: string; end: string; days: number; peakMax: number }[] = [];
  let run: WeatherRow[] = [];
  const flush = () => {
    if (run.length >= 3) {
      events.push({
        start: run[0].date,
        end: run[run.length - 1].date,
        days: run.length,
        peakMax: Math.max(...run.map(r => Number(r.max_temp_c) || 0)),
      });
    }
    run = [];
  };
  for (const w of last30) {
    if (w.max_temp_c != null && Number(w.max_temp_c) >= threshold) run.push(w);
    else flush();
  }
  flush();
  return { currentStreak: streak, streakDays, recentEvents: events, isActive: streak >= 3 };
}