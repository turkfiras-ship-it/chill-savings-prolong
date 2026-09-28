import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { TEMP_SENSITIVITY } from "@/hooks/useWeatherNormalization";

const SUMMER = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const MNUM: Record<string, string> = { May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10" };
const SAR_PER_KWH = 0.32;
const fmt = (n: number) => Math.round(n).toLocaleString();

export function CoolingLoadCostImpact() {
  const [bills, setBills] = useState<Record<string, number>>({});
  const [temps, setTemps] = useState<Record<string, number>>({});
  const [bandPct, setBandPct] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [b, w] = await Promise.all([
        supabase.from("sceco_monthly_bills").select("year,month,kwh").in("year", [2024, 2026]),
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

  const calc = useMemo(() => {
    const months = SUMMER.filter((m) => bills[`2024-${m}`] && bills[`2026-${m}`]);
    if (!months.length) return null;
    const base = months.reduce((s, m) => s + bills[`2024-${m}`], 0);
    const actual = months.reduce((s, m) => s + bills[`2026-${m}`], 0);
    const t24 = months.reduce((s, m) => s + (temps[`2024-${MNUM[m]}`] ?? 0), 0) / months.length;
    const t26 = months.reduce((s, m) => s + (temps[`2026-${MNUM[m]}`] ?? 0), 0) / months.length;
    const delta = t26 - t24;
    const measuredPct = delta * TEMP_SENSITIVITY * 100;
    return { months, base, actual, t24, t26, delta, measuredPct, window: `${months[0]}–${months[months.length - 1]}` };
  }, [bills, temps]);

  if (!calc) return null;
  const pct = bandPct ?? calc.measuredPct;
  const expected = calc.base * (1 + pct / 100);
  const extraKwh = expected - calc.base;
  const extraSar = extraKwh * SAR_PER_KWH;
  const absorbed = expected - calc.actual;
  const actualIncrease = calc.actual - calc.base;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">Cooling Load Cost Impact vs Actual Savings — 2026 ({calc.window})</CardTitle>
          <Badge variant="outline" className="text-[10px]">Diagnostic · in progress</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="rounded-md border p-2">
            <div className="text-muted-foreground text-[10px]">Heat delta vs 2024</div>
            <div className="text-base font-semibold">+{calc.delta.toFixed(2)}°C</div>
            <div className="text-muted-foreground text-[10px]">{calc.t24.toFixed(1)} → {calc.t26.toFixed(1)}°C avg</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-muted-foreground text-[10px]">Load impact (measured)</div>
            <div className="text-base font-semibold">{calc.measuredPct.toFixed(1)}%</div>
            <div className="text-muted-foreground text-[10px]">9.7% per °C</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-muted-foreground text-[10px]">Expected extra cost</div>
            <div className="text-base font-semibold">{fmt(extraSar)} SAR</div>
            <div className="text-muted-foreground text-[10px]">{fmt(extraKwh)} kWh @ {pct.toFixed(1)}%</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-muted-foreground text-[10px]">Heat absorbed by system</div>
            <div className={`text-base font-semibold ${absorbed > 0 ? "text-primary" : "text-destructive"}`}>{fmt(absorbed)} kWh</div>
            <div className="text-muted-foreground text-[10px]">≈ {fmt(absorbed * SAR_PER_KWH)} SAR</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Load impact assumption</span>
            <span className="font-mono font-semibold">{pct.toFixed(1)}%</span>
          </div>
          <Slider
            value={[pct]}
            min={Math.max(0, calc.measuredPct - 3)}
            max={calc.measuredPct + 3}
            step={0.5}
            onValueChange={([v]) => setBandPct(v)}
          />
          <p className="text-[10px] text-muted-foreground">
            2025 precedent: 8–14% band at +1.3°C, 12% chosen. 2026 measured delta +{calc.delta.toFixed(2)}°C → ~{calc.measuredPct.toFixed(0)}% midpoint (band {(calc.measuredPct - 3).toFixed(0)}–{(calc.measuredPct + 3).toFixed(0)}%).
          </p>
        </div>

        <div className="rounded-md border p-3 space-y-1 text-xs font-mono">
          <div className="flex justify-between"><span className="text-muted-foreground">2024 baseline ({calc.window})</span><span>{fmt(calc.base)} kWh</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Expected with heat @ {pct.toFixed(1)}%</span><span>{fmt(expected)} kWh</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Actual 2026 billed</span><span>{fmt(calc.actual)} kWh</span></div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>Net position</span>
            <span className={absorbed > 0 ? "text-primary" : "text-destructive"}>
              {absorbed > 0
                ? `Still saving ${fmt(absorbed)} kWh (~${((absorbed / expected) * 100).toFixed(1)}%) after the heat`
                : `Running ${fmt(-absorbed)} kWh above weather-adjusted expectation`}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Actual increase vs 2024</span>
            <span>{fmt(actualIncrease)} kWh ({((actualIncrease / calc.base) * 100).toFixed(1)}%)</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Engineering estimate, not a locked figure. Expected extra cost = 2024 baseline kWh × load impact % × {SAR_PER_KWH} SAR/kWh,
          for elapsed 2026 cooling months only. Load impact scales 9.7% per °C of mean-temperature delta vs 2024 (Rawdah site
          temperatures). 2026 finalizes after Oct 31. G8 has no meter, isn't controlled by the system, and is included in the
          SCECO bill. Locked 2025 study figures (102,194 kWh / 32,702 SAR / 17.3%) are unchanged.
        </p>
      </CardContent>
    </Card>
  );
}
