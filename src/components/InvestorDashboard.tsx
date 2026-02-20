import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, DollarSign, BarChart3, Shield, Landmark, LogOut, Users,
} from "lucide-react";
import { FounderCompensation } from "@/components/FounderCompensation";

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatSAR(v: number) {
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M SAR`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(0)}K SAR`;
  return `${v.toLocaleString()} SAR`;
}

function calcIRR(cashflows: number[], guess = 0.1): number {
  let rate = guess;
  for (let i = 0; i < 100; i++) {
    let npv = 0, dnpv = 0;
    cashflows.forEach((cf, t) => {
      npv += cf / Math.pow(1 + rate, t);
      dnpv -= (t * cf) / Math.pow(1 + rate, t + 1);
    });
    if (Math.abs(npv) < 0.01) return rate;
    rate -= npv / dnpv;
    if (!isFinite(rate) || rate < -1) return NaN;
  }
  return rate;
}

function calcNPV(rate: number, cashflows: number[]): number {
  return cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
}

// ─── SECTION 1: Investment Thesis ─────────────────────────────────────────

function InvestmentThesis() {
  const kpis = [
    { label: "Validated Energy Efficiency", value: "14.1%", sub: "Invoice-backed" },
    { label: "Invoice-Backed Energy Savings", value: "33,052 SAR", sub: "Annual recurring" },
    { label: "Capital Recovery (Client)", value: "3.1 Years", sub: "Payback period" },
    { label: "Deployment Model", value: "Retrofit", sub: "Non-disruptive installation" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          SCC — Scalable Energy Optimization Platform for High-Ambient Climates
        </h2>
        <p className="text-muted-foreground mt-3 max-w-3xl leading-relaxed">
          SCC transforms high cooling demand environments into recurring energy efficiency value
          through smart retrofit control systems validated under real invoice conditions.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border-l-4 border-l-primary">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{k.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 2: Unit Economics ─────────────────────────────────────────────

function UnitEconomics() {
  const [salePrice, setSalePrice] = useState(175000);
  const [cogs, setCogs] = useState(110000);
  const [subRevenue, setSubRevenue] = useState(12000);
  const [subMargin, setSubMargin] = useState(60);
  const [discountRate, setDiscountRate] = useState(15);
  const horizon = 10;

  const grossMargin = salePrice - cogs;
  const grossMarginPct = salePrice > 0 ? (grossMargin / salePrice) * 100 : 0;
  const subGrossProfit = subRevenue * (subMargin / 100);
  const contributionMargin = grossMargin + subGrossProfit;

  const cashflows = useMemo(() => {
    const cfs = [-cogs];
    for (let y = 1; y <= horizon; y++) {
      cfs.push(y === 1 ? salePrice - cogs + subGrossProfit : subGrossProfit);
    }
    // fix: year 0 is investment, year 1 gets sale margin
    return [-cogs, salePrice - cogs + subGrossProfit, ...Array(horizon - 1).fill(subGrossProfit)];
  }, [salePrice, cogs, subGrossProfit]);

  const irr = calcIRR(cashflows);
  const npv = calcNPV(discountRate / 100, cashflows);

  const cfChartData = useMemo(() => {
    let cumulative = 0;
    return cashflows.map((cf, i) => {
      cumulative += cf;
      return { year: `Y${i}`, cashflow: cf, cumulative };
    });
  }, [cashflows]);

  const irrSensitivity = useMemo(() => {
    return [10, 12, 14, 16, 18, 20].map((dr) => ({
      rate: `${dr}%`,
      npv: calcNPV(dr / 100, cashflows),
    }));
  }, [cashflows]);

  // payback
  let paybackYears = 0;
  let cum = 0;
  for (let i = 0; i < cashflows.length; i++) {
    cum += cashflows[i];
    if (cum >= 0) { paybackYears = i; break; }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Unit Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-xs">System Sale Price (SAR)</Label><Input type="number" value={salePrice} onChange={(e) => setSalePrice(+e.target.value)} /></div>
            <div><Label className="text-xs">COGS per Installation (SAR)</Label><Input type="number" value={cogs} onChange={(e) => setCogs(+e.target.value)} /></div>
            <div><Label className="text-xs">Subscription Revenue (SAR/yr)</Label><Input type="number" value={subRevenue} onChange={(e) => setSubRevenue(+e.target.value)} /></div>
            <div><Label className="text-xs">Subscription Margin (%)</Label><Input type="number" value={subMargin} onChange={(e) => setSubMargin(+e.target.value)} /></div>
            <div>
              <Label className="text-xs">Discount Rate: {discountRate}%</Label>
              <Slider min={10} max={20} step={1} value={[discountRate]} onValueChange={([v]) => setDiscountRate(v)} className="mt-2" />
            </div>
          </CardContent>
        </Card>
        {/* Outputs */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Unit Economics Output</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <Metric label="Gross Margin" value={formatSAR(grossMargin)} sub={`${grossMarginPct.toFixed(1)}%`} />
              <Metric label="Contribution Margin" value={formatSAR(contributionMargin)} />
              <Metric label="Annual Sub. Profit" value={formatSAR(subGrossProfit)} />
              <Metric label="IRR" value={isNaN(irr) ? "N/A" : `${(irr * 100).toFixed(1)}%`} />
              <Metric label="NPV" value={formatSAR(Math.round(npv))} sub={`@ ${discountRate}%`} />
              <Metric label="Payback" value={`${paybackYears} Year${paybackYears !== 1 ? "s" : ""}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">10-Year Cash Flow Curve</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={cfChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatSAR(v)} />
                    <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">NPV vs Discount Rate</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={irrSensitivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="rate" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatSAR(Math.round(v))} />
                    <Bar dataKey="npv" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── SECTION 3: Scale Projection ──────────────────────────────────────────

function ScaleProjection() {
  const [y1, setY1] = useState(10);
  const [y2, setY2] = useState(30);
  const [y3, setY3] = useState(75);
  const [growthRate, setGrowthRate] = useState(40);
  const salePrice = 175000;
  const grossMarginPct = 0.3714; // (175k-110k)/175k
  const subRevenue = 12000;
  const subMarginPct = 0.6;
  const overheadPct = 0.2;

  const projectionData = useMemo(() => {
    const installs = [y1, y2, y3];
    for (let i = 3; i < 10; i++) installs.push(Math.round(installs[i - 1] * (1 + growthRate / 100)));
    let cumulativeInstalls = 0;
    let cumulativeCash = 0;
    return installs.map((inst, i) => {
      cumulativeInstalls += inst;
      const revenue = inst * salePrice;
      const grossProfit = revenue * grossMarginPct;
      const recurringRevenue = cumulativeInstalls * subRevenue;
      const recurringProfit = recurringRevenue * subMarginPct;
      const totalRevenue = revenue + recurringRevenue;
      const ebitda = (grossProfit + recurringProfit) * (1 - overheadPct);
      cumulativeCash += ebitda;
      return {
        year: `Y${i + 1}`,
        revenue: Math.round(totalRevenue),
        grossProfit: Math.round(grossProfit + recurringProfit),
        recurring: Math.round(recurringRevenue),
        ebitda: Math.round(ebitda),
        cumCash: Math.round(cumulativeCash),
        installs: inst,
      };
    });
  }, [y1, y2, y3, growthRate]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Installation Schedule</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><Label className="text-xs">Year 1</Label><Input type="number" value={y1} onChange={(e) => setY1(+e.target.value)} /></div>
            <div><Label className="text-xs">Year 2</Label><Input type="number" value={y2} onChange={(e) => setY2(+e.target.value)} /></div>
            <div><Label className="text-xs">Year 3</Label><Input type="number" value={y3} onChange={(e) => setY3(+e.target.value)} /></div>
            <div>
              <Label className="text-xs">Growth Rate: {growthRate}%</Label>
              <Slider min={10} max={80} step={5} value={[growthRate]} onValueChange={([v]) => setGrowthRate(v)} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Revenue Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => formatSAR(v)} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Gross Profit Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => formatSAR(v)} />
                <Bar dataKey="grossProfit" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Recurring Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => formatSAR(v)} />
                <Area type="monotone" dataKey="recurring" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3)/0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── SECTION 4: Risk-Adjusted Model ───────────────────────────────────────

function RiskModel() {
  const [scenario, setScenario] = useState<"base" | "conservative" | "stress">("base");
  const salePrice = 175000;
  const cogs = 110000;
  const subGrossProfit = 12000 * 0.6;
  const baseInstalls = [10, 30, 75, 105, 147, 206, 288, 403, 565, 791];

  const scenarios = {
    base: { marginAdj: 1, salesAdj: 1, label: "Base Case" },
    conservative: { marginAdj: 0.85, salesAdj: 0.8, label: "Conservative" },
    stress: { marginAdj: 0.75, salesAdj: 0.6, label: "Stress" },
  };

  const results = useMemo(() => {
    return Object.entries(scenarios).map(([key, s]) => {
      const adjMargin = (salePrice - cogs) * s.marginAdj;
      const adjSub = subGrossProfit * s.marginAdj;
      const installs = baseInstalls.map((i) => Math.round(i * s.salesAdj));
      const cashflows = [-cogs];
      let cumInstalls = 0;
      installs.forEach((inst, idx) => {
        cumInstalls += inst;
        const cf = idx === 0
          ? inst * adjMargin + cumInstalls * adjSub
          : inst * adjMargin + cumInstalls * adjSub;
        cashflows.push(cf);
      });
      const irr = calcIRR(cashflows);
      const npv15 = calcNPV(0.15, cashflows);
      let payback = 0, cum = 0;
      for (let i = 0; i < cashflows.length; i++) { cum += cashflows[i]; if (cum >= 0) { payback = i; break; } }
      const y5Revenue = installs.slice(0, 5).reduce((a, b) => a + b, 0) * salePrice * s.salesAdj;
      const ebitda5 = cashflows.slice(1, 6).reduce((a, b) => a + b, 0) * 0.8;
      return { key, label: s.label, irr, npv: npv15, payback, ebitda5, y5Revenue };
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["base", "conservative", "stress"] as const).map((s) => (
          <Badge
            key={s}
            variant={scenario === s ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setScenario(s)}
          >
            {scenarios[s].label}
          </Badge>
        ))}
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3 font-medium text-muted-foreground">Scenario</th>
              <th className="p-3 font-medium text-muted-foreground">IRR</th>
              <th className="p-3 font-medium text-muted-foreground">NPV @15%</th>
              <th className="p-3 font-medium text-muted-foreground">Payback</th>
              <th className="p-3 font-medium text-muted-foreground">Y5 EBITDA</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.key} className={`border-b ${r.key === scenario ? "bg-muted/50" : ""}`}>
                <td className="p-3 font-medium">{r.label}</td>
                <td className="p-3">{isNaN(r.irr) ? "N/A" : `${(r.irr * 100).toFixed(1)}%`}</td>
                <td className="p-3">{formatSAR(Math.round(r.npv))}</td>
                <td className="p-3">{r.payback} yr</td>
                <td className="p-3">{formatSAR(Math.round(r.ebitda5))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SECTION 5: Fundraising Structure ─────────────────────────────────────

const SEED_DATA = [
  { name: "Production", value: 35, color: "hsl(var(--primary))" },
  { name: "Sales Expansion", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Engineering", value: 25, color: "hsl(var(--chart-3))" },
  { name: "Working Capital", value: 15, color: "hsl(var(--chart-4))" },
];

function FundraisingStructure() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Seed Round</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Target Raise</span>
              <span className="font-bold text-foreground">3–5M SAR</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Use of Funds</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={SEED_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                  {SEED_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Series A</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Target Raise</span>
              <span className="font-bold text-foreground">15–25M SAR</span>
            </div>
            <div className="space-y-3 mt-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Scale Target</p>
                <p className="text-lg font-bold text-foreground">200+ Installations</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Geographic Expansion</p>
                <p className="text-lg font-bold text-foreground">Regional (GCC)</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Revenue Target</p>
                <p className="text-lg font-bold text-foreground">35M+ SAR ARR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── SECTION 6: Exit Model ────────────────────────────────────────────────

function ExitModel() {
  const [revMultiple, setRevMultiple] = useState(4);
  const [ebitdaMultiple, setEbitdaMultiple] = useState(7);

  // Y5 projected figures (from scale model base case)
  const y5Revenue = 50_000_000; // ~50M SAR at scale
  const y5EBITDA = 12_000_000;  // ~12M SAR

  const revenueValuation = y5Revenue * revMultiple;
  const ebitdaValuation = y5EBITDA * ebitdaMultiple;
  const avgValuation = (revenueValuation + ebitdaValuation) / 2;

  // Assume seed investment of 4M SAR
  const seedInvestment = 4_000_000;
  const returnMultiple = avgValuation / seedInvestment;

  const exitData = useMemo(() => {
    return [3, 4, 5, 6].map((rm) => ({
      multiple: `${rm}x Rev`,
      valuation: y5Revenue * rm,
      returnX: (y5Revenue * rm) / seedInvestment,
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Valuation Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Revenue Multiple: {revMultiple}x</Label>
              <Slider min={3} max={6} step={0.5} value={[revMultiple]} onValueChange={([v]) => setRevMultiple(v)} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs">EBITDA Multiple: {ebitdaMultiple}x</Label>
              <Slider min={5} max={10} step={0.5} value={[ebitdaMultiple]} onValueChange={([v]) => setEbitdaMultiple(v)} className="mt-2" />
            </div>
            <div className="mt-4 space-y-3">
              <Metric label="Revenue-Based Valuation" value={formatSAR(revenueValuation)} />
              <Metric label="EBITDA-Based Valuation" value={formatSAR(ebitdaValuation)} />
              <Metric label="Blended Valuation" value={formatSAR(Math.round(avgValuation))} />
              <Metric label="Investor Return Multiple" value={`${returnMultiple.toFixed(1)}x`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Exit Outcome by Revenue Multiple</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={exitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="multiple" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => formatSAR(v)} />
                <Bar dataKey="valuation" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Small metric display ─────────────────────────────────────────────────

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Main Investor Dashboard ──────────────────────────────────────────────

export function InvestorDashboard() {
  const sections = [
    { id: "thesis", icon: <TrendingUp className="h-4 w-4" />, label: "Thesis", content: <InvestmentThesis /> },
    { id: "unit", icon: <DollarSign className="h-4 w-4" />, label: "Unit Economics", content: <UnitEconomics /> },
    { id: "scale", icon: <BarChart3 className="h-4 w-4" />, label: "Scale Model", content: <ScaleProjection /> },
    { id: "risk", icon: <Shield className="h-4 w-4" />, label: "Risk Model", content: <RiskModel /> },
    { id: "fundraising", icon: <Landmark className="h-4 w-4" />, label: "Fundraising", content: <FundraisingStructure /> },
    { id: "exit", icon: <LogOut className="h-4 w-4" />, label: "Exit Model", content: <ExitModel /> },
    { id: "founder", icon: <Users className="h-4 w-4" />, label: "Founder & Capital", content: <FounderCompensation /> },
  ];

  return (
    <div className="space-y-8">
      <Tabs defaultValue="thesis" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          {sections.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="flex items-center gap-2">
              {s.icon}{s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((s) => (
          <TabsContent key={s.id} value={s.id}>{s.content}</TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
