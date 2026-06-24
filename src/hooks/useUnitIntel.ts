import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const UNIT_NAMES = ["FF1", "FF2", "FF3", "FF4", "G1", "G2", "G3"] as const;
export type UnitName = (typeof UNIT_NAMES)[number];

export interface DailyReading {
  date: string;
  unit: UnitName;
  kwh: number;
  cdd: number | null;
  fleetTotal: number;
}

export interface UnitStat {
  unit: UnitName;
  n: number;
  meanKwh: number;
  sdKwh: number;
  baselineKpc: number;   // kWh / CDD over first ~33% of days
  recentKpc: number;     // kWh / CDD over last ~33% of days
  overallKpc: number;
  trendSlopePerDay: number; // change in daily kwh/cdd per day (lin reg)
  degradationPct: number;   // (recent - baseline) / baseline * 100
  flag: "improving" | "stable" | "degrading";
  lastKwh: number | null;
  lastZ: number | null;
  status: "normal" | "watch" | "alert";
}

export interface Anomaly {
  date: string;
  unit: UnitName;
  kwh: number;
  expected: number;       // unit mean (or CDD-adjusted)
  deviation: number;      // kwh - expected
  sigma: number;          // |z|
  severity: "Critical" | "High" | "Medium";
  reason: string;
}

export interface WasteCase {
  unit: UnitName;
  monthLabel: string;       // e.g. "2026-05"
  expectedKwh: number;
  actualKwh: number;
  excessKwh: number;
  excessSar: number;
  excessPct: number;
  days: number;
}

export interface UnitIntel {
  loading: boolean;
  error: string | null;
  readings: DailyReading[];
  byUnit: Record<UnitName, DailyReading[]>;
  stats: UnitStat[];
  anomalies: Anomaly[];
  wasteCases: WasteCase[];
  tariffSarPerKwh: number;
  dateRange: { min: string; max: string } | null;
}

function linRegSlope(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  return den === 0 ? 0 : num / den;
}

