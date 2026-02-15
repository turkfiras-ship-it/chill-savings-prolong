import {
  Thermometer,
  Zap,
  Wrench,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Wind,
  Clock,
  Target,
  Lightbulb,
  ArrowDown,
  ArrowUp,
  BarChart3,
} from "lucide-react";
import { unitMonthlyData2025, unitAnnualTotals, unitInfo } from "@/data/unitMonthlyData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// Derive insights from data
const unitNames = ['G1', 'G2', 'G3', 'F1', 'F2', 'F3', 'F4'] as const;

const unitEfficiency = unitNames.map(name => ({
  unit: name,
  annual: unitAnnualTotals[name],
  location: unitInfo[name].location,
  notes: unitInfo[name].notes,
  peakMonth: unitMonthlyData2025.reduce((max, m) => 
    m[name] > (max?.value || 0) ? { month: m.month, value: m[name] } : max, 
    { month: '', value: 0 }
  ),
  lowestMonth: unitMonthlyData2025.reduce((min, m) => 
    m[name] < (min?.value || Infinity) ? { month: m.month, value: m[name] } : min, 
    { month: '', value: Infinity }
  ),
  summerAvg: Math.round(
    unitMonthlyData2025
      .filter(m => ['May', 'June', 'July', 'August', 'September'].includes(m.month))
      .reduce((sum, m) => sum + m[name], 0) / 5
  ),
  winterAvg: Math.round(
    unitMonthlyData2025
      .filter(m => ['January', 'February', 'November', 'December'].includes(m.month))
      .reduce((sum, m) => sum + m[name], 0) / 4
  ),
})).sort((a, b) => b.annual - a.annual);

const radarData = unitNames.map(name => ({
  unit: name,
  consumption: Math.round(unitAnnualTotals[name] / 1000),
  peak: unitMonthlyData2025.reduce((max, m) => Math.max(max, m[name]), 0),
  efficiency: Math.round(100 - (unitAnnualTotals[name] / unitAnnualTotals.F4) * 100 + 50),
}));

const totalAnnual = unitAnnualTotals.total;
const avgPerUnit = Math.round(totalAnnual / 7);

// Seasonal breakdown chart
const seasonalData = [
  { 
    season: 'Winter', 
    months: 'Jan-Feb, Nov-Dec',
    consumption: unitMonthlyData2025
      .filter(m => ['January', 'February', 'November', 'December'].includes(m.month))
      .reduce((s, m) => s + m.total, 0),
  },
  { 
    season: 'Spring', 
    months: 'Mar-Apr',
    consumption: unitMonthlyData2025
      .filter(m => ['March', 'April'].includes(m.month))
      .reduce((s, m) => s + m.total, 0),
  },
  { 
    season: 'Summer', 
    months: 'May-Sep',
    consumption: unitMonthlyData2025
      .filter(m => ['May', 'June', 'July', 'August', 'September'].includes(m.month))
      .reduce((s, m) => s + m.total, 0),
  },
  { 
    season: 'Autumn', 
    months: 'Oct',
    consumption: unitMonthlyData2025
      .filter(m => ['October'].includes(m.month))
      .reduce((s, m) => s + m.total, 0),
  },
];

