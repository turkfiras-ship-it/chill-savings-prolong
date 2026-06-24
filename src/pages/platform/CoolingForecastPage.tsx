import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudSun, Thermometer, Zap, Banknote, Info } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCoolingIntel, SAR_PER_KWH, CDD_BASE_C } from "@/hooks/useCoolingIntel";

export default function CoolingForecastPage() {
  const intel = useCoolingIntel();

  if (intel.loading) {
    return <PageTransition><div className="p-8 text-sm text-muted-foreground">Loading forecast…</div></PageTransition>;
  }
  if (!intel.forecast.length) {
    return <PageTransition><div className="p-8 text-sm text-destructive">No forecast data — Open-Meteo unreachable.</div></PageTransition>;
  }

  const totalKwh = intel.forecast.reduce((s, d) => s + d.projectedKwh, 0);
  const totalSar = intel.forecast.reduce((s, d) => s + d.projectedSar, 0);
  const peakKwh = Math.max(...intel.forecast.map(d => d.projectedKwh));
  const peakDay = intel.forecast.find(d => d.projectedKwh === peakKwh);
  const chartData = intel.forecast.map(d => ({
    day: d.date.slice(5),
    tMax: d.tMax,
    tMean: d.tMean,
    cdd: Number(d.cdd.toFixed(1)),
    kwh: Math.round(d.projectedKwh),
    sar: Math.round(d.projectedSar),
  }));

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CloudSun className="h-6 w-6 text-accent" />
              Cooling Demand Forecast
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              7-day projection — Open-Meteo forecast at Rawdah coords × site historical {intel.kwhPerCdd.toFixed(1)} kWh per CDD-day
            </p>
          </div>
          <Badge variant="outline" className="text-xs">Forecast / projection — not actual</Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Peak Projected Day", value: peakDay ? `${Math.round(peakKwh).toLocaleString()} kWh` : "—", sub: peakDay?.date ?? "", icon: Zap },
            { label: "7-Day Total kWh", value: Math.round(totalKwh).toLocaleString(), sub: "Projected fleet load", icon: CloudSun },
            { label: "7-Day Total SAR", value: `﷼ ${Math.round(totalSar).toLocaleString()}`, sub: `@ ${SAR_PER_KWH} SAR/kWh`, icon: Banknote },
            { label: "Avg Forecast Mean Temp", value: `${(intel.forecast.reduce((s, d) => s + d.tMean, 0) / intel.forecast.length).toFixed(1)}°C`, sub: `CDD base ${CDD_BASE_C}°C`, icon: Thermometer },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="pt-5 pb-4 relative">
                  <kpi.icon className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">7-Day Projected kWh vs Max Temperature</CardTitle>
            <CardDescription>Bars: projected fleet kWh • Line: forecast max °C</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="kw" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis yAxisId="temp" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar yAxisId="kw" dataKey="kwh" radius={[4, 4, 0, 0]} name="Projected kWh" opacity={0.85}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.tMax >= (intel.baseline2024?.p90Max ?? 45) ? "hsl(var(--destructive))" : d.tMax >= 42 ? "hsl(var(--warning))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
                <Line yAxisId="temp" type="monotone" dataKey="tMax" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} name="Max °C" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Breakdown</CardTitle>
            <CardDescription>Forecast temps → CDD → projected fleet kWh & cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Max °C</th>
                    <th className="py-2 pr-3">Mean °C</th>
                    <th className="py-2 pr-3">CDD (base {CDD_BASE_C})</th>
                    <th className="py-2 pr-3">Projected kWh</th>
                    <th className="py-2 pr-3">Projected SAR</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {intel.forecast.map(d => (
                    <tr key={d.date} className="border-b border-border/40">
                      <td className="py-2 pr-3">{d.date}</td>
                      <td className="py-2 pr-3">{d.tMax.toFixed(1)}</td>
                      <td className="py-2 pr-3">{d.tMean.toFixed(1)}</td>
                      <td className="py-2 pr-3">{d.cdd.toFixed(1)}</td>
                      <td className="py-2 pr-3">{Math.round(d.projectedKwh).toLocaleString()}</td>
                      <td className="py-2 pr-3">﷼ {Math.round(d.projectedSar).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Method:</strong> daily forecast from Open-Meteo
              (<code>api.open-meteo.com/v1/forecast</code>) at {`24.7316, 46.7545`}.
              <code> CDD = max(0, mean − 18°C)</code>.
              Projected kWh = CDD × historical site ratio {intel.kwhPerCdd.toFixed(1)} kWh per CDD-day
              (derived from <code>daily_unit_readings</code> joined to <code>daily_weather_rawdah</code>).
              SAR uses {SAR_PER_KWH} SAR/kWh avg observed tariff. This is a projection — actuals will differ.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
