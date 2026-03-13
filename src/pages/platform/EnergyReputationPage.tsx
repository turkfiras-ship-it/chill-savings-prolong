import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ersData } from "@/data/advancedMockData";
import { Award, Star, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";

const categoryStyles: Record<string, { color: string; bg: string; text: string }> = {
  Elite: { color: "hsl(var(--primary))", bg: "bg-primary/10", text: "text-primary" },
  Strong: { color: "hsl(var(--accent))", bg: "bg-accent/10", text: "text-accent" },
  Average: { color: "hsl(var(--warning))", bg: "bg-warning/10", text: "text-warning" },
  "At Risk": { color: "hsl(var(--destructive))", bg: "bg-destructive/10", text: "text-destructive" },
};

function ScoreGauge({ score, size = 200 }: { score: number; size?: number }) {
  const pct = score / 1000;
  const angle = pct * 270;
  const r = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;
  const category = score >= 850 ? "Elite" : score >= 700 ? "Strong" : score >= 500 ? "Average" : "At Risk";
  const style = categoryStyles[category];

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
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={arcPath(-135, 135)} fill="none" stroke="hsl(var(--muted))" strokeWidth="14" strokeLinecap="round" />
        <motion.path
          d={arcPath(-135, -135 + angle)}
          fill="none"
          stroke={style.color}
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-foreground" style={{ fontSize: 40, fontWeight: 800 }}>
          {score}
        </text>
        <text x={cx} y={cy + 35} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 12 }}>
          / 1,000
        </text>
      </svg>
      <Badge className={`mt-2 ${style.bg} ${style.text} border-0 text-sm px-4 py-1`}>
        {category}
      </Badge>
    </div>
  );
}

export default function EnergyReputationPage() {
  const [selectedSiteId, setSelectedSiteId] = useState(ersData[0].siteId);
  const selected = ersData.find(d => d.siteId === selectedSiteId) || ersData[0];
  const style = categoryStyles[selected.category];

  const radarData = [
    { factor: "Efficiency", value: selected.components.efficiency, fullMark: 1000 },
    { factor: "Equipment Health", value: selected.components.equipmentHealth, fullMark: 1000 },
    { factor: "Demand Stability", value: selected.components.demandStability, fullMark: 1000 },
    { factor: "Carbon Intensity", value: selected.components.carbonIntensity, fullMark: 1000 },
    { factor: "Anomaly Frequency", value: selected.components.anomalyFrequency, fullMark: 1000 },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Star className="h-6 w-6 text-warning" />
              Energy Reputation Score
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Building credit score for energy performance • 0–1,000 scale</p>
          </div>
          <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ersData.map(d => (
                <SelectItem key={d.siteId} value={d.siteId}>{d.siteName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Score + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`border-${selected.category === "Elite" ? "primary" : selected.category === "Strong" ? "accent" : selected.category === "Average" ? "warning" : "destructive"}/20`}>
            <CardContent className="pt-6 flex flex-col items-center">
              <ScoreGauge score={selected.score} size={220} />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {selected.siteName} • {selected.city}
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Score Breakdown</CardTitle>
              <CardDescription>Five weighted components</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 1000]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Radar name="Score" dataKey="value" stroke={style.color} fill={style.color} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Trend + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ERS Trend Over Time</CardTitle>
              <CardDescription>12-month score history for {selected.siteName}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={selected.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis domain={[300, 1000]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="score" stroke={style.color} strokeWidth={2} dot={{ r: 3, fill: style.color }} name="ERS Score" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio Leaderboard</CardTitle>
              <CardDescription>All sites ranked by ERS</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[320px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Rank</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ersData.map((d, i) => {
                    const s = categoryStyles[d.category];
                    return (
                      <TableRow key={d.siteId} className={d.siteId === selectedSiteId ? "bg-secondary" : "cursor-pointer hover:bg-secondary/50"} onClick={() => setSelectedSiteId(d.siteId)}>
                        <TableCell className="font-mono text-muted-foreground">#{i + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{d.siteName}</TableCell>
                        <TableCell className="text-right font-bold" style={{ color: s.color }}>{d.score}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={`${s.bg} ${s.text} border-0`}>{d.category}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
