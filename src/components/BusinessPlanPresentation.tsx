import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ChevronLeft, ChevronRight, Printer,
  Zap, TrendingUp, Shield, Building2, Target, Eye,
  Landmark, Crown, Rocket,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatSAR(v: number) {
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M SAR`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(0)}K SAR`;
  return `${v.toLocaleString()} SAR`;
}

// ─── Slide wrapper ────────────────────────────────────────────────────────

function Slide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bp-slide min-h-[600px] p-8 md:p-12 rounded-2xl border bg-card space-y-6 ${className}`}>
      {children}
    </div>
  );
}

function SlideHeader({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">
        {String(number).padStart(2, "0")}
      </p>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "hsl(var(--exec-navy))" }}>
        {title}
      </h2>
      {subtitle && <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
      <Separator className="!mt-4" />
    </div>
  );
}

function KPI({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-5 rounded-xl border text-center ${accent ? "bg-primary/5 border-primary/20" : "bg-muted/30"}`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — COVER
// ═══════════════════════════════════════════════════════════════════════════

function SlideCover() {
  return (
    <div className="bp-slide min-h-[600px] rounded-2xl border overflow-hidden relative flex items-center justify-center"
      style={{ background: "linear-gradient(145deg, hsl(220 30% 10%) 0%, hsl(220 25% 18%) 50%, hsl(152 30% 20%) 100%)" }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      <div className="text-center space-y-6 relative z-10 px-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-white/50 text-xs tracking-widest uppercase">
          Business Plan
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
          Thermo Dynamics Engineer
        </h1>
        <p className="text-lg md:text-xl text-white/60 font-light tracking-wide">
          Premium Cooling Performance Optimization
        </p>
        <Separator className="max-w-[200px] mx-auto !bg-white/10" />
        <p className="text-sm text-white/40 tracking-wider">
          High-Ambient Commercial Markets &nbsp;|&nbsp; Saudi Arabia
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — MARKET PROBLEM
// ═══════════════════════════════════════════════════════════════════════════

function SlideMarketProblem() {
  const problems = [
    { icon: <Zap className="h-6 w-6" />, title: "50–70% Energy Share", desc: "Cooling dominates commercial electricity consumption in Saudi Arabia" },
    { icon: <TrendingUp className="h-6 w-6" />, title: "Rising Tariffs", desc: "SEC rates increasing: 0.20→0.22 and 0.30→0.32 SAR/kWh" },
    { icon: <Shield className="h-6 w-6" />, title: "Weak After-Sales", desc: "Limited engineering discipline in post-installation AC maintenance" },
    { icon: <Building2 className="h-6 w-6" />, title: "Aging Infrastructure", desc: "Commercial HVAC systems operating beyond optimal efficiency windows" },
    { icon: <Target className="h-6 w-6" />, title: "Heat Volatility", desc: "Extreme ambient temperature swings driving unpredictable cooling demand" },
  ];

  return (
    <Slide>
      <SlideHeader number={2} title="The Market Problem" subtitle="Structural inefficiency creates a compelling optimization opportunity" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {problems.map((p) => (
          <div key={p.title} className="p-5 rounded-xl border bg-muted/20 space-y-3 text-center">
            <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary">{p.icon}</div>
            <p className="font-bold text-sm" style={{ color: "hsl(var(--exec-navy))" }}>{p.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — VALIDATED PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════

function SlideValidatedPerformance() {
  const comparisonData = [
    { period: "Jan", "2024 Actual": 42500, "2025 Adjusted": 36200 },
    { period: "Feb", "2024 Actual": 38900, "2025 Adjusted": 33100 },
    { period: "Mar", "2024 Actual": 52100, "2025 Adjusted": 44800 },
    { period: "Apr", "2024 Actual": 61400, "2025 Adjusted": 52700 },
    { period: "May", "2024 Actual": 78300, "2025 Adjusted": 67200 },
    { period: "Jun", "2024 Actual": 89100, "2025 Adjusted": 76500 },
    { period: "Jul", "2024 Actual": 95200, "2025 Adjusted": 81800 },
    { period: "Aug", "2024 Actual": 92400, "2025 Adjusted": 79400 },
  ];

  return (
    <Slide>
      <SlideHeader number={3} title="Validated Performance" subtitle="Invoice-backed results from Jarir Bookstore Rawdah showroom — 7 SCC units, 175 tons capacity" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPI label="Efficiency Gain" value="14.1%" accent />
        <KPI label="Invoice Savings" value="33,052 SAR" accent />
        <KPI label="Payback Period" value="3.1 Years" />
        <KPI label="Achieved In" value="+1.3°C Hotter Year" />
      </div>
      <div className="pt-2">
        <p className="text-xs font-medium text-muted-foreground mb-3">Consumption Comparison (kWh) — 2024 vs 2025 Weather-Adjusted</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={comparisonData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => `${v.toLocaleString()} kWh`} />
            <Legend />
            <Bar dataKey="2024 Actual" fill="hsl(var(--chart-blue))" radius={[3, 3, 0, 0]} />
            <Bar dataKey="2025 Adjusted" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — BUSINESS MODEL
// ═══════════════════════════════════════════════════════════════════════════

function SlideBusinessModel() {
  const layers = [
    { tier: "Tier 1", title: "System Installation", price: "175,000 SAR / site", desc: "Smart retrofit control system deployed on existing AC infrastructure. Non-disruptive, same-day commissioning.", color: "hsl(var(--exec-navy))" },
    { tier: "Tier 2", title: "Monitoring Retainer", price: "1,500 SAR / month", desc: "Continuous performance monitoring, anomaly detection, and efficiency tracking. Recurring revenue layer.", color: "hsl(var(--primary))" },
    { tier: "Tier 3", title: "Engineering Advisory", price: "Project-Based", desc: "Deep HVAC optimization audits, expansion planning, and capital allocation guidance for major clients.", color: "hsl(var(--chart-teal))" },
  ];

  return (
    <Slide>
      <SlideHeader number={4} title="Business Model" subtitle="Three integrated revenue layers ensure capital efficiency and recurring value" />
      <div className="space-y-4">
        {layers.map((l) => (
          <div key={l.tier} className="flex items-stretch gap-4 rounded-xl border overflow-hidden bg-muted/10">
            <div className="w-2 shrink-0" style={{ backgroundColor: l.color }} />
            <div className="py-5 px-4 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{l.tier}</span>
                <span className="font-bold text-base" style={{ color: "hsl(var(--exec-navy))" }}>{l.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{l.desc}</p>
            </div>
            <div className="flex items-center px-6 border-l bg-muted/20">
              <p className="font-bold text-sm whitespace-nowrap text-primary">{l.price}</p>
            </div>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — UNIT ECONOMICS
// ═══════════════════════════════════════════════════════════════════════════

function SlideUnitEconomics() {
  const salePrice = 175000;
  const cogs = 110000;
  const monthlyFee = 1500;
  const monitoringMargin = 0.6;

  const grossMargin = salePrice - cogs;
  const grossMarginPct = (grossMargin / salePrice * 100).toFixed(1);
  const annualMonitoring = monthlyFee * 12;
  const recurringProfit = annualMonitoring * monitoringMargin;
  const contributionMargin = grossMargin + recurringProfit;

  const marginData = [
    { name: "System Sale", revenue: salePrice, cost: cogs, margin: grossMargin },
    { name: "Monitoring (Y1)", revenue: annualMonitoring, cost: annualMonitoring * 0.4, margin: recurringProfit },
    { name: "Total (Y1)", revenue: salePrice + annualMonitoring, cost: cogs + annualMonitoring * 0.4, margin: contributionMargin },
  ];

  return (
    <Slide>
      <SlideHeader number={5} title="Unit Economics" subtitle="Per-site margin analysis with recurring monitoring layer" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg border bg-muted/20">
              <p className="text-xs text-muted-foreground">System Price</p>
              <p className="text-xl font-bold text-foreground">175,000 SAR</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20">
              <p className="text-xs text-muted-foreground">COGS</p>
              <p className="text-xl font-bold text-foreground">110,000 SAR</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20">
              <p className="text-xs text-muted-foreground">Monitoring Fee</p>
              <p className="text-xl font-bold text-foreground">1,500 SAR/mo</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20">
              <p className="text-xs text-muted-foreground">Monitoring Margin</p>
              <p className="text-xl font-bold text-foreground">60%</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-3">
            <KPI label="Gross Margin" value={`${grossMarginPct}%`} accent />
            <KPI label="Contribution" value={formatSAR(contributionMargin)} accent />
            <KPI label="Recurring Profit" value={`${formatSAR(recurringProfit)}/yr`} />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">Margin Breakdown</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={marginData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v: number) => formatSAR(v)} />
              <Bar dataKey="margin" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Margin" />
              <Bar dataKey="cost" fill="hsl(var(--muted-foreground)/0.2)" radius={[0, 4, 4, 0]} name="Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — 3-YEAR EXECUTION ROADMAP
// ═══════════════════════════════════════════════════════════════════════════

function SlideRoadmap() {
  const roadmapData = [
    { year: "Year 1", installs: 10, cumulative: 10 },
    { year: "Year 2", installs: 25, cumulative: 35 },
    { year: "Year 3", installs: 40, cumulative: 75 },
  ];

  return (
    <Slide>
      <SlideHeader number={6} title="3-Year Execution Roadmap" subtitle="Controlled scaling through proven replication" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {roadmapData.map((r, i) => (
            <div key={r.year} className="flex items-center gap-4 p-5 rounded-xl border bg-muted/10">
              <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                style={{ backgroundColor: `hsl(var(--primary) / ${0.1 + i * 0.1})`, color: "hsl(var(--primary))" }}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-bold" style={{ color: "hsl(var(--exec-navy))" }}>{r.year}</p>
                <p className="text-sm text-muted-foreground">{r.installs} new installations • {r.cumulative} cumulative</p>
              </div>
              <p className="text-2xl font-bold text-primary">{r.installs}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">Installation Growth</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={roadmapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="installs" fill="hsl(var(--primary))" name="New Installs" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cumulative" fill="hsl(var(--primary)/0.3)" name="Cumulative" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — 5-YEAR FINANCIAL PROJECTION
// ═══════════════════════════════════════════════════════════════════════════

function SlideFinancialProjection() {
  const [activeInstalls, setActiveInstalls] = useState(55);
  const [annualNewInstalls, setAnnualNewInstalls] = useState(12);
  const [opCostPct, setOpCostPct] = useState(22);

  const projectionData = useMemo(() => {
    const salePrice = 175000;
    const monitoringAnnual = 18000;
    const grossMarginPct = 0.3714;
    const monitoringMarginPct = 0.6;
    let cumInstalls = 10;

    return Array.from({ length: 5 }, (_, i) => {
      const newInstalls = i === 0 ? 10 : i === 1 ? 25 : i === 2 ? 40 : annualNewInstalls;
      cumInstalls += newInstalls;
      if (i === 4) cumInstalls = Math.max(cumInstalls, activeInstalls);

      const installRevenue = newInstalls * salePrice;
      const recurringRevenue = cumInstalls * monitoringAnnual;
      const totalRevenue = installRevenue + recurringRevenue;
      const grossProfit = installRevenue * grossMarginPct + recurringRevenue * monitoringMarginPct;
      const netIncome = grossProfit * (1 - opCostPct / 100);

      return {
        year: `Y${i + 1}`,
        revenue: Math.round(totalRevenue),
        recurring: Math.round(recurringRevenue),
        netIncome: Math.round(netIncome),
      };
    });
  }, [activeInstalls, annualNewInstalls, opCostPct]);

  return (
    <Slide>
      <SlideHeader number={7} title="5-Year Financial Projection" subtitle="Target: 8–12M SAR revenue, 2–4M SAR net income" />
      <div className="grid grid-cols-3 gap-3 mb-2">
        <div><Label className="text-xs">Active Installs (Y5): {activeInstalls}</Label><Slider min={30} max={80} value={[activeInstalls]} onValueChange={([v]) => setActiveInstalls(v)} className="mt-1" /></div>
        <div><Label className="text-xs">Annual New: {annualNewInstalls}</Label><Slider min={5} max={25} value={[annualNewInstalls]} onValueChange={([v]) => setAnnualNewInstalls(v)} className="mt-1" /></div>
        <div><Label className="text-xs">OpEx: {opCostPct}%</Label><Slider min={15} max={35} value={[opCostPct]} onValueChange={([v]) => setOpCostPct(v)} className="mt-1" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Revenue</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => formatSAR(v)} />
              <Bar dataKey="revenue" fill="hsl(var(--exec-navy))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Recurring Revenue</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => formatSAR(v)} />
              <Area type="monotone" dataKey="recurring" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Net Income</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => formatSAR(v)} />
              <Bar dataKey="netIncome" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — RISK-ADJUSTED MODEL
// ═══════════════════════════════════════════════════════════════════════════

function SlideRiskModel() {
  const baseData = [
    { year: "Y1", base: 2410000, conservative: 1832000 },
    { year: "Y2", base: 5380000, conservative: 4088000 },
    { year: "Y3", base: 9100000, conservative: 6916000 },
    { year: "Y4", base: 11200000, conservative: 8512000 },
    { year: "Y5", base: 12800000, conservative: 9728000 },
  ];

  const baseNetY5 = 3200000;
  const consNetY5 = 2048000;

  return (
    <Slide>
      <SlideHeader number={8} title="Risk-Adjusted Model" subtitle="Base vs Conservative: -15% margin, -20% growth reduction" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">Revenue Comparison</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={baseData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => formatSAR(v)} />
              <Legend />
              <Bar dataKey="base" fill="hsl(var(--exec-navy))" name="Base Case" radius={[3, 3, 0, 0]} />
              <Bar dataKey="conservative" fill="hsl(var(--muted-foreground)/0.3)" name="Conservative" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          <div className="overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Metric</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">Base</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">Conservative</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="p-3">Y5 Revenue</td><td className="p-3 text-right font-bold">12.8M SAR</td><td className="p-3 text-right">9.7M SAR</td></tr>
                <tr className="border-b"><td className="p-3">Y5 Net Income</td><td className="p-3 text-right font-bold">{formatSAR(baseNetY5)}</td><td className="p-3 text-right">{formatSAR(consNetY5)}</td></tr>
                <tr className="border-b"><td className="p-3">Margin Adjustment</td><td className="p-3 text-right">—</td><td className="p-3 text-right text-destructive">-15%</td></tr>
                <tr><td className="p-3">Growth Adjustment</td><td className="p-3 text-right">—</td><td className="p-3 text-right text-destructive">-20%</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Even under conservative assumptions, the business achieves 2M+ SAR net income by Year 5 — confirming downside resilience.
          </p>
        </div>
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 9 — COMPETITIVE ADVANTAGE
// ═══════════════════════════════════════════════════════════════════════════

function SlideCompetitiveAdvantage() {
  const advantages = [
    { title: "Extreme-Climate Specialization", desc: "Purpose-built for GCC high-ambient environments where standard solutions underperform" },
    { title: "Invoice-Backed Validation", desc: "Performance proven through real utility billing data — 33,052 SAR savings, 80,762 kWh, 14.1% efficiency gain" },
    { title: "Monitoring Revenue Layer", desc: "Recurring subscription model creates predictable cash flow and long-term client retention" },
    { title: "Engineering Precision", desc: "Deep technical thermodynamics expertise in HVAC optimization separates us from generalist competitors" },
    { title: "Selective Client Strategy", desc: "Focus on high-value commercial accounts ensures premium positioning and margin protection" },
  ];

  return (
    <Slide>
      <SlideHeader number={9} title="Competitive Advantage" subtitle="Structural moats that compound over time" />
      <div className="space-y-3">
        {advantages.map((a, i) => (
          <div key={a.title} className="flex items-start gap-4 p-5 rounded-xl border bg-muted/10">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 bg-primary/10 text-primary">
              {i + 1}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "hsl(var(--exec-navy))" }}>{a.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 10 — STRATEGIC PARTNER & CONTROL
// ═══════════════════════════════════════════════════════════════════════════

function SlidePartnerControl() {
  return (
    <Slide>
      <SlideHeader number={10} title="Strategic Partner & Control" subtitle="Governance structure preserving founder majority" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Org chart */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-5 rounded-xl border-2 border-primary bg-primary/5 text-center w-64">
            <Crown className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="font-bold text-sm" style={{ color: "hsl(var(--exec-navy))" }}>Founder</p>
            <p className="text-xs text-primary font-medium">51%+ Ownership</p>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="p-5 rounded-xl border bg-muted/20 text-center w-64">
            <Landmark className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="font-bold text-sm" style={{ color: "hsl(var(--exec-navy))" }}>Holding Company</p>
            <p className="text-xs text-muted-foreground">Asset & IP Protection</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="w-px h-6 bg-border" />
              <div className="p-4 rounded-xl border bg-muted/10 text-center w-48">
                <Building2 className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="font-bold text-xs">Operating Company</p>
                <p className="text-[10px] text-muted-foreground">Thermo Dynamics Engineer</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-6 bg-border" />
              <div className="p-4 rounded-xl border border-dashed bg-muted/5 text-center w-48">
                <p className="font-bold text-xs text-muted-foreground">Strategic Partner</p>
                <p className="text-[10px] text-muted-foreground">Max 49% Minority</p>
              </div>
            </div>
          </div>
        </div>
        {/* Governance */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm" style={{ color: "hsl(var(--exec-navy))" }}>Governance Protections</h3>
          {[
            "Founder retains 51%+ equity at all times",
            "Board majority controlled by founder",
            "Reserved matters require founder consent",
            "Strategic partner provides capital + market access",
            "No dilution below majority threshold",
          ].map((g) => (
            <div key={g} className="flex items-start gap-3 text-sm">
              <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span className="text-foreground/85">{g}</span>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 11 — CAPITAL STRATEGY
// ═══════════════════════════════════════════════════════════════════════════

function SlideCapitalStrategy() {
  const principles = [
    { title: "Controlled Scaling", desc: "Growth matched to operational capacity — no overextension" },
    { title: "Strategic Capital Only", desc: "Accept investment that adds market access, not just money" },
    { title: "No Aggressive VC Dependency", desc: "Self-sustaining unit economics eliminate growth-at-all-costs pressure" },
    { title: "Majority Ownership Preserved", desc: "Capital structure designed to protect founder control through all stages" },
  ];

  return (
    <Slide>
      <SlideHeader number={11} title="Capital Strategy" subtitle="Discipline over speed — building enduring value" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {principles.map((p, i) => (
          <div key={p.title} className="p-6 rounded-xl border bg-muted/10 space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary/10 text-primary">
                {i + 1}
              </div>
              <p className="font-bold text-sm" style={{ color: "hsl(var(--exec-navy))" }}>{p.title}</p>
            </div>
            <p className="text-sm text-muted-foreground pl-11">{p.desc}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 12 — LONG-TERM VISION
// ═══════════════════════════════════════════════════════════════════════════

function SlideVision() {
  const pillars = [
    "Disciplined Growth",
    "Majority Control",
    "Multi-Million SAR Annual Income",
    "Sustainable Engineering Brand",
  ];

  return (
    <div className="bp-slide min-h-[600px] rounded-2xl border overflow-hidden relative flex items-center justify-center"
      style={{ background: "linear-gradient(145deg, hsl(220 30% 10%) 0%, hsl(220 25% 16%) 60%, hsl(152 25% 18%) 100%)" }}>
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "48px 48px" }} />
      <div className="text-center space-y-8 relative z-10 px-8 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-white/50 text-xs tracking-widest uppercase">
          Long-Term Vision
        </div>
        <div className="space-y-4">
          {pillars.map((p) => (
            <p key={p} className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight">{p}.</p>
          ))}
        </div>
        <Separator className="max-w-[200px] mx-auto !bg-white/10" />
        <p className="text-sm text-white/40 tracking-wide max-w-xl mx-auto">
          Building a premium engineering company that delivers lasting value through technical excellence, financial discipline, and measurable client impact.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN — Business Plan Presentation
// ═══════════════════════════════════════════════════════════════════════════

const SLIDES = [
  { label: "Cover", component: <SlideCover /> },
  { label: "Market Problem", component: <SlideMarketProblem /> },
  { label: "Validated Performance", component: <SlideValidatedPerformance /> },
  { label: "Business Model", component: <SlideBusinessModel /> },
  { label: "Unit Economics", component: <SlideUnitEconomics /> },
  { label: "3-Year Roadmap", component: <SlideRoadmap /> },
  { label: "5-Year Projection", component: <SlideFinancialProjection /> },
  { label: "Risk Model", component: <SlideRiskModel /> },
  { label: "Competitive Advantage", component: <SlideCompetitiveAdvantage /> },
  { label: "Partner & Control", component: <SlidePartnerControl /> },
  { label: "Capital Strategy", component: <SlideCapitalStrategy /> },
  { label: "Vision", component: <SlideVision /> },
];

export function BusinessPlanPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewAll, setViewAll] = useState(false);

  const handlePrint = () => {
    setViewAll(true);
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewAll(!viewAll)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            {viewAll ? "Slide View" : "View All"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / PDF
          </button>
        </div>

        {!viewAll && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-2 rounded-lg border bg-card hover:bg-muted/50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-muted-foreground min-w-[80px] text-center">
              {currentSlide + 1} / {SLIDES.length}
            </span>
            <button
              onClick={() => setCurrentSlide(Math.min(SLIDES.length - 1, currentSlide + 1))}
              disabled={currentSlide === SLIDES.length - 1}
              className="p-2 rounded-lg border bg-card hover:bg-muted/50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Slide dots nav */}
      {!viewAll && (
        <div className="flex gap-1.5 justify-center flex-wrap print:hidden">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                i === currentSlide
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {viewAll ? (
        <div className="bp-print-all space-y-8">
          {SLIDES.map((s, i) => (
            <div key={i} className="print:break-before-page">{s.component}</div>
          ))}
        </div>
      ) : (
        <div>{SLIDES[currentSlide].component}</div>
      )}
    </div>
  );
}
