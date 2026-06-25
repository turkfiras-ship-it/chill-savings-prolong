import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useWeatherFactor } from "@/hooks/useWeatherFactor";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const chartTooltipStyle = {
  background: "hsl(222, 40%, 9%)",
  border: "1px solid hsl(215, 20%, 16%)",
  borderRadius: 8,
  fontSize: 12,
};
const gridStroke = "hsl(215, 20%, 16%)";
const tickStyle = { fontSize: 10, fill: "hsl(215, 15%, 55%)" };

type Row = { year: number; month: string; kwh: number | null };

export function ExpectedVsActualChart() {
  const [rows, setRows] = useState<Row[]>([]);
  const [year, setYear] = useState<2024 | 2025 | 2026>(2025);
  const [loading, setLoading] = useState(true);
  const wf = useWeatherFactor();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("sceco_monthly_bills")
        .select("year, month, kwh");
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const factorFor = (y: number): number => {
    if (y === 2024) return 1;
    if (y === 2025) return wf.locked.factor; // locked 1.1262
    // 2026 — live in-progress, fall back to locked if unavailable
    return wf.live?.factor ?? wf.locked.factor;
  };

  const baseline2024 = useMemo(() => {
    const map = new Map<string, number>();
    rows.filter(r => r.year === 2024 && r.kwh != null).forEach(r => map.set(r.month, Number(r.kwh)));
    return map;
  }, [rows]);

  const actualForYear = useMemo(() => {
    const map = new Map<string, number>();
    rows.filter(r => r.year === year && r.kwh != null).forEach(r => map.set(r.month, Number(r.kwh)));
    return map;
  }, [rows, year]);

  const factor = factorFor(year);

  const chartData = useMemo(() => {
    return MONTHS.map(m => {
      const actual = actualForYear.get(m);
      const base = baseline2024.get(m);
      const expected = base != null ? Math.round(base * factor) : null;
      // Saved area only where actual < expected
      const saved =
        actual != null && expected != null && actual < expected ? expected - actual : 0;
      return {
        month: m,
        actual: actual ?? null,
        expected: expected ?? null,
        // floor at actual so the stacked area visually fills the gap
        actualFloor: actual ?? null,
        savedGap: saved,
      };
    });
  }, [actualForYear, baseline2024, factor]);

  const totals = useMemo(() => {
    let actual = 0;
    let expected = 0;
    let saved = 0;
    let months = 0;
    chartData.forEach(d => {
      if (d.actual != null && d.expected != null) {
        actual += d.actual;
        expected += d.expected;
        saved += Math.max(0, d.expected - d.actual);
        months += 1;
      }
    });
    return { actual, expected, saved, months };
  }, [chartData]);

  const factorLabel =
    year === 2024
      ? "1.0000 (baseline)"
      : year === 2025
      ? `${wf.locked.factor.toFixed(4)} (locked study)`
      : `${(wf.live?.factor ?? wf.locked.factor).toFixed(4)} (in-progress)`;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-medium">
              Expected vs Actual Consumption — Weather-Normalized
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-2xl">
              Expected = 2024 actual monthly kWh × that year's weather-normalization factor (what
              consumption <em>should</em> have been given how much hotter the year was). Shaded
              area = weather-normalized savings (months where actual &lt; expected). Source:
              sceco_monthly_bills + cooling-season factor.
            </p>
          </div>
          <div className="flex gap-1">
            {[2024, 2025, 2026].map(y => (
              <Button
                key={y}
                size="sm"
                variant={year === y ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => setYear(y as 2024 | 2025 | 2026)}
              >
                {y}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="text-[10px]">Factor: {factorLabel}</Badge>
          <Badge variant="outline" className="text-[10px]">
            Months w/ data: {totals.months}
          </Badge>
          <Badge variant="outline" className="text-[10px] text-savings">
            Actual: {totals.actual.toLocaleString()} kWh
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Expected: {totals.expected.toLocaleString()} kWh
          </Badge>
          <Badge className="text-[10px] bg-savings/20 text-savings border-savings/40">
            Weather-normalized savings: {totals.saved.toLocaleString()} kWh
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[320px] flex items-center justify-center text-xs text-muted-foreground">
            Loading…
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(v: number | null | undefined, name: string) => {
                    if (v == null) return ["—", name];
                    return [`${Math.round(v).toLocaleString()} kWh`, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {/* Invisible floor stack so the "savings" area renders ON TOP of actual */}
                <Area
                  type="monotone"
                  dataKey="actualFloor"
                  stackId="gap"
                  stroke="transparent"
                  fill="transparent"
                  legendType="none"
                  name=""
                />
                <Area
                  type="monotone"
                  dataKey="savedGap"
                  stackId="gap"
                  stroke="hsl(152, 60%, 48%)"
                  strokeWidth={0}
                  fill="url(#savedGrad)"
                  name="Weather-normalized savings"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="expected"
                  stroke="hsl(38, 92%, 60%)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3 }}
                  name="Expected (2024 × factor)"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(192, 80%, 55%)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Actual"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-muted-foreground mt-2">
              {year === 2024 &&
                "2024 is the pre-SCC baseline year. Expected = Actual by definition (factor 1.0)."}
              {year === 2025 &&
                `In 2025 the Expected line sits ABOVE Actual — weather demanded ~${totals.expected.toLocaleString()} kWh, but the system held actual consumption to ${totals.actual.toLocaleString()} kWh. The shaded gap (${totals.saved.toLocaleString()} kWh) is the weather-normalized savings.`}
              {year === 2026 &&
                `2026 is in-progress — only ${totals.months} months of bills available. Factor is the live cooling-season figure and finalizes after Oct 31, 2026.`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ExpectedVsActualChart;