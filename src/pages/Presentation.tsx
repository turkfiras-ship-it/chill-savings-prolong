import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

// ─── CFO-LOCKED CONSTANTS ───────────────────────────
const ACTUAL_BILL_2024 = 220028;
const ACTUAL_BILL_2025 = 213379;
const WEATHER_FACTOR = 1.12;
const EXPECTED_2025 = Math.round(ACTUAL_BILL_2024 * WEATHER_FACTOR); // 246431
const ENERGY_SAVINGS_SAR = EXPECTED_2025 - ACTUAL_BILL_2025; // 33052
const MAINTENANCE_DOWNTIME_SAR = 22660;
const RECURRING_ANNUAL = ENERGY_SAVINGS_SAR + MAINTENANCE_DOWNTIME_SAR; // 55712
const SYSTEM_COST = 175000;
const DEFERRED_CAPITAL = 385000;
const CAPITAL_RECOVERY_YRS = +(SYSTEM_COST / RECURRING_ANNUAL).toFixed(1); // 3.1
const ANNUAL_KWH_SAVED = 80762;
const EFFICIENCY_PCT = 14.1;
const AUGUST_2025_RAW = 71586;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const KW_2024 = [25464,35426,36250,39224,60210,68993,72871,77243,60655,42915,33158,22304];
const KW_2025 = [26381,25607,40720,51248,51220,62835,68338,71586,56067,40182,32335,21823];

// ─── Validation ─────────────────────────────────────
function useValidation() {
  const w: string[] = [];
  if (EXPECTED_2025 !== 246431) w.push("Weather adjustment logic mismatch.");
  if (KW_2025[7] !== AUGUST_2025_RAW) w.push("August 2025 Raw kWh mismatch.");
  if (CAPITAL_RECOVERY_YRS > 3.2 || CAPITAL_RECOVERY_YRS < 3.0) w.push("Capital recovery out of range.");
  return w;
}

function Divider() {
  return <div className="w-full max-w-5xl mx-auto border-t border-exec-divider my-16" />;
}

