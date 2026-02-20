import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Building2, Shield, TrendingUp, Wallet } from "lucide-react";

function formatSAR(v: number) {
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M SAR`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(0)}K SAR`;
  return `${v.toLocaleString()} SAR`;
}

// ─── PART A: Founder Compensation Model ───────────────────────────────────

function CompensationModel() {
  const phases = [
    {
      phase: "Phase 1 (Y1–Y2)",
      salary: 180000,
      dividendPct: 0,
      retainedPct: 100,
      notes: [
        "Modest salary — sustainable but conservative",
        "Reinvest majority of profits",
        "Focus on capital stability",
      ],
    },
    {
      phase: "Phase 2 (Y3–Y4)",
      salary: 360000,
      dividendPct: 25,
      retainedPct: 75,
      notes: [
        "Market engineering leadership compensation",
        "Controlled dividend distribution (20–30% of net profit)",
        "Maintain reinvestment for growth",
      ],
    },
    {
      phase: "Phase 3 (Y5+)",
      salary: 540000,
      dividendPct: 40,
      retainedPct: 60,
      notes: [
        "Competitive executive salary",
        "30–50% profit distribution",
        "Remainder reinvested for expansion & reserve",
      ],
    },
  ];

  // 5-year income mix chart
  const incomeData = useMemo(() => {
    const netProfits = [800000, 1200000, 2000000, 3200000, 4000000];
    return netProfits.map((np, i) => {
      const p = i < 2 ? phases[0] : i < 4 ? phases[1] : phases[2];
      const salary = p.salary;
      const dividend = np * (p.dividendPct / 100);
      const retained = np - dividend;
      return { year: `Y${i + 1}`, Salary: salary, Dividends: Math.round(dividend), "Retained Earnings": Math.round(retained) };
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {phases.map((p) => (
          <Card key={p.phase} className="border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{p.phase}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-semibold text-foreground">{formatSAR(p.salary)}/yr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dividend Payout</span>
                <span className="font-semibold text-foreground">{p.dividendPct}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Retained</span>
                <span className="font-semibold text-foreground">{p.retainedPct}%</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                {p.notes.map((n, i) => <li key={i}>• {n}</li>)}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Founder Income Mix Over Time</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e3).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => formatSAR(v)} />
              <Legend />
              <Bar dataKey="Salary" stackId="a" fill="hsl(var(--primary))" />
              <Bar dataKey="Dividends" stackId="a" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Retained Earnings" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── PART B: Dividend vs Reinvestment Strategy ────────────────────────────

function DividendStrategy() {
  const [annualProfit, setAnnualProfit] = useState(2000000);
  const [dividendPct, setDividendPct] = useState(25);

  const reinvestPct = 100 - dividendPct;
  const dividendCash = annualProfit * (dividendPct / 100);
  const retained = annualProfit - dividendCash;

  const projectionData = useMemo(() => {
    let cumRetained = 0;
    let cumDividend = 0;
    const growthRate = reinvestPct / 100 * 0.15; // reinvestment drives ~15% efficiency
    let profit = annualProfit;
    return Array.from({ length: 5 }, (_, i) => {
      const div = profit * (dividendPct / 100);
      const ret = profit - div;
      cumRetained += ret;
      cumDividend += div;
      profit *= (1 + growthRate);
      return {
        year: `Y${i + 1}`,
        "Retained Earnings": Math.round(cumRetained),
        "Cumulative Dividends": Math.round(cumDividend),
      };
    });
  }, [annualProfit, dividendPct, reinvestPct]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Dynamic Dividend Model</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Annual Net Profit (SAR)</Label>
              <Input type="number" value={annualProfit} onChange={(e) => setAnnualProfit(+e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Dividend Payout Ratio: {dividendPct}%</Label>
              <Slider min={0} max={60} step={5} value={[dividendPct]} onValueChange={([v]) => setDividendPct(v)} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Reinvestment: {reinvestPct}%</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div><p className="text-xs text-muted-foreground">Dividend Cash</p><p className="text-lg font-bold text-foreground">{formatSAR(Math.round(dividendCash))}</p></div>
            <div><p className="text-xs text-muted-foreground">Capital Retained</p><p className="text-lg font-bold text-foreground">{formatSAR(Math.round(retained))}</p></div>
            <div><p className="text-xs text-muted-foreground">5-Year Retained</p><p className="text-lg font-bold text-foreground">{formatSAR(projectionData[4]?.["Retained Earnings"] ?? 0)}</p></div>
            <div><p className="text-xs text-muted-foreground">5-Year Dividends</p><p className="text-lg font-bold text-foreground">{formatSAR(projectionData[4]?.["Cumulative Dividends"] ?? 0)}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Retained Earnings Growth vs Dividend Extraction</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => formatSAR(v)} />
              <Legend />
              <Area type="monotone" dataKey="Retained Earnings" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
              <Area type="monotone" dataKey="Cumulative Dividends" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-3 italic border-l-2 border-l-primary pl-3">
            "Company prioritizes stability, cash reserve building, and strategic reinvestment before maximizing distributions."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── PART C: Holding Structure Design ─────────────────────────────────────

function HoldingStructure() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Recommended Corporate Structure</CardTitle></CardHeader>
        <CardContent>
          {/* Visual org chart */}
          <div className="flex flex-col items-center gap-3">
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-center font-semibold text-sm shadow-sm">
              <Building2 className="h-4 w-4 inline mr-2" />
              Holding Company
              <p className="text-xs font-normal opacity-80 mt-1">Founder-Owned · Asset Protection</p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex flex-wrap justify-center gap-6">
              <div className="border-2 border-primary rounded-lg px-5 py-3 text-center min-w-[180px]">
                <p className="font-semibold text-sm text-foreground">Thermo Dynamics Engineer</p>
                <p className="text-xs text-muted-foreground">Operating Company</p>
                <p className="text-xs text-muted-foreground mt-1">Revenue · Operations · Staff</p>
              </div>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg px-5 py-3 text-center min-w-[180px]">
                <p className="font-semibold text-sm text-muted-foreground">Future Subsidiaries</p>
                <p className="text-xs text-muted-foreground">Expansion Entities</p>
                <p className="text-xs text-muted-foreground mt-1">Regional · Product Lines</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {[
              { title: "Risk Separation", desc: "Operating liabilities isolated from personal and holding assets" },
              { title: "Asset Protection", desc: "IP and reserves held at holding level for maximum security" },
              { title: "Profit Distribution", desc: "Dividends flow from operating company to holding efficiently" },
              { title: "Expansion Flexibility", desc: "New ventures spin off as subsidiaries without restructuring" },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p>• Holding company receives dividends from operating company</p>
            <p>• Operating company retains working capital for operations</p>
            <p>• Intellectual property may be held at holding level</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── PART D: Capital Reserve Policy ───────────────────────────────────────

function CapitalReservePolicy() {
  const [annualOpCost, setAnnualOpCost] = useState(1500000);
  const [retainedEarnings, setRetainedEarnings] = useState(2000000);
  const reserveMonths = 9; // target 6-12, use 9 as midpoint
  const requiredReserve = (annualOpCost / 12) * reserveMonths;
  const reserveRatio = retainedEarnings / requiredReserve;
  const reserveHealthy = reserveRatio >= 1;

  const reserveData = [
    { name: "Required Reserve", value: Math.round(requiredReserve), color: "hsl(var(--chart-4))" },
    { name: "Current Retained", value: retainedEarnings, color: reserveHealthy ? "hsl(var(--primary))" : "hsl(var(--destructive))" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Capital Reserve Tracking</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Annual Operating Cost (SAR)</Label>
              <Input type="number" value={annualOpCost} onChange={(e) => setAnnualOpCost(+e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Current Retained Earnings (SAR)</Label>
              <Input type="number" value={retainedEarnings} onChange={(e) => setRetainedEarnings(+e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><p className="text-xs text-muted-foreground">Monthly OpEx</p><p className="text-lg font-bold text-foreground">{formatSAR(Math.round(annualOpCost / 12))}</p></div>
            <div><p className="text-xs text-muted-foreground">Required Reserve ({reserveMonths}mo)</p><p className="text-lg font-bold text-foreground">{formatSAR(Math.round(requiredReserve))}</p></div>
            <div><p className="text-xs text-muted-foreground">Reserve Ratio</p><p className={`text-lg font-bold ${reserveHealthy ? "text-primary" : "text-destructive"}`}>{(reserveRatio * 100).toFixed(0)}%</p></div>
            <div><p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={reserveHealthy ? "default" : "destructive"} className="mt-1">
                {reserveHealthy ? "Healthy" : "Below Threshold"}
              </Badge>
            </div>
          </div>

          <div className="flex items-end gap-4 pt-2">
            {reserveData.map((d) => (
              <div key={d.name} className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">{d.name}</p>
                <div className="relative h-32 bg-muted/30 rounded-lg overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full rounded-b-lg transition-all duration-500"
                    style={{
                      height: `${Math.min((d.value / Math.max(requiredReserve, retainedEarnings)) * 100, 100)}%`,
                      backgroundColor: d.color,
                    }}
                  />
                </div>
                <p className="text-xs font-semibold text-foreground mt-1">{formatSAR(d.value)}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground italic border-l-2 border-l-primary pl-3 mt-2">
            Maintain minimum 6–12 months operating expense reserve before major dividend expansion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── PART E: Long-Term Growth Strategy ────────────────────────────────────

function GrowthStrategy() {
  const targets = [
    { metric: "Active Installations", value: "50–60", icon: <Building2 className="h-4 w-4" /> },
    { metric: "Annual Revenue", value: "8–12M SAR", icon: <TrendingUp className="h-4 w-4" /> },
    { metric: "Net Income", value: "2–4M SAR", icon: <Wallet className="h-4 w-4" /> },
    { metric: "Ownership", value: "Founder Majority", icon: <Shield className="h-4 w-4" /> },
  ];

  const principles = [
    "Controlled installation scaling",
    "Recurring monitoring base expansion",
    "Strong net margin preservation",
    "No over-leveraging",
    "Founder majority ownership retained",
    "Strategic optionality without dilution",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">5-Year Target Outcome</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {targets.map((t) => (
              <div key={t.metric} className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="flex justify-center mb-2 text-primary">{t.icon}</div>
                <p className="text-xl font-bold text-foreground">{t.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.metric}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Growth Principles</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {principles.map((p, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-foreground">{p}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-foreground font-medium">
              Growth model prioritizes capital discipline, recurring revenue accumulation, and strategic optionality — enabling long-term wealth creation without dilution or over-extension.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────

export function FounderCompensation() {
  const parts = [
    { id: "compensation", label: "Compensation Model", content: <CompensationModel /> },
    { id: "dividend", label: "Dividend Strategy", content: <DividendStrategy /> },
    { id: "holding", label: "Holding Structure", content: <HoldingStructure /> },
    { id: "reserve", label: "Capital Reserve", content: <CapitalReservePolicy /> },
    { id: "growth", label: "Growth Strategy", content: <GrowthStrategy /> },
  ];

  return (
    <div className="space-y-8">
      {parts.map((p) => (
        <div key={p.id}>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {p.label}
          </h3>
          {p.content}
        </div>
      ))}
    </div>
  );
}
