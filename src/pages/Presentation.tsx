import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── CFO-LOCKED CONSTANTS ───────────────────────────
const ACTUAL_BILL_2024 = 220028;
const ACTUAL_BILL_2025 = 213379;
const WEATHER_FACTOR = 1.12;
const EXPECTED_2025 = Math.round(ACTUAL_BILL_2024 * WEATHER_FACTOR); // 246431
const TRUE_SAVINGS_SAR = EXPECTED_2025 - ACTUAL_BILL_2025; // 33052
const ANNUAL_KWH_2024 = 574713;
const ANNUAL_KWH_2025_RAW = 561307;
const ANNUAL_TRUE_SAVINGS_KWH = 80763;
const EFFICIENCY_PCT = 14.1;
const AUGUST_2025_RAW = 71586;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const KW_2024 = [25464, 35426, 36250, 39224, 60210, 68993, 72871, 77243, 60655, 42915, 33158, 22304];
const KW_2025 = [26381, 25607, 40720, 51248, 51220, 62835, 68338, 71586, 56067, 40182, 32335, 21823];

// ─── Validation ─────────────────────────────────────
function useValidation() {
  const warnings: string[] = [];

  if (EXPECTED_2025 !== 246431) warnings.push("Weather adjustment logic mismatch.");
  if (KW_2025[7] !== AUGUST_2025_RAW) warnings.push("August 2025 Raw kWh mismatch.");

  return warnings;
}

// ─── Section Divider ────────────────────────────────
function SectionDivider() {
  return <div className="w-full max-w-5xl mx-auto border-t border-exec-divider my-16" />;
}

// ─── SECTION 1: EXECUTIVE IMPACT ────────────────────
function ExecutiveImpact() {
  return (
    <section className="pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold tracking-widest uppercase text-exec-green mb-3">
          Section 1 — Executive Impact
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-exec-navy leading-tight mb-2">
          SCC Performance Summary
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Rawdah Showroom · 7 SCC Units · FY 2025 Results
        </p>

        {/* KPI Cards — 3×2 grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <KPICard label="2024 Actual Cost" value="220,028" unit="SAR" />
          <KPICard label="2025 Actual Cost" value="213,379" unit="SAR" />
          <KPICard label="Weather-Adjusted Expected" value="246,431" unit="SAR" sub="220,028 × 1.12" />
          <KPICard label="True Avoided Cost" value="33,052" unit="SAR" positive />
          <KPICard label="Efficiency Improvement" value="14.1" unit="%" positive />
          <KPICard label="Energy Avoided" value="80,763" unit="kWh" positive />
        </div>

        <p className="text-sm text-muted-foreground mt-8 text-center">
          All values derived from actual SCECO invoices (VAT included).
        </p>
      </div>
    </section>
  );
}

function KPICard({
  label,
  value,
  unit,
  sub,
  positive,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-8 border ${positive ? "bg-exec-green-light border-exec-green/20" : "bg-white border-exec-divider"}`}>
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <p className={`text-4xl md:text-5xl font-bold tracking-tight ${positive ? "text-exec-green" : "text-exec-navy"}`}>
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{unit}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── SECTION 2: OPERATIONAL PERFORMANCE ─────────────
function OperationalPerformance() {
  const chartData = MONTHS.map((m, i) => ({
    month: m,
    "2024 kWh": KW_2024[i],
    "2025 Adjusted kWh": Math.round(KW_2025[i] * 0.88),
  }));

  return (
    <section className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold tracking-widest uppercase text-exec-green mb-3">
          Section 2 — Operational Performance
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-exec-navy mb-10">
          Monthly Energy Comparison
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Chart — 3 cols */}
          <div className="lg:col-span-3 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 13, fill: "hsl(220, 10%, 45%)" }} />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(220, 10%, 45%)" }}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid hsl(220, 15%, 90%)",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                  formatter={(v: number) => `${v.toLocaleString()} kWh`}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Line
                  type="monotone"
                  dataKey="2024 kWh"
                  stroke="hsl(220, 30%, 15%)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="2025 Adjusted kWh"
                  stroke="hsl(152, 45%, 42%)"
                  strokeWidth={2.5}
                  dot={false}
                  strokeDasharray="6 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary — 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            <SummaryRow label="2024 Total kWh" value="574,713" />
            <SummaryRow label="2025 Raw kWh" value="561,307" />
            <SummaryRow label="Weather-Normalised Savings" value="80,763 kWh" highlight />
            <SummaryRow label="Efficiency Gain" value="14.1%" highlight />
            <SummaryRow label="SCC Coverage" value="81.8%" />
            <div className="pt-4 border-t border-exec-divider">
              <p className="text-xs text-muted-foreground">
                Analysis applies to 7 SCC panels. G8 excluded.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-exec-divider last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-lg font-bold ${highlight ? "text-exec-green" : "text-exec-navy"}`}>{value}</span>
    </div>
  );
}

// ─── SECTION 3: FINANCIAL METHODOLOGY ───────────────
function FinancialMethodology() {
  return (
    <section className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold tracking-widest uppercase text-exec-green mb-3">
          Section 3 — Financial Methodology
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-exec-navy mb-10">
          Savings Derivation
        </h2>

        {/* Visual Step Flow */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-12">
          <StepBox label="2024 Actual" value="220,028 SAR" variant="neutral" />
          <StepArrow />
          <StepBox label="+12% Weather" value="× 1.12" variant="neutral" />
          <StepArrow />
          <StepBox label="Expected 2025" value="246,431 SAR" variant="neutral" />
          <StepArrow />
          <StepBox label="Actual 2025" value="213,379 SAR" variant="neutral" />
          <StepArrow />
          <StepBox label="Avoided Cost" value="33,052 SAR" variant="positive" />
        </div>

        {/* Integrity Bullets */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-exec-navy mb-4">Data Integrity</h3>
          <ul className="space-y-3">
            {[
              "VAT included in all invoice figures",
              "No baseline growth assumptions applied",
              "No tariff projections or rate escalation",
              "No compounded multipliers",
              "Invoice-backed validation from SCECO",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-exec-green shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StepBox({ label, value, variant }: { label: string; value: string; variant: "neutral" | "positive" }) {
  return (
    <div
      className={`rounded-xl px-6 py-5 text-center border ${
        variant === "positive"
          ? "bg-exec-green-light border-exec-green/20"
          : "bg-white border-exec-divider"
      }`}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-bold ${variant === "positive" ? "text-exec-green" : "text-exec-navy"}`}>
        {value}
      </p>
    </div>
  );
}