// ─── SECTION 1: EXECUTIVE KPIs ──────────────────────
function ExecutiveKPIs() {
  return (
    <section className="pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold tracking-widest uppercase text-exec-green mb-3">
          Section 1 — Capital Allocation Summary
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-exec-navy leading-tight mb-2">
          SCC Investment Return Analysis
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Rawdah Showroom · 7 SCC Units · FY 2025 Invoice-Validated Results
        </p>

        {/* Primary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <KPICard label="Recurring Annual Benefit" value="55,712" unit="SAR" positive size="large" />
          <KPICard label="Capital Recovery" value={`${CAPITAL_RECOVERY_YRS}`} unit="Years" positive size="large" />
          <KPICard label="Invoice-Validated Energy Savings" value="33,052" unit="SAR" positive size="large" />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <KPICard label="5-Year Net Benefit" value="296,060" unit="SAR (recurring)" />
          <KPICard label="10-Year Modeled Value" value="942,120" unit="SAR" sub="Recurring + Deferred Capital" />
          <KPICard label="Efficiency Improvement" value="14.1" unit="%" positive />
          <KPICard label="Energy Avoided" value="80,762" unit="kWh" positive />
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center">
          All energy values derived from actual SCECO invoices (VAT included). Tariff increases already reflected in billed amounts.
        </p>
      </div>
    </section>
  );
}

function KPICard({ label, value, unit, sub, positive, size }: {
  label: string; value: string; unit: string; sub?: string; positive?: boolean; size?: "large";
}) {
  return (
    <div className={`rounded-2xl border ${size === "large" ? "p-10" : "p-7"} ${positive ? "bg-exec-green-light border-exec-green/20" : "bg-white border-exec-divider"}`}>
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <p className={`font-bold tracking-tight ${positive ? "text-exec-green" : "text-exec-navy"} ${size === "large" ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl"}`}>
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{unit}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── SECTION 2: SAVINGS BREAKDOWN ───────────────────
function SavingsBreakdown() {
  return (
    <section className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold tracking-widest uppercase text-exec-green mb-3">
          Section 2 — Savings Structure
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-exec-navy mb-10">
          Recurring vs. Deferred Impact
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* A) Recurring */}
          <div className="rounded-2xl border border-exec-green/20 bg-exec-green-light p-8">
            <h3 className="text-lg font-bold text-exec-navy mb-1">A) Recurring Annual Operational Savings</h3>
            <p className="text-xs text-muted-foreground mb-6">Invoice-validated, repeats annually</p>
            <div className="space-y-4">
              <BreakdownRow label="Energy Savings (Invoice-validated)" value="33,052" note="SCECO invoices, VAT included" />
              <BreakdownRow label="Maintenance & Downtime Avoidance" value="22,660" note="Labor, parts, downtime hours" />
              <div className="pt-4 border-t border-exec-green/20">
                <BreakdownRow label="Total Recurring Annual Benefit" value="55,712" bold />
              </div>
            </div>
          </div>

          {/* B) Deferred Capital */}
          <div className="rounded-2xl border border-exec-divider bg-exec-surface p-8">
            <h3 className="text-lg font-bold text-exec-navy mb-1">B) Deferred Capital Impact</h3>
            <p className="text-xs text-muted-foreground mb-6">Scenario-based, non-recurring</p>
            <div className="space-y-4">
              <BreakdownRow label="AC Replacement Avoided" value="385,000" note="Standard 10–15 year equipment lifecycle" />
              <div className="pt-4 border-t border-exec-divider">
                <p className="text-xs text-muted-foreground italic">
                  Deferred Capital Impact (Scenario-Based) — not mixed into recurring totals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BreakdownRow({ label, value, note, bold }: { label: string; value: string; note?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <p className={`text-sm ${bold ? "font-bold text-exec-navy" : "text-muted-foreground"}`}>{label}</p>
        {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
      </div>
      <p className={`text-lg tabular-nums ${bold ? "font-bold text-exec-green" : "font-semibold text-exec-navy"}`}>
        {value} <span className="text-sm font-normal text-muted-foreground">SAR</span>
      </p>
    </div>
  );
}

// ─── SECTION 3: ROI & CAPITAL RECOVERY ──────────────
function ROISection() {
  const yr5 = RECURRING_ANNUAL * 5;
  const yr10Recurring = RECURRING_ANNUAL * 10;
  const yr10Total = yr10Recurring + DEFERRED_CAPITAL;

  const timelineData = Array.from({ length: 11 }, (_, y) => ({
    year: y,
    cumulative: y * RECURRING_ANNUAL,
    investment: SYSTEM_COST,
  }));

  return (
    <section className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold tracking-widest uppercase text-exec-green mb-3">
          Section 3 — Return on Investment
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-exec-navy mb-10">
          Capital Recovery Analysis
        </h2>

        {/* ROI Summary Table */}
        <div className="rounded-2xl border border-exec-divider bg-white p-8 mb-10">
          <div className="space-y-4">
            <ROIRow label="System Investment" value={`${SYSTEM_COST.toLocaleString()} SAR`} />
            <ROIRow label="Recurring Annual Benefit" value={`${RECURRING_ANNUAL.toLocaleString()} SAR`} highlight />
            <ROIRow label="Capital Recovery" value={`${CAPITAL_RECOVERY_YRS} Years`} highlight />
            <div className="border-t border-exec-divider pt-4 mt-4" />
            <ROIRow label="5-Year Net Benefit (Recurring only)" value={`${(yr5 - SYSTEM_COST).toLocaleString()} SAR`} />
            <ROIRow label="10-Year Projection" value="" />
            <div className="pl-6 space-y-2">
              <ROIRow label="Recurring savings" value={`${yr10Recurring.toLocaleString()} SAR`} sub />
              <ROIRow label="+ Deferred capital" value={`${DEFERRED_CAPITAL.toLocaleString()} SAR`} sub />
              <ROIRow label="= Modeled value" value={`${yr10Total.toLocaleString()} SAR`} highlight />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-6 italic">
            Deferred capital assumes standard 10–15 year equipment lifecycle.
          </p>
        </div>

        {/* Timeline Chart */}
        <div className="rounded-2xl border border-exec-divider bg-white p-8">
          <h3 className="text-lg font-bold text-exec-navy mb-6">Cumulative Recurring Savings vs. Investment</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="year" tick={{ fontSize: 13, fill: "hsl(220, 10%, 45%)" }} label={{ value: "Years", position: "bottom", offset: -5 }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 45%)" }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid hsl(220,15%,90%)", borderRadius: 8, fontSize: 13 }} formatter={(v: number) => `${v.toLocaleString()} SAR`} />
                <ReferenceLine y={SYSTEM_COST} stroke="hsl(220, 30%, 15%)" strokeDasharray="5 5" label={{ value: "Investment: 175,000", fill: "hsl(220,30%,15%)", fontSize: 11, position: "right" }} />
                <Line type="monotone" dataKey="cumulative" name="Cumulative Recurring Savings" stroke="hsl(152, 45%, 42%)" strokeWidth={2.5} dot={{ fill: "hsl(152,45%,42%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function ROIRow({ label, value, highlight, sub }: { label: string; value: string; highlight?: boolean; sub?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${sub ? "py-1" : "py-3 border-b border-exec-divider last:border-0"}`}>
      <span className={`text-sm ${sub ? "text-muted-foreground" : "text-muted-foreground"}`}>{label}</span>
      <span className={`tabular-nums ${highlight ? "text-lg font-bold text-exec-green" : sub ? "text-sm text-exec-navy" : "text-lg font-bold text-exec-navy"}`}>{value}</span>
    </div>
  );
}

// ─── SECTION 4: METHODOLOGY & ENERGY ────────────────
function Methodology() {
  const chartData = MONTHS.map((m, i) => ({
    month: m,
    "2024 kWh": KW_2024[i],
    "2025 Adjusted kWh": Math.round(KW_2025[i] * 0.88),
  }));

  return (
    <section className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold tracking-widest uppercase text-exec-green mb-3">
          Section 4 — Methodology & Energy Performance
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-exec-navy mb-10">
          Invoice-Validated Derivation
        </h2>

        {/* Step Flow */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-12">
          <StepBox label="2024 Actual" value="220,028 SAR" variant="neutral" />
          <StepArrow />
          <StepBox label="12% Weather Normalization" value="× 1.12" variant="neutral" />
          <StepArrow />
          <StepBox label="Expected 2025" value="246,431 SAR" variant="neutral" />
          <StepArrow />
          <StepBox label="Actual 2025" value="213,379 SAR" variant="neutral" />
          <StepArrow />
          <StepBox label="Avoided Cost" value="33,052 SAR" variant="positive" />
        </div>

        {/* Integrity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div>
            <h3 className="text-lg font-bold text-exec-navy mb-4">Data Integrity</h3>
            <ul className="space-y-3">
              {[
                "Based on actual SCECO invoices",
                "VAT included in all figures",
                "Tariff increases (0.20→0.22 and 0.30→0.32) reflected in billed totals",
                "No forward tariff projections",
                "No baseline growth assumptions",
                "Single adjustment: 12% weather normalization",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-exec-green shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compact Energy Chart */}
          <div>
            <h3 className="text-lg font-bold text-exec-navy mb-4">Monthly Energy Comparison</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220, 10%, 45%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 45%)" }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid hsl(220,15%,90%)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v.toLocaleString()} kWh`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="2024 kWh" stroke="hsl(220, 30%, 15%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="2025 Adjusted kWh" stroke="hsl(152, 45%, 42%)" strokeWidth={2} dot={false} strokeDasharray="6 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Analysis applies to 7 SCC panels. G8 excluded.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepBox({ label, value, variant }: { label: string; value: string; variant: "neutral" | "positive" }) {
  return (
    <div className={`rounded-xl px-6 py-5 text-center border ${variant === "positive" ? "bg-exec-green-light border-exec-green/20" : "bg-white border-exec-divider"}`}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-bold ${variant === "positive" ? "text-exec-green" : "text-exec-navy"}`}>{value}</p>
    </div>
  );
}

function StepArrow() {
  return <span className="text-2xl text-exec-divider font-light hidden md:block">→</span>;
}

// ─── NARRATIVE LOCK ─────────────────────────────────
function NarrativeLock() {
  return (
    <section className="py-8 px-6 pb-20">
      <div className="max-w-4xl mx-auto bg-exec-surface rounded-2xl border border-exec-divider p-8">
        <p className="text-sm text-exec-navy leading-relaxed">
          In a ~12% hotter year, electricity cost decreased.
          Invoice-validated avoided cost: <strong className="text-exec-green">33,052 SAR</strong>.
          Combined recurring annual benefit: <strong className="text-exec-green">55,712 SAR</strong>.
          Capital recovery: <strong className="text-exec-green">{CAPITAL_RECOVERY_YRS} years</strong>.
          All values derived from actual SCECO invoices (VAT included). No forward projections applied.
        </p>
      </div>
    </section>
  );
}

// ─── MAIN ───────────────────────────────────────────
export default function Presentation() {
  const navigate = useNavigate();
  const warnings = useValidation();

  return (
    <div className="min-h-screen bg-white">
      {warnings.length > 0 && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">
              Presentation data mismatch — check locked inputs. {warnings.join(" ")}
            </p>
          </div>
        </div>
      )}

      <div className="border-b border-exec-divider px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-exec-navy transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <p className="text-xs text-muted-foreground tracking-wider uppercase">Confidential — Board Review</p>
        </div>
      </div>

      <ExecutiveKPIs />
      <Divider />
      <SavingsBreakdown />
      <Divider />
      <ROISection />
      <Divider />
      <Methodology />
      <Divider />
      <NarrativeLock />
    </div>
  );
}
