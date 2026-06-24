import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dna, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useUnitIntel, UNIT_NAMES, flagColor, type UnitName } from "@/hooks/useUnitIntel";

function FlagBadge({ flag }: { flag: "degrading" | "stable" | "improving" }) {
  const c = flagColor(flag);
  const Icon = flag === "degrading" ? TrendingUp : flag === "improving" ? TrendingDown : Minus;
  return (
    <Badge variant="outline" className={`${c.text} border-current gap-1`}>
      <Icon className="h-3 w-3" />
      {flag.toUpperCase()}
    </Badge>
  );
}

export default function CoolingGenomePage() {
  const intel = useUnitIntel();
  const [selected, setSelected] = useState<UnitName>("G1");

  const selectedStat = intel.stats.find(s => s.unit === selected);
  const selectedRows = intel.byUnit[selected] ?? [];

  // 7-day rolling kWh/CDD for selected unit
  const chartData = useMemo(() => {
    const pts = selectedRows.filter(r => r.cdd && r.cdd > 0).map(r => ({ date: r.date, v: r.kwh / r.cdd! }));
    return pts.map((p, i) => {
      const window = pts.slice(Math.max(0, i - 6), i + 1);
      const ra = window.reduce((a, b) => a + b.v, 0) / window.length;
      return { date: p.date.slice(5), daily: Number(p.v.toFixed(2)), rolling7d: Number(ra.toFixed(2)) };
    });
  }, [selectedRows]);

  if (intel.loading) return <PageTransition><div className="p-8 text-sm text-muted-foreground">Sequencing genomes…</div></PageTransition>;
  if (intel.error)   return <PageTransition><div className="p-8 text-sm text-destructive">No data — {intel.error}</div></PageTransition>;

  const dayCount = intel.stats[0]?.n ?? 0;
  const degrading = intel.stats.filter(s => s.flag === "degrading").length;
  const improving = intel.stats.filter(s => s.flag === "improving").length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Dna className="h-6 w-6 text-accent" />
              Cooling Genome — Per-Unit Efficiency Trends
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              kWh per CDD trajectory across {dayCount} days • indicator only, NOT a validated failure model
            </p>
          </div>
          <Select value={selected} onValueChange={(v) => setSelected(v as UnitName)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNIT_NAMES.map(u => <SelectItem key={u} value={u}>Unit {u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Low confidence banner */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-foreground leading-relaxed">
              <strong>Low statistical confidence:</strong> only {dayCount} days of unit-level history are available
              ({intel.dateRange?.min} → {intel.dateRange?.max}). Trends shown here are directional, not predictive.
              A "degrading" flag means the unit's recent kWh-per-CDD is ≥ 5% above its early-window baseline — it does
              <em> not </em> indicate imminent failure or a validated remaining-useful-life estimate.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Units Degrading", value: degrading, sub: "Recent kWh/CDD ≥ +5% vs baseline" },
            { label: "Units Improving", value: improving, sub: "Recent kWh/CDD ≤ −5% vs baseline" },
            { label: "Units Stable", value: 7 - degrading - improving, sub: "Within ±5% band" },
            { label: "Tariff Reference", value: `${intel.tariffSarPerKwh.toFixed(3)}`, sub: "SAR/kWh (avg from bills)" },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">{k.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{k.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Unit grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-Unit Degradation Indicator</CardTitle>
            <CardDescription>
              Recent third vs first third of the {dayCount}-day window — kWh per CDD-day (lower = more efficient)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {intel.stats.map((s) => {
                const c = flagColor(s.flag);
                return (
                  <button
                    key={s.unit}
                    onClick={() => setSelected(s.unit)}
                    className={`text-left p-3 rounded-lg border transition-colors ${selected === s.unit ? "border-accent bg-accent/5" : `${c.bg} border-border hover:border-accent/40`}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-foreground">{s.unit}</span>
                      <FlagBadge flag={s.flag} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div><p className="text-muted-foreground">Baseline</p><p className="text-foreground">{s.baselineKpc.toFixed(2)}</p></div>
                      <div><p className="text-muted-foreground">Recent</p><p className={c.text}>{s.recentKpc.toFixed(2)}</p></div>
                      <div className="col-span-2"><p className="text-muted-foreground">Δ vs baseline</p><p className={c.text}>{s.degradationPct >= 0 ? "+" : ""}{s.degradationPct.toFixed(1)}%</p></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected unit chart */}
        {selectedStat && chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unit {selected} — Daily kWh / CDD with 7-day rolling avg</CardTitle>
              <CardDescription>
                Baseline ref line = {selectedStat.baselineKpc.toFixed(2)} (first third of history). Higher line over time = degradation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <ReferenceLine y={selectedStat.baselineKpc} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "baseline", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Line type="monotone" dataKey="daily" stroke="hsl(var(--accent))" strokeOpacity={0.4} strokeWidth={1.5} dot={false} name="Daily kWh/CDD" />
                  <Line type="monotone" dataKey="rolling7d" stroke={flagColor(selectedStat.flag).hex} strokeWidth={2.5} dot={false} name="7-day rolling" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Method:</strong> for each unit we compute daily kWh / CDD,
              then compare the mean of the most recent third vs the first third of available history.
              Flag thresholds: <em>degrading</em> ≥ +5%, <em>improving</em> ≤ −5%, otherwise <em>stable</em>.
              This is a trend indicator only — failure-date estimates, "health %" scores and remaining-life
              numbers would require validated reliability models and a longer history than the {dayCount}
              days currently available.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}