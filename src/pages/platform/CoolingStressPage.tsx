import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, AlertTriangle, TrendingUp, Info, Thermometer, Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Bar, BarChart } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCoolingIntel, stressScore, stressLevel } from "@/hooks/useCoolingIntel";

// ── Gauge Component ──────────────────────────────────────
function StressGauge({ score, size = 200 }: { score: number; size?: number }) {
  const level = stressLevel(score);
  const angle = (score / 100) * 270 - 135;
  const r = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;

  const arcPath = (startAngle: number, endAngle: number) => {
    const s = ((startAngle - 90) * Math.PI) / 180;
    const e = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={arcPath(-135, 135)} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" strokeLinecap="round" />
      <motion.path
        d={arcPath(-135, Math.min(angle, 135))}
        fill="none"
        stroke={level.color}
        strokeWidth="12"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {/* Needle */}
      <motion.line
        x1={cx} y1={cy}
        x2={cx + (r - 15) * Math.cos(((angle - 90) * Math.PI) / 180)}
        y2={cy + (r - 15) * Math.sin(((angle - 90) * Math.PI) / 180)}
        stroke={level.color}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      />
      <circle cx={cx} cy={cy} r={6} fill={level.color} />
      <text x={cx} y={cy + 35} textAnchor="middle" className="fill-foreground text-3xl font-bold" style={{ fontSize: 32, fontWeight: 800 }}>
        {score}
      </text>
      <text x={cx} y={cy + 55} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 12 }}>
        / 100
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
export default function CoolingStressPage() {
  const intel = useCoolingIntel();

  // Build a kWh-by-date map then compute trailing 30-day stress
  const trend = useMemo(() => {
    if (!intel.baseline2024 || !intel.weather.length) return [];
    const kwhMap = new Map(intel.readings.map(r => [r.reading_date, Number(r.fleet_total) || null]));
    return intel.weather.slice(-30).map(w => {
      const kwh = kwhMap.get(w.date) ?? null;
      const s = stressScore(w.max_temp_c, kwh, w.cdd, intel.baseline2024, intel.kwhPerCdd);
      return {
        date: w.date,
        short: w.date.slice(5),
        score: s?.score ?? 0,
        maxTemp: w.max_temp_c != null ? Number(w.max_temp_c) : null,
        kwh,
      };
    });
  }, [intel]);

  const today = trend[trend.length - 1];
  const todayScore = today?.score ?? 0;
  const level = stressLevel(todayScore);
  const topStressed = [...trend].filter(t => t.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

  if (intel.loading) {
    return <PageTransition><div className="p-8 text-sm text-muted-foreground">Loading real cooling data…</div></PageTransition>;
  }
  if (intel.error || !intel.baseline2024) {
    return <PageTransition><div className="p-8 text-sm text-destructive">No data — {intel.error ?? "missing 2024 baseline"}.</div></PageTransition>;
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Gauge className="h-6 w-6 text-accent" />
            Cooling Stress Index
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Jarir Rawdah — derived from live <code>daily_weather_rawdah</code> + <code>daily_unit_readings</code>
          </p>
        </div>

        {/* Today + KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`border ${level.border} ${level.bg}`}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today's Stress ({today?.date ?? "n/a"})</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <AnimatePresence mode="wait">
                <motion.div key={todayScore} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                  <StressGauge score={todayScore} size={200} />
                </motion.div>
              </AnimatePresence>
              <Badge className={`mt-2 ${level.bg} ${level.text} border-0`}>{level.label} Stress</Badge>
              <div className="mt-3 text-xs text-muted-foreground text-center">
                Max {today?.maxTemp != null ? `${today.maxTemp.toFixed(1)}°C` : "—"} • Fleet {today?.kwh != null ? `${Math.round(today.kwh).toLocaleString()} kWh` : "no reading"}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-accent" />30-Day Stress Trend</CardTitle>
              <CardDescription>Daily score combining max-temp percentile (2024 baseline) and kWh/CDD ratio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="short" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={2} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <ReTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={level.color} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={level.color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="score" stroke={level.color} fill="url(#stressGrad)" strokeWidth={2} name="Stress" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Baseline + ratio readouts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "2024 Baseline avg max", value: `${intel.baseline2024.avgMax.toFixed(1)}°C`, icon: Thermometer },
            { label: "2024 Baseline P90 max", value: `${intel.baseline2024.p90Max.toFixed(1)}°C`, icon: AlertTriangle },
            { label: "Site kWh / CDD (hist.)", value: `${intel.kwhPerCdd.toFixed(1)}`, icon: Activity },
            { label: "Baseline sample (May–Oct '24)", value: `${intel.baseline2024.n} days`, icon: TrendingUp },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <k.icon className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="text-xl font-bold font-mono text-foreground mt-1">{k.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Top stressed days */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Stressed Days (last 30)</CardTitle>
            <CardDescription>Ranked by computed stress score</CardDescription>
          </CardHeader>
          <CardContent>
            {topStressed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topStressed}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <ReTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="score" fill={level.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card className="glass-card">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Formula:</strong> stress = average of (A) temperature
              percentile — today's max relative to the 2024 May–Oct distribution at site coords,
              mapped <em>avg − 5°C → 0</em> and <em>P90 + 2°C → 100</em>; and (B) load ratio —
              today's <code>kWh / CDD(18°C)</code> vs the historical site average
              ({intel.kwhPerCdd.toFixed(1)} kWh per CDD-day from <code>daily_unit_readings</code>),
              mapped 0.5× → 0, 1.5× → 100. No demo values — all inputs come from the database.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
