import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar as RadarIcon, Activity, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { PageTransition } from "@/components/platform/PageTransition";
import { useUnitIntel, statusColor } from "@/hooks/useUnitIntel";

function RadarSweep({ stats }: { stats: ReturnType<typeof useUnitIntel>["stats"] }) {
  const cx = 200, cy = 200, rMax = 170;
  const n = stats.length;
  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-[420px] mx-auto">
      {/* rings */}
      {[0.33, 0.66, 1].map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={rMax * f} fill="none" stroke="hsl(var(--border))" strokeOpacity={0.5} strokeDasharray="3 5" />
      ))}
      {/* spokes */}
      {stats.map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * rMax} y2={cy + Math.sin(a) * rMax} stroke="hsl(var(--border))" strokeOpacity={0.4} />;
      })}
      {/* sweep */}
      <motion.line
        x1={cx} y1={cy} x2={cx} y2={cy - rMax}
        stroke="hsl(var(--accent))" strokeWidth={2} strokeOpacity={0.5}
        animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* unit blips */}
      {stats.map((s, i) => {
        const c = statusColor(s.status);
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        // distance from center based on |z|: 0 → inner, 3+ → outer
        const dist = Math.min(1, Math.abs(s.lastZ ?? 0) / 3) * rMax * 0.85 + rMax * 0.1;
        const x = cx + Math.cos(a) * dist;
        const y = cy + Math.sin(a) * dist;
        return (
          <g key={s.unit}>
            <motion.circle
              cx={x} cy={y} r={s.status === "alert" ? 11 : 8}
              fill={c.hex} fillOpacity={0.35} stroke={c.hex} strokeWidth={2}
              animate={s.status !== "normal" ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
            <text x={x} y={y - 14} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={11} fontWeight={600}>{s.unit}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="hsl(var(--accent))" />
    </svg>
  );
}

export default function RadarDetectionPage() {
  const intel = useUnitIntel();

  const summary = useMemo(() => {
    const counts = { alert: 0, watch: 0, normal: 0 };
    for (const s of intel.stats) counts[s.status]++;
    return counts;
  }, [intel.stats]);

  if (intel.loading) return <PageTransition><div className="p-8 text-sm text-muted-foreground">Initialising radar…</div></PageTransition>;
  if (intel.error)   return <PageTransition><div className="p-8 text-sm text-destructive">No data — {intel.error}</div></PageTransition>;

  const recentAnomalies = intel.anomalies.slice(0, 6);
  const allClear = summary.alert === 0 && summary.watch === 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RadarIcon className="h-6 w-6 text-accent" />
            Radar Detection
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live status of 7 SCC units — derived from latest reading z-score per unit
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Alert", value: summary.alert, color: "text-destructive", icon: AlertTriangle },
            { label: "Watch", value: summary.watch, color: "text-warning",     icon: Activity },
            { label: "Normal", value: summary.normal, color: "text-primary",   icon: CheckCircle2 },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                  <k.icon className={`h-5 w-5 ${k.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className={`text-2xl font-bold font-mono ${k.color}`}>{k.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Unit Scan</CardTitle>
              <CardDescription>Distance from centre = |z| of latest reading vs unit mean</CardDescription>
            </CardHeader>
            <CardContent>
              <RadarSweep stats={intel.stats} />
              {allClear && (
                <p className="text-center text-xs text-primary mt-2">All units within ±1.5σ — all-clear</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unit Status Board</CardTitle>
              <CardDescription>Most recent reading: {intel.dateRange?.max ?? "—"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {intel.stats.map((s) => {
                const c = statusColor(s.status);
                return (
                  <div key={s.unit} className={`flex items-center justify-between px-3 py-2 rounded border ${c.border} ${c.bg}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-foreground w-10">{s.unit}</span>
                      <span className="text-xs text-muted-foreground">μ {s.meanKwh.toFixed(0)} kWh • σ {s.sdKwh.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-muted-foreground">last {s.lastKwh?.toFixed(0) ?? "—"} kWh</span>
                      <span className={`font-mono ${c.text}`}>z={s.lastZ != null ? (s.lastZ >= 0 ? "+" : "") + s.lastZ.toFixed(2) : "—"}</span>
                      <Badge variant="outline" className={`${c.text} border-current`}>{c.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Recent Anomaly Events</CardTitle>
            <CardDescription>Top hits from the statistical detection engine</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAnomalies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No anomalies in the detection window.</p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {recentAnomalies.map((a, i) => (
                  <div key={i} className="flex justify-between px-2 py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">{a.date}</span>
                    <span>{a.unit}</span>
                    <span>{a.kwh.toFixed(0)} kWh</span>
                    <span className={a.deviation < 0 ? "text-warning" : "text-destructive"}>z={a.sigma.toFixed(2)}</span>
                    <Badge variant="outline" className="text-xs">{a.severity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Live monitoring view of the same anomaly engine on the AI Anomalies page.
              Status: <strong>Alert</strong> if latest |z| ≥ 2.5, <strong>Watch</strong> if ≥ 1.5,
              else <strong>Normal</strong>. No synthetic blips — units, readings and statuses come
              from <code>daily_unit_readings</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}