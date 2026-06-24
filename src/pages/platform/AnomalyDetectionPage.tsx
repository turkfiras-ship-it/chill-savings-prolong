import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useUnitIntel, UNIT_NAMES, type UnitName } from "@/hooks/useUnitIntel";

const sevColor: Record<string, string> = {
  Critical: "bg-destructive/20 text-destructive border-destructive/30",
  High:     "bg-warning/20 text-warning border-warning/30",
  Medium:   "bg-accent/20 text-accent border-accent/30",
};

export default function AnomalyDetectionPage() {
  const intel = useUnitIntel();
  const [unitFilter, setUnitFilter] = useState<UnitName | "all">("all");

  const anomalies = useMemo(
    () => unitFilter === "all" ? intel.anomalies : intel.anomalies.filter(a => a.unit === unitFilter),
    [intel.anomalies, unitFilter]
  );

  // Build chart series for selected unit (or fleet average)
  const chart = useMemo(() => {
    if (unitFilter === "all" || !intel.byUnit[unitFilter]?.length) return [];
    const rows = intel.byUnit[unitFilter];
    const s = intel.stats.find(x => x.unit === unitFilter);
    return rows.map(r => ({
      date: r.date.slice(5),
      kwh: r.kwh,
      mean: s?.meanKwh ?? 0,
      upper: (s?.meanKwh ?? 0) + 2 * (s?.sdKwh ?? 0),
      lower: Math.max(0, (s?.meanKwh ?? 0) - 2 * (s?.sdKwh ?? 0)),
    }));
  }, [unitFilter, intel]);

  if (intel.loading) return <PageTransition><div className="p-8 text-sm text-muted-foreground">Loading anomaly engine…</div></PageTransition>;
  if (intel.error)   return <PageTransition><div className="p-8 text-sm text-destructive">No data — {intel.error}</div></PageTransition>;

  const totalDays = intel.dateRange ? `${intel.dateRange.min} → ${intel.dateRange.max}` : "—";
  const sevCounts = { Critical: 0, High: 0, Medium: 0 };
  for (const a of intel.anomalies) sevCounts[a.severity]++;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="h-6 w-6 text-accent" />
              Anomaly Detection
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Statistical z-score detection across {intel.stats[0]?.n ?? 0} days × 7 units •
              <code className="ml-1">daily_unit_readings</code>
            </p>
          </div>
          <Select value={unitFilter} onValueChange={(v) => setUnitFilter(v as any)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All units</SelectItem>
              {UNIT_NAMES.map(u => <SelectItem key={u} value={u}>Unit {u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Anomalies", value: intel.anomalies.length, sub: `|z| ≥ 2 in ${totalDays}` },
            { label: "Critical (|z|≥3)", value: sevCounts.Critical, sub: "Severe deviation" },
            { label: "High (|z|≥2.5)", value: sevCounts.High, sub: "Notable deviation" },
            { label: "Medium (|z|≥2)", value: sevCounts.Medium, sub: "Threshold flag" },
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

        {unitFilter !== "all" && chart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unit {unitFilter} — Daily kWh vs ±2σ band</CardTitle>
              <CardDescription>Points outside the band are flagged anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <ReferenceLine y={chart[0]?.upper} stroke="hsl(var(--warning))" strokeDasharray="4 4" label={{ value: "+2σ", fill: "hsl(var(--warning))", fontSize: 10 }} />
                  <ReferenceLine y={chart[0]?.lower} stroke="hsl(var(--warning))" strokeDasharray="4 4" label={{ value: "-2σ", fill: "hsl(var(--warning))", fontSize: 10 }} />
                  <ReferenceLine y={chart[0]?.mean} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
                  <Line type="monotone" dataKey="kwh" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detected Anomalies</CardTitle>
            <CardDescription>{unitFilter === "all" ? "All units" : `Unit ${unitFilter}`} — sorted by date</CardDescription>
          </CardHeader>
          <CardContent>
            {anomalies.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                No anomalies detected for {unitFilter === "all" ? "the fleet" : `Unit ${unitFilter}`} at |z| ≥ 2.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Unit</th>
                      <th className="py-2 pr-3">Actual kWh</th>
                      <th className="py-2 pr-3">Expected (unit mean)</th>
                      <th className="py-2 pr-3">Deviation</th>
                      <th className="py-2 pr-3">σ</th>
                      <th className="py-2 pr-3">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {anomalies.map((a, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-2 pr-3">{a.date}</td>
                        <td className="py-2 pr-3">{a.unit}</td>
                        <td className="py-2 pr-3">{a.kwh.toFixed(1)}</td>
                        <td className="py-2 pr-3">{a.expected.toFixed(1)}</td>
                        <td className={`py-2 pr-3 ${a.deviation < 0 ? "text-warning" : "text-destructive"}`}>{a.deviation >= 0 ? "+" : ""}{a.deviation.toFixed(1)}</td>
                        <td className="py-2 pr-3">{a.sigma.toFixed(2)}</td>
                        <td className="py-2 pr-3"><Badge variant="outline" className={sevColor[a.severity]}>{a.severity}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Method:</strong> for each unit, mean μ and σ
              are computed across all available daily readings ({intel.stats[0]?.n ?? 0}-day window).
              A day is flagged when |kWh − μ| ≥ 2σ. Severity = Medium ≥ 2σ, High ≥ 2.5σ, Critical ≥ 3σ.
              Confidence is limited by sample size — only {intel.stats[0]?.n ?? 0} days available.
              Bulk same-day low-kWh anomalies often reflect facility closures (e.g. weekly off-day or holiday).
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}