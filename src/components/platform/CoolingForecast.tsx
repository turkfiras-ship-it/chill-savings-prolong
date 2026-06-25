import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { estimateCoolingLoadMultiplier, getWeatherInfo } from "@/lib/weatherService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, TrendingUp, Zap, Snowflake } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { portfolioKPIs } from "@/data/mockData";
import { cn } from "@/lib/utils";

// Baseline daily consumption in kWh (portfolio average)
const DAILY_BASELINE_KWH = Math.round(portfolioKPIs.totalConsumption / 30);
const COST_PER_KWH = 0.30; // SAR

interface ForecastDay {
  date: string;
  tMax: number;
  tMin: number;
  tMean: number;
  solar: number;
  weatherCode?: number;
  precipitation?: number;
  cdd: number;
}

function useEdgeForecast() {
  const [days, setDays] = useState<ForecastDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("forecast-weather");
      if (error) throw error;
      if (!data?.days?.length) throw new Error("Empty forecast payload");
      setDays(data.days as ForecastDay[]);
    } catch (e: any) {
      setError(e?.message || "Failed to load forecast");
      setDays(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { days, loading, error, refresh: load };
}

export function CoolingForecast() {
  const { days, loading, error, refresh } = useEdgeForecast();

  if (loading || error || !days || !days.length) {
    const message = error
      ? `Forecast unavailable: ${error}`
      : loading
      ? "Loading weather forecast…"
      : "Forecast unavailable — no data returned from weather service.";
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Snowflake className="h-4 w-4 text-energy" />
            7-Day Cooling Load Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>{message}</span>
            {!loading && (
              <button
                onClick={() => refresh()}
                className="text-xs px-3 py-1 rounded border border-border hover:bg-secondary/50 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const forecastData = days.map(day => {
    const tempMax = day.tMax;
    const tempMin = day.tMin;
    const avgTemp = day.tMean ?? (tempMax + tempMin) / 2;
    const multiplier = estimateCoolingLoadMultiplier(tempMax);
    const projectedKwh = Math.round(DAILY_BASELINE_KWH * (multiplier || 1));
    const projectedCost = Math.round(projectedKwh * COST_PER_KWH);
    const extraKwh = projectedKwh - DAILY_BASELINE_KWH;
    const weatherInfo = getWeatherInfo(day.weatherCode ?? 0);
    const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

    return {
      day: dayName,
      date: day.date,
      tempMax,
      tempMin,
      avgTemp: Math.round(avgTemp),
      multiplier,
      projectedKwh,
      baselineKwh: DAILY_BASELINE_KWH,
      extraKwh: Math.max(0, extraKwh),
      projectedCost,
      weatherIcon: weatherInfo.icon,
      weatherLabel: weatherInfo.label,
    };
  });

  const totalProjectedCost = forecastData.reduce((a, d) => a + d.projectedCost, 0);
  const totalExtraKwh = forecastData.reduce((a, d) => a + d.extraKwh, 0);
  const peakDay = [...forecastData].sort((a, b) => b.tempMax - a.tempMax)[0];

  const getBarColor = (temp: number) => {
    if (temp >= 48) return 'hsl(0, 72%, 51%)';
    if (temp >= 43) return 'hsl(25, 95%, 53%)';
    if (temp >= 38) return 'hsl(38, 92%, 50%)';
    return 'hsl(152, 60%, 48%)';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Snowflake className="h-4 w-4 text-energy" />
            7-Day Cooling Load Forecast
          </CardTitle>
          <Badge variant="outline" className="text-[9px] h-5 gap-1">
            <Thermometer className="h-2.5 w-2.5" /> Live Weather Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">7-Day Projected Cost</p>
            <p className="text-sm font-bold font-mono text-energy">
              {(totalProjectedCost / 1000).toFixed(0)}K SAR
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Extra Cooling Load</p>
            <p className="text-sm font-bold font-mono text-warning">
              +{(totalExtraKwh / 1000).toFixed(0)}K kWh
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Peak Day</p>
            <p className="text-sm font-bold font-mono text-destructive">
              {peakDay.tempMax}°C {peakDay.weatherIcon}
            </p>
            <p className="text-[9px] text-muted-foreground">{peakDay.day}</p>
          </div>
        </div>

        {/* Forecast chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={forecastData} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(222, 40%, 9%)',
                border: '1px solid hsl(215, 20%, 16%)',
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(value: number, name: string) => [
                `${(value / 1000).toFixed(1)}K kWh`,
                name === 'baselineKwh' ? 'Baseline' : 'Extra Cooling',
              ]}
              labelFormatter={(label: string, payload: any[]) => {
                const d = payload?.[0]?.payload;
                return d ? `${label} — ${d.tempMax}°C ${d.weatherIcon}` : label;
              }}
            />
            <Bar dataKey="baselineKwh" stackId="a" fill="hsl(215, 20%, 25%)" radius={[0, 0, 0, 0]} name="baselineKwh" />
            <Bar dataKey="extraKwh" stackId="a" radius={[4, 4, 0, 0]} name="extraKwh">
              {forecastData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.tempMax)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Daily breakdown */}
        <div className="space-y-1">
          {forecastData.map((d, i) => (
            <div
              key={d.date}
              className={cn(
                "flex items-center justify-between text-[11px] px-2 py-1.5 rounded-md",
                i === 0 && "bg-secondary/50"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 text-muted-foreground">{d.day}</span>
                <span>{d.weatherIcon}</span>
                <span className="font-mono">
                  <span className="text-destructive">{d.tempMax}°</span>
                  <span className="text-muted-foreground mx-0.5">/</span>
                  <span className="text-energy">{d.tempMin}°</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-muted-foreground">
                  {d.multiplier > 0 ? `${d.multiplier}x` : '—'}
                </span>
                <span className="font-mono w-16 text-right">
                  {(d.projectedKwh / 1000).toFixed(0)}K kWh
                </span>
                <span className="font-mono w-14 text-right text-savings">
                  {(d.projectedCost / 1000).toFixed(0)}K SAR
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
