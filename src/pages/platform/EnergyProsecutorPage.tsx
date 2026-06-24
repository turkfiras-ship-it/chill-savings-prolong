import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, Info, Banknote } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useUnitIntel } from "@/hooks/useUnitIntel";

export default function EnergyProsecutorPage() {
  const intel = useUnitIntel();

  if (intel.loading) return <PageTransition><div className="p-8 text-sm text-muted-foreground">Building case files…</div></PageTransition>;
  if (intel.error)   return <PageTransition><div className="p-8 text-sm text-destructive">No data — {intel.error}</div></PageTransition>;

  const wasteful = intel.wasteCases.filter(c => c.excessKwh > 0);
  const top = wasteful.slice(0, 8);
  const totalExcessKwh = wasteful.reduce((s, c) => s + c.excessKwh, 0);
  const totalExcessSar = wasteful.reduce((s, c) => s + c.excessSar, 0);
  const topCase = wasteful[0];

  const chartData = top.map(c => ({
    label: `${c.unit} ${c.monthLabel.slice(5)}`,
    excess: Math.round(c.excessKwh),
    pct: Number(c.excessPct.toFixed(1)),
  }));

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            Energy Prosecutor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Per-unit monthly cases — actual kWh vs CDD-expected at the unit's baseline efficiency
          </p>
        </div>

        {wasteful.length === 0 ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 pb-6 flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">No prosecutable waste detected</p>
                <p className="text-sm text-muted-foreground">All units are at or below their CDD-expected baseline.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Open Cases", value: wasteful.length, sub: "Unit-months above baseline", icon: AlertTriangle },
                { label: "Total Excess kWh", value: Math.round(totalExcessKwh).toLocaleString(), sub: `Across ${wasteful.length} cases`, icon: AlertTriangle },
                { label: "Total Excess SAR", value: `﷼ ${Math.round(totalExcessSar).toLocaleString()}`, sub: `@ ${intel.tariffSarPerKwh.toFixed(3)} SAR/kWh`, icon: Banknote },
                { label: "Top Offender", value: topCase ? `${topCase.unit} ${topCase.monthLabel.slice(5)}` : "—", sub: topCase ? `+${Math.round(topCase.excessKwh).toLocaleString()} kWh (${topCase.excessPct.toFixed(0)}%)` : "", icon: Shield },
              ].map((k, i) => (
                <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Cases — Excess kWh vs CDD-Expected</CardTitle>
                <CardDescription>Higher = more energy used than baseline efficiency predicts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="excess" radius={[4, 4, 0, 0]} name="Excess kWh">
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.pct >= 20 ? "hsl(var(--destructive))" : d.pct >= 10 ? "hsl(var(--warning))" : "hsl(var(--accent))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Case Files</CardTitle>
                <CardDescription>Ranked by excess kWh</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {top.map((c, i) => (
                    <motion.div
                      key={`${c.unit}-${c.monthLabel}`}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`p-3 rounded-lg border ${c.excessPct >= 20 ? "border-destructive/40 bg-destructive/5" : c.excessPct >= 10 ? "border-warning/40 bg-warning/5" : "border-border bg-card"}`}
                    >
                      <div className="flex justify-between items-start gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-foreground">Case #{i + 1} — Unit {c.unit} • {c.monthLabel}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {c.days} days analysed • baseline efficiency derived from this unit's first-third of history
                          </p>
                        </div>
                        <Badge variant="outline" className={c.excessPct >= 20 ? "border-destructive text-destructive" : c.excessPct >= 10 ? "border-warning text-warning" : ""}>
                          {c.excessPct >= 20 ? "Critical" : c.excessPct >= 10 ? "Material" : "Minor"} • +{c.excessPct.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3 font-mono text-sm">
                        <div><p className="text-xs text-muted-foreground">Expected</p><p className="text-foreground">{Math.round(c.expectedKwh).toLocaleString()} kWh</p></div>
                        <div><p className="text-xs text-muted-foreground">Actual</p><p className="text-foreground">{Math.round(c.actualKwh).toLocaleString()} kWh</p></div>
                        <div><p className="text-xs text-muted-foreground">Excess</p><p className="text-destructive">+{Math.round(c.excessKwh).toLocaleString()} kWh • ﷼ {Math.round(c.excessSar).toLocaleString()}</p></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Finding: Unit {c.unit} consumed {c.excessPct.toFixed(1)}% above its CDD-adjusted baseline in {c.monthLabel}.
                        At {intel.tariffSarPerKwh.toFixed(3)} SAR/kWh (avg from <code>sceco_monthly_bills</code>), this represents ﷼ {Math.round(c.excessSar).toLocaleString()} of avoidable cost.
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="glass-card">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Method:</strong> for each unit-month,
              expected kWh = Σ(CDD) × the unit's baseline kWh-per-CDD (computed from its first-third of available history).
              Excess = actual − expected. Tariff {intel.tariffSarPerKwh.toFixed(4)} SAR/kWh is the running average from
              <code> sceco_monthly_bills</code>. Cases use real DB rows only — no manufactured incidents.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}