export function useUnitIntel(): UnitIntel {
  const [state, setState] = useState<UnitIntel>({
    loading: true, error: null,
    readings: [], byUnit: {} as any, stats: [], anomalies: [], wasteCases: [],
    tariffSarPerKwh: 0.346, dateRange: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rRes, wRes, bRes] = await Promise.all([
          supabase.from("daily_unit_readings")
            .select("reading_date,unit,kwh,fleet_total")
            .order("reading_date", { ascending: true })
            .limit(5000),
          supabase.from("daily_weather_rawdah")
            .select("date,cdd")
            .order("date", { ascending: true })
            .limit(2000),
          supabase.from("sceco_monthly_bills")
            .select("year,month,kwh,bill_sar")
            .limit(200),
        ]);
        if (rRes.error) throw rRes.error;
        if (wRes.error) throw wRes.error;
        if (bRes.error) throw bRes.error;

        const cddMap = new Map<string, number>();
        for (const w of (wRes.data ?? []) as any[]) cddMap.set(w.date, Number(w.cdd) || 0);

        // Tariff from real bills
        const bills = (bRes.data ?? []) as any[];
        const tariffs = bills.filter(b => Number(b.kwh) > 0).map(b => Number(b.bill_sar) / Number(b.kwh));
        const tariffSarPerKwh = tariffs.length ? tariffs.reduce((a, b) => a + b, 0) / tariffs.length : 0.346;

        const readings: DailyReading[] = ((rRes.data ?? []) as any[]).map(r => ({
          date: r.reading_date,
          unit: r.unit as UnitName,
          kwh: Number(r.kwh) || 0,
          cdd: cddMap.has(r.reading_date) ? cddMap.get(r.reading_date)! : null,
          fleetTotal: Number(r.fleet_total) || 0,
        }));

        const byUnit = {} as Record<UnitName, DailyReading[]>;
        for (const u of UNIT_NAMES) byUnit[u] = [];
        for (const r of readings) if (byUnit[r.unit]) byUnit[r.unit].push(r);
        // ensure sorted
        for (const u of UNIT_NAMES) byUnit[u].sort((a, b) => a.date.localeCompare(b.date));

        // Per-unit stats
        const stats: UnitStat[] = UNIT_NAMES.map((unit) => {
          const rows = byUnit[unit];
          const n = rows.length;
          if (n === 0) {
            return { unit, n: 0, meanKwh: 0, sdKwh: 0, baselineKpc: 0, recentKpc: 0, overallKpc: 0, trendSlopePerDay: 0, degradationPct: 0, flag: "stable" as const, lastKwh: null, lastZ: null, status: "normal" as const };
          }
          const kwhs = rows.map(r => r.kwh);
          const meanKwh = kwhs.reduce((a, b) => a + b, 0) / n;
          const variance = kwhs.reduce((a, b) => a + (b - meanKwh) ** 2, 0) / n;
          const sdKwh = Math.sqrt(variance);

          const kpcs = rows.filter(r => r.cdd && r.cdd > 0).map(r => ({ date: r.date, v: r.kwh / r.cdd! }));
          const overallKpc = kpcs.length ? kpcs.reduce((a, b) => a + b.v, 0) / kpcs.length : 0;
          const split = Math.max(1, Math.floor(kpcs.length / 3));
          const baseSlice = kpcs.slice(0, split).map(k => k.v);
          const recentSlice = kpcs.slice(-split).map(k => k.v);
          const baselineKpc = baseSlice.length ? baseSlice.reduce((a, b) => a + b, 0) / baseSlice.length : overallKpc;
          const recentKpc = recentSlice.length ? recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length : overallKpc;
          const degradationPct = baselineKpc > 0 ? ((recentKpc - baselineKpc) / baselineKpc) * 100 : 0;

          // trend slope vs day index
          const xs = kpcs.map((_, i) => i);
          const ys = kpcs.map(k => k.v);
          const trendSlopePerDay = linRegSlope(xs, ys);

          let flag: UnitStat["flag"] = "stable";
          if (degradationPct >= 5) flag = "degrading";
          else if (degradationPct <= -5) flag = "improving";

          const last = rows[rows.length - 1];
          const lastZ = sdKwh > 0 ? (last.kwh - meanKwh) / sdKwh : 0;
          let status: UnitStat["status"] = "normal";
          if (Math.abs(lastZ) >= 2.5) status = "alert";
          else if (Math.abs(lastZ) >= 1.5) status = "watch";

          return { unit, n, meanKwh, sdKwh, baselineKpc, recentKpc, overallKpc, trendSlopePerDay, degradationPct, flag, lastKwh: last.kwh, lastZ, status };
        });

        // Anomalies — per-unit z-score >= 2
        const statByUnit = new Map(stats.map(s => [s.unit, s]));
        const anomalies: Anomaly[] = [];
        for (const r of readings) {
          const s = statByUnit.get(r.unit);
          if (!s || s.sdKwh === 0) continue;
          const z = (r.kwh - s.meanKwh) / s.sdKwh;
          const abs = Math.abs(z);
          if (abs >= 2) {
            const sev: Anomaly["severity"] = abs >= 3 ? "Critical" : abs >= 2.5 ? "High" : "Medium";
            anomalies.push({
              date: r.date, unit: r.unit, kwh: r.kwh,
              expected: s.meanKwh, deviation: r.kwh - s.meanKwh,
              sigma: abs, severity: sev,
              reason: `${z > 0 ? "Above" : "Below"} unit's 41-day mean by ${abs.toFixed(2)}σ`,
            });
          }
        }
        anomalies.sort((a, b) => b.date.localeCompare(a.date) || b.sigma - a.sigma);

        // Waste cases: per-unit per-month, expected = sum(cdd * baselineKpc), actual = sum(kwh)
        const monthBuckets = new Map<string, DailyReading[]>();
        for (const r of readings) {
          const k = `${r.unit}|${r.date.slice(0, 7)}`;
          if (!monthBuckets.has(k)) monthBuckets.set(k, []);
          monthBuckets.get(k)!.push(r);
        }
        const wasteCases: WasteCase[] = [];
        for (const [key, rows] of monthBuckets) {
          const [unit, monthLabel] = key.split("|") as [UnitName, string];
          const s = statByUnit.get(unit);
          if (!s || s.baselineKpc <= 0) continue;
          const cddSum = rows.reduce((a, b) => a + (b.cdd ?? 0), 0);
          const expectedKwh = cddSum * s.baselineKpc;
          const actualKwh = rows.reduce((a, b) => a + b.kwh, 0);
          const excessKwh = actualKwh - expectedKwh;
          const excessPct = expectedKwh > 0 ? (excessKwh / expectedKwh) * 100 : 0;
          wasteCases.push({
            unit, monthLabel, expectedKwh, actualKwh, excessKwh,
            excessSar: excessKwh * tariffSarPerKwh,
            excessPct, days: rows.length,
          });
        }
        wasteCases.sort((a, b) => b.excessKwh - a.excessKwh);

        const dates = readings.map(r => r.date);
        const dateRange = dates.length ? { min: dates[0], max: dates[dates.length - 1] } : null;

        if (cancelled) return;
        setState({
          loading: false, error: null,
          readings, byUnit, stats, anomalies, wasteCases,
          tariffSarPerKwh, dateRange,
        });
      } catch (e: any) {
        if (cancelled) return;
        setState(s => ({ ...s, loading: false, error: e?.message ?? "Failed to load unit intel" }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

export function statusColor(status: UnitStat["status"]) {
  if (status === "alert") return { text: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/40", hex: "hsl(var(--destructive))", label: "ALERT" };
  if (status === "watch") return { text: "text-warning", bg: "bg-warning/15", border: "border-warning/40", hex: "hsl(var(--warning))", label: "WATCH" };
  return { text: "text-primary", bg: "bg-primary/15", border: "border-primary/40", hex: "hsl(var(--primary))", label: "NORMAL" };
}

export function flagColor(flag: UnitStat["flag"]) {
  if (flag === "degrading") return { text: "text-destructive", bg: "bg-destructive/15", hex: "hsl(var(--destructive))" };
  if (flag === "improving") return { text: "text-primary", bg: "bg-primary/15", hex: "hsl(var(--primary))" };
  return { text: "text-muted-foreground", bg: "bg-muted/40", hex: "hsl(var(--muted-foreground))" };
}