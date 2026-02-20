import { useMemo } from "react";
import {
  PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Target, DollarSign, Clock, TrendingUp, Shield, Wrench,
  Zap, Timer, CheckCircle, ArrowRight,
} from "lucide-react";
import { useEditableData } from "@/context/EditableDataContext";
import { cn } from "@/lib/utils";

/* ── CFO-locked constants (from ROI 2) ────────────────────────────── */
const ACTUAL_BILL_2024 = 220_028;
const ACTUAL_BILL_2025 = 213_379;
const WEATHER_FACTOR = 1.12;
const EXPECTED_2025 = Math.round(ACTUAL_BILL_2024 * WEATHER_FACTOR); // 246,431
const TRUE_SAVINGS_SAR = EXPECTED_2025 - ACTUAL_BILL_2025; // 33,052
const TRUE_SAVINGS_KWH = 80_762;
const EFFICIENCY_PCT = 14.1;

/* ── component ─────────────────────────────────────────────────────── */

export function ROIAnalysis3() {
  const { data, derived } = useEditableData();

  const summary = useMemo(() => {
    const energySAR = TRUE_SAVINGS_SAR; // 33,052
    const maintenanceTotal = derived.maintenanceTotal; // from editable context
    const downtimeTotal = derived.downtimeSavingsAnnual;
    const replacementAvg = derived.replacementAvg; // 385,000 one-time
    const replacementAnnualized = derived.replacementAnnualized;

    const annualRecurring = energySAR + maintenanceTotal + downtimeTotal;
    const annualWithReplacement = annualRecurring + replacementAnnualized;

    const systemCost = derived.totalSystemCost;
    const paybackYears = annualRecurring > 0 ? systemCost / annualRecurring : 0;

    // Projections
    const yr5Op = annualRecurring * 5;
    const yr5Replacement = replacementAvg * 0.5; // prorated
    const yr5Total = yr5Op + yr5Replacement;
    const yr5Net = yr5Total - systemCost;
    const yr5ROI = systemCost > 0 ? ((yr5Total - systemCost) / systemCost) * 100 : 0;

    const yr10Op = annualRecurring * 10;
    const yr10Total = yr10Op + replacementAvg;
    const yr10Net = yr10Total - systemCost;
    const yr10ROI = systemCost > 0 ? ((yr10Total - systemCost) / systemCost) * 100 : 0;

    return {
      energySAR,
      maintenanceTotal,
      downtimeTotal,
      replacementAvg,
      replacementAnnualized,
      annualRecurring,
      annualWithReplacement,
      systemCost,
      paybackYears,
      yr5Op, yr5Replacement, yr5Total, yr5Net, yr5ROI,
      yr10Op, yr10Total, yr10Net, yr10ROI,
    };
  }, [derived]);

  /* pie data */
  const pieData = [
    { name: "Energy Savings", value: summary.energySAR, color: "hsl(152, 60%, 40%)" },
    { name: "Maintenance", value: summary.maintenanceTotal, color: "hsl(220, 70%, 50%)" },
    { name: "Downtime Avoidance", value: summary.downtimeTotal, color: "hsl(280, 60%, 55%)" },
    { name: "Lifespan Extension", value: summary.replacementAnnualized, color: "hsl(38, 92%, 50%)" },
  ];

  /* timeline data */
  const timelineData = Array.from({ length: 11 }, (_, yr) => {
    const repBonus = yr >= 10 ? summary.replacementAvg : yr >= 5 ? summary.yr5Replacement : 0;
    const cumSavings = yr * summary.annualRecurring + repBonus;
    return {
      year: yr,
      cumSavings,
      investment: summary.systemCost,
      netProfit: cumSavings - summary.systemCost,
    };
  });

  const breakEvenYear = timelineData.find((d) => d.netProfit >= 0)?.year ?? ">10";

  return (
    <div className="space-y-8">
      {/* ── HERO HEADER ── */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-6 w-6" />
          <h2 className="text-2xl font-bold">ROI 3 — Combined Investment Return</h2>
        </div>
        <p className="text-white/80 text-sm mb-4">
          Energy + Maintenance + Downtime + Lifespan — Full picture from Rawdah validated data
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HeroCard label="System Investment" value={`${summary.systemCost.toLocaleString()} SAR`} sub={`${data.systemCfg.numberOfUnits} units × ${data.systemCfg.costPerUnit.toLocaleString()} SAR`} />
          <HeroCard label="Annual Recurring Savings" value={`${Math.round(summary.annualRecurring).toLocaleString()} SAR`} sub="Energy + Maint + Downtime" accent />
          <HeroCard label="Combined Payback" value={`${summary.paybackYears.toFixed(1)} Years`} sub={`~${Math.round(summary.paybackYears * 12)} months`} />
          <HeroCard label="5-Year ROI" value={`${summary.yr5ROI.toFixed(0)}%`} sub={`Net: ${Math.round(summary.yr5Net).toLocaleString()} SAR`} accent />
        </div>
      </div>

      {/* ── METHODOLOGY FLOW ── */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">How We Calculate Total ROI</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <FlowStep label="Energy Savings" value={`${summary.energySAR.toLocaleString()} SAR`} color="text-savings" />
          <Plus />
          <FlowStep label="Maintenance" value={`${summary.maintenanceTotal.toLocaleString()} SAR`} color="text-chart-blue" />
          <Plus />
          <FlowStep label="Downtime" value={`${summary.downtimeTotal.toLocaleString()} SAR`} color="text-purple-500" />
          <Equals />
          <FlowStep label="Annual Recurring" value={`${Math.round(summary.annualRecurring).toLocaleString()} SAR`} color="text-savings" highlight />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <FlowStep label="Annual Recurring" value={`${Math.round(summary.annualRecurring).toLocaleString()} SAR`} color="text-savings" />
          <span className="text-muted-foreground font-medium">÷</span>
          <FlowStep label="System Cost" value={`${summary.systemCost.toLocaleString()} SAR`} color="text-foreground" />
          <Equals />
          <FlowStep label="Payback" value={`${summary.paybackYears.toFixed(1)} Years`} color="text-energy" highlight />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["VAT included", "Invoice-backed", "Weather-adjusted +12%", "No compounding", "No tariff projections"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-xs bg-muted/50 border border-border rounded-full px-3 py-1">
              <CheckCircle className="h-3 w-3 text-savings" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── SAVINGS BREAKDOWN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="rounded-xl bg-card p-6 card-elevated">
          <h3 className="text-lg font-semibold mb-1">Annual Savings Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">Including annualized lifespan extension</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  formatter={(v: number) => [`${Math.round(v).toLocaleString()} SAR/yr`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category list */}
        <div className="rounded-xl bg-card p-6 card-elevated">
          <h3 className="text-lg font-semibold mb-4">Savings by Category</h3>
          <div className="space-y-3">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums">{Math.round(item.value).toLocaleString()} SAR</p>
                  <p className="text-xs text-muted-foreground">{((item.value / summary.annualWithReplacement) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-lg bg-savings/10 border border-savings/20">
              <span className="font-semibold text-savings text-sm">Total Annual (incl. annualized lifespan)</span>
              <span className="font-bold text-savings text-lg">{Math.round(summary.annualWithReplacement).toLocaleString()} SAR</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SOURCE DATA CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From ROI 2 */}
        <div className="rounded-xl bg-card p-6 card-elevated border-l-4 border-l-savings">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-savings" />
            <h4 className="font-semibold">From ROI 2 — Energy Performance</h4>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="2024 Bill" value={`${ACTUAL_BILL_2024.toLocaleString()} SAR`} />
            <Row label="2025 Bill" value={`${ACTUAL_BILL_2025.toLocaleString()} SAR`} />
            <Row label="Expected 2025 (Weather-Adj)" value={`${EXPECTED_2025.toLocaleString()} SAR`} />
            <Row label="True Energy Savings" value={`${TRUE_SAVINGS_SAR.toLocaleString()} SAR`} accent />
            <Row label="kWh Avoided" value={`${TRUE_SAVINGS_KWH.toLocaleString()} kWh`} />
            <Row label="Efficiency Improvement" value={`${EFFICIENCY_PCT}%`} />
          </div>
        </div>

        {/* From Maintenance Sim */}
        <div className="rounded-xl bg-card p-6 card-elevated border-l-4 border-l-chart-blue">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="h-5 w-5 text-chart-blue" />
            <h4 className="font-semibold">From Maintenance & Operations</h4>
          </div>
          <div className="space-y-2 text-sm">
            {data.maintenanceItems.map((m, i) => (
              <Row key={i} label={m.category} value={`${m.annualSavings.toLocaleString()} SAR`} />
            ))}
            <Row label="Downtime Avoidance" value={`${summary.downtimeTotal.toLocaleString()} SAR`} />
            <div className="border-t border-border pt-2 mt-2">
              <Row label="Subtotal Maint + Downtime" value={`${(summary.maintenanceTotal + summary.downtimeTotal).toLocaleString()} SAR`} accent />
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <Row label="AC Replacement Avoided" value={`${summary.replacementAvg.toLocaleString()} SAR`} />
              <p className="text-xs text-muted-foreground ml-2">One-time at year 10 (lifespan 10→15 yrs)</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROJECTION CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={<Clock className="h-5 w-5" />} label="Combined Payback" value={`${summary.paybackYears.toFixed(1)} Years`} sub={`~${Math.round(summary.paybackYears * 12)} months`} accent="energy" />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="5-Year Total Savings" value={`${Math.round(summary.yr5Total).toLocaleString()} SAR`} sub={`ROI: ${summary.yr5ROI.toFixed(0)}% | Net: ${Math.round(summary.yr5Net).toLocaleString()} SAR`} accent="savings" />
        <MetricCard icon={<DollarSign className="h-5 w-5" />} label="10-Year Total Savings" value={`${Math.round(summary.yr10Total).toLocaleString()} SAR`} sub={`ROI: ${summary.yr10ROI.toFixed(0)}% | Net: ${Math.round(summary.yr10Net).toLocaleString()} SAR`} accent="savings" />
      </div>

      {/* ── TIMELINE CHART ── */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-lg font-semibold mb-1">Combined ROI Timeline</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Cumulative savings vs. investment — break-even at year {breakEvenYear}
        </p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: "Years", position: "bottom", offset: -5 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(v: number) => [`${Math.round(v).toLocaleString()} SAR`, ""]}
              />
              <Legend />
              <Line type="monotone" dataKey="cumSavings" name="Cumulative Savings" stroke="hsl(152, 60%, 40%)" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="investment" name="Initial Investment" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="8 4" dot={false} />
              <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="hsl(220, 70%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── EXECUTIVE SUMMARY ── */}
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
        <h3 className="text-lg font-bold mb-3">Executive Summary</h3>
        <div className="space-y-2 text-sm text-white/90">
          <SummaryLine text={`System investment of ${summary.systemCost.toLocaleString()} SAR generates ${Math.round(summary.annualRecurring).toLocaleString()} SAR in recurring annual savings.`} />
          <SummaryLine text={`Full payback achieved in ${summary.paybackYears.toFixed(1)} years (~${Math.round(summary.paybackYears * 12)} months).`} />
          <SummaryLine text={`5-year net profit: ${Math.round(summary.yr5Net).toLocaleString()} SAR (${summary.yr5ROI.toFixed(0)}% ROI).`} />
          <SummaryLine text={`10-year net profit: ${Math.round(summary.yr10Net).toLocaleString()} SAR (${summary.yr10ROI.toFixed(0)}% ROI), including ${summary.replacementAvg.toLocaleString()} SAR avoided AC replacement.`} />
          <SummaryLine text={`All energy values validated against SCECO invoices. Weather-adjusted methodology (+12%) applied.`} />
        </div>
      </div>
    </div>
  );
}

/* ── sub-components ────────────────────────────────────────────────── */

function HeroCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg p-4", accent ? "bg-white/20" : "bg-white/10")}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70">{sub}</p>
    </div>
  );
}

function FlowStep({ label, value, color, highlight }: { label: string; value: string; color: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-lg px-4 py-2 text-center", highlight ? "bg-savings/10 border-2 border-savings/40" : "bg-muted/40")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-bold", color)}>{value}</p>
    </div>
  );
}

function Plus() {
  return <span className="text-muted-foreground font-bold text-lg">+</span>;
}
function Equals() {
  return <ArrowRight className="h-5 w-5 text-muted-foreground" />;
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold tabular-nums", accent && "text-savings")}>{value}</span>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent: "savings" | "energy" }) {
  return (
    <div className={cn("rounded-xl bg-card p-5 card-elevated border-l-4", accent === "savings" ? "border-l-savings" : "border-l-energy")}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={accent === "savings" ? "text-savings" : "text-energy"}>{icon}</span>
      </div>
      <p className={cn("text-3xl font-bold", accent === "savings" ? "text-savings" : "text-energy")}>{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function SummaryLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <p>{text}</p>
    </div>
  );
}
