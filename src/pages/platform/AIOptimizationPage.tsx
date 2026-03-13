import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { optimizationOpps } from "@/data/autonomousMockData";
import { Cpu, TrendingUp, Zap, Leaf, ChevronRight, Play } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";
import { useCountUp } from "@/hooks/useCountUp";

const complexityColor = { Low: "text-primary", Medium: "text-warning", High: "text-destructive" };

export default function AIOptimizationPage() {
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simulated, setSimulated] = useState<Set<string>>(new Set());
  const totalSavings = optimizationOpps.reduce((a, o) => a + o.potentialSavings, 0);
  const countSavings = useCountUp({ end: totalSavings, duration: 1800 });

  const handleSimulate = (id: string) => {
    setSimulating(id);
    setTimeout(() => { setSimulated(prev => new Set(prev).add(id)); setSimulating(null); }, 2000);
  };

  const chartData = optimizationOpps.map(o => ({
    name: o.strategy.split(" ")[0],
    savings: o.potentialSavings / 1000,
    confidence: o.confidence,
  }));

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-6 w-6 text-accent" />
            Autonomous Optimization Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered energy optimization strategies with simulation</p>
        </div>

        <Card className="border-accent/20">
          <CardContent className="pt-5 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Optimization Potential</p>
              <p className="text-3xl font-bold text-foreground">{(countSavings / 1000).toFixed(0)}K SAR/yr</p>
            </div>
            <Badge className="bg-primary/20 text-primary border-0 text-sm px-4 py-1">
              {optimizationOpps.length} Opportunities Detected
            </Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {optimizationOpps.map((opp, i) => (
            <motion.div key={opp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className={`relative overflow-hidden transition-all ${simulated.has(opp.id) ? "border-primary/30" : ""}`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{opp.icon}</span>
                    <Badge variant="outline" className={complexityColor[opp.complexity]}>{opp.complexity}</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{opp.strategy}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{opp.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-center mb-3">
                    <div className="bg-secondary/50 rounded p-2">
                      <p className="text-sm font-bold text-primary">{(opp.potentialSavings / 1000).toFixed(0)}K SAR</p>
                      <p className="text-[10px] text-muted-foreground">Potential Savings</p>
                    </div>
                    <div className="bg-secondary/50 rounded p-2">
                      <p className="text-sm font-bold text-accent">{opp.confidence}%</p>
                      <p className="text-[10px] text-muted-foreground">Confidence</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {simulated.has(opp.id) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-border pt-3 mt-3 grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-sm font-bold text-primary">-{opp.energyReduction}%</p><p className="text-[10px] text-muted-foreground">Energy</p></div>
                        <div><p className="text-sm font-bold text-accent">{(opp.costSavings / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">SAR Saved</p></div>
                        <div><p className="text-sm font-bold text-primary">-{opp.carbonReduction}t</p><p className="text-[10px] text-muted-foreground">CO₂</p></div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    size="sm"
                    variant={simulated.has(opp.id) ? "outline" : "default"}
                    className="w-full mt-3 gap-2"
                    onClick={() => handleSimulate(opp.id)}
                    disabled={simulating === opp.id}
                  >
                    {simulating === opp.id ? (
                      <><span className="animate-spin">⟳</span> Simulating...</>
                    ) : simulated.has(opp.id) ? (
                      <>✓ Simulated</>
                    ) : (
                      <><Play className="h-3 w-3" /> Simulate</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Optimization Comparison</CardTitle>
            <CardDescription>Potential savings by strategy (K SAR)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="savings" radius={[4, 4, 0, 0]} name="Savings (K SAR)">
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
