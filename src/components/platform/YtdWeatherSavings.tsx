import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Wind, CloudSun, TrendingUp, TrendingDown, Calendar, Target } from "lucide-react";
import { useGlobalWeather } from "@/context/WeatherContext";
import { getWeatherInfo } from "@/lib/weatherService";
import { LockedFinancials, ClimateConstants } from "@/data/lockedPerformanceModel";

// Locked coefficient: 1.3°C → 12.6% load impact ⇒ 9.69%/°C
const LOAD_PCT_PER_C = ClimateConstants.adoptedNormalizationPct / ClimateConstants.avgTemperatureIncrease;
const BASELINE_FACTOR = ClimateConstants.weatherNormalizationFactor; // 1.126

const LAT = 24.7136;
const LNG = 46.6753;

type YtdState = {
  ytd2025AvgC: number;
  ytd2026AvgC: number;
  deltaC: number;
  loadImpactPct: number;
  newFactor: number;
  ytdDays: number;
  endDate: string;
};

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(d: Date) { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; }

async function fetchDailyMean(start: string, end: string): Promise<number[]> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LNG}&start_date=${start}&end_date=${end}&daily=temperature_2m_mean&timezone=Asia%2FRiyadh`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Archive ${res.status}`);
  const j = await res.json();
  return (j?.daily?.temperature_2m_mean ?? []).filter((v: number | null) => typeof v === "number") as number[];
}

