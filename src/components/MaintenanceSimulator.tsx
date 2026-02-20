import { useState, useMemo } from "react";
import { Wrench, DollarSign, Clock, TrendingUp, RotateCcw, Pencil } from "lucide-react";
import { maintenanceSavings, downtimeSavings, energySavings, systemConfig } from "@/data/roiCalculations";
import { cn } from "@/lib/utils";

/* ── types ─────────────────────────────────────────────────────────── */

interface MaintenanceRow {
  category: string;
  description: string;
  withoutSystem: number;
  withSystem: number;
}

interface SimState {
  rows: MaintenanceRow[];
  downtimeHoursWithout: number;
  downtimeHoursWith: number;
  hourlyRevenueLoss: number;
  energySavingsSAR: number;
  acReplacementTotal: number;
  systemCost: number;
  numberOfUnits: number;
}

/* ── defaults ──────────────────────────────────────────────────────── */

function buildDefaults(): SimState {
  return {
    rows: maintenanceSavings.map((m) => ({
      category: m.category,
      description: m.description,
      withoutSystem: m.withoutSystem,
      withSystem: m.withSystem,
    })),
    downtimeHoursWithout: downtimeSavings.averageDowntimeHoursWithout,
    downtimeHoursWith: downtimeSavings.averageDowntimeHoursWith,
    hourlyRevenueLoss: downtimeSavings.hourlyRevenueLoss,
    energySavingsSAR: energySavings.annualSavingsRawdah,
    acReplacementTotal: 7 * 55_000, // 385,000
    systemCost: systemConfig.totalSystemCost,
    numberOfUnits: systemConfig.numberOfUnits,
  };
}

/* ── inline editable number ────────────────────────────────────────── */

