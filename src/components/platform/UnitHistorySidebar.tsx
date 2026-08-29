import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, TrendingDown, TrendingUp, RefreshCw } from "lucide-react";
import { unitMonthlyData2025, unitInfo, unitAnnualTotals } from "@/data/unitMonthlyData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UnitKey = "G1" | "G2" | "G3" | "F1" | "F2" | "F3" | "F4" | "G8";
const UNITS: UnitKey[] = ["G1", "G2", "G3", "F1", "F2", "F3", "F4", "G8"];

interface Props {
  trigger?: React.ReactNode;
}

export function UnitHistorySidebar({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<UnitKey>("G1");
  const [daily, setDaily] = useState<{ reading_date: string; kwh: number | null; status: string | null }[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Sidebar unit -> sheet unit (F1 <-> FF1)
  const sheetUnit = (u: UnitKey) => (u.startsWith("F") && u !== "G8" ? `F${u.slice(1)}` : u).replace(/^F(\d)$/, "FF$1");

  const [liveMonths, setLiveMonths] = useState<{ label: string; kwh: number; days: number }[]>([]);

  const loadDaily = useCallback(async (u: UnitKey) => {
    setLoadingDaily(true);
    const unit = sheetUnit(u);
    const [recent, all] = await Promise.all([
      supabase
        .from("daily_unit_readings")
        .select("reading_date,kwh,status")
        .eq("unit", unit)
        .order("reading_date", { ascending: false })
        .limit(60),
      supabase
        .from("daily_unit_readings")
        .select("reading_date,kwh")
        .eq("unit", unit)
        .gt("reading_date", "2026-02-28")
        .order("reading_date", { ascending: true })
        .limit(2000),
    ]);
    if (recent.error) console.error(recent.error);
    setDaily(recent.data ?? []);

    // Roll up post-Feb-2026 days into monthly totals
    const buckets = new Map<string, { kwh: number; days: number }>();
    for (const r of all.data ?? []) {
      if (r.kwh == null) continue;
      const key = r.reading_date.slice(0, 7);
      const b = buckets.get(key) ?? { kwh: 0, days: 0 };
      b.kwh += Number(r.kwh);
      b.days += 1;
      buckets.set(key, b);
    }
    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    setLiveMonths(
      [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({
        label: `${MONTHS[Number(k.slice(5, 7)) - 1]} '${k.slice(2, 4)}`,
        kwh: v.kwh,
        days: v.days,
      })),
    );
    setLoadingDaily(false);
  }, []);

  useEffect(() => {
    if (open) loadDaily(active);
  }, [open, active, loadDaily]);


  const handleSync = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke("sync-gsheet", { method: "POST" });
    setSyncing(false);
    if (error || !data?.ok) {
      toast.error("Sync failed", { description: error?.message ?? data?.error });
      return;
    }
    setLastSync(new Date().toLocaleTimeString());
    toast.success("Synced from Google Sheet", {
      description: `${data.synced?.daily_unit_readings ?? 0} daily rows · ${data.synced?.sceco_monthly_bills ?? 0} bills`,
    });
    loadDaily(active);
  };

  const staticSeries = unitMonthlyData2025.map(m => ({
    month: m.month.replace(" 2024", " '24").replace(" 2026", " '26"),
    kWh: m[active],
    days: null as number | null,
  }));

  // Live monthly rollup from daily_unit_readings for months after the static history ends
  const liveSeries = liveMonths.map(m => ({ month: m.label, kWh: Math.round(m.kwh), days: m.days }));
  const series = [...staticSeries, ...liveSeries];

  const total = series.reduce((a, b) => a + b.kWh, 0);
  const peak = series.reduce((a, b) => (b.kWh > a.kWh ? b : a), series[0]);
  const min = series.reduce((a, b) => (b.kWh < a.kWh ? b : a), series[0]);
  const annual = unitAnnualTotals[active as keyof typeof unitAnnualTotals] as number;


  // YoY: Jan/Feb 2026 vs Jan/Feb 2025
  const jan25 = unitMonthlyData2025.find(m => m.month === "January")?.[active] ?? 0;
  const jan26 = unitMonthlyData2025.find(m => m.month === "January 2026")?.[active] ?? 0;
  const feb25 = unitMonthlyData2025.find(m => m.month === "February")?.[active] ?? 0;
  const feb26 = unitMonthlyData2025.find(m => m.month === "February 2026")?.[active] ?? 0;
  const janDelta = jan25 ? ((jan26 - jan25) / jan25) * 100 : 0;
  const febDelta = feb25 ? ((feb26 - feb25) / feb25) * 100 : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <History className="mr-1.5 h-3.5 w-3.5 text-energy" />
            Unit History
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[520px] sm:w-[560px] bg-background border-border overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <History className="h-5 w-5 text-energy" />
            Per-Unit Monthly History
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Dec 2024 – Feb 2026 · kWh per billing cycle · Jarir Bookstore Rawdah
          </p>
        </SheetHeader>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2">
          <div className="text-[10px] text-muted-foreground">
            Live sync · Google Sheet
            {lastSync && <span className="ml-2 font-mono">last: {lastSync}</span>}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`mr-1.5 h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync now"}
          </Button>
        </div>

        <Tabs value={active} onValueChange={v => setActive(v as UnitKey)} className="mt-4">
          <TabsList className="grid grid-cols-8 h-8">
            {UNITS.map(u => (
              <TabsTrigger key={u} value={u} className="text-[11px] font-mono">
                {u}
              </TabsTrigger>
            ))}
          </TabsList>

          {UNITS.map(u => (
            <TabsContent key={u} value={u} className="mt-4 space-y-4">
              <div className="rounded-md border border-border bg-secondary/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {u === "G8" ? "Derived (non-SCC)" : "Metered SCC Panel"}
                </div>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {unitInfo[u].location}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {unitInfo[u].notes}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border border-border p-2">
                  <div className="text-[9px] uppercase text-muted-foreground">Annual 2025</div>
                  <div className="font-mono text-sm font-bold">{annual.toLocaleString()}</div>
                  <div className="text-[9px] text-muted-foreground">kWh</div>
                </div>
                <div className="rounded-md border border-border p-2">
                  <div className="text-[9px] uppercase text-muted-foreground">Peak</div>
                  <div className="font-mono text-sm font-bold">{peak.kWh.toLocaleString()}</div>
                  <div className="text-[9px] text-muted-foreground">{peak.month}</div>
                </div>
                <div className="rounded-md border border-border p-2">
                  <div className="text-[9px] uppercase text-muted-foreground">Min</div>
                  <div className="font-mono text-sm font-bold">{min.kWh.toLocaleString()}</div>
                  <div className="text-[9px] text-muted-foreground">{min.month}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-border p-2">
                  <div className="text-[9px] uppercase text-muted-foreground">Jan YoY</div>
                  <div className="flex items-center gap-1.5">
                    {janDelta < 0 ? <TrendingDown className="h-3.5 w-3.5 text-savings" /> : <TrendingUp className="h-3.5 w-3.5 text-warning" />}
                    <span className={`font-mono text-sm font-bold ${janDelta < 0 ? "text-savings" : "text-warning"}`}>
                      {janDelta > 0 ? "+" : ""}{janDelta.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono">
                    {jan25.toLocaleString()} → {jan26.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-md border border-border p-2">
                  <div className="text-[9px] uppercase text-muted-foreground">Feb YoY</div>
                  <div className="flex items-center gap-1.5">
                    {febDelta < 0 ? <TrendingDown className="h-3.5 w-3.5 text-savings" /> : <TrendingUp className="h-3.5 w-3.5 text-warning" />}
                    <span className={`font-mono text-sm font-bold ${febDelta < 0 ? "text-savings" : "text-warning"}`}>
                      {febDelta > 0 ? "+" : ""}{febDelta.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono">
                    {feb25.toLocaleString()} → {feb26.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-border bg-card p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Monthly Consumption Trend
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={series} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={1} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        fontSize: 11,
                      }}
                      formatter={(v: number) => [`${v.toLocaleString()} kWh`, u]}
                    />
                    <Line
                      type="monotone"
                      dataKey="kWh"
                      stroke="hsl(var(--energy))"
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <ScrollArea className="h-[260px] rounded-md border border-border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                    <tr className="border-b border-border">
                      <th className="text-left px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Month</th>
                      <th className="text-right px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">kWh</th>
                      <th className="text-right px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">% of total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {series.map(row => (
                      <tr key={row.month} className="border-b border-border/50 hover:bg-secondary/40">
                        <td className="px-3 py-1.5 font-medium">
                          {row.month}
                          {row.days != null && row.days < 28 && (
                            <span className="ml-1.5 text-[9px] text-warning">partial · {row.days}d</span>
                          )}
                        </td>

                        <td className="px-3 py-1.5 text-right font-mono">{row.kWh.toLocaleString()}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                          {((row.kWh / total) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>

              {u === "G8" && (
                <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">
                  Derived value — excluded from SCC savings
                </Badge>
              )}

              <div className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Daily History (Live · last 60 days)
                  </div>
                  <Badge variant="outline" className="text-[9px]">{daily.length} rows</Badge>
                </div>
                <ScrollArea className="h-[220px]">
                  {loadingDaily ? (
                    <div className="text-[11px] text-muted-foreground py-6 text-center">Loading…</div>
                  ) : daily.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground py-6 text-center">
                      No data yet. Click "Sync now".
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                        <tr className="border-b border-border">
                          <th className="text-left px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Date</th>
                          <th className="text-right px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">kWh</th>
                          <th className="text-right px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daily.map(row => (
                          <tr key={row.reading_date} className="border-b border-border/50 hover:bg-secondary/40">
                            <td className="px-3 py-1.5 font-mono text-[11px]">{row.reading_date}</td>
                            <td className="px-3 py-1.5 text-right font-mono">
                              {row.kwh != null ? Number(row.kwh).toFixed(2) : "—"}
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              {row.status === "ALERT" ? (
                                <span className="text-warning text-[10px]">ALERT</span>
                              ) : (
                                <span className="text-savings text-[10px]">{row.status ?? "—"}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}