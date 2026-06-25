import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Factory, TrendingDown, Printer, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCountUp } from "@/hooks/useCountUp";
import { supabase } from "@/integrations/supabase/client";
import { LockedFinancials, GridEmissionConstants } from "@/data/lockedPerformanceModel";

/**
 * Saudi grid emission factor — re-exported from LockedPerformanceModel
 * (GridEmissionConstants). Single source of truth lives there; do not redefine here.
 */
export const GRID_EMISSION_FACTOR_KGCO2_PER_KWH = GridEmissionConstants.kgCo2PerKwh;

const MONTH_ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type DayRow = { reading_date: string; fleet_total: number | null; kwh: number | null };
type BillRow = { year: number; month: string; kwh: number | null };

export default function CarbonIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [latestDay, setLatestDay] = useState<{ date: string; kwh: number } | null>(null);
  const [bills, setBills] = useState<BillRow[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: dayRows }, { data: billRows }] = await Promise.all([
        supabase
          .from("daily_unit_readings")
          .select("reading_date,fleet_total,kwh")
          .order("reading_date", { ascending: false })
          .limit(50),
        supabase
          .from("sceco_monthly_bills")
          .select("year,month,kwh")
          .order("year", { ascending: true }),
      ]);

      // Aggregate latest day (sum of unit kwh; fleet_total repeats per row)
      if (dayRows && dayRows.length) {
        const latest = (dayRows as DayRow[])[0].reading_date;
        const sameDay = (dayRows as DayRow[]).filter(r => r.reading_date === latest);
        const ft = sameDay[0].fleet_total;
        const kwh = ft != null ? Number(ft) : sameDay.reduce((a, r) => a + Number(r.kwh ?? 0), 0);
        setLatestDay({ date: latest, kwh });
      }
      setBills((billRows ?? []) as BillRow[]);
      setLoading(false);
    })();
  }, []);

  // ── Today's emissions (real) ────────────────────────────────────────────
  const tonsToday = latestDay ? (latestDay.kwh * GRID_EMISSION_FACTOR_KGCO2_PER_KWH) / 1000 : 0;

  // ── Annual avoided (locked savings × factor) ───────────────────────────
  const annualAvoidedKwh = LockedFinancials.weatherAdjustedEnergyAvoided; // 102,194
  const annualAvoidedTons = (annualAvoidedKwh * GRID_EMISSION_FACTOR_KGCO2_PER_KWH) / 1000; // ≈ 66.43

  // ── Monthly trend: emitted from sceco bills; avoided allocated pro-rata ─
  const last12 = bills.slice(-12);
  const totalConsumed = last12.reduce((a, b) => a + Number(b.kwh ?? 0), 0) || 1;
  // Scale annual avoided to the window covered by `last12` proportionally
  const windowAvoidedKwh = annualAvoidedKwh * (last12.length / 12);
  const monthlyTrend = last12.map(b => {
    const consumed = Number(b.kwh ?? 0);
    const share = consumed / totalConsumed;
    const emittedT = (consumed * GRID_EMISSION_FACTOR_KGCO2_PER_KWH) / 1000;
    const avoidedT = (share * windowAvoidedKwh * GRID_EMISSION_FACTOR_KGCO2_PER_KWH) / 1000;
    return {
      label: `${b.month} ${String(b.year).slice(2)}`,
      emitted: Number(emittedT.toFixed(2)),
      avoided: Number(avoidedT.toFixed(2)),
    };
  });

  // ── Per-site / per-unit intensity (we have ONE site: Jarir Rawdah) ─────
  // Per-unit annual consumption from latest fleet ÷ units is unavailable; use
  // last-12-months sum of metered SCECO consumption (the 7 SCC panels' aggregate).
  const annualConsumed = last12.reduce((a, b) => a + Number(b.kwh ?? 0), 0);
  const siteEmittedTons = (annualConsumed * GRID_EMISSION_FACTOR_KGCO2_PER_KWH) / 1000;
  const perBuilding = [
    {
      site: "Jarir Rawdah — 7 SCC Units",
      total: Number(siteEmittedTons.toFixed(1)),
      intensity: annualConsumed ? Number((siteEmittedTons * 1000 / annualConsumed).toFixed(3)) : 0,
    },
  ];

  const countEmitted = useCountUp({ end: Math.round(tonsToday * 100), duration: 1200 });
  const countAvoided = useCountUp({ end: Math.round(annualAvoidedTons * 100), duration: 1500 });

  const handleExport = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>ESG Carbon Report</title><style>body{font-family:system-ui;padding:40px;max-width:800px;margin:0 auto}h1{color:#22c55e;border-bottom:2px solid #22c55e;padding-bottom:8px}.kpi{display:flex;gap:24px;margin:20px 0}.kpi-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;flex:1}.kpi-value{font-size:24px;font-weight:800;color:#22c55e}.kpi-label{font-size:12px;color:#64748b}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0}th{background:#f1f5f9;font-size:12px;text-transform:uppercase;color:#64748b}.footer{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center}</style></head><body><h1>🌿 ESG Carbon Intelligence Report</h1><p style="color:#64748b">Generated: ${new Date().toLocaleDateString()} • Jarir Rawdah • Grid factor ${GRID_EMISSION_FACTOR_KGCO2_PER_KWH} kgCO₂/kWh</p><div class="kpi"><div class="kpi-card"><div class="kpi-value">${tonsToday.toFixed(2)} t</div><div class="kpi-label">CO₂ Emitted (latest day: ${latestDay?.date ?? "—"})</div></div><div class="kpi-card"><div class="kpi-value">${annualAvoidedTons.toFixed(2)} t</div><div class="kpi-label">CO₂ Avoided (annual, locked)</div></div></div><h2>Site Intensity</h2><table><tr><th>Site</th><th>CO₂ (t/yr)</th><th>Intensity (kgCO₂/kWh)</th></tr>${perBuilding.map(b => `<tr><td>${b.site}</td><td>${b.total}</td><td>${b.intensity}</td></tr>`).join("")}</table><div class="footer">DC Evolve — ESG Compliance Report</div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              Carbon Intelligence
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time emissions tracking — derived from live meter data ×{" "}
              <span className="font-mono">{GRID_EMISSION_FACTOR_KGCO2_PER_KWH}</span> kgCO₂/kWh (Saudi grid factor)
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> Export ESG Report
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: `CO₂ Emitted (${latestDay?.date ?? "latest day"})`,
              value: `${(countEmitted / 100).toFixed(2)} t`,
              sub: latestDay ? `${latestDay.kwh.toLocaleString()} kWh × ${GRID_EMISSION_FACTOR_KGCO2_PER_KWH}` : "No data",
              icon: Factory,
              gradient: "gradient-warning",
            },
            {
              label: "Annual CO₂ Avoided (locked)",
              value: `${(countAvoided / 100).toFixed(2)} t`,
              sub: `${annualAvoidedKwh.toLocaleString()} kWh × ${GRID_EMISSION_FACTOR_KGCO2_PER_KWH}`,
              icon: Leaf,
              gradient: "gradient-savings",
            },
            {
              label: "Site CO₂ (last 12 mo, metered)",
              value: `${siteEmittedTons.toFixed(1)} t`,
              sub: `${Math.round(annualConsumed).toLocaleString()} kWh consumed`,
              icon: TrendingDown,
              gradient: "gradient-energy",
            },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${kpi.gradient}`} />
                <CardContent className="pt-5 pb-4 relative">
                  <kpi.icon className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{loading ? "…" : kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">{kpi.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-3 flex gap-3 items-start">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Method:</span> CO₂ = kWh × grid emission factor.
              Saudi grid range per credible sources: <span className="font-mono">0.52</span> (IEA) to{" "}
              <span className="font-mono">0.65</span> (operational baseline) kgCO₂/kWh. We use{" "}
              <span className="font-mono">{GRID_EMISSION_FACTOR_KGCO2_PER_KWH}</span> (conservative). Avoided CO₂ uses
              the TDE-verified locked savings basis ({annualAvoidedKwh.toLocaleString()} kWh/yr). Monthly emitted comes
              from <span className="font-mono">sceco_monthly_bills</span>; daily from{" "}
              <span className="font-mono">daily_unit_readings.fleet_total</span>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carbon Reduction Trend</CardTitle>
            <CardDescription>
              Monthly CO₂ emitted (from metered kWh) vs CO₂ avoided (locked annual ÷ month, weighted by consumption)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No monthly bill data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} label={{ value: "tCO₂", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 } }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => `${v} tCO₂`} />
                  <Bar dataKey="emitted" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="CO₂ Emitted" opacity={0.5} />
                  <Bar dataKey="avoided" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="CO₂ Avoided" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carbon Intensity by Site</CardTitle>
            <CardDescription>
              Portfolio currently contains one monitored site. Additional sites will appear as they onboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {perBuilding.map(b => (
                <div key={b.site} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{b.site}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Intensity: {b.intensity} kgCO₂/kWh • Period: trailing {last12.length} months
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono">{b.total} tCO₂</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}