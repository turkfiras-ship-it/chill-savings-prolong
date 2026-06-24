import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KpiCard } from "@/components/platform/KpiCard";
import { useWeather } from "@/hooks/useWeather";
import { getWeatherInfo, estimateHvacEfficiencyImpact, estimateCoolingLoadMultiplier } from "@/lib/weatherService";
import { sites } from "@/data/mockData";
import { unitMonthlyData2025, unitAnnualTotals, unitNames } from "@/data/unitMonthlyData";
import { monthlyWeatherData } from "@/data/weatherData";
import { ClimateConstants, LockedFinancials } from "@/data/lockedPerformanceModel";
import { Thermometer, Droplets, Wind, Sun, AlertTriangle, Activity, Zap, Gauge, CloudSun, TrendingUp, MapPin } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Scatter } from "recharts";
import { YtdWeatherSavings } from "@/components/platform/YtdWeatherSavings";
import { WeatherNormalizationPanel } from "@/components/platform/WeatherNormalizationPanel";
import { WeatherCoordsDiagnostic } from "@/components/platform/WeatherCoordsDiagnostic";

const chartTooltipStyle = { background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(215, 20%, 16%)";
const tickStyle = { fontSize: 10, fill: 'hsl(215, 15%, 55%)' };

const activeSites = sites.filter(s => s.status === 'active');

export default function WeatherPage() {
  const [selectedSiteId, setSelectedSiteId] = useState(activeSites[0].id);
  const selectedSite = activeSites.find(s => s.id === selectedSiteId) || activeSites[0];
  const { weather, loading, error } = useWeather({ lat: selectedSite.lat, lng: selectedSite.lng, name: selectedSite.city });

  const isRawdah = selectedSiteId === 'S001';

  // Correlate historical weather with unit consumption
  const correlationData = monthlyWeatherData.map((w, i) => {
    const unitData = unitMonthlyData2025[i];
    return {
      month: w.month.slice(0, 3),
      temp2024: w.avgTemp2024,
      temp2025: w.avgTemp2025,
      tempDiff: w.tempDiff,
      consumption: unitData ? unitData.total : 0,
      consumptionK: unitData ? Math.round(unitData.total / 1000) : 0,
      coolingLoad: w.avgTemp2025 > 25 ? Math.round((w.avgTemp2025 - 25) * 6) : 0,
    };
  });

  // Simulate current conditions impact on each unit
  const currentTemp = weather?.current.temperature || 35;
  const currentHumidity = weather?.current.humidity || 30;
  const hvacImpact = estimateHvacEfficiencyImpact(currentTemp, currentHumidity);
  const coolingMult = estimateCoolingLoadMultiplier(currentTemp);

  const unitSimulation = unitNames.map(u => {
    const annual = unitAnnualTotals[u as keyof typeof unitAnnualTotals] as number;
    const monthlyAvg = Math.round(annual / 12);
    const adjustedLoad = Math.round(monthlyAvg * (coolingMult || 1));
    return {
      unit: u,
      baseline: monthlyAvg,
      projected: adjustedLoad,
      increase: adjustedLoad - monthlyAvg,
      increasePct: coolingMult > 0 ? Math.round((coolingMult - 1) * 100) : 0,
    };
  });

  // Hourly forecast with HVAC impact
  const hourlyImpact = weather?.hourly.slice(0, 24).map(h => {
    const impact = estimateHvacEfficiencyImpact(h.temperature, h.humidity);
    return {
      hour: new Date(h.time).getHours() + 'h',
      temp: h.temperature,
      humidity: h.humidity,
      loadIncrease: impact.loadIncrease,
      copReduction: impact.copReduction,
      risk: impact.riskLevel,
    };
  }) || [];

  // Multi-site weather comparison
  const [compareSites, setCompareSites] = useState<string[]>([activeSites[0].id]);

  const riskColors = {
    low: 'bg-savings/10 text-savings border-savings/30',
    moderate: 'bg-warning/10 text-warning border-warning/30',
    high: 'bg-orange-400/10 text-orange-400 border-orange-400/30',
    extreme: 'bg-destructive/10 text-destructive border-destructive/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-energy" />
            Weather Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Live weather correlation with HVAC performance and energy consumption</p>
        </div>
        <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
          <SelectTrigger className="w-56 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {activeSites.map(s => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Live Weather + HVAC Impact KPIs */}
      {weather && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <KpiCard
              title="Temperature"
              value={`${Math.round(weather.current.temperature)}°C`}
              icon={Thermometer}
              variant={weather.current.temperature > 43 ? 'danger' : weather.current.temperature > 38 ? 'warning' : 'energy'}
              subtitle={`Feels ${Math.round(weather.current.feelsLike)}°C`}
            />
            <KpiCard title="Humidity" value={`${weather.current.humidity}%`} icon={Droplets} variant="energy" subtitle="Relative" />
            <KpiCard title="Wind" value={`${Math.round(weather.current.windSpeed)} km/h`} icon={Wind} />
            <KpiCard title="UV Index" value={String(weather.current.uvIndex)} icon={Sun} variant={weather.current.uvIndex > 8 ? 'warning' : undefined} />
            <KpiCard title="Cooling Load" value={`+${hvacImpact.loadIncrease}%`} icon={Zap} variant={hvacImpact.riskLevel === 'low' ? 'savings' : 'warning'} subtitle="vs 25°C baseline" />
            <KpiCard title="COP Impact" value={`-${hvacImpact.copReduction}%`} icon={Gauge} variant={hvacImpact.copReduction > 10 ? 'danger' : hvacImpact.copReduction > 5 ? 'warning' : 'savings'} subtitle="Efficiency" />
          </div>

          {/* HVAC Risk Banner */}
          <Card className={`border ${riskColors[hvacImpact.riskLevel]}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold">HVAC Risk Level: {hvacImpact.riskLevel.toUpperCase()}</p>
                  <Badge variant="outline" className={`text-[9px] ${riskColors[hvacImpact.riskLevel]}`}>
                    {getWeatherInfo(weather.current.weatherCode).label}
                  </Badge>
                </div>
                <p className="text-xs opacity-80">{hvacImpact.recommendation}</p>
                {coolingMult > 0 && <p className="text-xs mt-1 opacity-60">Cooling demand multiplier: {coolingMult}x baseline · Cloud cover: {weather.current.cloudCover}%</p>}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 24-Hour HVAC Load Forecast */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">24-Hour HVAC Load Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={hourlyImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="hour" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={tickStyle} axisLine={false} tickLine={false} unit="°C" />
              <YAxis yAxisId="right" orientation="right" tick={tickStyle} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="left" type="monotone" dataKey="temp" stroke="hsl(0, 70%, 55%)" fill="hsl(0, 70%, 55%)" fillOpacity={0.1} strokeWidth={2} name="Temperature (°C)" />
              <Bar yAxisId="right" dataKey="loadIncrease" fill="hsl(38, 92%, 50%)" opacity={0.6} radius={[3, 3, 0, 0]} name="Load Increase (%)" />
              <Line yAxisId="right" type="monotone" dataKey="copReduction" stroke="hsl(210, 80%, 55%)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="COP Reduction (%)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Historical Temp vs Consumption Correlation */}
        {isRawdah && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Temperature vs Consumption Correlation (Rawdah 2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="temp" tick={tickStyle} axisLine={false} tickLine={false} unit="°C" />
                  <YAxis yAxisId="kwh" orientation="right" tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}K`} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line yAxisId="temp" type="monotone" dataKey="temp2025" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Temp 2025 (°C)" />
                  <Bar yAxisId="kwh" dataKey="consumptionK" fill="hsl(192, 70%, 50%)" opacity={0.5} radius={[3, 3, 0, 0]} name="Consumption (K kWh)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Unit Load Simulation */}
        {isRawdah && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Live Unit Load Projection ({Math.round(currentTemp)}°C)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={unitSimulation}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="unit" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(1)}K`} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="baseline" fill="hsl(210, 80%, 55%)" opacity={0.4} radius={[3, 3, 0, 0]} name="Monthly Avg (kWh)" stackId="a" />
                  <Bar dataKey="increase" fill="hsl(38, 92%, 50%)" opacity={0.8} radius={[3, 3, 0, 0]} name="Weather Increase (kWh)" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 7-Day Forecast with HVAC Impact */}
      {weather && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">7-Day Forecast — HVAC Impact Projection</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weather.daily.map((day, i) => {
                const dayInfo = getWeatherInfo(day.weatherCode);
                const dayImpact = estimateHvacEfficiencyImpact(day.tempMax, 30);
                const dayName = i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
                return (
                  <div key={day.date} className={`rounded-lg border p-3 text-center ${riskColors[dayImpact.riskLevel]}`}>
                    <p className="text-[10px] font-medium mb-1">{dayName}</p>
                    <p className="text-2xl mb-1">{dayInfo.icon}</p>
                    <p className="text-sm font-bold">{Math.round(day.tempMax)}°</p>
                    <p className="text-[10px] text-muted-foreground">{Math.round(day.tempMin)}°</p>
                    <div className="mt-2 pt-2 border-t border-current/10">
                      <p className="text-[9px]">Load +{dayImpact.loadIncrease}%</p>
                      <Badge variant="outline" className={`text-[7px] h-3.5 mt-0.5 ${riskColors[dayImpact.riskLevel]}`}>
                        {dayImpact.riskLevel}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Normalization Reference */}
      {isRawdah && (
        <YtdWeatherSavings />
      )}

      {/* Persistent daily-weather normalization engine (CDD + temp-delta vs 2024) */}
      {isRawdah && <WeatherNormalizationPanel />}

      {/* Diagnostic: Airport vs Rawdah vs Sol-air adjusted */}
      {isRawdah && <WeatherCoordsDiagnostic />}

      {/* Weather Normalization Reference */}
      {isRawdah && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Weather Normalization Engine — Live vs Historical</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Historical Avg Increase</p>
                <p className="text-lg font-bold text-warning">+{ClimateConstants.avgTemperatureIncrease}°C</p>
                <p className="text-[9px] text-muted-foreground">2024 → 2025 annual</p>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Normalization Factor</p>
                <p className="text-lg font-bold text-energy">×{ClimateConstants.weatherNormalizationFactor}</p>
                <p className="text-[9px] text-muted-foreground">{ClimateConstants.coolingLoadImpactRange} load impact</p>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Current Live Temp</p>
                <p className="text-lg font-bold">{weather ? `${Math.round(weather.current.temperature)}°C` : '—'}</p>
                <p className="text-[9px] text-muted-foreground">{weather ? getWeatherInfo(weather.current.weatherCode).label : ''}</p>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground">True Adjusted Savings</p>
                <p className="text-lg font-bold text-savings">{LockedFinancials.directEnergySavingsSAR.toLocaleString()} SAR</p>
                <p className="text-[9px] text-muted-foreground">{LockedFinancials.efficiencyImprovement}% efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}