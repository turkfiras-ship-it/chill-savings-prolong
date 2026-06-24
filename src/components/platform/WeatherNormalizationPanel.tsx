import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWeatherNormalization, WeatherFactorPeriod, LOCKED_STUDY_FACTOR, LOCKED_STUDY_DELTA_C } from "@/hooks/useWeatherNormalization";
import { supabase } from "@/integrations/supabase/client";
import { ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { Thermometer, Flame, RefreshCw, Calendar, TrendingUp, Snowflake, Lock } from "lucide-react";

const chartTooltipStyle = { background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(215, 20%, 16%)";
const tickStyle = { fontSize: 10, fill: 'hsl(215, 15%, 55%)' };

function fmtTemp(v: number | null | undefined, digits = 1) {
  return v == null ? "—" : `${v.toFixed(digits)}°C`;
}
function fmtDelta(v: number | null | undefined) {
  if (v == null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}°C`;
}
function fmtFactor(v: number | null | undefined) {
  return v == null ? "—" : `×${v.toFixed(4)}`;
}

function PeriodCard({ p, icon: Icon, accent }: { p: WeatherFactorPeriod; icon: any; accent?: "official" | "progress" | "context" }) {
  const positive = (p.tempDelta ?? 0) >= 0;
  const ring = accent === "official"
    ? "ring-1 ring-energy/40"
    : accent === "progress"
      ? "ring-1 ring-warning/40"
      : "";
  return (
    <div className={`bg-secondary rounded-lg p-3 border border-border ${ring}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Icon className="h-3 w-3" /> {p.label}
        </span>
        {accent === "official" && <Badge variant="outline" className="text-[9px] border-energy/40 text-energy">Official</Badge>}
        {accent === "progress" && <Badge variant="outline" className="text-[9px] border-warning/40 text-warning">In progress</Badge>}
        {!accent && <Badge variant="outline" className="text-[9px]">{p.currentDays}d vs {p.baselineDays}d</Badge>}
      </div>
      <p className={`text-xl font-bold ${positive ? 'text-warning' : 'text-energy'}`}>{fmtFactor(p.weatherFactor)}</p>
      <p className="text-[10px] text-muted-foreground mt-1">
        {p.currentYear} {fmtTemp(p.currentAvg)} vs {p.baselineYear} {fmtTemp(p.baselineAvg)}
      </p>
      <p className={`text-[10px] mt-0.5 font-medium ${positive ? 'text-warning' : 'text-energy'}`}>
        ΔT {fmtDelta(p.tempDelta)} · CDD {Math.round(p.currentCdd)} vs {Math.round(p.baselineCdd)}
      </p>
      {p.inProgress && p.throughDate && (
        <p className="text-[9px] text-warning/80 mt-1">Through {p.throughDate} · finalizes after Oct 31</p>
      )}
      {accent !== "official" && accent !== "progress" && (
        <p className="text-[9px] text-muted-foreground mt-1">{p.currentDays}d vs {p.baselineDays}d</p>
      )}
    </div>
  );
}

export function WeatherNormalizationPanel() {
  const { loading, error, rows, today, mtd, ytd, annual2025, coolingSeason2025, coolingSeasonCurrent, series, refresh, lockedFactors } = useWeatherNormalization();
  const currentYear = new Date().getUTCFullYear();
  const currentLocked = lockedFactors[currentYear];
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSync = async (mode: "daily" | "backfill") => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("sync-weather", {
        body: { mode, ...(mode === "backfill" ? { start_date: "2024-01-01" } : {}) },
      });
      if (error) throw error;
      setSyncMsg(`OK · ${data?.upserted ?? 0} rows (${data?.range?.[0]} → ${data?.range?.[1]})`);
      await refresh();
    } catch (e: any) {
      setSyncMsg(`Failed: ${e?.message || e}`);
    } finally {
      setSyncing(false);
    }
  };

  // Chart data: daily temp + CDD over the last 365 days
  const chartData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 365);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return rows
      .filter(r => r.date >= cutoffStr)
      .map(r => ({
        date: r.date.slice(5),
        mean: r.mean_temp_c,
        max: r.max_temp_c,
        min: r.min_temp_c,
        cdd: r.cdd,
      }));
  }, [rows]);

  // Monthly rollup current year vs 2024
  const monthly = useMemo(() => {
    const byMonth: Record<string, { currentSum: number; currentCount: number; baseSum: number; baseCount: number; cddCurrent: number; cddBase: number }> = {};
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    for (let m = 0; m < 12; m++) {
      byMonth[String(m)] = { currentSum: 0, currentCount: 0, baseSum: 0, baseCount: 0, cddCurrent: 0, cddBase: 0 };
    }
    rows.forEach(r => {
      const d = new Date(r.date + "T00:00:00Z");
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth();
      const bucket = byMonth[String(m)];
      if (!bucket) return;
      if (y === currentYear && r.mean_temp_c != null) {
        bucket.currentSum += r.mean_temp_c;
        bucket.currentCount += 1;
        bucket.cddCurrent += r.cdd ?? 0;
      } else if (y === 2024 && r.mean_temp_c != null) {
        bucket.baseSum += r.mean_temp_c;
        bucket.baseCount += 1;
        bucket.cddBase += r.cdd ?? 0;
      }
    });
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return monthNames.map((name, i) => {
      const b = byMonth[String(i)];
      const curAvg = b.currentCount ? b.currentSum / b.currentCount : null;
      const baseAvg = b.baseCount ? b.baseSum / b.baseCount : null;
      const delta = curAvg != null && baseAvg != null ? curAvg - baseAvg : null;
      return {
        month: name,
        currentAvg: curAvg ? Number(curAvg.toFixed(2)) : null,
        baselineAvg: baseAvg ? Number(baseAvg.toFixed(2)) : null,
        delta: delta != null ? Number(delta.toFixed(2)) : null,
        factor: delta != null ? Number((1 + delta * 0.097).toFixed(4)) : null,
        cddCurrent: Math.round(b.cddCurrent),
        cddBase: Math.round(b.cddBase),
      };
    });
  }, [rows]);

  const todayCdd = today?.cdd ?? null;
  const todayMean = today?.mean_temp_c ?? null;
  const todayDelta = useMemo(() => {
    if (!today) return null;
    const md = today.date.slice(5);
    const baseRow = rows.find(r => r.date === `2024-${md}`);
    if (!baseRow?.mean_temp_c || today.mean_temp_c == null) return null;
    return today.mean_temp_c - baseRow.mean_temp_c;
  }, [today, rows]);
  const todayFactor = todayDelta != null ? 1 + todayDelta * 0.097 : null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-energy" />
          Weather Normalization Engine — Cooling-Season Basis (May–Oct vs 2024 · 9.7%/°C)
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px]">Source: {series === "rawdah" ? "Rawdah site (24.7316, 46.7545)" : "Airport"}</Badge>
          {syncMsg && <span className="text-[10px] text-muted-foreground">{syncMsg}</span>}
          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={syncing} onClick={() => handleSync("daily")}>
            <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
            Sync yesterday
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={syncing} onClick={() => handleSync("backfill")}>
            Re-backfill
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-xs text-muted-foreground">Loading daily weather history…</p>}
        {error && <p className="text-xs text-destructive">Error: {error}</p>}

        {/* Methodology line */}
        <div className="rounded-md border border-energy/20 bg-energy/5 p-2.5 text-[10px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Official normalization basis:</span> cooling season (May–Oct)
          mean-temperature delta vs 2024 baseline at site coordinates, × 9.7%/°C sensitivity. Full-year shown for
          context only. 2026 finalizes after the cooling season completes (Oct 31, 2026).
        </div>

        {/* OFFICIAL cooling-season cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coolingSeason2025 && (
            <div className="bg-secondary rounded-lg p-3 border border-energy/30 ring-1 ring-energy/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Snowflake className="h-3 w-3 text-energy" /> Official 2025 factor — cooling season
                </span>
                <Badge variant="outline" className="text-[9px] border-energy/40 text-energy flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> Study locked
                </Badge>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold text-energy">×{LOCKED_STUDY_FACTOR.toFixed(4)}</p>
                <p className="text-[10px] text-muted-foreground">study: ΔT +{LOCKED_STUDY_DELTA_C.toFixed(2)}°C</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Data-derived (Rawdah ERA5): {fmtFactor(coolingSeason2025.weatherFactor)} · ΔT {fmtDelta(coolingSeason2025.tempDelta)}
                ({coolingSeason2025.currentDays}d vs {coolingSeason2025.baselineDays}d)
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                2025 {fmtTemp(coolingSeason2025.currentAvg)} vs 2024 {fmtTemp(coolingSeason2025.baselineAvg)} · reconciles to locked ~1.1262.
              </p>
            </div>
          )}
          {coolingSeasonCurrent && (
            currentLocked ? (
              <div className="bg-secondary rounded-lg p-3 border border-energy/30 ring-1 ring-energy/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Snowflake className="h-3 w-3 text-energy" /> Official {currentYear} factor — cooling season
                  </span>
                  <Badge variant="outline" className="text-[9px] border-energy/40 text-energy flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" /> Final
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-energy">×{currentLocked.factor.toFixed(4)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  ΔT {fmtDelta(currentLocked.delta_c)} · finalized {currentLocked.finalized_at.slice(0,10)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Source: {currentLocked.source}</p>
              </div>
            ) : (
              <PeriodCard p={coolingSeasonCurrent} icon={Snowflake} accent="progress" />
            )
          )}
        </div>

        {/* Secondary / context cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-secondary rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Today ({today?.date ?? "—"})
              </span>
              <Badge variant="outline" className="text-[9px]">{today?.source ?? '—'}</Badge>
            </div>
            <p className={`text-xl font-bold ${(todayDelta ?? 0) >= 0 ? 'text-warning' : 'text-energy'}`}>{fmtFactor(todayFactor)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Mean {fmtTemp(todayMean)} · CDD {todayCdd != null ? todayCdd.toFixed(1) : '—'}
            </p>
            <p className={`text-[10px] mt-0.5 font-medium ${(todayDelta ?? 0) >= 0 ? 'text-warning' : 'text-energy'}`}>
              ΔT vs 2024 same-day: {fmtDelta(todayDelta)}
            </p>
          </div>
          {mtd && <PeriodCard p={mtd} icon={Calendar} accent="context" />}
          {ytd && <PeriodCard p={ytd} icon={TrendingUp} accent="context" />}
          {annual2025 && <PeriodCard p={annual2025} icon={Flame} accent="context" />}
        </div>

        {/* Daily temp + CDD chart */}
        <div>
          <p className="text-[11px] text-muted-foreground mb-1">Daily temperature & cooling degree days (last 365d, base 18°C)</p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(chartData.length / 12))} />
              <YAxis yAxisId="t" tick={tickStyle} axisLine={false} tickLine={false} unit="°C" />
              <YAxis yAxisId="c" orientation="right" tick={tickStyle} axisLine={false} tickLine={false} unit=" CDD" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="t" type="monotone" dataKey="max" name="Max °C" stroke="hsl(0, 70%, 55%)" fill="hsl(0, 70%, 55%)" fillOpacity={0.08} strokeWidth={1} />
              <Area yAxisId="t" type="monotone" dataKey="min" name="Min °C" stroke="hsl(210, 80%, 55%)" fill="hsl(210, 80%, 55%)" fillOpacity={0.08} strokeWidth={1} />
              <Line yAxisId="t" type="monotone" dataKey="mean" name="Mean °C" stroke="hsl(38, 92%, 55%)" strokeWidth={2} dot={false} />
              <Bar yAxisId="c" dataKey="cdd" name="CDD (base 18°C)" fill="hsl(192, 70%, 50%)" opacity={0.45} radius={[2,2,0,0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly comparison */}
        <div>
          <p className="text-[11px] text-muted-foreground mb-1">Monthly avg mean temp — current year vs 2024 baseline (with derived factor)</p>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis yAxisId="t" tick={tickStyle} axisLine={false} tickLine={false} unit="°C" />
              <YAxis yAxisId="f" orientation="right" tick={tickStyle} axisLine={false} tickLine={false} domain={[0.9, 1.3]} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="t" dataKey="baselineAvg" name="2024 baseline °C" fill="hsl(210, 30%, 45%)" opacity={0.5} radius={[2,2,0,0]} />
              <Bar yAxisId="t" dataKey="currentAvg" name="Current year °C" fill="hsl(0, 70%, 55%)" opacity={0.75} radius={[2,2,0,0]} />
              <Line yAxisId="f" type="monotone" dataKey="factor" name="Weather factor" stroke="hsl(140, 70%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[10px] text-muted-foreground">
          Formula: weather_factor = 1 + (current_cooling-season_avg_mean_temp − 2024_cooling-season_avg_mean_temp) × 0.097.
          MTD / YTD / Annual cards are full-period rollups shown for context — not the official basis.
          Locked savings KPIs (17.3% / 102,194 kWh / 33,286 SAR) are unaffected; this engine only feeds normalization comparisons.
        </p>
      </CardContent>
    </Card>
  );
}