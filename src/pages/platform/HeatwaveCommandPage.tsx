import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Thermometer, AlertTriangle, Activity, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCoolingIntel, detectHeatwave, CDD_BASE_C, SAR_PER_KWH } from "@/hooks/useCoolingIntel";

export default function HeatwaveCommandPage() {
  const intel = useCoolingIntel();

  const heat = useMemo(() => {
    if (!intel.baseline2024) return null;
    return detectHeatwave(intel.weather, intel.baseline2024.p90Max);
  }, [intel]);

  if (intel.loading) {
    return <PageTransition><div className="p-8 text-sm text-muted-foreground">Loading heatwave data…</div></PageTransition>;
  }
  if (!intel.baseline2024 || !heat) {
    return <PageTransition><div className="p-8 text-sm text-destructive">No data — missing 2024 baseline.</div></PageTransition>;
  }

  const threshold = intel.baseline2024.p90Max;
  const forecastToday = intel.forecast[0];
  const liveMax = forecastToday?.tMax ?? (intel.weather[intel.weather.length - 1]?.max_temp_c ?? null);
  const liveOverThreshold = liveMax != null && Number(liveMax) >= threshold;

  // Last 14-day chart with threshold reference
  const last14 = intel.weather.slice(-14).map(w => ({
    date: w.date.slice(5),
    max: w.max_temp_c != null ? Number(w.max_temp_c) : null,
    over: w.max_temp_c != null && Number(w.max_temp_c) >= threshold,
  }));

  // Extra cooling load from streak (vs a "normal" day at avgMax baseline)
  const normalCdd = Math.max(0, intel.baseline2024.avgMean - CDD_BASE_C);
  const streakExtraKwh = heat.streakDays.reduce((s, d) => {
    const cdd = Number(d.cdd) || 0;
    const extraCdd = Math.max(0, cdd - normalCdd);
    return s + extraCdd * intel.kwhPerCdd;
  }, 0);
  const streakExtraSar = streakExtraKwh * SAR_PER_KWH;

  // Forecast days that would extend the heatwave
  const forecastOver = intel.forecast.filter(d => d.tMax >= threshold);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-4 flex items-center gap-4 border ${heat.isActive ? "bg-destructive/20 border-destructive/40" : liveOverThreshold ? "bg-warning/15 border-warning/40" : "bg-secondary/40 border-border"}`}
        >
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${heat.isActive ? "bg-destructive/30 animate-pulse" : "bg-muted"}`}>
            <Flame className={`h-6 w-6 ${heat.isActive ? "text-destructive" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <p className={`font-bold text-lg ${heat.isActive ? "text-destructive" : "text-foreground"}`}>
              {heat.isActive ? "🔥 Active heatwave in progress" : liveOverThreshold ? "Threshold crossed today — streak starting" : "No active heatwave"}
            </p>
            <p className="text-sm text-muted-foreground">
              Trailing streak above {threshold.toFixed(1)}°C: <strong className="text-foreground">{heat.currentStreak}</strong> day{heat.currentStreak === 1 ? "" : "s"} • definition: 3+ consecutive days ≥ P90 of 2024 May–Oct max-temp distribution
            </p>
          </div>
          <Badge variant={heat.isActive ? "destructive" : "outline"}>{heat.isActive ? "ACTIVE" : "WATCH"}</Badge>
        </motion.div>

        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Flame className="h-6 w-6 text-destructive" />
            Heatwave Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Data-driven detection from <code>daily_weather_rawdah</code> at site coords (24.7316, 46.7545)
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Heatwave Threshold", value: `${threshold.toFixed(1)}°C`, sub: `P90 of ${intel.baseline2024.n}-day 2024 May–Oct distribution`, icon: AlertTriangle },
            { label: "Today's Max", value: liveMax != null ? `${Number(liveMax).toFixed(1)}°C` : "—", sub: liveOverThreshold ? "Above threshold" : "Below threshold", icon: Thermometer },
            { label: "Current Streak", value: `${heat.currentStreak}d`, sub: heat.isActive ? "Active heatwave" : heat.currentStreak > 0 ? "Below 3-day trigger" : "No streak", icon: Activity },
            { label: "Recent Events (30d)", value: `${heat.recentEvents.length}`, sub: heat.recentEvents.length ? `Last peaked ${heat.recentEvents[heat.recentEvents.length - 1].peakMax.toFixed(1)}°C` : "None", icon: Flame },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <k.icon className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="text-xl font-bold font-mono text-foreground mt-1">{k.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{k.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 14-day chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last 14 Days — Max Temp vs Heatwave Threshold</CardTitle>
            <CardDescription>Red bars exceed the {threshold.toFixed(1)}°C P90 threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={last14}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis domain={[30, 50]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <ReferenceLine y={threshold} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: `P90 ${threshold.toFixed(1)}°C`, fill: "hsl(var(--destructive))", fontSize: 10, position: "insideTopRight" }} />
                <Bar dataKey="max" radius={[4, 4, 0, 0]}>
                  {last14.map((d, i) => (
                    <Cell key={i} fill={d.over ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Streak detail + forecast extension */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Streak Load Impact</CardTitle>
              <CardDescription>Extra cooling load vs a typical baseline day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {heat.streakDays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active streak.</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div><p className="text-xs text-muted-foreground">Days</p><p className="text-lg font-mono font-bold">{heat.streakDays.length}</p></div>
                    <div><p className="text-xs text-muted-foreground">Extra kWh</p><p className="text-lg font-mono font-bold text-warning">+{Math.round(streakExtraKwh).toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Extra SAR</p><p className="text-lg font-mono font-bold text-warning">+﷼ {Math.round(streakExtraSar).toLocaleString()}</p></div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 max-h-[140px] overflow-y-auto">
                    {heat.streakDays.map(d => (
                      <div key={d.date} className="flex justify-between font-mono">
                        <span>{d.date}</span>
                        <span>max {Number(d.max_temp_c).toFixed(1)}°C • CDD {Number(d.cdd ?? 0).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Forecast — Days That Would Extend Heatwave</CardTitle>
              <CardDescription>Next 7 days where forecast max ≥ {threshold.toFixed(1)}°C</CardDescription>
            </CardHeader>
            <CardContent>
              {forecastOver.length === 0 ? (
                <p className="text-sm text-muted-foreground">None — forecast stays below threshold.</p>
              ) : (
                <div className="space-y-2 font-mono text-sm">
                  {forecastOver.map(d => (
                    <div key={d.date} className="flex justify-between p-2 rounded bg-destructive/10 border border-destructive/20">
                      <span>{d.date}</span>
                      <span className="text-destructive">{d.tMax.toFixed(1)}°C</span>
                      <span className="text-muted-foreground">+{Math.round(Math.max(0, d.cdd - normalCdd) * intel.kwhPerCdd).toLocaleString()} kWh</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Methodology */}
        <Card className="glass-card">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Definition:</strong> heatwave = 3+ consecutive days
              with max_temp_c ≥ P90 of the 2024 May–Oct distribution (computed live, currently {threshold.toFixed(1)}°C).
              Extra load = (today's CDD − baseline-day CDD {normalCdd.toFixed(1)}) × {intel.kwhPerCdd.toFixed(1)} kWh per CDD
              from <code>daily_unit_readings</code>. Live current-day max from Open-Meteo forecast at site coords.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
