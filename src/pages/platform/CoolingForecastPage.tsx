import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { coolingForecast7Day } from "@/data/autonomousMockData";
import { useGlobalWeather } from "@/context/WeatherContext";
import { CloudSun, Thermometer, Droplets, TrendingUp } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Area, AreaChart } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCountUp } from "@/hooks/useCountUp";

export default function CoolingForecastPage() {
  const { weather } = useGlobalWeather();
  const avgConfidence = Math.round(coolingForecast7Day.reduce((a, d) => a + d.confidence, 0) / coolingForecast7Day.length);
  const peakLoad = Math.max(...coolingForecast7Day.map(d => d.predicted));
  const countPeak = useCountUp({ end: peakLoad, duration: 1500 });
  const countConf = useCountUp({ end: avgConfidence, duration: 1500 });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-accent" />
            Cooling Demand Forecast AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">7-day cooling load prediction combining weather + historical patterns</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Peak Predicted Load", value: `${countPeak} kW`, icon: TrendingUp, gradient: "gradient-energy" },
            { label: "Forecast Confidence", value: `${countConf}%`, icon: CloudSun, gradient: "gradient-savings" },
            { label: "Current Temp", value: `${weather?.current?.temperature ? Math.round(weather.current.temperature) : 38}°C`, icon: Thermometer, gradient: "gradient-warning" },
            { label: "Humidity", value: `${weather?.current?.humidity ?? 45}%`, icon: Droplets, gradient: "gradient-energy" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${kpi.gradient}`} />
                <CardContent className="pt-5 pb-4 relative">
                  <kpi.icon className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">7-Day Cooling Demand Forecast</CardTitle>
            <CardDescription>Predicted vs actual kW load with temperature correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={coolingForecast7Day}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="kw" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis yAxisId="temp" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar yAxisId="kw" dataKey="predicted" radius={[4, 4, 0, 0]} name="Predicted kW" opacity={0.8}>
                  {coolingForecast7Day.map((d, i) => (
                    <Cell key={i} fill={d.predicted > 4500 ? "hsl(var(--destructive))" : d.predicted > 3800 ? "hsl(var(--warning))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
                {coolingForecast7Day.some(d => d.actual !== null) && (
                  <Bar yAxisId="kw" dataKey="actual" radius={[4, 4, 0, 0]} name="Actual kW" fill="hsl(var(--accent))" opacity={0.5} />
                )}
                <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} name="Temp °C" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Temperature Correlation</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={coolingForecast7Day}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.02} /></linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="temp" stroke="hsl(var(--destructive))" fill="url(#tempGrad)" strokeWidth={2} name="Temperature °C" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Confidence Levels</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coolingForecast7Day.map((d, i) => (
                  <motion.div key={d.day} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground w-8">{d.day}</span>
                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${d.confidence}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                    </div>
                    <span className="text-sm font-bold text-primary w-10 text-right">{d.confidence}%</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
