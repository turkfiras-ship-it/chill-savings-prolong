import { useMemo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sites } from "@/data/mockData";
import { PageTransition } from "@/components/platform/PageTransition";
import { Radar, Shield, AlertTriangle, Crosshair, Radio, Zap, Thermometer, Activity } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, ResponsiveContainer, Tooltip } from "recharts";

// ── Seeded random ────────────────────────────────────────
function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ── ANOMALY SWEEP RADAR ──────────────────────────────────
interface AnomalyBlip {
  id: string;
  label: string;
  angle: number;
  distance: number; // 0-1
  severity: "normal" | "warning" | "critical";
  type: string;
}

function AnomalySweepRadar() {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [revealedBlips, setRevealedBlips] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const blips = useMemo<AnomalyBlip[]>(() => {
    const rand = seeded(99);
    const anomalyTypes = ["Energy Spike", "Compressor Fault", "Temp Drift", "Load Surge", "Efficiency Drop", "Sensor Offline"];
    return sites.filter(s => s.status === "active").slice(0, 12).map((s, i) => ({
      id: s.id,
      label: s.name.split(" ").slice(0, 2).join(" "),
      angle: rand() * 360,
      distance: 0.25 + rand() * 0.65,
      severity: rand() > 0.7 ? "critical" : rand() > 0.4 ? "warning" : "normal",
      type: anomalyTypes[Math.floor(rand() * anomalyTypes.length)],
    }));
  }, []);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const speed = 45; // degrees per second

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) / 1000;
      const angle = (elapsed * speed) % 360;
      setSweepAngle(angle);

      // Reveal blips as sweep passes them
      setRevealedBlips(prev => {
        const next = new Set(prev);
        blips.forEach(b => {
          const diff = ((angle - b.angle) % 360 + 360) % 360;
          if (diff < 8 && diff >= 0) next.add(b.id);
        });
        return next;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [blips]);

  // Draw radar canvas (rings + sweep)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 400;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2); // retina
    const cx = size / 2, cy = size / 2, maxR = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    // Rings
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(77, 163, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Cross lines
    ctx.strokeStyle = "rgba(77, 163, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let a = 0; a < 360; a += 45) {
      const rad = (a * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(rad), cy + maxR * Math.sin(rad));
      ctx.stroke();
    }

    // Sweep cone
    const sweepRad = ((sweepAngle - 90) * Math.PI) / 180;
    const gradient = ctx.createConicalGradient?.(sweepRad, cx, cy);
    // Fallback: draw as arc fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR, sweepRad - 0.5, sweepRad, false);
    ctx.closePath();
    const grad = ctx.createLinearGradient(cx, cy, cx + maxR * Math.cos(sweepRad), cy + maxR * Math.sin(sweepRad));
    grad.addColorStop(0, "rgba(77, 163, 255, 0.25)");
    grad.addColorStop(1, "rgba(77, 163, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Sweep line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + maxR * Math.cos(sweepRad), cy + maxR * Math.sin(sweepRad));
    ctx.strokeStyle = "rgba(77, 163, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(210, 100%, 62%)";
    ctx.fill();
  }, [sweepAngle]);

  const severityColor = (s: AnomalyBlip["severity"]) =>
    s === "critical" ? "hsl(var(--destructive))" : s === "warning" ? "hsl(var(--warning))" : "hsl(var(--primary))";

  const cx = 200, cy = 200, maxR = 180;

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ imageRendering: "auto" }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {blips.map(b => {
          const rad = ((b.angle - 90) * Math.PI) / 180;
          const x = cx + maxR * b.distance * Math.cos(rad);
          const y = cy + maxR * b.distance * Math.sin(rad);
          const revealed = revealedBlips.has(b.id);
          return (
            <g key={b.id}>
              <motion.circle
                cx={x} cy={y}
                r={revealed ? 5 : 0}
                fill={severityColor(b.severity)}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: revealed ? 5 : 0, opacity: revealed ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              {revealed && (
                <motion.circle
                  cx={x} cy={y} r={12}
                  fill="none"
                  stroke={severityColor(b.severity)}
                  strokeWidth={1}
                  initial={{ r: 5, opacity: 0.8 }}
                  animate={{ r: 12, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </g>
          );
        })}
      </svg>
      {/* Blip Labels */}
      <div className="absolute inset-0">
        {blips.filter(b => revealedBlips.has(b.id)).map(b => {
          const rad = ((b.angle - 90) * Math.PI) / 180;
          const pct_x = 50 + (50 * b.distance * Math.cos(rad));
          const pct_y = 50 + (50 * b.distance * Math.sin(rad));
          return (
            <motion.div
              key={b.id + "-label"}
              className="absolute pointer-events-none"
              style={{ left: `${pct_x}%`, top: `${pct_y}%`, transform: "translate(-50%, -150%)" }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap bg-background/80 px-1 rounded">
                {b.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Anomaly Log ──────────────────────────────────────────
function AnomalyLog() {
  const rand = seeded(77);
  const logs = useMemo(() => {
    const types = ["Energy Spike", "Compressor Cycling", "Temp Deviation", "Load Imbalance", "Sensor Drift", "Efficiency Loss"];
    return sites.filter(s => s.status === "active").slice(0, 8).map((s, i) => ({
      site: s.name.split(" ").slice(0, 2).join(" "),
      type: types[Math.floor(rand() * types.length)],
      severity: rand() > 0.6 ? "critical" : rand() > 0.3 ? "warning" : "normal",
      time: `${Math.floor(rand() * 12)}:${String(Math.floor(rand() * 60)).padStart(2, "0")} ago`,
      value: `+${(5 + rand() * 30).toFixed(1)}%`,
    }));
  }, []);

  const sevBadge = (s: string) =>
    s === "critical" ? "bg-destructive/20 text-destructive border-0" :
    s === "warning" ? "bg-warning/20 text-warning border-0" :
    "bg-primary/20 text-primary border-0";

  return (
    <div className="space-y-2">
      {logs.map((log, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/30"
        >
          <div className={`h-2 w-2 rounded-full shrink-0 ${log.severity === "critical" ? "bg-destructive" : log.severity === "warning" ? "bg-warning" : "bg-primary"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{log.site}</p>
            <p className="text-[10px] text-muted-foreground">{log.type}</p>
          </div>
          <span className="text-xs font-mono text-destructive font-bold">{log.value}</span>
          <Badge className={`text-[9px] ${sevBadge(log.severity)}`}>{log.severity}</Badge>
          <span className="text-[9px] text-muted-foreground/60 font-mono">{log.time}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ── EFFICIENCY RADAR (Spider Chart) ──────────────────────
function EfficiencyRadar() {
  const rand = seeded(42);
  const metrics = ["Thermal Inertia", "Compressor COP", "Load Balance", "Recovery Speed", "Peak Handling", "Humidity Control"];
  const siteData = useMemo(() => {
    return sites.filter(s => s.status === "active").slice(0, 3).map(s => ({
      name: s.name.split(" ").slice(0, 2).join(" "),
      values: metrics.map(() => Math.round(40 + rand() * 55)),
    }));
  }, []);

  const chartData = metrics.map((m, i) => ({
    metric: m,
    ...Object.fromEntries(siteData.map(s => [s.name, s.values[i]])),
  }));

  const colors = ["hsl(var(--primary))", "hsl(var(--chart-green))", "hsl(var(--chart-amber))"];

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          {siteData.map((s, i) => (
            <RechartsRadar
              key={s.name}
              name={s.name}
              dataKey={s.name}
              stroke={colors[i]}
              fill={colors[i]}
              fillOpacity={0.08}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 11,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EfficiencyTable() {
  const rand = seeded(42);
  const metrics = ["Thermal Inertia", "Compressor COP", "Load Balance", "Recovery Speed", "Peak Handling", "Humidity Control"];
  const topSites = sites.filter(s => s.status === "active").slice(0, 6).map(s => ({
    name: s.name.split(" ").slice(0, 2).join(" "),
    avg: Math.round(55 + rand() * 35),
    best: metrics[Math.floor(rand() * metrics.length)],
    worst: metrics[Math.floor(rand() * metrics.length)],
    trend: rand() > 0.5 ? "up" : "down",
  }));

  return (
    <div className="space-y-2">
      {topSites.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/30"
        >
          <span className="text-xs font-bold text-primary bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{s.name}</p>
            <p className="text-[10px] text-muted-foreground">Best: {s.best}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono font-bold text-foreground">{s.avg}%</p>
            <p className={`text-[10px] ${s.trend === "up" ? "text-primary" : "text-destructive"}`}>
              {s.trend === "up" ? "▲ improving" : "▼ declining"}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── THREAT RISK RADAR (Concentric Rings) ─────────────────
interface ThreatEntry {
  label: string;
  ring: 0 | 1 | 2 | 3; // 0=center=critical, 3=outer=low
  angle: number;
  type: "equipment" | "energy" | "weather" | "operational";
}

function ThreatRiskRadar() {
  const threats = useMemo<ThreatEntry[]>(() => {
    const rand = seeded(123);
    const items: ThreatEntry[] = [
      { label: "Compressor Valve Wear", ring: 0, angle: 30, type: "equipment" },
      { label: "Peak Demand Breach", ring: 0, angle: 180, type: "energy" },
      { label: "Heatwave +8°C", ring: 1, angle: 70, type: "weather" },
      { label: "Refrigerant Leak", ring: 1, angle: 220, type: "equipment" },
      { label: "Grid Instability", ring: 1, angle: 310, type: "operational" },
      { label: "Condenser Fouling", ring: 2, angle: 45, type: "equipment" },
      { label: "Tariff Spike", ring: 2, angle: 150, type: "energy" },
      { label: "Humidity Surge", ring: 2, angle: 260, type: "weather" },
      { label: "Filter Blockage", ring: 3, angle: 20, type: "equipment" },
      { label: "Night Recovery Fail", ring: 3, angle: 120, type: "operational" },
      { label: "Sensor Drift", ring: 3, angle: 200, type: "operational" },
      { label: "Insulation Decay", ring: 3, angle: 300, type: "equipment" },
    ];
    return items;
  }, []);

  const ringLabels = ["CRITICAL", "HIGH", "MODERATE", "LOW"];
  const ringColors = [
    "rgba(255, 92, 92, 0.15)",
    "rgba(255, 179, 71, 0.1)",
    "rgba(77, 163, 255, 0.07)",
    "rgba(77, 163, 255, 0.03)",
  ];
  const typeColors: Record<string, string> = {
    equipment: "hsl(var(--destructive))",
    energy: "hsl(var(--warning))",
    weather: "hsl(var(--chart-amber))",
    operational: "hsl(var(--primary))",
  };

  const cx = 200, cy = 200;
  const ringRadii = [50, 90, 130, 170];

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Concentric rings */}
        {ringRadii.map((r, i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill={ringColors[i]} stroke="hsl(var(--border))" strokeWidth={0.5} strokeOpacity={0.3} />
            <text
              x={cx + r - 8} y={cy - 4}
              fill="hsl(var(--muted-foreground))"
              fontSize={7} opacity={0.5}
              textAnchor="end"
            >
              {ringLabels[i]}
            </text>
          </g>
        ))}

        {/* Center shield */}
        <circle cx={cx} cy={cy} r={12} fill="hsl(var(--destructive))" fillOpacity={0.3} />
        <circle cx={cx} cy={cy} r={5} fill="hsl(var(--destructive))" fillOpacity={0.8} />

        {/* Threat dots */}
        {threats.map((t, i) => {
          const r = ringRadii[t.ring];
          const rad = ((t.angle - 90) * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          return (
            <g key={i}>
              <motion.circle
                cx={x} cy={y} r={6}
                fill={typeColors[t.type]}
                fillOpacity={0.9}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
              />
              {t.ring <= 1 && (
                <motion.circle
                  cx={x} cy={y} r={14}
                  fill="none"
                  stroke={typeColors[t.type]}
                  strokeWidth={1}
                  initial={{ r: 6, opacity: 0.6 }}
                  animate={{ r: 14, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Labels */}
      {threats.map((t, i) => {
        const r = ringRadii[t.ring];
        const rad = ((t.angle - 90) * Math.PI) / 180;
        const pctX = 50 + (r / 2) * Math.cos(rad);
        const pctY = 50 + (r / 2) * Math.sin(rad);
        return (
          <motion.div
            key={i + "-label"}
            className="absolute pointer-events-none"
            style={{ left: `${pctX}%`, top: `${pctY}%`, transform: "translate(-50%, -180%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.08 }}
          >
            <span className="text-[8px] font-mono text-muted-foreground whitespace-nowrap bg-background/90 px-1 rounded border border-border/20">
              {t.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function ThreatSummary() {
  const categories = [
    { type: "Equipment", count: 5, critical: 1, color: "destructive", icon: Zap },
    { type: "Energy", count: 3, critical: 1, color: "warning", icon: Activity },
    { type: "Weather", count: 2, critical: 0, color: "chart-amber", icon: Thermometer },
    { type: "Operational", count: 3, critical: 0, color: "primary", icon: Shield },
  ];

  return (
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.type}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30"
        >
          <div className={`h-8 w-8 rounded-lg bg-${cat.color}/10 flex items-center justify-center`}>
            <cat.icon className={`h-4 w-4 text-${cat.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">{cat.type} Threats</p>
            <p className="text-[10px] text-muted-foreground">{cat.count} detected • {cat.critical} critical</p>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: cat.count }).map((_, j) => (
              <div key={j} className={`h-2 w-2 rounded-full ${j < cat.critical ? `bg-destructive` : `bg-${cat.color}/40`}`} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────
export default function RadarDetectionPage() {
  const activeSites = sites.filter(s => s.status === "active").length;
  const stats = [
    { label: "Active Scans", value: activeSites, icon: Radio, color: "primary" },
    { label: "Anomalies Detected", value: 14, icon: AlertTriangle, color: "warning" },
    { label: "Critical Threats", value: 3, icon: Shield, color: "destructive" },
    { label: "Avg Efficiency", value: "78%", icon: Crosshair, color: "primary" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radar className="h-6 w-6 text-primary" />
            Radar Detection
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time anomaly scanning • Efficiency profiling • Threat assessment
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-border/30">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className={`h-4 w-4 text-${s.color}`} />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  </div>
                  <p className={`text-2xl font-mono font-bold text-${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabbed Radar Views */}
        <Tabs defaultValue="anomaly" className="w-full">
          <TabsList className="bg-secondary/50 border border-border/30">
            <TabsTrigger value="anomaly" className="gap-1.5 text-xs">
              <Radio className="h-3.5 w-3.5" /> Anomaly Sweep
            </TabsTrigger>
            <TabsTrigger value="efficiency" className="gap-1.5 text-xs">
              <Crosshair className="h-3.5 w-3.5" /> Efficiency Radar
            </TabsTrigger>
            <TabsTrigger value="threat" className="gap-1.5 text-xs">
              <Shield className="h-3.5 w-3.5" /> Threat Radar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anomaly" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Radio className="h-4 w-4 text-primary animate-pulse" />
                    Live Anomaly Scan
                  </CardTitle>
                  <CardDescription>Sweeping {activeSites} active sites for anomalies</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnomalySweepRadar />
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Detection Log</CardTitle>
                  <CardDescription>Recent anomalies identified by sweep</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnomalyLog />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="efficiency" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-primary" />
                    Multi-Axis Performance Radar
                  </CardTitle>
                  <CardDescription>Cooling efficiency profile across 6 dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <EfficiencyRadar />
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Site Rankings</CardTitle>
                  <CardDescription>Performance leaderboard by composite score</CardDescription>
                </CardHeader>
                <CardContent>
                  <EfficiencyTable />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threat" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3 border-destructive/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    Threat Assessment Ring
                  </CardTitle>
                  <CardDescription>Risk proximity from center (critical) to edge (low)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ThreatRiskRadar />
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Threat Categories</CardTitle>
                  <CardDescription>Breakdown by threat domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <ThreatSummary />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
