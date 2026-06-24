import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type Row = { date: string; mean_temp_c: number | null; sol_air_mean_c: number | null; solar_rad_mj: number | null };

const SENSITIVITY = 0.097; // 9.7 % per °C

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function compute(rows: Row[], year: number, months?: number[]) {
  const air: number[] = [];
  const sol: number[] = [];
  for (const r of rows) {
    const d = new Date(r.date + "T00:00:00Z");
    if (d.getUTCFullYear() !== year) continue;
    const m = d.getUTCMonth() + 1;
    if (months && !months.includes(m)) continue;
    if (r.mean_temp_c != null) air.push(Number(r.mean_temp_c));
    if (r.sol_air_mean_c != null) sol.push(Number(r.sol_air_mean_c));
  }
  return { air: avg(air), sol: avg(sol) };
}

export function WeatherCoordsDiagnostic() {
  const [rawdah, setRawdah] = useState<Row[]>([]);
  const [airport, setAirport] = useState<{ date: string; mean_temp_c: number | null }[]>([]);

  useEffect(() => {
    (async () => {
      const [a, b] = await Promise.all([
        supabase.from("daily_weather_rawdah").select("date,mean_temp_c,sol_air_mean_c,solar_rad_mj").order("date"),
        supabase.from("daily_weather").select("date,mean_temp_c").order("date"),
      ]);
      if (a.data) setRawdah(a.data as Row[]);
      if (b.data) setAirport(b.data as any);
    })();
  }, []);

  // Airport (OERK) — air only
  const airAir24 = avg(airport.filter(r => r.date.startsWith("2024") && r.mean_temp_c != null).map(r => Number(r.mean_temp_c)));
  const airAir25 = avg(airport.filter(r => r.date.startsWith("2025") && r.mean_temp_c != null).map(r => Number(r.mean_temp_c)));

  // Rawdah air + sol-air
  const r24 = compute(rawdah, 2024);
  const r25 = compute(rawdah, 2025);
  const rCool24 = compute(rawdah, 2024, [5, 6, 7, 8, 9, 10]);
  const rCool25 = compute(rawdah, 2025, [5, 6, 7, 8, 9, 10]);

  const rows = [
    {
      label: "Airport (OERK) — air temp, full year",
      a: airAir24, b: airAir25,
    },
    {
      label: "Rawdah site — air temp, full year",
      a: r24.air, b: r25.air,
    },
    {
      label: "Rawdah site — air temp, cooling May–Oct",
      a: rCool24.air, b: rCool25.air,
    },
    {
      label: "Rawdah site — sol-air adjusted, full year",
      a: r24.sol, b: r25.sol,
    },
    {
      label: "Rawdah site — sol-air adjusted, cooling May–Oct",
      a: rCool24.sol, b: rCool25.sol,
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          Coordinate &amp; Sol-Air Diagnostic — 2024 → 2025
        </CardTitle>
        <Badge variant="outline" className="text-[9px] border-warning/40 text-warning">
          Diagnostic — not the official factor
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left py-2 font-medium">Series</th>
                <th className="text-right py-2 font-medium">2024 avg (°C)</th>
                <th className="text-right py-2 font-medium">2025 avg (°C)</th>
                <th className="text-right py-2 font-medium">Δ (°C)</th>
                <th className="text-right py-2 font-medium">Factor (×)</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {rows.map((r) => {
                const delta = r.b - r.a;
                const factor = 1 + delta * SENSITIVITY;
                return (
                  <tr key={r.label} className="border-b border-border/40">
                    <td className="py-2 font-sans">{r.label}</td>
                    <td className="text-right py-2">{r.a.toFixed(2)}</td>
                    <td className="text-right py-2">{r.b.toFixed(2)}</td>
                    <td className={`text-right py-2 ${delta >= 1.2 ? "text-warning" : "text-muted-foreground"}`}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(3)}
                    </td>
                    <td className="text-right py-2 text-energy">{factor.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[10px] text-muted-foreground leading-relaxed space-y-1">
          <p>
            <span className="font-semibold text-foreground">Sol-air estimate:</span> T<sub>sol-air</sub> = T<sub>air</sub> + (α · I) / h<sub>o</sub>,
            using α = 0.7 (dark rooftop absorptance), h<sub>o</sub> = 25 W/m²·K, I from ERA5 daily shortwave radiation (MJ/m²/day, averaged to W/m²). Engineering approximation only — not a locked KPI.
          </p>
          <p>
            <span className="font-semibold text-foreground">Locked study reference:</span> +1.3 °C / factor 1.1262 — reproducible only on the cooling-season (May–Oct) window; full-year ERA5 at both Rawdah and OERK coords yields ~+0.7 °C. Rooftop sol-air does not close the gap because 2024 and 2025 had near-identical insolation (~20.9 MJ/m²/day).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}