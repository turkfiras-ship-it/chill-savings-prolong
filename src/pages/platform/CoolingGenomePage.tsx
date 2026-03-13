import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dna, FlaskConical, Activity, Zap, ShieldCheck, AlertTriangle, TrendingUp, GitCompare, Sparkles, Brain } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import {
  coolingGenomes, genomeStats, computeGenomeSimilarity, simulateScenario,
  type CoolingGenome, type ScenarioResult,
} from "@/data/coolingGenomeData";

// ── Animated KPI ──────────────────────────────────────────
function GenomeKpi({ label, value, suffix = "", icon: Icon, color }: {
  label: string; value: number; suffix?: string; icon: React.ElementType; color: string;
}) {
  const display = useCountUp({ end: value, duration: 1200 });
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{display}{suffix}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── DNA Radial Chart ──────────────────────────────────────
function GenomeDna({ genome, compare }: { genome: CoolingGenome; compare?: CoolingGenome }) {
  const data = genome.traits.map((t, i) => ({
    trait: t.name,
    value: t.value,
    compare: compare?.traits[i]?.value ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="trait" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name={genome.siteName} dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
        {compare && (
          <Radar name={compare.siteName} dataKey="compare" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 4" />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Trait Bar ─────────────────────────────────────────────
function TraitBar({ name, value, label }: { name: string; value: number; label: string }) {
  const barColor = value > 70 ? "bg-primary" : value > 45 ? "bg-accent" : "bg-warning";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{name}</span>
        <span className="text-foreground font-medium">{label} ({value})</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Diagnostic Card ───────────────────────────────────────
function DiagnosticCard({ d }: { d: CoolingGenome["diagnostics"][0] }) {
  const sevColor = d.severity === "critical" ? "text-destructive" : d.severity === "warning" ? "text-warning" : "text-primary";
  const sevBg = d.severity === "critical" ? "bg-destructive/10 border-destructive/30" : d.severity === "warning" ? "bg-warning/10 border-warning/30" : "bg-primary/10 border-primary/30";
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`rounded-lg border p-3 ${sevBg}`}>
      <div className="flex items-center gap-2 mb-2">
        {d.severity === "critical" ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Activity className="h-4 w-4 text-warning" />}
        <span className={`text-sm font-semibold ${sevColor}`}>Genome Mismatch — {d.trait}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div><span className="text-muted-foreground">Expected: </span><span className="text-foreground font-mono">{d.expected}%</span></div>
        <div><span className="text-muted-foreground">Observed: </span><span className="text-foreground font-mono">{d.observed}%</span></div>
      </div>
      <p className="text-xs text-muted-foreground">Likely cause: <span className="text-foreground font-medium">{d.likelyCause}</span></p>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function CoolingGenomePage() {
  const [selectedId, setSelectedId] = useState(coolingGenomes[0]?.siteId);
  const [compareId, setCompareId] = useState<string>("");
  const [simResults, setSimResults] = useState<ScenarioResult[]>([]);

  const genome = useMemo(() => coolingGenomes.find(g => g.siteId === selectedId)!, [selectedId]);
  const compareGenome = useMemo(() => (compareId ? coolingGenomes.find(g => g.siteId === compareId) : undefined), [compareId]);
  const similarity = useMemo(() => (compareGenome ? computeGenomeSimilarity(genome, compareGenome) : null), [genome, compareGenome]);

  const runSimulations = () => {
    const results = ["setpoint", "nightCool", "compressorUpgrade", "heatwave"].map(s => simulateScenario(genome, s));
    setSimResults(results);
  };

  const categoryColor: Record<string, string> = {
    Elite: "bg-primary/20 text-primary border-primary/30",
    Strong: "bg-accent/20 text-accent border-accent/30",
    Average: "bg-warning/20 text-warning border-warning/30",
    Developing: "bg-destructive/20 text-destructive border-destructive/30",
  };

  // Distribution for histogram
  const distribution = useMemo(() => {
    const buckets = [
      { range: "0–20", count: 0 }, { range: "21–40", count: 0 }, { range: "41–60", count: 0 },
      { range: "61–80", count: 0 }, { range: "81–100", count: 0 },
    ];
    coolingGenomes.forEach(g => {
      const idx = Math.min(4, Math.floor(g.overallScore / 20));
      buckets[idx].count++;
    });
    return buckets;
  }, []);

  const bucketColors = ["hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--accent))", "hsl(var(--chart-blue))", "hsl(var(--primary))"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Dna className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Cooling Genome™ Lab</h1>
            <p className="text-sm text-muted-foreground">The DNA model of every cooling system</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary gap-1">
          <Sparkles className="h-3 w-3" /> {genomeStats.totalGenomes} Genomes Profiled
        </Badge>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GenomeKpi label="Portfolio Genome Score" value={genomeStats.avgScore} suffix="/100" icon={Dna} color="bg-primary" />
        <GenomeKpi label="Elite Systems" value={genomeStats.eliteCount} icon={ShieldCheck} color="bg-accent" />
        <GenomeKpi label="Critical Mismatches" value={genomeStats.criticalDiagnostics} icon={AlertTriangle} color="bg-destructive" />
        <GenomeKpi label="Genomes Analyzed" value={genomeStats.totalGenomes} icon={FlaskConical} color="bg-chart-purple" />
      </div>

      {/* Building Selector */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">Select Building</label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {coolingGenomes.map(g => (
                  <SelectItem key={g.siteId} value={g.siteId}>{g.siteName} — {g.city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">Compare With</label>
            <Select value={compareId} onValueChange={setCompareId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {coolingGenomes.filter(g => g.siteId !== selectedId).map(g => (
                  <SelectItem key={g.siteId} value={g.siteId}>{g.siteName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {similarity !== null && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <p className="text-xs text-muted-foreground">Genome Similarity</p>
              <p className="text-2xl font-bold text-accent">{similarity}%</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="profile">Genome Profile</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="simulate">Scenario Simulation</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio View</TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ────────────────────────────── */}
        <TabsContent value="profile">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* DNA Radial */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dna className="h-4 w-4 text-primary" /> Cooling DNA Fingerprint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={`${categoryColor[genome.category]} border`}>{genome.category}</Badge>
                  <span className="text-sm text-muted-foreground">Genome ID: <span className="font-mono text-foreground">{genome.genomeId}</span></span>
                </div>
                <GenomeDna genome={genome} compare={compareGenome} />
                {compareGenome && (
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1"><span className="h-2 w-6 rounded bg-primary inline-block" /> {genome.siteName}</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-6 rounded bg-accent inline-block border-dashed" /> {compareGenome.siteName}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trait Breakdown */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" /> Trait Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {genome.traits.map(t => (
                  <TraitBar key={t.key} name={t.name} value={t.value} label={t.label} />
                ))}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Overall Genome Score</span>
                    <span className="text-xl font-bold text-foreground">{genome.overallScore}/100</span>
                  </div>
                  <Progress value={genome.overallScore} className="mt-2 h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Evolution Chart */}
            <Card className="border-border/50 bg-card/80 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Genome Evolution Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={genome.evolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} name="Genome Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Diagnostics Tab ────────────────────────── */}
        <TabsContent value="diagnostics">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border/50 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" /> Genome Mismatch Diagnostics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {genome.diagnostics.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm">All traits within expected ranges. No mismatches detected.</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {genome.diagnostics.map((d, i) => (
                        <DiagnosticCard key={i} d={d} />
                      ))}
                    </AnimatePresence>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Insight */}
            <Card className="border-primary/20 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> AI Genome Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-secondary/50 p-4 border border-border/50">
                  <TypingText text={`${genome.siteName} exhibits ${genome.traits.find(t => t.key === "thermalInertia")?.label.toLowerCase()} thermal inertia with ${genome.traits.find(t => t.key === "compressorStability")?.label.toLowerCase()} compressor stability. ${genome.diagnostics.filter(d => d.severity === "critical").length > 0 ? `Critical mismatches detected in ${genome.diagnostics.filter(d => d.severity === "critical").map(d => d.trait).join(", ")}. Immediate investigation recommended.` : "System is operating within expected behavioral parameters."} Genome category: ${genome.category}.`} />
                </div>

                {/* Closest match */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Closest Genome Match</p>
                  {(() => {
                    const matches = coolingGenomes
                      .filter(g => g.siteId !== genome.siteId)
                      .map(g => ({ ...g, matchScore: computeGenomeSimilarity(genome, g) }))
                      .sort((a, b) => b.matchScore - a.matchScore);
                    const best = matches[0];
                    return best ? (
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                        <p className="text-sm font-medium text-foreground">{best.siteName}</p>
                        <p className="text-xs text-muted-foreground">{best.city} — {best.type}</p>
                        <p className="text-lg font-bold text-primary mt-1">{best.matchScore}% similarity</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Simulation Tab ─────────────────────────── */}
        <TabsContent value="simulate">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-accent" /> Scenario Simulation — {genome.siteName}
              </CardTitle>
              <Button onClick={runSimulations} size="sm" className="gap-2">
                <Zap className="h-3 w-3" /> Run All Scenarios
              </Button>
            </CardHeader>
            <CardContent>
              {simResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Click "Run All Scenarios" to simulate impacts based on this building's Cooling Genome.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {simResults.map((sr, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <div className={`rounded-lg border p-4 ${sr.energyReduction >= 0 ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{sr.icon}</span>
                          <span className="text-sm font-semibold text-foreground">{sr.scenario}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Energy Impact</p>
                            <p className={`text-lg font-bold ${sr.energyReduction >= 0 ? "text-primary" : "text-destructive"}`}>
                              {sr.energyReduction >= 0 ? "-" : "+"}{Math.abs(sr.energyReduction)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Comfort Risk</p>
                            <Badge variant="outline" className={sr.comfortRisk === "Low" ? "border-primary/30 text-primary" : sr.comfortRisk === "Medium" ? "border-warning/30 text-warning" : "border-destructive/30 text-destructive"}>
                              {sr.comfortRisk}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Confidence</p>
                            <p className="text-lg font-bold text-foreground">{sr.confidence}%</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Portfolio Tab ───────────────────────────── */}
        <TabsContent value="portfolio">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Genome Distribution */}
            <Card className="border-border/50 bg-card/80 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Genome Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="count" name="Buildings" radius={[6, 6, 0, 0]}>
                      {distribution.map((_, i) => (
                        <Cell key={i} fill={bucketColors[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trait Averages */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Portfolio Trait Averages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {genomeStats.traitDistribution.map(td => (
                  <TraitBar key={td.trait} name={td.trait} value={td.avg} label={`${td.avg}`} />
                ))}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="border-border/50 bg-card/80 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-accent" /> Genome Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Rank</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Building</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">City</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Type</th>
                        <th className="text-center py-2 px-3 text-muted-foreground font-medium">Score</th>
                        <th className="text-center py-2 px-3 text-muted-foreground font-medium">Category</th>
                        <th className="text-center py-2 px-3 text-muted-foreground font-medium">Mismatches</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...coolingGenomes].sort((a, b) => b.overallScore - a.overallScore).map((g, i) => (
                        <motion.tr
                          key={g.siteId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/30 hover:bg-secondary/30 cursor-pointer transition-colors"
                          onClick={() => setSelectedId(g.siteId)}
                        >
                          <td className="py-2 px-3 font-mono text-muted-foreground">#{i + 1}</td>
                          <td className="py-2 px-3 font-medium text-foreground">{g.siteName}</td>
                          <td className="py-2 px-3 text-muted-foreground">{g.city}</td>
                          <td className="py-2 px-3 text-muted-foreground">{g.type}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`font-bold ${g.overallScore > 70 ? "text-primary" : g.overallScore > 50 ? "text-accent" : "text-warning"}`}>{g.overallScore}</span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant="outline" className={`${categoryColor[g.category]} border text-xs`}>{g.category}</Badge>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {g.diagnostics.filter(d => d.severity !== "normal").length > 0 ? (
                              <Badge variant="destructive" className="text-xs">{g.diagnostics.filter(d => d.severity !== "normal").length}</Badge>
                            ) : (
                              <span className="text-primary text-xs">✓</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Typing Effect Component ───────────────────────────────
function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useMemo(() => {
    setDisplayed("");
    setDone(false);
  }, [text]);

  // Use useEffect for the typing interval
  const textRef = useMemo(() => ({ text }), [text]);

  useState(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < textRef.text.length) {
        setDisplayed(textRef.text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  });

  return (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {displayed}
      {!done && <span className="inline-block w-1 h-4 bg-primary animate-pulse ml-0.5" />}
    </p>
  );
}
