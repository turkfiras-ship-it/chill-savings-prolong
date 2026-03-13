import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { contractDefaults } from "@/data/autonomousMockData";
import { FileText, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { PageTransition } from "@/components/platform/PageTransition";

export default function ContractLabPage() {
  const [capex, setCapex] = useState(contractDefaults.capex);
  const [savingsPct, setSavingsPct] = useState(contractDefaults.savingsPercent);
  const [duration, setDuration] = useState(contractDefaults.durationYears);
  const [split, setSplit] = useState(contractDefaults.revenueSplit);

  const projections = useMemo(() => {
    const annualSavings = capex * (savingsPct / 100) * 2;
    let escoCum = 0, clientCum = 0;
    return Array.from({ length: duration }, (_, i) => {
      const year = i + 1;
      const annual = annualSavings * Math.pow(1.03, i);
      const escoShare = annual * (split / 100);
      const clientShare = annual * (1 - split / 100);
      escoCum += escoShare;
      clientCum += clientShare;
      return { year: `Y${year}`, escoAnnual: Math.round(escoShare), clientAnnual: Math.round(clientShare), escoCum: Math.round(escoCum), clientCum: Math.round(clientCum), totalSavings: Math.round(escoCum + clientCum) };
    });
  }, [capex, savingsPct, duration, split]);

  const paybackYear = projections.findIndex(p => p.escoCum >= capex) + 1;
  const totalEsco = projections[projections.length - 1]?.escoCum || 0;
  const totalClient = projections[projections.length - 1]?.clientCum || 0;
  const escoROI = Math.round(((totalEsco - capex) / capex) * 100);

  const riskScenarios = useMemo(() => {
    return [
      { scenario: "Base Case", probability: 60, savings: savingsPct, npv: totalEsco - capex },
      { scenario: "Optimistic (+20%)", probability: 20, savings: Math.round(savingsPct * 1.2), npv: Math.round((totalEsco - capex) * 1.2) },
      { scenario: "Conservative (-30%)", probability: 15, savings: Math.round(savingsPct * 0.7), npv: Math.round((totalEsco - capex) * 0.7) },
      { scenario: "Worst Case (-50%)", probability: 5, savings: Math.round(savingsPct * 0.5), npv: Math.round((totalEsco - capex) * 0.5) },
    ];
  }, [savingsPct, totalEsco, capex]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-accent" />
            ESCO Contract Lab
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Shared-savings contract simulator for deal structuring</p>
        </div>

        {/* Inputs */}
        <Card>
          <CardHeader><CardTitle className="text-base">Contract Parameters</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label className="text-xs text-muted-foreground">Project CAPEX</Label>
              <p className="text-xl font-bold text-foreground mb-2">{(capex / 1000).toFixed(0)}K SAR</p>
              <Slider value={[capex]} onValueChange={v => setCapex(v[0])} min={100000} max={2000000} step={50000} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Expected Savings %</Label>
              <p className="text-xl font-bold text-foreground mb-2">{savingsPct}%</p>
              <Slider value={[savingsPct]} onValueChange={v => setSavingsPct(v[0])} min={5} max={35} step={1} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Contract Duration</Label>
              <p className="text-xl font-bold text-foreground mb-2">{duration} Years</p>
              <Slider value={[duration]} onValueChange={v => setDuration(v[0])} min={3} max={15} step={1} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Revenue Split (ESCO %)</Label>
              <p className="text-xl font-bold text-foreground mb-2">{split}% / {100 - split}%</p>
              <Slider value={[split]} onValueChange={v => setSplit(v[0])} min={30} max={90} step={5} />
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "ESCO Total Revenue", value: `${(totalEsco / 1e6).toFixed(2)}M SAR`, icon: DollarSign, gradient: "gradient-savings" },
            { label: "Client Total Savings", value: `${(totalClient / 1e6).toFixed(2)}M SAR`, icon: TrendingUp, gradient: "gradient-energy" },
            { label: "Payback Period", value: paybackYear > 0 ? `${paybackYear} Years` : "N/A", icon: TrendingUp, gradient: "gradient-warning" },
            { label: "ESCO ROI", value: `${escoROI}%`, icon: DollarSign, gradient: "gradient-savings" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${kpi.gradient}`} />
                <CardContent className="pt-5 pb-4 relative">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cumulative Revenue Split</CardTitle>
              <CardDescription>ESCO vs Client over contract duration</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => `${v.toLocaleString()} SAR`} />
                  <defs>
                    <linearGradient id="escoGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} /></linearGradient>
                    <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.02} /></linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="escoCum" stroke="hsl(var(--primary))" fill="url(#escoGrad)" strokeWidth={2} name="ESCO Revenue" />
                  <Area type="monotone" dataKey="clientCum" stroke="hsl(var(--accent))" fill="url(#clientGrad)" strokeWidth={2} name="Client Savings" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Risk Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskScenarios.map((r, i) => (
                  <motion.div key={r.scenario} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.scenario}</p>
                      <p className="text-xs text-muted-foreground">Probability: {r.probability}% • Savings: {r.savings}%</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${r.npv >= 0 ? "text-primary" : "text-destructive"}`}>{(r.npv / 1000).toFixed(0)}K SAR</p>
                      <p className="text-[10px] text-muted-foreground">Net Present Value</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
