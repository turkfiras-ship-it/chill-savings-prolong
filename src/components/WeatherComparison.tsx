import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { monthlyWeatherData, weatherSummary } from "@/data/weatherData";
import { yearlyComparisonData } from "@/data/rawdahAnalysis";
import { Thermometer, TrendingUp, Sun, Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function WeatherComparison() {
  const chartData = monthlyWeatherData.map((w, idx) => ({
    month: w.month.substring(0, 3),
    temp2024: w.avgTemp2024,
    temp2025: w.avgTemp2025,
    consumption2024: yearlyComparisonData[idx]?.year2024 || 0,
    consumption2025: yearlyComparisonData[idx]?.year2025 || 0,
  }));

  const [explainerOpen, setExplainerOpen] = useState(false);

  const tempChartData = monthlyWeatherData.map(w => ({
    month: w.month.substring(0, 3),
    '2024 Temp': w.avgTemp2024,
    '2025 Temp': w.avgTemp2025,
    diff: w.tempDiff,
  }));

  const TemperatureCoolingExplainer = () => {
    return (
      <Collapsible open={explainerOpen} onOpenChange={setExplainerOpen}>
        <div className="rounded-xl border border-border bg-card p-5 card-elevated">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">How Temperature Affects Cooling Demand</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${explainerOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-border">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Engineering View</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• +1.3°C measured ambient increase</li>
                  <li>• HVAC load sensitivity in hot climates ≈ 5–8% per °C</li>
                  <li>• Peak degradation may approach 8–10% per °C</li>
                  <li>• Estimated impact range: 8–12%</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">CFO View</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 12% used as base-case assumption</li>
                  <li>• Sensitivity tested from 8%–14%</li>
                  <li>• Financial model remains positive under lower assumptions</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Executive View</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Hotter year</li>
                  <li>• Higher cooling demand</li>
                  <li>• Lower total cost achieved</li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Thermometer className="h-6 w-6" />
          <h3 className="text-xl font-bold">Weather Impact: 2024 vs 2025 — Riyadh Temperatures</h3>
        </div>
        <p className="opacity-90 mb-4">
          2025 was consistently hotter than 2024, meaning AC systems had to work harder — yet Rawdah still achieved cost savings.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">+{weatherSummary.avgTempDiff}°C</p>
            <p className="text-xs opacity-80">Average Ambient Temperature Increase (Measured)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{weatherSummary.hottestTemp2025}°C</p>
            <p className="text-xs opacity-80">Peak ({weatherSummary.hottestMonth2025} 2025)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{weatherSummary.peakMonths.length}</p>
            <p className="text-xs opacity-80">Months Above 40°C</p>
          </div>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="bg-white/10 rounded-lg p-3 text-center cursor-help">
                  <p className="text-2xl font-bold">{weatherSummary.coolingDegreeIncrease}</p>
                  <p className="text-xs opacity-80 flex items-center justify-center gap-1">
                    Estimated Cooling Demand Increase <Info className="h-3 w-3 opacity-60" />
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Estimated additional cooling energy required due to higher ambient temperatures. Not a direct temperature percentage conversion.
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs opacity-70 mt-4 leading-relaxed">
          Cooling demand increase is derived from HVAC load response to ambient temperature rise. Temperature change (°C) and cooling demand (%) are related but not equivalent metrics.
        </p>
      </div>

      {/* Expandable Engineering / CFO / Executive Info */}
      <TemperatureCoolingExplainer />

      {/* Temperature Chart */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h4 className="text-lg font-semibold mb-1">Monthly Average High Temperature — Riyadh</h4>
        <p className="text-sm text-muted-foreground mb-4">2025 recorded higher temperatures across all months</p>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={tempChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                domain={[15, 50]}
                tickFormatter={(v) => `${v}°C`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'diff') return [`+${value}°C`, 'Temperature Increase'];
                  return [`${value}°C`, name];
                }}
              />
              <Legend />
               <Bar dataKey="2024 Temp" fill="hsl(200, 50%, 65%)" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="2025 Temp" fill="hsl(0, 55%, 55%)" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Line type="monotone" dataKey="diff" name="Temp Diff (°C)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temperature vs Consumption Correlation */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h4 className="text-lg font-semibold mb-1">Temperature vs Energy Cost Correlation</h4>
        <p className="text-sm text-muted-foreground mb-4">Higher temperatures drive higher AC consumption — but Rawdah still saved in most months</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-semibold">Month</th>
                <th className="text-right p-3 font-semibold">2024 Temp</th>
                <th className="text-right p-3 font-semibold">2025 Temp</th>
                <th className="text-right p-3 font-semibold">Temp Δ</th>
                <th className="text-right p-3 font-semibold">2024 Cost</th>
                <th className="text-right p-3 font-semibold">2025 Cost</th>
                <th className="text-right p-3 font-semibold">Cost Savings</th>
              </tr>
            </thead>
            <tbody>
              {monthlyWeatherData.map((w, idx) => {
                const yoy = yearlyComparisonData[idx];
                const saved = yoy ? yoy.year2024 - yoy.year2025 : 0;
                return (
                  <tr key={w.month} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{w.month}</td>
                    <td className="p-3 text-right tabular-nums">{w.avgTemp2024}°C</td>
                    <td className="p-3 text-right tabular-nums text-destructive font-medium">{w.avgTemp2025}°C</td>
                    <td className="p-3 text-right tabular-nums text-destructive">+{w.tempDiff}°C</td>
                    <td className="p-3 text-right tabular-nums">{yoy?.year2024.toLocaleString()} SAR</td>
                    <td className="p-3 text-right tabular-nums">{yoy?.year2025.toLocaleString()} SAR</td>
                    <td className={`p-3 text-right tabular-nums font-medium ${saved > 0 ? 'text-savings' : 'text-destructive'}`}>
                      {saved > 0 ? `${Math.round(saved).toLocaleString()} ✓` : `${Math.round(saved).toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cooling Load Cost vs Savings */}
      <div className="rounded-xl bg-card p-6 card-elevated border-2 border-savings/30">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-energy" />
          <h4 className="text-lg font-semibold">Cooling Load Cost Impact vs Actual Savings</h4>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          The {weatherSummary.coolingDegreeIncrease} increase in cooling load translates to an estimated additional energy cost of <strong>{weatherSummary.additionalCoolingCostLow.toLocaleString()}–{weatherSummary.additionalCoolingCostHigh.toLocaleString()} SAR</strong> that would have been expected on top of 2024 bills.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Expected Extra Cost (8–12% Load)</p>
            <p className="text-2xl font-bold text-destructive">{weatherSummary.additionalCoolingCostLow.toLocaleString()}–{weatherSummary.additionalCoolingCostHigh.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">SAR</p>
          </div>
          <div className="p-4 bg-savings/10 border border-savings/20 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Actual Savings Achieved</p>
            <p className="text-2xl font-bold text-savings">{weatherSummary.actualSavings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">SAR</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-savings/15 to-savings/5 border-2 border-savings/40 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">True Adjusted Value</p>
            <p className="text-2xl font-bold text-savings">{weatherSummary.adjustedSavingsLow.toLocaleString()}–{weatherSummary.adjustedSavingsHigh.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">SAR (Savings + Avoided Cost)</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Without the SCC system, the hotter 2025 temperatures would have <strong>increased</strong> costs by {weatherSummary.additionalCoolingCostLow.toLocaleString()}–{weatherSummary.additionalCoolingCostHigh.toLocaleString()} SAR. Instead, Rawdah <strong>saved</strong> {weatherSummary.actualSavings.toLocaleString()} SAR — a combined value of <strong>{weatherSummary.adjustedSavingsLow.toLocaleString()}–{weatherSummary.adjustedSavingsHigh.toLocaleString()} SAR</strong>.
        </p>
      </div>

      {/* Key Insight */}
      <div className="p-4 bg-savings/10 border border-savings/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sun className="h-5 w-5 text-savings" />
          <span className="font-semibold text-savings">Key Weather Insight</span>
        </div>
        <p className="text-sm text-muted-foreground">{weatherSummary.insight}</p>
      </div>
    </div>
  );
}
