import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { sites, portfolioKPIs } from "@/data/mockData";
import { Thermometer, DollarSign, Zap, Users, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalWeather } from "@/context/WeatherContext";

// Baseline: 22°C setpoint, each degree change = ~6% energy impact
const BASELINE_SETPOINT = 22;
const ENERGY_IMPACT_PER_DEGREE = 0.06;
const MONTHLY_BASELINE_COST = portfolioKPIs.totalCost / 12;
const COMFORT_LABELS = [
  { min: 18, max: 20, label: 'Arctic Office', emoji: '🥶', comfort: 95 },
  { min: 20, max: 21, label: 'Cool & Crisp', emoji: '❄️', comfort: 90 },
  { min: 21, max: 22, label: 'Ideal Comfort', emoji: '😊', comfort: 100 },
  { min: 22, max: 23, label: 'Balanced', emoji: '👍', comfort: 95 },
  { min: 23, max: 24, label: 'Warm Side', emoji: '🌤️', comfort: 80 },
  { min: 24, max: 25, label: 'Eco Warrior', emoji: '🌱', comfort: 65 },
  { min: 25, max: 26, label: 'Warm Office', emoji: '🥵', comfort: 45 },
  { min: 26, max: 28, label: 'Sauna Mode', emoji: '🔥', comfort: 20 },
];

export function ComfortCostSlider() {
  const [setpoint, setSetpoint] = useState([22]);
  const { weather } = useGlobalWeather();
  const currentTemp = weather?.current?.temperature ?? 42;

  const analysis = useMemo(() => {
    const temp = setpoint[0];
    const deltaDegrees = temp - BASELINE_SETPOINT;
    const energyChange = -deltaDegrees * ENERGY_IMPACT_PER_DEGREE;
    const costChange = MONTHLY_BASELINE_COST * energyChange;
    const annualSavings = costChange * 12;
    const kwhChange = (portfolioKPIs.totalConsumption / 12) * energyChange;

    // Comfort score
    const comfortEntry = COMFORT_LABELS.find(c => temp >= c.min && temp < c.max)
      || COMFORT_LABELS[COMFORT_LABELS.length - 1];

    // Cooling load relative to ambient
    const coolingDelta = currentTemp - temp;
    const baselineDelta = currentTemp - BASELINE_SETPOINT;
    const loadRatio = baselineDelta > 0 ? coolingDelta / baselineDelta : 1;

    return {
      temp,
      deltaDegrees,
      energyChangePct: Math.round(energyChange * 100),
      monthlyCostChange: Math.round(costChange),
      annualSavings: Math.round(annualSavings),
      kwhChange: Math.round(kwhChange),
      ...comfortEntry,
      loadRatio: Math.round(loadRatio * 100),
      coolingDelta,
    };
  }, [setpoint, currentTemp]);

  const isWarming = analysis.deltaDegrees > 0;
  const isCooling = analysis.deltaDegrees < 0;
  const costColor = isWarming ? 'text-savings' : isCooling ? 'text-destructive' : 'text-foreground';
  const savingsPositive = analysis.annualSavings > 0;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-energy" />
            Comfort vs. Cost Optimizer
          </CardTitle>
          <Badge variant="outline" className="text-[9px] h-5 gap-1">
            Ambient: {currentTemp}°C
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Slide to see the real-time cost impact of every degree change across your portfolio
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Slider */}
        <div className="relative px-2">
          <div className="flex justify-between text-[9px] text-muted-foreground mb-2">
            <span>❄️ Max Comfort</span>
            <span>💰 Max Savings</span>
          </div>
          <Slider
            value={setpoint}
            onValueChange={setSetpoint}
            min={18}
            max={27}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>18°C</span>
            <span className="font-bold text-foreground text-sm">{analysis.temp}°C</span>
            <span>27°C</span>
          </div>
        </div>

        {/* Comfort Label */}
        <div className="text-center py-2 rounded-lg bg-secondary/50">
          <span className="text-2xl">{analysis.emoji}</span>
          <p className="text-sm font-bold mt-1">{analysis.label}</p>
          <p className="text-[10px] text-muted-foreground">Comfort Score: {analysis.comfort}%</p>
        </div>

        {/* Impact Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <DollarSign className="h-4 w-4 mx-auto text-savings mb-1" />
            <p className={cn("text-lg font-bold font-mono", costColor)}>
              {analysis.monthlyCostChange > 0 ? '+' : ''}{(analysis.monthlyCostChange / 1000).toFixed(0)}K
            </p>
            <p className="text-[9px] text-muted-foreground">SAR/month</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <Zap className="h-4 w-4 mx-auto text-energy mb-1" />
            <p className={cn("text-lg font-bold font-mono", costColor)}>
              {analysis.energyChangePct > 0 ? '+' : ''}{analysis.energyChangePct}%
            </p>
            <p className="text-[9px] text-muted-foreground">Energy Change</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <Snowflake className="h-4 w-4 mx-auto text-accent mb-1" />
            <p className="text-lg font-bold font-mono">{analysis.loadRatio}%</p>
            <p className="text-[9px] text-muted-foreground">Cooling Load</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-warning mb-1" />
            <p className="text-lg font-bold font-mono">{analysis.comfort}%</p>
            <p className="text-[9px] text-muted-foreground">Occupant Comfort</p>
          </div>
        </div>

        {/* Annual projection */}
        <div className={cn(
          "rounded-lg p-3 text-center border",
          savingsPositive ? "border-savings/30 bg-savings/5" : "border-destructive/30 bg-destructive/5"
        )}>
          <p className="text-[10px] text-muted-foreground mb-1">Annual Portfolio Impact</p>
          <p className={cn("text-xl font-bold font-mono", savingsPositive ? "text-savings" : "text-destructive")}>
            {savingsPositive ? '↓ Save' : '↑ Extra'} {Math.abs(analysis.annualSavings / 1000).toFixed(0)}K SAR/year
          </p>
          <p className="text-[9px] text-muted-foreground mt-1">
            {Math.abs(analysis.kwhChange / 1000).toFixed(0)}K kWh/mo {savingsPositive ? 'reduced' : 'increased'} across {sites.filter(s => s.status === 'active').length} sites
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