function StepArrow() {
  return (
    <span className="text-2xl text-exec-divider font-light hidden md:block">→</span>
  );
}

// ─── SECTION 4: STRATEGIC SCALING ───────────────────
function StrategicScaling() {
  const perBranch = TRUE_SAVINGS_SAR;
  const projections = [
    { branches: 5, total: perBranch * 5 },
    { branches: 10, total: perBranch * 10 },
    { branches: 20, total: perBranch * 20 },
  ];

  return (
    <section className="py-8 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold tracking-widest uppercase text-exec-green mb-3">
          Section 4 — Strategic Scale Opportunity
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-exec-navy mb-10">
          Network Expansion Projection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projections.map((p) => (
            <div
              key={p.branches}
              className="rounded-2xl p-8 bg-exec-surface border border-exec-divider"
            >
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {p.branches} Branches
              </p>
              <p className="text-3xl font-bold text-exec-navy">
                {p.total.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">SAR</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Annual avoided cost
              </p>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Projection based on validated Rawdah performance
        </p>
      </div>
    </section>
  );
}

// ─── Narrative Lock ─────────────────────────────────
function NarrativeLock() {
  return (
    <section className="py-8 px-6">
      <div className="max-w-4xl mx-auto bg-exec-surface rounded-2xl border border-exec-divider p-8">
        <p className="text-sm text-exec-navy leading-relaxed">
          In a ~12% hotter year, electricity cost decreased.
          Weather-normalised avoided cost: <strong className="text-exec-green">33,052 SAR</strong>.
          Efficiency improvement: <strong className="text-exec-green">14.1%</strong>.
          All values derived from actual SCECO invoices (VAT included).
        </p>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────
export default function Presentation() {
  const navigate = useNavigate();
  const warnings = useValidation();

  return (
    <div className="min-h-screen bg-white">
      {/* Warning Banner */}
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

      {/* Top Bar */}
      <div className="border-b border-exec-divider px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-exec-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <p className="text-xs text-muted-foreground tracking-wider uppercase">
            Confidential — Board Review
          </p>
        </div>
      </div>

      <ExecutiveImpact />
      <SectionDivider />
      <OperationalPerformance />
      <SectionDivider />
      <FinancialMethodology />
      <SectionDivider />
      <StrategicScaling />
      <SectionDivider />
      <NarrativeLock />
    </div>
  );
}