export function YtdWeatherSavings() {
  const { weather } = useGlobalWeather();
  const [ytd, setYtd] = useState<YtdState | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        // Archive lags ~2 days; use today-3 to be safe
        const today = new Date();
        const end = new Date(today);
        end.setUTCDate(end.getUTCDate() - 3);
        const endStr = fmt(end);

        const cacheKey = `ytd-weather-${endStr}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          if (!cancel) setYtd(JSON.parse(cached));
          return;
        }

        // Matching window in 2025: Jan 1 → same MM-DD
        const mmdd = endStr.slice(5);
        const [arr2026, arr2025] = await Promise.all([
          fetchDailyMean("2026-01-01", endStr),
          fetchDailyMean("2025-01-01", `2025-${mmdd}`),
        ]);
        if (!arr2026.length || !arr2025.length) throw new Error("No archive data");

        const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
        const ytd2025AvgC = mean(arr2025);
        const ytd2026AvgC = mean(arr2026);
        const deltaC = ytd2026AvgC - ytd2025AvgC;
        const loadImpactPct = deltaC * LOAD_PCT_PER_C;
        const newFactor = 1 + loadImpactPct / 100;

        const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
        const ytdDays = Math.floor((today.getTime() - startOfYear.getTime()) / 86400000) + 1;

        const state: YtdState = {
          ytd2025AvgC: +ytd2025AvgC.toFixed(2),
          ytd2026AvgC: +ytd2026AvgC.toFixed(2),
          deltaC: +deltaC.toFixed(2),
          loadImpactPct: +loadImpactPct.toFixed(2),
          newFactor: +newFactor.toFixed(3),
          ytdDays,
          endDate: endStr,
        };
        localStorage.setItem(cacheKey, JSON.stringify(state));
        if (!cancel) setYtd(state);
      } catch (e: any) {
        if (!cancel) setErr(e?.message ?? "Failed");
      }
    })();
    return () => { cancel = true; };
  }, []);

  const current = weather?.current;
  const baseSAR = LockedFinancials.directEnergySavingsSAR;
  const factorRatio = ytd ? ytd.newFactor / BASELINE_FACTOR : 1;
  const proratedSAR = ytd ? Math.round(baseSAR * (ytd.ytdDays / 365) * factorRatio) : 0;
  const projectedSAR = ytd ? Math.round(baseSAR * factorRatio) : 0;
  const deltaTone = ytd && ytd.deltaC >= 0 ? "text-warning" : "text-savings";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-energy" />
          2026 Weather Snapshot &amp; Savings Projection
          {ytd && <span className="ml-auto text-[10px] text-muted-foreground font-normal">archive thru {ytd.endDate} · day {ytd.ytdDays} of 365</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Row 1 — Current conditions */}
        <RowLabel label="Current conditions" sub="Live · Riyadh OERK" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Box label="Temperature" value={current ? `${Math.round(current.temperature)}°C` : "—"} sub={current ? `Feels ${Math.round(current.feelsLike)}°C` : ""} icon={Thermometer} tone="energy" />
          <Box label="Condition" value={current ? getWeatherInfo(current.weatherCode).label : "—"} sub={current ? `${current.cloudCover}% cloud` : ""} icon={CloudSun} />
          <Box label="Humidity" value={current ? `${current.humidity}%` : "—"} sub="Relative" icon={Droplets} />
          <Box label="Wind" value={current ? `${Math.round(current.windSpeed)} km/h` : "—"} sub="Surface" icon={Wind} />
        </div>

        {/* Row 2 — YTD pro-rated */}
        <RowLabel label="2026 YTD — pro-rated savings" sub={ytd ? `${ytd.ytdDays} days elapsed · vs same window 2025` : "loading…"} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Box label="2025 YTD avg" value={ytd ? `${ytd.ytd2025AvgC}°C` : "…"} sub="Same Jan 1 → today window" icon={Calendar} />
          <Box label="2026 YTD avg" value={ytd ? `${ytd.ytd2026AvgC}°C` : "…"} sub="This year so far" icon={Calendar} tone="energy" />
          <Box label="ΔT YoY" value={ytd ? `${ytd.deltaC > 0 ? "+" : ""}${ytd.deltaC}°C` : "…"} sub={ytd ? `${ytd.loadImpactPct > 0 ? "+" : ""}${ytd.loadImpactPct}% cooling load` : ""} icon={ytd && ytd.deltaC >= 0 ? TrendingUp : TrendingDown} toneClass={deltaTone} />
          <Box label="YTD savings (pro-rated)" value={ytd ? `${proratedSAR.toLocaleString()} SAR` : "…"} sub={ytd ? `× factor ${ytd.newFactor} (vs locked ${BASELINE_FACTOR})` : ""} icon={Target} tone="savings" />
        </div>

        {/* Row 3 — Full year 2026 projection */}
        <RowLabel label="Full-year 2026 projection" sub="Annualized from YTD ΔT trend" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Box label="Projected factor" value={ytd ? `×${ytd.newFactor}` : "…"} sub={`Locked 2024→2025: ×${BASELINE_FACTOR}`} icon={TrendingUp} tone="energy" />
          <Box label="Projected kWh avoided" value={ytd ? `${Math.round(LockedFinancials.weatherAdjustedEnergyAvoided * factorRatio).toLocaleString()}` : "…"} sub="7 SCC panels, full year" icon={Target} />
          <Box label="Projected savings (full year)" value={ytd ? `${projectedSAR.toLocaleString()} SAR` : "…"} sub="Direct energy savings" icon={Target} tone="savings" />
          <Box label="Δ vs locked baseline" value={ytd ? `${projectedSAR - baseSAR >= 0 ? "+" : ""}${(projectedSAR - baseSAR).toLocaleString()} SAR` : "…"} sub={`Baseline ${baseSAR.toLocaleString()} SAR`} icon={projectedSAR >= baseSAR ? TrendingUp : TrendingDown} toneClass={projectedSAR >= baseSAR ? "text-savings" : "text-warning"} />
        </div>

        {err && <p className="text-[10px] text-warning">Could not load archive: {err}</p>}
        <p className="text-[10px] text-muted-foreground">
          Coefficient: {LOAD_PCT_PER_C.toFixed(2)}% load impact per °C (derived from locked 2024→2025 calibration: {ClimateConstants.avgTemperatureIncrease}°C → {ClimateConstants.adoptedNormalizationPct}%).
          Source: Open-Meteo ERA5 archive · King Khalid International (OERK), Riyadh.
        </p>
      </CardContent>
    </Card>
  );
}

function RowLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-baseline gap-2 pt-1">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-foreground">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground">· {sub}</span>}
    </div>
  );
}

function Box({
  label, value, sub, icon: Icon, tone, toneClass,
}: { label: string; value: string; sub?: string; icon?: any; tone?: "energy" | "savings"; toneClass?: string }) {
  const color = toneClass ?? (tone === "savings" ? "text-savings" : tone === "energy" ? "text-energy" : "text-foreground");
  return (
    <div className="bg-secondary rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        <span>{label}</span>
      </div>
      <div className={`font-mono text-lg font-bold tabular-nums mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}