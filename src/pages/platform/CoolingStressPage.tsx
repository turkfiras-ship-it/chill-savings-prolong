import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { sites } from "@/data/mockData";
import { useGlobalWeather } from "@/context/WeatherContext";
import { Thermometer, Droplets, Wind, Gauge, AlertTriangle, TrendingUp, Building2, Info } from "lucide-react";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";

// ── Cooling Stress Algorithm ──────────────────────────────
interface StressFactors {
  temperature: number;    // 0-100
  humidity: number;       // 0-100
  thermalInertia: number; // 0-100
  compressorCycling: number; // 0-100
  loadIntensity: number;  // 0-100
  weatherVolatility: number; // 0-100
}

function computeCoolingStressIndex(factors: StressFactors): number {
  const weights = {
    temperature: 0.30,
    humidity: 0.15,
    thermalInertia: 0.15,
    compressorCycling: 0.20,
    loadIntensity: 0.12,
    weatherVolatility: 0.08,
  };
  const raw =
    factors.temperature * weights.temperature +
    factors.humidity * weights.humidity +
    factors.thermalInertia * weights.thermalInertia +
    factors.compressorCycling * weights.compressorCycling +
    factors.loadIntensity * weights.loadIntensity +
    factors.weatherVolatility * weights.weatherVolatility;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

function getStressLevel(score: number) {
  if (score >= 80) return { label: "Critical", color: "hsl(var(--destructive))", bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" };
  if (score >= 60) return { label: "High", color: "hsl(var(--warning))", bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" };
  if (score >= 40) return { label: "Moderate", color: "hsl(var(--chart-blue))", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" };
  return { label: "Low", color: "hsl(var(--primary))", bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" };
}

// ── Simulated per-site stress data ──────────────────────────
function generateSiteStress(site: typeof sites[0], ambientTemp: number, humidity: number) {
  const tempScore = Math.min(100, Math.max(0, (ambientTemp - 20) * 3.3));
  const humidScore = Math.min(100, Math.max(0, humidity * 1.2));
  const loadRatio = site.demand_kw / site.peak_kw;
  const thermalInertia = site.type === "Healthcare" || site.type === "Hospitality" ? 65 + Math.random() * 20 : 30 + Math.random() * 40;
  const compCycling = loadRatio > 0.7 ? 60 + Math.random() * 30 : 20 + Math.random() * 40;
  const loadIntensity = loadRatio * 100;
  const weatherVol = ambientTemp > 42 ? 70 + Math.random() * 20 : 20 + Math.random() * 30;

  const factors: StressFactors = {
    temperature: tempScore,
    humidity: humidScore,
    thermalInertia,
    compressorCycling: compCycling,
    loadIntensity,
    weatherVolatility: weatherVol,
  };

  return { factors, score: computeCoolingStressIndex(factors) };
}

// ── Gauge Component ──────────────────────────────────────
function StressGauge({ score, size = 200 }: { score: number; size?: number }) {
  const level = getStressLevel(score);
  const angle = (score / 100) * 270 - 135;
  const r = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;

  const arcPath = (startAngle: number, endAngle: number) => {
    const s = ((startAngle - 90) * Math.PI) / 180;
    const e = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={arcPath(-135, 135)} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" strokeLinecap="round" />
      <motion.path
        d={arcPath(-135, Math.min(angle, 135))}
        fill="none"
        stroke={level.color}
        strokeWidth="12"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {/* Needle */}
      <motion.line
        x1={cx} y1={cy}
        x2={cx + (r - 15) * Math.cos(((angle - 90) * Math.PI) / 180)}
        y2={cy + (r - 15) * Math.sin(((angle - 90) * Math.PI) / 180)}
        stroke={level.color}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      />
      <circle cx={cx} cy={cy} r={6} fill={level.color} />
      <text x={cx} y={cy + 35} textAnchor="middle" className="fill-foreground text-3xl font-bold" style={{ fontSize: 32, fontWeight: 800 }}>
        {score}
      </text>
      <text x={cx} y={cy + 55} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 12 }}>
        / 100
      </text>
    </svg>
  );
}

// ── Hourly Forecast Mock ──────────────────────────────────
function generateHourlyForecast(baseScore: number) {
  return Array.from({ length: 24 }, (_, i) => {
    const peakFactor = i >= 11 && i <= 16 ? 1.3 : i >= 8 && i <= 20 ? 1.1 : 0.7;
    const noise = (Math.random() - 0.5) * 10;
    return {
      hour: `${String(i).padStart(2, "0")}:00`,
      stress: Math.min(100, Math.max(0, Math.round(baseScore * peakFactor + noise))),
    };
  });
}

// ═══════════════════════════════════════════════════════════
export default function CoolingStressPage() {
  const { weather } = useGlobalWeather();
  const ambientTemp = weather?.current?.temperature ?? 38;
  const humidity = weather?.current?.humidity ?? 45;
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0].id);
  const activeSites = sites.filter(s => s.status === "active");

  const allStress = useMemo(
    () => activeSites.map(s => ({ site: s, ...generateSiteStress(s, ambientTemp, humidity) })),
    [ambientTemp, humidity]
  );

  const selectedData = allStress.find(d => d.site.id === selectedSiteId) ?? allStress[0];
  const level = getStressLevel(selectedData.score);
  const forecast = useMemo(() => generateHourlyForecast(selectedData.score), [selectedData.score]);

  const radarData = [
    { factor: "Temperature", value: selectedData.factors.temperature, fullMark: 100 },
    { factor: "Humidity", value: selectedData.factors.humidity, fullMark: 100 },
    { factor: "Thermal Inertia", value: selectedData.factors.thermalInertia, fullMark: 100 },
    { factor: "Compressor Cycling", value: selectedData.factors.compressorCycling, fullMark: 100 },
    { factor: "Load Intensity", value: selectedData.factors.loadIntensity, fullMark: 100 },
    { factor: "Weather Volatility", value: selectedData.factors.weatherVolatility, fullMark: 100 },
  ];

  // Sort portfolio by stress descending
  const portfolioRanked = [...allStress].sort((a, b) => b.score - a.score);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Gauge className="h-6 w-6 text-accent" />
              Cooling Stress Index™
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Proprietary 0–100 score predicting HVAC stress levels • Real-time weather + load analysis
            </p>
          </div>
          <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeSites.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Score + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Gauge */}
          <Card className={`border ${level.border} ${level.bg}`}>
            <CardContent className="pt-6 flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div key={selectedData.score} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                  <StressGauge score={selectedData.score} size={220} />
                </motion.div>
              </AnimatePresence>
              <Badge className={`mt-2 ${level.bg} ${level.text} border-0 text-sm px-4 py-1`}>
                {level.label} Stress
              </Badge>
              <p className="text-xs text-muted-foreground mt-3 text-center max-w-[260px]">
                {selectedData.score >= 80
                  ? "Immediate action required — compressors are near capacity under extreme conditions."
                  : selectedData.score >= 60
                  ? "Elevated risk — consider load reduction or pre-cooling strategies."
                  : selectedData.score >= 40
                  ? "Manageable stress — systems operating within normal parameters."
                  : "Optimal conditions — low thermal and mechanical stress."}
              </p>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Stress Factor Breakdown
              </CardTitle>
              <CardDescription>Six weighted factors composing the CSI score</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Radar name="Stress" dataKey="value" stroke={level.color} fill={level.color} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Factor Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Thermometer, label: "Temperature", value: selectedData.factors.temperature, unit: "%" },
            { icon: Droplets, label: "Humidity", value: selectedData.factors.humidity, unit: "%" },
            { icon: Building2, label: "Thermal Inertia", value: selectedData.factors.thermalInertia, unit: "%" },
            { icon: Wind, label: "Compressor Cycling", value: selectedData.factors.compressorCycling, unit: "%" },
            { icon: Gauge, label: "Load Intensity", value: selectedData.factors.loadIntensity, unit: "%" },
            { icon: AlertTriangle, label: "Weather Vol.", value: selectedData.factors.weatherVolatility, unit: "%" },
          ].map((f, i) => {
            const fLevel = getStressLevel(f.value);
            return (
              <motion.div key={f.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="relative overflow-hidden">
                  <div className={`absolute inset-x-0 top-0 h-1 ${fLevel.bg}`} style={{ background: fLevel.color }} />
                  <CardContent className="pt-5 pb-4 px-4 text-center">
                    <f.icon className="h-4 w-4 mx-auto mb-1" style={{ color: fLevel.color }} />
                    <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
                    <p className="text-xl font-bold text-foreground">{Math.round(f.value)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 24h Forecast + Portfolio Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 24h Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">24-Hour Stress Forecast</CardTitle>
              <CardDescription>Predicted CSI trajectory for {selectedData.site.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={3} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <ReTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={level.color} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={level.color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="stress" stroke={level.color} fill="url(#stressGrad)" strokeWidth={2} name="CSI Score" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Portfolio Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio Stress Ranking</CardTitle>
              <CardDescription>All active sites ranked by CSI score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
              {portfolioRanked.map((d, i) => {
                const l = getStressLevel(d.score);
                return (
                  <motion.div
                    key={d.site.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      d.site.id === selectedSiteId ? "bg-secondary" : "hover:bg-secondary/50"
                    }`}
                    onClick={() => setSelectedSiteId(d.site.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.site.name}</p>
                        <p className="text-xs text-muted-foreground">{d.site.city} • {d.site.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: l.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${d.score}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                        />
                      </div>
                      <span className="text-sm font-bold w-8 text-right" style={{ color: l.color }}>
                        {d.score}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Methodology note */}
        <Card className="glass-card">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">CSI™ Methodology:</strong> The Cooling Stress Index is a proprietary composite score
              weighted across six factors — ambient temperature (30%), compressor cycling behavior (20%),
              humidity load (15%), thermal inertia (15%), demand-to-capacity ratio (12%), and weather
              volatility (8%). Scores refresh with live weather data every 5 minutes. Patent pending.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
