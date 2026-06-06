import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { RefreshCw, CalendarDays, TrendingDown, Database } from "lucide-react";
import { PageTransition } from "@/components/platform/PageTransition";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnitHistorySidebar } from "@/components/platform/UnitHistorySidebar";
import { unitMonthlyData2025 } from "@/data/unitMonthlyData";
import { LockedFinancials } from "@/data/lockedPerformanceModel";

// Sheet uses FF1..FF4 for first-floor units. UI uses F1..F4.
const UI_UNITS = ["G1", "G2", "G3", "F1", "F2", "F3", "F4"] as const;
const fromSheetUnit = (u: string) => (u.startsWith("FF") ? `F${u.slice(2)}` : u);

type DailyRow = { reading_date: string; unit: string; kwh: number | null; status: string | null };

const DAILY_START = "2026-05-14";
const AVOIDED_RATE = LockedFinancials.directEnergySavingsSAR / 102000; // ~0.409 SAR/kWh

export default function MonitoringPage() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_unit_readings")
      .select("reading_date,unit,kwh,status")
      .gte("reading_date", DAILY_START)
      .order("reading_date", { ascending: true });
    if (error) console.error(error);
    setRows((data ?? []).map((r: any) => ({ ...r, unit: fromSheetUnit(r.unit) })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const syncNow = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke("sync-gsheet", { method: "POST" });
    setSyncing(false);
    if (error || !data?.ok) {
      toast({ title: "Sync failed", description: error?.message ?? data?.error, variant: "destructive" });
      return;
    }
    toast({ title: "Sheet synced", description: `${data.synced?.daily_unit_readings ?? 0} daily rows pulled` });
    load();
  };

  const dailyByDate = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const r of rows) {
      if (r.kwh == null) continue;
      if (!map.has(r.reading_date)) map.set(r.reading_date, {});
      map.get(r.reading_date)![r.unit] = Number(r.kwh);
    }
    return Array.from(map.entries())
      .map(([date, units]) => {
        const total = UI_UNITS.reduce((s, u) => s + (units[u] ?? 0), 0);
        return { date, total, ...units } as any;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  const alertCount = rows.filter(r => r.status === "ALERT").length;
  const latest = dailyByDate.at(-1);
  const prev = dailyByDate.at(-2);
  const last7 = dailyByDate.slice(-7);
  const avg7 = last7.length ? last7.reduce((s, d) => s + d.total, 0) / last7.length : 0;
  const mtd = dailyByDate.filter(d => d.date.startsWith(latest?.date.slice(0, 7) ?? "")).reduce((s, d) => s + d.total, 0);

  // Operational benchmark: 2025 (post-install) May/Jun daily avg.
  const may2025 = unitMonthlyData2025.find(m => m.month === "May")?.total ?? 0;
  const jun2025 = unitMonthlyData2025.find(m => m.month === "June")?.total ?? 0;
  const baseDailyMay = may2025 / 31;
  const baseDailyJun = jun2025 / 30;
  const latestVsBaseline = latest
    ? ((latest.total - (latest.date.slice(5, 7) === "05" ? baseDailyMay : baseDailyJun)) /
        (latest.date.slice(5, 7) === "05" ? baseDailyMay : baseDailyJun)) * 100
    : 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Operations Monitoring</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Daily per-unit consumption · Synced from metering sheet · Window: {DAILY_START} → today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UnitHistorySidebar />
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={syncNow} disabled={syncing}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 text-energy ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync now"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiTile label="Latest day kWh" value={latest ? Math.round(latest.total).toLocaleString() : "—"} sub={latest?.date ?? "no data"} />
          <KpiTile
            label="vs Previous day"
            value={latest && prev ? `${(((latest.total - prev.total) / prev.total) * 100).toFixed(1)}%` : "—"}
            sub={prev?.date ?? "—"}
            tone={latest && prev ? (latest.total < prev.total ? "good" : "bad") : "neutral"}
          />
          <KpiTile label="7-day avg" value={`${Math.round(avg7).toLocaleString()} kWh`} sub={`${last7.length} days`} />
          <KpiTile label="MTD total" value={`${Math.round(mtd).toLocaleString()} kWh`} sub={`SAR ${Math.round(mtd * AVOIDED_RATE).toLocaleString()} avoided-rate`} />
          <KpiTile
            label="vs 2025 daily avg"
            value={latest ? `${latestVsBaseline >= 0 ? "+" : ""}${latestVsBaseline.toFixed(1)}%` : "—"}
            sub="post-install benchmark"
            tone={latestVsBaseline < 0 ? "good" : "bad"}
          />
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily" className="text-xs"><CalendarDays className="h-3.5 w-3.5 mr-1.5" />Daily operations</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs"><Database className="h-3.5 w-3.5 mr-1.5" />Monthly history</TabsTrigger>
            <TabsTrigger value="savings" className="text-xs"><TrendingDown className="h-3.5 w-3.5 mr-1.5" />Baseline vs performance</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Daily total — all 7 SCC panels</CardTitle>
                <Badge variant="outline" className="text-[10px]">{dailyByDate.length} days · {alertCount} alerts</Badge>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">Loading…</div>
                ) : dailyByDate.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">
                    No daily data yet — click "Sync now".
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dailyByDate} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                        formatter={(v: number) => [`${Math.round(v).toLocaleString()} kWh`, "Total"]}
                      />
                      <Bar dataKey="total" fill="hsl(var(--energy))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Per-unit daily kWh</CardTitle></CardHeader>
              <CardContent>
                {!loading && (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={dailyByDate} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {UI_UNITS.map((u, i) => (
                        <Line key={u} type="monotone" dataKey={u} stroke={`hsl(${(i * 50) % 360} 70% 55%)`} strokeWidth={1.5} dot={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Daily readings table</CardTitle></CardHeader>
              <CardContent>
                <div className="max-h-[360px] overflow-auto rounded-md border border-border">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                      <tr className="border-b border-border">
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Date</th>
                        {UI_UNITS.map(u => (
                          <th key={u} className="text-right px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">{u}</th>
                        ))}
                        <th className="text-right px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...dailyByDate].reverse().map(d => (
                        <tr key={d.date} className="border-b border-border/40 hover:bg-secondary/40">
                          <td className="px-3 py-1.5 font-mono">{d.date}</td>
                          {UI_UNITS.map(u => (
                            <td key={u} className="px-2 py-1.5 text-right font-mono">
                              {(d as any)[u] != null ? Math.round((d as any)[u]).toLocaleString() : "—"}
                            </td>
                          ))}
                          <td className="px-3 py-1.5 text-right font-mono font-semibold">{Math.round(d.total).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Monthly history · Dec 2024 → Feb 2026</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={unitMonthlyData2025} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="total" fill="hsl(var(--energy))" name="7 SCC panels" />
                    <Bar dataKey="G8" fill="hsl(var(--warning))" name="G8 derived" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2">
                  G8 = SCECO bill total minus the 7 metered SCC panels (uncontrolled loads). Daily granularity only available from {DAILY_START}.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="savings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <KpiTile label="2024 baseline" value="220,028 SAR" sub="Pre-install bill (annual)" />
              <KpiTile label="2025 with smart system" value="−17.3%" sub="Verified efficiency vs 2024 baseline" tone="good" />
              <KpiTile label="Direct energy savings" value="33,286 SAR" sub="Weather-normalized · LockedPerformanceModel" tone="good" />
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Annual bill — Baseline vs Performance year (TDE-audited, w/o VAT)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={[
                      { year: "May-24 → Apr-25 (baseline)", bill: LockedFinancials.actualBill2024 },
                      { year: "May-25 → Apr-26 (smart system)", bill: LockedFinancials.actualBill2025 },
                    ]}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                      formatter={(v: number) => [`${v.toLocaleString()} SAR`, "Annual bill"]}
                    />
                    <Bar dataKey="bill" fill="hsl(var(--energy))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2">
                  2025 savings of 17.3% (weather-normalized) reflect the smart cooling-control system deployed across the 7 SCC panels. 2026 daily ingestion (from {DAILY_START}) extends this verification into the current operating year.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function KpiTile({ label, value, sub, tone = "neutral" }: { label: string; value: string; sub?: string; tone?: "good" | "bad" | "neutral" }) {
  const color = tone === "good" ? "text-savings" : tone === "bad" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg font-bold tabular-nums mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