function Editable({
  value,
  onChange,
  className,
  suffix = "",
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  suffix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const start = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const commit = () => {
    const n = parseFloat(draft.replace(/,/g, ""));
    if (!isNaN(n)) onChange(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-28 rounded border border-primary bg-background px-2 py-0.5 text-sm font-semibold text-right focus:outline-none focus:ring-1 focus:ring-primary"
      />
    );
  }

  return (
    <button
      onClick={start}
      className={cn(
        "group inline-flex items-center gap-1 rounded px-1 -mx-1 hover:bg-primary/10 transition-colors cursor-text tabular-nums",
        className,
      )}
      title="Click to edit"
    >
      <span>
        {value.toLocaleString()}
        {suffix}
      </span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
    </button>
  );
}

/* ── component ─────────────────────────────────────────────────────── */

export function MaintenanceSimulator() {
  const [state, setState] = useState<SimState>(buildDefaults);

  const updateRow = (idx: number, field: "withoutSystem" | "withSystem", val: number) => {
    setState((prev) => {
      const rows = [...prev.rows];
      rows[idx] = { ...rows[idx], [field]: val };
      return { ...prev, rows };
    });
  };

  const set = <K extends keyof SimState>(key: K, val: SimState[K]) =>
    setState((prev) => ({ ...prev, [key]: val }));

  /* derived */
  const derived = useMemo(() => {
    const maintenanceTotal = state.rows.reduce((s, r) => s + (r.withoutSystem - r.withSystem), 0);
    const downtimeSav = (state.downtimeHoursWithout - state.downtimeHoursWith) * state.hourlyRevenueLoss;
    const annualOperational = state.energySavingsSAR + maintenanceTotal + downtimeSav;
    const paybackYears = annualOperational > 0 ? state.systemCost / annualOperational : 0;
    const fiveYear = annualOperational * 5 + state.acReplacementTotal * 0.5;
    const fiveYearROI = state.systemCost > 0 ? ((fiveYear - state.systemCost) / state.systemCost) * 100 : 0;
    const tenYear = annualOperational * 10 + state.acReplacementTotal;
    const tenYearROI = state.systemCost > 0 ? ((tenYear - state.systemCost) / state.systemCost) * 100 : 0;

    return {
      maintenanceTotal,
      downtimeSav,
      annualOperational,
      paybackYears,
      fiveYear,
      fiveYearROI,
      tenYear,
      tenYearROI,
    };
  }, [state]);

  const reset = () => setState(buildDefaults());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Maintenance & Operational Cost Simulator</h2>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
        <p className="text-white/80 text-sm">
          Click any value to edit — all totals update instantly
        </p>

        {/* Live KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <KpiCard label="System Investment" value={`${state.systemCost.toLocaleString()} SAR`} sub={`${state.numberOfUnits} units`} />
          <KpiCard label="Annual Operational Savings" value={`${Math.round(derived.annualOperational).toLocaleString()} SAR`} sub="Recurring yearly" accent />
          <KpiCard label="Payback Period" value={`${derived.paybackYears.toFixed(1)} Years`} sub={`~${Math.round(derived.paybackYears * 12)} months`} />
          <KpiCard label="5-Year ROI" value={`${derived.fiveYearROI.toFixed(0)}%`} sub={`Net: ${Math.round(derived.fiveYear - state.systemCost).toLocaleString()} SAR`} accent />
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Maintenance & Operational Cost Savings</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Detailed breakdown — click values to edit
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Without System</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">With System</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Annual Savings</th>
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row, idx) => {
                const saving = row.withoutSystem - row.withSystem;
                return (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium">{row.category}</p>
                    </td>
                    <td className="py-3 px-4 text-right text-energy">
                      <Editable
                        value={row.withoutSystem}
                        onChange={(v) => updateRow(idx, "withoutSystem", v)}
                        suffix=" SAR"
                        className="text-energy justify-end"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Editable
                        value={row.withSystem}
                        onChange={(v) => updateRow(idx, "withSystem", v)}
                        suffix=" SAR"
                        className="justify-end"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-savings">
                      {saving.toLocaleString()} SAR
                    </td>
                  </tr>
                );
              })}

              {/* Downtime Avoidance row */}
              <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium">Downtime Avoidance</p>
                  <p className="text-xs text-muted-foreground">
                    Rate:{" "}
                    <Editable
                      value={state.hourlyRevenueLoss}
                      onChange={(v) => set("hourlyRevenueLoss", v)}
                      className="text-muted-foreground"
                    />{" "}
                    SAR/hr
                  </p>
                </td>
                <td className="py-3 px-4 text-right text-energy">
                  <Editable
                    value={state.downtimeHoursWithout}
                    onChange={(v) => set("downtimeHoursWithout", v)}
                    className="text-energy justify-end"
                  />{" "}
                  hrs = {(state.downtimeHoursWithout * state.hourlyRevenueLoss).toLocaleString()} SAR
                </td>
                <td className="py-3 px-4 text-right">
                  <Editable
                    value={state.downtimeHoursWith}
                    onChange={(v) => set("downtimeHoursWith", v)}
                    className="justify-end"
                  />{" "}
                  hrs = {(state.downtimeHoursWith * state.hourlyRevenueLoss).toLocaleString()} SAR
                </td>
                <td className="py-3 px-4 text-right font-semibold text-savings">
                  {derived.downtimeSav.toLocaleString()} SAR
                </td>
              </tr>

              {/* Energy Cost Reduction row */}
              <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium">Energy Cost Reduction</p>
                  <p className="text-xs text-muted-foreground">Direct electricity bill savings</p>
                </td>
                <td className="py-3 px-4 text-right text-muted-foreground">—</td>
                <td className="py-3 px-4 text-right text-muted-foreground">—</td>
                <td className="py-3 px-4 text-right font-semibold text-savings">
                  <Editable
                    value={state.energySavingsSAR}
                    onChange={(v) => set("energySavingsSAR", v)}
                    suffix=" SAR"
                    className="text-savings justify-end"
                  />
                </td>
              </tr>

              {/* AC Replacement row */}
              <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium">AC Unit Replacement (Avoided)</p>
                  <p className="text-xs text-muted-foreground">Lifespan: 10→15 yrs</p>
                </td>
                <td className="py-3 px-4 text-right text-energy">
                  <Editable
                    value={state.acReplacementTotal}
                    onChange={(v) => set("acReplacementTotal", v)}
                    suffix=" SAR"
                    className="text-energy justify-end"
                  />
                  <p className="text-xs text-muted-foreground">(at year 10)</p>
                </td>
                <td className="py-3 px-4 text-right">0 SAR</td>
                <td className="py-3 px-4 text-right font-semibold text-savings">
                  {state.acReplacementTotal.toLocaleString()} SAR
                  <p className="text-xs text-muted-foreground font-normal">one-time at year 10</p>
                </td>
              </tr>

              {/* Total */}
              <tr className="bg-muted/40">
                <td className="py-4 px-4 font-bold" colSpan={3}>
                  TOTAL ANNUAL OPERATIONAL SAVINGS
                </td>
                <td className="py-4 px-4 text-right font-bold text-savings text-lg">
                  {Math.round(derived.annualOperational).toLocaleString()} SAR
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom projection cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProjectionCard
          icon={<Clock className="h-5 w-5" />}
          label="Payback Period"
          value={`${derived.paybackYears.toFixed(1)} Years`}
          sub={`~${Math.round(derived.paybackYears * 12)} months`}
          accent="energy"
        />
        <ProjectionCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="5-Year Total Savings"
          value={`${Math.round(derived.fiveYear).toLocaleString()} SAR`}
          sub={`ROI: ${derived.fiveYearROI.toFixed(0)}%`}
          accent="savings"
        />
        <ProjectionCard
          icon={<DollarSign className="h-5 w-5" />}
          label="10-Year Total Savings"
          value={`${Math.round(derived.tenYear).toLocaleString()} SAR`}
          sub={`ROI: ${derived.tenYearROI.toFixed(0)}%`}
          accent="savings"
        />
      </div>

      {/* System cost editor */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h4 className="font-semibold mb-3">System Configuration</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Number of Units</p>
            <Editable
              value={state.numberOfUnits}
              onChange={(v) => {
                const units = Math.round(v);
                set("numberOfUnits", units);
                set("systemCost", units * (state.systemCost / state.numberOfUnits));
              }}
              className="text-xl font-bold"
            />
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Cost per Unit (SAR)</p>
            <Editable
              value={Math.round(state.systemCost / state.numberOfUnits)}
              onChange={(v) => set("systemCost", v * state.numberOfUnits)}
              className="text-xl font-bold"
              suffix=" SAR"
            />
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total System Cost</p>
            <p className="text-xl font-bold">{state.systemCost.toLocaleString()} SAR</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── sub-components ────────────────────────────────────────────────── */

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg p-4", accent ? "bg-white/20" : "bg-white/10")}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70">{sub}</p>
    </div>
  );
}

function ProjectionCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: "savings" | "energy";
}) {
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
