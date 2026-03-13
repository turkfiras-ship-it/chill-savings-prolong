import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { equipmentRisks, type EquipmentRisk } from "@/data/autonomousMockData";
import { Wrench, AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";

const typeColors: Record<string, string> = {
  Compressor: "hsl(var(--destructive))",
  Condenser: "hsl(var(--warning))",
  Evaporator: "hsl(var(--accent))",
  Refrigerant: "hsl(var(--primary))",
};

export default function PredictiveMaintenancePage() {
  const [selected, setSelected] = useState<EquipmentRisk>(equipmentRisks[0]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-6 w-6 text-warning" />
            Predictive Maintenance AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Equipment failure prediction before it occurs</p>
        </div>

        {/* Risk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipmentRisks.map((eq, i) => (
            <motion.div key={eq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.02 }}>
              <Card
                className={`cursor-pointer transition-all ${selected.id === eq.id ? "ring-2 ring-accent border-accent/50" : "hover:border-muted-foreground/30"}`}
                onClick={() => setSelected(eq)}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{eq.name}</p>
                      <p className="text-xs text-muted-foreground">{eq.site}</p>
                    </div>
                    <Badge className={`border-0 ${eq.failureRisk >= 70 ? "bg-destructive/20 text-destructive" : eq.failureRisk >= 50 ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"}`}>
                      {eq.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Failure Risk</p>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: typeColors[eq.type] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${eq.failureRisk}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: typeColors[eq.type] }}>{eq.failureRisk}%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Est. {eq.daysToFailure} days to failure
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detail */}
        <AnimatePresence mode="wait">
          <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-warning" />
                    Health Degradation — {selected.name}
                  </CardTitle>
                  <CardDescription>{selected.site} • {selected.runHours.toLocaleString()} run hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={selected.degradationTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={4} />
                      <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      <defs>
                        <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={typeColors[selected.type]} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={typeColors[selected.type]} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="health" stroke={typeColors[selected.type]} fill="url(#healthGrad)" strokeWidth={2} name="Health %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-warning/20">
                <CardHeader>
                  <CardTitle className="text-base">Equipment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    ["Equipment", selected.name],
                    ["Type", selected.type],
                    ["Site", selected.site],
                    ["Failure Risk", `${selected.failureRisk}%`],
                    ["Days to Failure", `${selected.daysToFailure} days`],
                    ["Run Hours", selected.runHours.toLocaleString()],
                    ["Last Maintenance", selected.lastMaintenance],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
