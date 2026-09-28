import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { LOCKED_STUDY_FACTOR, TEMP_SENSITIVITY } from "@/hooks/useWeatherNormalization";

const SUMMER = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const MNUM: Record<string, string> = { May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10" };
const tip = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 };
const fmt = (n: number) => Math.round(n).toLocaleString();

export function YearOverYearNormalized() {
  const [bills, setBills] = useState<Record<string, number>>({});
  const [temps, setTemps] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const [b, w] = await Promise.all([
        supabase.from("sceco_monthly_bills").select("year,month,kwh").in("year", [2024, 2025, 2026]),
        supabase.from("daily_weather_rawdah" as any).select("date,mean_temp_c").gte("date", "2024-05-01"),
      ]);
      const bm: Record<string, number> = {};
      (b.data || []).forEach((r: any) => r.kwh != null && (bm[`${r.year}-${r.month}`] = Number(r.kwh)));
      const acc: Record<string, { s: number; n: number }> = {};
      ((w.data as any[]) || []).forEach((r) => {
        if (r.mean_temp_c == null) return;
        const k = r.date.slice(0, 7);
        acc[k] = acc[k] || { s: 0, n: 0 };
        acc[k].s += Number(r.mean_temp_c); acc[k].n++;
      });
      const tm: Record<string, number> = {};
      Object.entries(acc).forEach(([k, v]) => (tm[k] = v.s / v.n));
      setBills(bm); setTemps(tm);
    })();
  }, []);

  const data = useMemo(() => {
    // Only months with a full bill in BOTH comparison years
    return SUMMER.filter((m) => bills[`2024-${m}`] && bills[`2026-${m}`]).map((m) => {
      const base = bills[`2024-${m}`];
      const t24 = temps[`2024-${MNUM[m]}`];
      const f = (y: number) => {
        const t = temps[`${y}-${MNUM[m]}`];
        return t != null && t24 != null ? 1 + (t - t24) * TEMP_SENSITIVITY : 1;
      };
      const e25 = base * f(2025), e26 = base * f(2026);
      return {
        month: m, base,
        t24, t25: temps[`2025-${MNUM[m]}`], t26: temps[`2026-${MNUM[m]}`],
        a25: bills[`2025-${m}`] ?? 0, a26: bills[`2026-${m}`],
        e25, e26,
        s25: e25 - (bills[`2025-${m}`] ?? 0), s26: e26 - bills[`2026-${m}`],
      };
    });
  }, [bills, temps]);

  if (!data.length) return null;
  const sum = (k: keyof (typeof data)[0]) => data.reduce((s, r) => s + (r[k] as number), 0);
  const base = sum("base"), a25 = sum("a25"), a26 = sum("a26");
  const e25Locked = base * LOCKED_STUDY_FACTOR;
  const e26 = sum("e26");
  const s25 = e25Locked - a25, s26 = e26 - a26;
  const avg = (k: "t24" | "t25" | "t26") => data.reduce((s, r) => s + (r[k] ?? 0), 0) / data.length;
  const f26 = e26 / base;
  const window = `${data[0].month}–${data[data.length - 1].month}`;

  const cols = [
    { y: "2024 baseline", t: avg("t24"), f: 1, e: base, a: base, s: 0 },
    { y: "2025", t: avg("t25"), f: LOCKED_STUDY_FACTOR, e: e25Locked, a: a25, s: s25 },
    { y: "2026", t: avg("t26"), f: f26, e: e26, a: a26, s: s26 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">2026 vs 2025 — weather-normalized savings ({window})</CardTitle>
          <Badge variant="outline" className="text-[10px]">2026 in progress</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="text-muted-foreground">
              <tr><th className="text-left py-1"></th>{cols.map((c) => <th key={c.y} className="text-right py-1">{c.y}</th>)}</tr>
            </thead>
            <tbody>
              <tr><td className="py-1 text-muted-foreground">Avg temp</td>{cols.map((c) => <td key={c.y} className="text-right">{c.t.toFixed(1)}°C</td>)}</tr>
              <tr><td className="py-1 text-muted-foreground">Weather factor</td>{cols.map((c) => <td key={c.y} className="text-right">{c.f.toFixed(3)}</td>)}</tr>
              <tr><td className="py-1 text-muted-foreground">Expected kWh</td>{cols.map((c) => <td key={c.y} className="text-right">{fmt(c.e)}</td>)}</tr>
              <tr><td className="py-1 text-muted-foreground">Actual kWh</td>{cols.map((c) => <td key={c.y} className="text-right">{fmt(c.a)}</td>)}</tr>
              <tr className="font-semibold"><td className="py-1">Saving</td>{cols.map((c) => (
                <td key={c.y} className={`text-right ${c.s > 0 ? "text-primary" : c.s < 0 ? "text-destructive" : ""}`}>
                  {c.s === 0 ? "—" : `${fmt(c.s)} (${((c.s / c.e) * 100).toFixed(1)}%)`}
                </td>))}</tr>
            </tbody>
          </table>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={tip} formatter={(v: number) => `${fmt(v)} kWh`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
              <Bar dataKey="s25" name="2025 saved (+) / over (−)" fill="hsl(var(--muted-foreground))" />
              <Bar dataKey="s26" name="2026 saved (+) / over (−)" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Expected = 2024 bill × weather factor (+9.7% per °C hotter than 2024, Rawdah site temperatures). 2025 totals use the
          locked 1.1262 study factor; monthly bars use each month's own factor. Bars below zero are months where usage was
          higher than the heat explains. 2026 is still in progress: September and October are not billed yet. G8 has no meter,
          isn't controlled by the system, and is included in the SCECO bill.
        </p>
      </CardContent>
    </Card>
  );
}
