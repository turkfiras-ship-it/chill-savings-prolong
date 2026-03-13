import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sites, monthlyTrends, portfolioKPIs } from "@/data/mockData";
import { useGlobalWeather } from "@/context/WeatherContext";
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Quarterly M&V targets (SAR savings)
const QUARTERLY_TARGET = Math.round(portfolioKPIs.totalSavings * 0.3); // 30% of annual target per quarter
const DAYS_IN_QUARTER = 90;

export function SavingsConfidence() {
  const { weather } = useGlobalWeather();

  const analysis = useMemo(() => {
    // Simulate we're partway through Q1
    const dayOfQuarter = 67; // day 67 of 90
    const daysRemaining = DAYS_IN_QUARTER - dayOfQuarter;
    const progressPct = dayOfQuarter / DAYS_IN_QUARTER;

    // Accumulated savings so far (simulated from monthly trends)
    const accumulatedSavings = Math.round(
      monthlyTrends.slice(0, 2).reduce((a, m) => a + m.savings, 0) +
      monthlyTrends[2].savings * (dayOfQuarter - 59) / 31
    );

    const remaining = QUARTERLY_TARGET - accumulatedSavings;
    const dailyRateNeeded = remaining / Math.max(daysRemaining, 1);
    const currentDailyRate = accumulatedSavings / dayOfQuarter;

    // Weather risk factor
    const tempFactor = weather?.current?.temperature
      ? weather.current.temperature > 43 ? 0.85 : weather.current.temperature > 38 ? 0.92 : 1.0
      : 1.0;

    // Probability calculation
    const runRate = currentDailyRate * tempFactor;
    const projected = accumulatedSavings + runRate * daysRemaining;
    const rawProbability = Math.min(projected / QUARTERLY_TARGET, 1.3);
    const probability = Math.round(Math.min(100, rawProbability * 100));

    // Risk factors
    const risks: string[] = [];
    if (weather?.current?.temperature && weather.current.temperature > 43)
      risks.push('Extreme heat reducing HVAC efficiency');
    if (remaining > accumulatedSavings * 0.5)
      risks.push('Behind pace — need acceleration');
    if (currentDailyRate < dailyRateNeeded)
      risks.push(`Need ${((dailyRateNeeded / currentDailyRate - 1) * 100).toFixed(0)}% rate increase`);

    const boosters: string[] = [];
    if (probability >= 80) boosters.push('On track — maintain current optimization');
    if (weather?.daily?.some(d => d.tempMax < 38))
      boosters.push('Cooler days ahead will help efficiency');
    boosters.push('SCC/VMF active on all optimized sites');

    return {
      dayOfQuarter,
      daysRemaining,
      progressPct,
      accumulatedSavings,
      target: QUARTERLY_TARGET,
      remaining,
      dailyRateNeeded: Math.round(dailyRateNeeded),
      currentDailyRate: Math.round(currentDailyRate),
      projected: Math.round(projected),
      probability,
      risks,
      boosters,
    };
  }, [weather]);

  const probColor = analysis.probability >= 80 ? 'text-savings'
    : analysis.probability >= 60 ? 'text-warning'
    : 'text-destructive';

  const probBg = analysis.probability >= 80 ? 'bg-savings'
    : analysis.probability >= 60 ? 'bg-warning'
    : 'bg-destructive';

  const gaugeAngle = (analysis.probability / 100) * 180;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-savings" />
          Savings Confidence Meter
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">
          Will you hit your Q1 M&V target? Live probability updated daily.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-24 overflow-hidden">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 10 95 A 90 90 0 0 1 190 95"
                fill="none"
                stroke="hsl(215, 20%, 14%)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Colored arc */}
              <path
                d="M 10 95 A 90 90 0 0 1 190 95"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(gaugeAngle / 180) * 283} 283`}
                className={probColor}
              />
              {/* Needle */}
              <line
                x1="100"
                y1="95"
                x2={100 + 70 * Math.cos(Math.PI - (gaugeAngle * Math.PI / 180))}
                y2={95 - 70 * Math.sin(Math.PI - (gaugeAngle * Math.PI / 180))}
                stroke="hsl(210, 40%, 96%)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="95" r="4" fill="hsl(210, 40%, 96%)" />
            </svg>
          </div>
          <p className={cn("text-3xl font-bold font-mono -mt-2", probColor)}>
            {analysis.probability}%
          </p>
          <p className="text-[10px] text-muted-foreground">confidence of hitting target</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Q1 Progress</span>
            <span className="font-mono">
              {(analysis.accumulatedSavings / 1000).toFixed(0)}K / {(analysis.target / 1000).toFixed(0)}K SAR
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden relative">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", probBg)}
              style={{ width: `${Math.min(100, (analysis.accumulatedSavings / analysis.target) * 100)}%` }}
            />
            {/* Target marker */}
            <div className="absolute top-0 right-0 h-full w-0.5 bg-foreground/50" />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>Day {analysis.dayOfQuarter}/{DAYS_IN_QUARTER}</span>
            <span>{analysis.daysRemaining} days remaining</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground">Current Rate</p>
            <p className="text-sm font-bold font-mono">{analysis.currentDailyRate.toLocaleString()}</p>
            <p className="text-[8px] text-muted-foreground">SAR/day</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground">Needed Rate</p>
            <p className={cn("text-sm font-bold font-mono",
              analysis.dailyRateNeeded > analysis.currentDailyRate ? 'text-warning' : 'text-savings'
            )}>
              {analysis.dailyRateNeeded.toLocaleString()}
            </p>
            <p className="text-[8px] text-muted-foreground">SAR/day</p>
          </div>
        </div>

        {/* Risks & Boosters */}
        {analysis.risks.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-warning" /> Risk Factors
            </p>
            {analysis.risks.map((r, i) => (
              <p key={i} className="text-[10px] text-muted-foreground pl-4">• {r}</p>
            ))}
          </div>
        )}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-savings" /> Positive Signals
          </p>
          {analysis.boosters.map((b, i) => (
            <p key={i} className="text-[10px] text-muted-foreground pl-4">• {b}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