export function Recommendations() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Optimization Recommendations</h2>
        </div>
        <p className="opacity-90 mb-4">
          Data-driven recommendations to maximize efficiency across all 7 AC units at Rawdah Showroom
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{totalAnnual.toLocaleString()}</p>
            <p className="text-sm opacity-80">Total kWh (2025)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{avgPerUnit.toLocaleString()}</p>
            <p className="text-sm opacity-80">Avg kWh/Unit</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">F4</p>
            <p className="text-sm opacity-80">Highest Consumer</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">F1</p>
            <p className="text-sm opacity-80">Most Efficient</p>
          </div>
        </div>
      </div>

      {/* Optimal Temperature Recommendation */}
      <div className="rounded-xl bg-card p-6 card-elevated border-2 border-amber-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Thermometer className="h-6 w-6 text-amber-500" />
          <h3 className="text-xl font-bold">Optimal Temperature Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Winter (Nov–Feb)</p>
            <p className="text-4xl font-bold text-blue-500">24°C</p>
            <p className="text-sm text-muted-foreground mt-1">Set thermostat higher to reduce load</p>
          </div>
          <div className="p-5 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Transition (Mar–Apr, Oct)</p>
            <p className="text-4xl font-bold text-amber-500">23°C</p>
            <p className="text-sm text-muted-foreground mt-1">Balance comfort & efficiency</p>
          </div>
          <div className="p-5 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Summer (May–Sep)</p>
            <p className="text-4xl font-bold text-red-500">22°C</p>
            <p className="text-sm text-muted-foreground mt-1">
              NOT below 22°C — each 1°C lower = ~8% more energy
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-amber-600">Critical Finding: Thermostat Misuse</span>
          </div>
          <p className="text-sm text-muted-foreground">
            March/April 2025 data shows abnormal consumption spikes consistent with thermostats being set to <strong>18°C or below</strong>. 
            This wastes ~15–20% more energy. Staff training and thermostat locks are strongly recommended. 
            Estimated annual savings from proper thermostat control: <strong className="text-savings">8,000–12,000 SAR</strong>.
          </p>
        </div>
      </div>

      {/* Unit-Specific Recommendations */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-energy" />
          <h3 className="text-xl font-semibold">Unit-Specific Optimization</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Ranked by annual consumption (highest to lowest) with targeted recommendations</p>

        <div className="space-y-4">
          {unitEfficiency.map((unit, idx) => {
            const isHighConsumer = unit.annual > avgPerUnit;
            const ratio = ((unit.annual / avgPerUnit) * 100 - 100);
            
            return (
              <div key={unit.unit} className={`p-4 rounded-lg border ${isHighConsumer ? 'border-amber-500/30 bg-amber-500/5' : 'border-savings/30 bg-savings/5'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isHighConsumer ? 'bg-amber-500/20 text-amber-600' : 'bg-savings/20 text-savings'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-lg">{unit.unit}</span>
                      <span className="text-sm text-muted-foreground ml-2">{unit.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{unit.annual.toLocaleString()} kWh</p>
                    <p className={`text-xs ${isHighConsumer ? 'text-amber-600' : 'text-savings'}`}>
                      {isHighConsumer ? `+${ratio.toFixed(0)}% above avg` : `${Math.abs(ratio).toFixed(0)}% below avg`}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">Peak</p>
                    <p className="font-medium">{unit.peakMonth.month}: {unit.peakMonth.value.toLocaleString()} kW</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">Lowest</p>
                    <p className="font-medium">{unit.lowestMonth.month}: {unit.lowestMonth.value.toLocaleString()} kW</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">Summer Avg</p>
                    <p className="font-medium">{unit.summerAvg.toLocaleString()} kW/mo</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">Winter Avg</p>
                    <p className="font-medium">{unit.winterAvg.toLocaleString()} kW/mo</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {getRecommendation(unit.unit)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seasonal Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card p-6 card-elevated">
          <h3 className="text-xl font-semibold mb-1">Seasonal Load Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">Total kWh by season — summer is 55%+ of annual load</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="season" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} kWh`, 'Consumption']}
                />
                <Bar dataKey="consumption" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unit Comparison Radar */}
        <div className="rounded-xl bg-card p-6 card-elevated">
          <h3 className="text-xl font-semibold mb-1">Unit Efficiency Score</h3>
          <p className="text-sm text-muted-foreground mb-4">Higher = more efficient (F1 best, F4 worst)</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="unit" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Radar name="Efficiency" dataKey="efficiency" stroke="hsl(152, 60%, 40%)" fill="hsl(152, 60%, 40%)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Actionable Recommendations */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-savings" />
          <h3 className="text-xl font-semibold">Top 8 Actionable Recommendations</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${
              rec.priority === 'high' ? 'border-red-500/30 bg-red-500/5' :
              rec.priority === 'medium' ? 'border-amber-500/30 bg-amber-500/5' :
              'border-savings/30 bg-savings/5'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <rec.icon className={`h-5 w-5 ${
                    rec.priority === 'high' ? 'text-red-500' :
                    rec.priority === 'medium' ? 'text-amber-500' :
                    'text-savings'
                  }`} />
                  <span className="font-semibold">{rec.title}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  rec.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                  rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-600' :
                  'bg-savings/20 text-savings'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-savings" />
                <span className="text-sm font-medium text-savings">{rec.savings}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Total Savings */}
      <div className="bg-gradient-to-r from-savings to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-6 w-6" />
          <h3 className="text-xl font-bold">Total Estimated Savings from Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-5 text-center">
            <p className="text-sm opacity-80 mb-1">Conservative Estimate</p>
            <p className="text-3xl font-bold">25,000+ SAR</p>
            <p className="text-xs opacity-70">Per year additional savings</p>
          </div>
          <div className="bg-white/10 rounded-lg p-5 text-center">
            <p className="text-sm opacity-80 mb-1">Optimistic Estimate</p>
            <p className="text-3xl font-bold">45,000+ SAR</p>
            <p className="text-xs opacity-70">Per year additional savings</p>
          </div>
          <div className="bg-white/20 rounded-lg p-5 text-center">
            <p className="text-sm opacity-80 mb-1">Combined with SCC System</p>
            <p className="text-3xl font-bold">60,000+ SAR</p>
            <p className="text-xs opacity-70">Total annual savings potential</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRecommendation(unit: string): string {
  switch (unit) {
    case 'F4':
      return 'Highest consumer (97,034 kWh). Inspect insulation, check for air leaks in corner section. Consider adding thermal curtain. Peak in August (14,098 kW) suggests oversized load — investigate zone balancing with F3.';
    case 'G1':
      return 'High load from frequent door openings. Install air curtain if not present. Consider vestibule entrance or auto-closing doors. Thermostat should be set to 23–24°C minimum in winter.';
    case 'F2':
      return 'Sensor issue was resolved, but August spike (12,236 kW) is abnormal. Monitor sensor readings monthly. Consider adding a backup thermostat sensor for this zone.';
    case 'G2':
      return 'Good improvement after SCC installation (62% daily reduction). Maintain current filter schedule. May/June fluctuations may be from thermostat adjustments — lock thermostat at 22–23°C.';
    case 'F3':
      return 'Consistent performer. Maintain current operations. Minor optimization: adjust fan speed to medium during winter months to save ~5–8% during low-load periods.';
    case 'G3':
      return 'Serves same zone as F1 across floors. Coordinate scheduling — consider alternating operation during low-traffic hours to reduce combined load by ~10%.';
    case 'F1':
      return 'Lowest consumer but has extra duct line adding ~20,000 kWh/year. Evaluate duct layout — sealing or removing redundant duct sections could save 15–20% on this unit alone.';
    default:
      return '';
  }
}

const recommendations = [
  {
    title: 'Lock Thermostats at 22–24°C',
    description: 'Install tamper-proof thermostat covers or smart thermostats with locked ranges. Prevents staff from setting below 20°C.',
    savings: '8,000–12,000 SAR/year',
    priority: 'high' as const,
    icon: Thermometer,
  },
  {
    title: 'Air Curtain for G1 Entrance',
    description: 'Main entrance unit G1 loses significant cooling due to door traffic. Air curtain can reduce loss by 60–80%.',
    savings: '5,000–8,000 SAR/year',
    priority: 'high' as const,
    icon: Wind,
  },
  {
    title: 'F4 Zone Rebalancing',
    description: 'F4 is the highest consumer (97K kWh). Rebalance airflow with F3 and check for insulation issues in corner section.',
    savings: '4,000–7,000 SAR/year',
    priority: 'high' as const,
    icon: Target,
  },
  {
    title: 'F1 Duct Optimization',
    description: 'Extra duct line adds ~20,000 kWh/year. Seal or redirect redundant duct sections to reduce F1 load by 15–20%.',
    savings: '2,500–4,000 SAR/year',
    priority: 'medium' as const,
    icon: Wrench,
  },
  {
    title: 'Seasonal Schedule Adjustment',
    description: 'Reduce fan speed to medium in winter months (Nov–Feb). Summer accounts for 55%+ of load — focus resources there.',
    savings: '2,000–3,500 SAR/year',
    priority: 'medium' as const,
    icon: Clock,
  },
  {
    title: 'G3/F1 Alternating Operation',
    description: 'These units serve overlapping zones. Alternate operation during low-traffic hours (early morning, last hour) to cut combined load ~10%.',
    savings: '2,000–3,000 SAR/year',
    priority: 'medium' as const,
    icon: Zap,
  },
  {
    title: 'Monthly F2 Sensor Checks',
    description: 'F2 had a sensor issue that caused an August spike. Monthly sensor calibration prevents recurrence and wasted energy.',
    savings: '1,500–2,500 SAR/year',
    priority: 'low' as const,
    icon: BarChart3,
  },
  {
    title: 'Filter Maintenance Schedule',
    description: 'Maintain 30-day filter replacement cycle across all units. Dirty filters increase consumption by 5–15%.',
    savings: '3,000–5,000 SAR/year',
    priority: 'high' as const,
    icon: CheckCircle,
  },
];
