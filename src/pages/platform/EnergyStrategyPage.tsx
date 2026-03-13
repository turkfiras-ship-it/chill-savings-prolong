import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { energyScenarios, type EnergyScenario } from "@/data/autonomousMockData";
import { BarChart3, Zap, TrendingDown, DollarSign } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";

export default function EnergyStrategyPage() {
  const [selected, setSelected] = useState<EnergyScenario>(energyScenarios[0]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent" />
            Energy Demand Strategy
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Simulate demand shaping strategies and projected impact</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {energyScenarios.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.02 }}>
              <Card
                className={`cursor-pointer transition-all ${selected.id === s.id ? "ring-2 ring-accent border-accent/50" : "hover:border-muted-foreground/30"}`}
                onClick={() => setSelected(s)}
              >
                <CardContent className="pt-5 pb-4">
                  <h3 className="font-semibold text-foreground mb-2">{s.strategy}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{s.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-secondary/50 rounded p-2">
                      <p className="text-sm font-bold text-primary">-{s.demandReduction}%</p>
                      <p className="text-[10px] text-muted-foreground">Demand</p>
                    </div>
                    <div className="bg-secondary/50 rounded p-2">
                      <p className="text-sm font-bold text-accent">{(s.costImpact / 1000).toFixed(0)}K</p>
                      <p className="text-[10px] text-muted-foreground">SAR/yr</p>
                    </div>
                    <div className="bg-secondary/50 rounded p-2">
                      <p className="text-sm font-bold text-primary">-{s.gridLoadReduction}%</p>
                      <p className="text-[10px] text-muted-foreground">Grid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{selected.strategy} — 24h Load Profile</CardTitle>
                <CardDescription>Baseline vs Optimized demand curve</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={selected.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={3} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <defs>
                      <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} /><stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.02} /></linearGradient>
                      <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} /></linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="baseline" stroke="hsl(var(--destructive))" fill="url(#baseGrad)" strokeWidth={2} strokeDasharray="6 3" name="Baseline (kW)" />
                    <Area type="monotone" dataKey="optimized" stroke="hsl(var(--primary))" fill="url(#optGrad)" strokeWidth={2} name="Optimized (kW)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <Card className="glass-card border-primary/20">
          <CardContent className="pt-5 pb-4 flex flex-wrap gap-8 justify-center">
            <div className="text-center">
              <TrendingDown className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">-{selected.demandReduction}%</p>
              <p className="text-xs text-muted-foreground">Peak Demand Reduction</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{Math.abs(selected.costImpact).toLocaleString()} SAR</p>
              <p className="text-xs text-muted-foreground">Annual Cost Savings</p>
            </div>
            <div className="text-center">
              <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">-{selected.gridLoadReduction}%</p>
              <p className="text-xs text-muted-foreground">Grid Load Reduction</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
