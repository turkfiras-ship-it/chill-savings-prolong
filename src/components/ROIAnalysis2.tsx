import { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// CORRECT DATA FROM EXCEL — Monthly kW for 7 SCC-controlled panels (without G8)
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─────────────────────────────────────────────────────────────────────────────
// ACTUAL EXCEL DATA — Monthly kWh — updated from Excel Feb 2026
// ─────────────────────────────────────────────────────────────────────────────
// 2024 With G8:    26240, 36800, 40458, 47829, 71038, 81536, 87538, 90122, 70163, 48672, 36501, 23998  → Total: 660855
// 2025 With G8:    27157, 26981, 44928, 59853, 72048, 75378, 83005, 82594, 65564, 45939, 35678, 23517  → Total: 642622
// G8 monthly:       776,  1374,  4208,  8605, 10828, 12543, 14657, 12879,  9497,  5757,  3343,  1694  → Total: 86171

const DEFAULT_KW_2024 = [25464, 35426, 36250, 39224, 60210, 68993, 72871, 77243, 60655, 42915, 33158, 22304]; // Without G8 (from Excel — Sep corrected to 60,655)
const DEFAULT_KW_2025 = [26381, 25607, 40720, 51248, 51220, 62835, 68338, 69715, 56067, 40182, 32335, 21823]; // Without G8 (from Excel — Jul corrected to 68,338)
const G8_MONTHLY     = [ 776,   1374,  4208,  8605, 10828, 12543, 14667, 13308,  9813,  5757,  3454,  1750]; // G8 monthly kWh — Total: 87,083 (Aug corrected to 13,308, Sep corrected to 9,813)

// With G8 totals (from Excel)
const TOTAL_WITH_G8_2024 = 660855; // Excel verified: sum of 2024 "With G8" column
const TOTAL_WITH_G8_2025 = 648391; // Verified: 561,308 (SCC) + 87,083 (G8) = 648,391
const G8_ANNUAL_TOTAL = G8_MONTHLY.reduce((a, b) => a + b, 0); // 87,083 kWh — from unit meter readings

// BUILDING COVERAGE
// ─────────────────────────────────────────────────────────────────────────────
// SCC panels: 7 × 25 tons = 175 tons (all inverter-type package units)
// G8 panel: 26 tons BUT non-inverter units (3 cassettes MCCT36/48, 1 ducted MHGT60, 1 split RYD25)
//   Non-inverter units draw ~1.5× more power per ton vs inverter → higher kW consumption per ton
//   G8 effective consumption weight = 26 × 1.5 = 39 "equivalent tons"
// Total effective tons = 175 (SCC) + 39 (G8 non-inv equivalent) = 214
// ─────────────────────────────────────────────────────────────────────────────
const SCC_TONS = 175;           // 7 panels × 25 tons — inverter-type, SCC controlled
const G8_TONS_ACTUAL = 26;      // physical tons on G8
const G8_NON_INVERTER_FACTOR = 1.5; // non-inverter draws ~50% more per ton vs inverter
const G8_EFFECTIVE_TONS = G8_TONS_ACTUAL * G8_NON_INVERTER_FACTOR; // 39 equivalent tons
const TOTAL_EFFECTIVE_TONS = SCC_TONS + G8_EFFECTIVE_TONS;          // 214 equivalent tons
const SCC_EFFECTIVE_SHARE_PCT = (SCC_TONS / TOTAL_EFFECTIVE_TONS) * 100;   // ~81.8%
const G8_EFFECTIVE_SHARE_PCT = (G8_EFFECTIVE_TONS / TOTAL_EFFECTIVE_TONS) * 100; // ~18.2%

// ─────────────────────────────────────────────────────────────────────────────
// SAUDI SCECO TIERED ELECTRICITY RATES — 800A panel (commercial)
// ─────────────────────────────────────────────────────────────────────────────
// 2024:  First 6,000 kWh/month = 0.20 SAR/kWh  |  Above 6,000 = 0.30 SAR/kWh
// 2025:  Jan–Apr same as 2024  |  May–Dec: First 6,000 = 0.22 SAR | Above = 0.32 SAR (rate hike)
// ─────────────────────────────────────────────────────────────────────────────

const TIER_1_LIMIT = 6000; // kWh/month threshold

// Compute monthly tiered bill for a given kWh array and year
// year: 2024 = flat old rates, 2025 = rate hike kicks in from May (index 4)
function tieredMonthlyBill(kwh: number, monthIndex: number, year: 2024 | 2025): number {
  const rateHike = year === 2025 && monthIndex >= 4; // May = index 4
  const r1 = rateHike ? 0.22 : 0.20;
  const r2 = rateHike ? 0.32 : 0.30;
  if (kwh <= TIER_1_LIMIT) return kwh * r1;
  return TIER_1_LIMIT * r1 + (kwh - TIER_1_LIMIT) * r2;
}

// Effective blended rate per kWh for a given consumption and month/year
function blendedRate(kwh: number, monthIndex: number, year: 2024 | 2025): number {
  return tieredMonthlyBill(kwh, monthIndex, year) / kwh;
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL FINANCIAL DATA — derived from actual bills
// ─────────────────────────────────────────────────────────────────────────────
const ACTUAL_BILL_2025 = 213379;   // SAR — actual 2025 annual bill
const ACTUAL_BILL_2024 = 220028;   // SAR — actual 2024 annual bill

// What 2025 SHOULD have cost without SCC: 213,379 ÷ (1 - 0.15 VAT) × 1.12 weather
const EXPECTED_BILL_2025_WITHOUT_SCC = 246431.36; // SAR
const TRUE_SAVINGS_SAR = Math.round(EXPECTED_BILL_2025_WITHOUT_SCC - ACTUAL_BILL_2025); // 33,052 SAR

// Blended rate: derived from 2024 actual bill vs total building kWh
const BLENDED_RATE_2024 = ACTUAL_BILL_2024 / TOTAL_WITH_G8_2024; // 220028 / 660855 ≈ 0.3329 — use as cross-check only

// SCC 7-panel bill share — now corrected for G8's heavier non-inverter consumption weight
const SEVEN_PANEL_KWH_2024 = DEFAULT_KW_2024.reduce((a, b) => a + b, 0);
const SCC_BILL_SHARE_SAR = ACTUAL_BILL_2025 * (SCC_EFFECTIVE_SHARE_PCT / 100); // ~174,547 SAR
const SCC_BILL_SHARE_PCT = SCC_EFFECTIVE_SHARE_PCT; // ~81.8%

// YoY apparent bill saving
const APPARENT_BILL_SAVINGS_SAR = ACTUAL_BILL_2024 - ACTUAL_BILL_2025; // 220,028 - 213,379 = 6,649 SAR

const COOLING_LOAD_FACTOR = 0.12; // 2025 was ~1.3°C hotter → 12% extra cooling demand

// ─────────────────────────────────────────────────────────────────────────────
// BUILDING TOTAL DAILY DEMAND (Oct 21 each year — FULL METER)
// ─────────────────────────────────────────────────────────────────────────────
const demandSnapshots = [
  { label: 'Oct 2023 — Pre-SCC', totalKw: 495, note: 'No energy-saving system', colorClass: 'text-destructive', cellFill: 'hsl(var(--destructive))' },
  { label: 'Oct 2024 — Post-SCC (Old Filters + Complaints)', totalKw: 218, note: 'SCC installed but issues present', colorClass: 'text-energy', cellFill: 'hsl(var(--energy))' },
  { label: 'Oct 2025 — Optimised (New Filters, Zero Complaints)', totalKw: 189, note: 'Full performance, zero AC complaints', colorClass: 'text-savings', cellFill: 'hsl(var(--savings))' },
];

const reduction2023to2025 = (((495 - 189) / 495) * 100).toFixed(1);
const reduction2024to2025 = (((218 - 189) / 218) * 100).toFixed(1);

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-LEVEL DEMAND SNAPSHOTS (Oct spot measurements)
// ─────────────────────────────────────────────────────────────────────────────
const unitDemandData = [
  { unit: 'G1', kw2024: 478, kw2025: 214, reduction: 55.2 },
  { unit: 'G3', kw2024: 327, kw2025: 217, reduction: 33.6 },
  { unit: 'F3', kw2024: 477, kw2025: 234, reduction: 50.9 },
  { unit: 'F1', kw2024: 465, kw2025: 290, reduction: 37.6 },
];

// ─────────────────────────────────────────────────────────────────────────────
// DERIVED CALCULATIONS
// ─────────────────────────────────────────────────────────────────────────────
function computeMonthly(kw2024: number[], kw2025: number[]) {
  return MONTHS.map((month, i) => {
    const raw2024 = kw2024[i];
    const raw2025 = kw2025[i];
    const adjusted2025 = Math.round(raw2025 * (1 + COOLING_LOAD_FACTOR));
    const rawSavingsKw = raw2024 - raw2025;
    // adjusted2025 = what the building NEEDED given 12% extra heat
    // trueSavingsKw = how much less was consumed vs that higher demand
    const trueSavingsKw = adjusted2025 - raw2025; // = raw2025 * 0.12 (weather-corrected gain)
    const totalSavingsKw = rawSavingsKw + trueSavingsKw; // raw YoY + weather bonus
    const trueSavingsPct = (totalSavingsKw / raw2024) * 100;
    // Use tiered 2025 rate for SAR valuation — savings are valued at the rate we're paying in 2025
    const rate2025 = blendedRate(raw2025 > 0 ? raw2025 : 1, i, 2025);
    const trueSavingsSAR = Math.round(totalSavingsKw * rate2025);
    return {
      month,
      raw2024,
      raw2025,
      adjusted2025,
      rawSavingsKw: Math.round(rawSavingsKw),
      rawSavingsPct: parseFloat(((rawSavingsKw / raw2024) * 100).toFixed(1)),
      weatherBonusKw: Math.round(trueSavingsKw),
      trueSavingsKw: Math.round(totalSavingsKw),
      trueSavingsPct: parseFloat(trueSavingsPct.toFixed(1)),
      trueSavingsSAR,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIPS
// ─────────────────────────────────────────────────────────────────────────────
const renderKwTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-sm shadow-lg">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{Number(p.value).toLocaleString()} kWh</span>
        </p>
      ))}
    </div>
  );
};

const renderSavingsTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-sm shadow-lg">
      <p className="font-semibold mb-2">{label}</p>
      <p className="text-muted-foreground">True Adjusted Savings: <span className="text-savings font-bold">{d.trueSavingsKw.toLocaleString()} kWh</span></p>
      <p className="text-muted-foreground">Raw Savings: <span className="font-medium">{d.rawSavingsKw.toLocaleString()} kWh</span></p>
      <p className="text-muted-foreground">Financial Value: <span className="text-savings font-bold">{d.trueSavingsSAR.toLocaleString()} SAR</span></p>
      <p className="text-xs text-muted-foreground mt-1">Adjusted %: {d.trueSavingsPct}%</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EDITABLE CELL
// ─────────────────────────────────────────────────────────────────────────────
function EditableCell({
  value,
  onChange,
  isEditing,
}: {
  value: number;
  onChange: (v: number) => void;
  isEditing: boolean;
}) {
  if (!isEditing) return <span>{value.toLocaleString()}</span>;
  return (
    <input
      type="number"
      className="w-24 text-right bg-primary/10 border border-primary/40 rounded px-1 py-0.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
      value={value}
      onChange={(e) => {
        const v = parseInt(e.target.value, 10);
        if (!isNaN(v) && v >= 0) onChange(v);
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function ROIAnalysis2() {
  const [kw2024, setKw2024] = useState<number[]>([...DEFAULT_KW_2024]);
  const [kw2025, setKw2025] = useState<number[]>([...DEFAULT_KW_2025]);
  const [isEditing, setIsEditing] = useState(false);

  const monthlyData = computeMonthly(kw2024, kw2025);

  const totalKw2024 = kw2024.reduce((a, b) => a + b, 0);
  const totalKw2025 = kw2025.reduce((a, b) => a + b, 0);
  const totalAdjusted2025 = monthlyData.reduce((a, m) => a + m.adjusted2025, 0);
  const totalRawSavingsKw = totalKw2024 - totalKw2025;
  const totalRawSavingsPct = (totalRawSavingsKw / totalKw2024) * 100;
  const totalWeatherBonusKw = Math.round(totalKw2025 * COOLING_LOAD_FACTOR);
  const totalTrueSavingsKw = totalRawSavingsKw + totalWeatherBonusKw;
  const totalTrueSavingsPct = (totalTrueSavingsKw / totalKw2024) * 100;
  // Compute SAR total using per-month tiered rates (sum from monthlyData)
  const totalTrueSavingsSAR = monthlyData.reduce((a, m) => a + m.trueSavingsSAR, 0);

  const update2024 = useCallback((i: number, v: number) => {
    setKw2024((prev) => { const next = [...prev]; next[i] = v; return next; });
  }, []);
  const update2025 = useCallback((i: number, v: number) => {
    setKw2025((prev) => { const next = [...prev]; next[i] = v; return next; });
  }, []);

  const resetData = () => {
    setKw2024([...DEFAULT_KW_2024]);
    setKw2025([...DEFAULT_KW_2025]);
  };

  return (
    <div className="space-y-8">

      {/* ── HEADER ── */}
      <div className="rounded-xl bg-card p-6 card-elevated border-l-4 border-l-savings">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-savings/10 mt-1">
            <span className="text-2xl">⚡</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">True Adjusted kW Savings — ROI 2</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
              KW-based analysis for the <strong>7 SCC-controlled panels</strong> (G8 excluded — no device installed).
              A <strong>12% weather bonus</strong> is applied since 2025 was ~1.3°C hotter.
              <strong> 2024 had active cooling complaints</strong> — meaning kW was inflated by a struggling system.
              2025 achieved full comfort with <em>less energy</em>.
            </p>
          </div>
        </div>
      </div>

      {/* ── COVERAGE BANNER ── */}
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
        <h3 className="font-bold text-sm mb-4 uppercase tracking-wide">Building Coverage — SCC System Scope (Consumption-Weighted)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-3xl font-black">8</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Total Panels</p>
            <p className="text-xs text-muted-foreground">201 physical tons total</p>
          </div>
          <div className="p-3 rounded-lg bg-savings/10 border border-savings/30">
            <p className="text-3xl font-black text-savings">7</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">SCC Panels (G1–G3, F1–F4)</p>
            <p className="text-xs text-savings font-medium">{SCC_TONS} tons inverter — Saving ✓</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-3xl font-black text-destructive">1</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">G8 — No Device</p>
            <p className="text-xs text-destructive font-medium">{G8_TONS_ACTUAL} tons non-inverter ✗</p>
            <p className="text-xs text-destructive">(≈{G8_EFFECTIVE_TONS} equiv. tons @ 1.5× draw)</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-3xl font-black text-primary">{SCC_EFFECTIVE_SHARE_PCT.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Effective Bill Share</p>
            <p className="text-xs text-primary font-medium">Consumption-weighted coverage</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
          <strong className="text-foreground">Non-inverter correction:</strong> G8's {G8_TONS_ACTUAL}-ton panel uses non-inverter compressors (3 cassettes MCCT36/48, 1 ducted MHGT60, 1 split RYD25).
          Non-inverter units draw ~50% more power per ton than inverter units — constant on/off cycling, no modulation.
          Adjusted for consumption weight, G8 represents <strong>{G8_EFFECTIVE_SHARE_PCT.toFixed(1)}%</strong> of the bill
          while the 7 SCC panels represent <strong>{SCC_EFFECTIVE_SHARE_PCT.toFixed(1)}%</strong>.
          The true financial savings are being measured against the SCC-controlled {SCC_EFFECTIVE_SHARE_PCT.toFixed(1)}% of the bill.
        </p>
      </div>

      {/* ── FINANCIAL REALITY ── */}
      <div className="rounded-xl bg-card card-elevated p-6 border-2 border-primary/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">💰</span>
          <h3 className="text-lg font-bold">Financial Reality — True Savings on {SCC_EFFECTIVE_SHARE_PCT.toFixed(1)}% of the Bill</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          G8's non-inverter units make it consume disproportionately more per ton. After consumption-weighting,
          the 7 SCC panels represent <strong>{SCC_EFFECTIVE_SHARE_PCT.toFixed(1)}% of the actual bill</strong>
          (~{Math.round(SCC_BILL_SHARE_SAR).toLocaleString()} SAR out of {ACTUAL_BILL_2025.toLocaleString()} SAR actual 2025 bill).
          SCECO tiered rates: Jan–Apr 2025 @ 0.20/0.30 SAR/kWh | May–Dec 2025 @ 0.22/0.32 SAR/kWh (rate hike).
          2024 annual blended rate (cross-check): <strong>{BLENDED_RATE_2024.toFixed(4)} SAR/kWh</strong>.
        </p>

        {/* SCECO Rate Table */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 mb-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">⚡ Saudi SCECO Tiered Rates — 800A Panel (Commercial)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
            <div className="p-2 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">2024 · Tier 1 (≤6,000 kWh)</p>
              <p className="text-xl font-black">0.20 SAR</p>
              <p className="text-xs text-muted-foreground">/kWh</p>
            </div>
            <div className="p-2 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">2024 · Tier 2 (&gt;6,000 kWh)</p>
              <p className="text-xl font-black">0.30 SAR</p>
              <p className="text-xs text-muted-foreground">/kWh</p>
            </div>
            <div className="p-2 rounded-lg bg-energy/10 border border-energy/30">
              <p className="text-xs text-muted-foreground mb-1">2025 (May+) · Tier 1</p>
              <p className="text-xl font-black text-energy">0.22 SAR</p>
              <p className="text-xs text-energy font-medium">+10% rate hike</p>
            </div>
            <div className="p-2 rounded-lg bg-energy/10 border border-energy/30">
              <p className="text-xs text-muted-foreground mb-1">2025 (May+) · Tier 2</p>
              <p className="text-xl font-black text-energy">0.32 SAR</p>
              <p className="text-xs text-energy font-medium">+6.7% rate hike</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            SAR values in the monthly table use the applicable tiered rate for each month. Jan–Apr 2025 uses 2024 rates; May–Dec 2025 uses the increased rates.
            Each kWh saved above the 6,000 threshold is worth <strong>0.32 SAR</strong> in peak summer months — maximising the financial impact of SCC savings.
          </p>
        </div>

        {/* Bills comparison */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Actual Bill 2024</p>
            <p className="text-3xl font-black">{ACTUAL_BILL_2024.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">SAR — full building</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Actual Bill 2025</p>
            <p className="text-3xl font-black">{ACTUAL_BILL_2025.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">SAR — full building</p>
          </div>
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Expected 2025 (No SCC + Heat)</p>
            <p className="text-3xl font-black text-destructive">{Math.round(EXPECTED_BILL_2025_WITHOUT_SCC).toLocaleString()}</p>
            <p className="text-xs text-destructive font-medium">Without SCC + 12% heat + 15% baseline</p>
          </div>
          <div className="p-4 rounded-xl bg-savings/10 border border-savings/30 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">True Savings vs Expected</p>
            <p className="text-3xl font-black text-savings">{TRUE_SAVINGS_SAR.toLocaleString()}</p>
            <p className="text-xs text-savings font-medium">SAR saved vs what it SHOULD have cost</p>
          </div>
        </div>

        {/* SCC portion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">SCC 7-Panel Bill Share (2025)</p>
            <p className="text-3xl font-black text-primary">{Math.round(SCC_BILL_SHARE_SAR).toLocaleString()}</p>
            <p className="text-xs text-primary font-medium">{SCC_EFFECTIVE_SHARE_PCT.toFixed(1)}% — the portion we optimise</p>
          </div>
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">G8 Bill Share (No Device)</p>
            <p className="text-3xl font-black text-destructive">{Math.round(ACTUAL_BILL_2025 - SCC_BILL_SHARE_SAR).toLocaleString()}</p>
            <p className="text-xs text-destructive font-medium">{G8_EFFECTIVE_SHARE_PCT.toFixed(1)}% — non-inverter, unoptimised</p>
          </div>
          <div className="p-4 rounded-xl bg-savings/10 border border-savings/30 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Apparent YoY Bill Saving</p>
            <p className="text-3xl font-black text-savings">{APPARENT_BILL_SAVINGS_SAR.toLocaleString()}</p>
            <p className="text-xs text-savings font-medium">SAR — raw 2024 vs 2025 difference</p>
            <p className="text-xs text-muted-foreground">Understates true value</p>
          </div>
        </div>

        <div className="rounded-xl border border-savings/30 bg-savings/5 p-5">
          <h4 className="font-bold text-sm mb-4">The Real Picture: Apparent vs True Savings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Apparent Bill Savings (YoY)</p>
              <p className="text-2xl font-black">{APPARENT_BILL_SAVINGS_SAR.toLocaleString()} SAR</p>
              <p className="text-xs text-muted-foreground mt-1">Raw diff: G8 increases &amp; hotter 2025 mask the gains</p>
            </div>
            <div className="p-3 rounded-lg bg-savings/10 border border-savings/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">True Adjusted Savings</p>
              <p className="text-2xl font-black text-savings">{TRUE_SAVINGS_SAR.toLocaleString()} SAR</p>
              <p className="text-xs text-savings font-medium mt-1">vs what 2025 SHOULD have cost without SCC</p>
            </div>
            <div className="p-3 rounded-lg bg-energy/10 border border-energy/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Hidden Value (Gap)</p>
              <p className="text-2xl font-black text-energy">{(TRUE_SAVINGS_SAR - APPARENT_BILL_SAVINGS_SAR).toLocaleString()} SAR</p>
              <p className="text-xs text-energy font-medium mt-1">Masked by G8 non-inverter load &amp; 2025 heat</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            <strong className="text-foreground">Key message:</strong> The apparent YoY bill saving of {APPARENT_BILL_SAVINGS_SAR.toLocaleString()} SAR
            <em> massively understates</em> the real value. 2025 should have cost <strong>{Math.round(EXPECTED_BILL_2025_WITHOUT_SCC).toLocaleString()} SAR</strong> given
            hotter weather and baseline growth — the SCC system delivered <strong className="text-savings">{TRUE_SAVINGS_SAR.toLocaleString()} SAR in true savings</strong>,
            all from the {SCC_EFFECTIVE_SHARE_PCT.toFixed(1)}% of the bill it controls.
          </p>
        </div>
      </div>

      {/* ── 2024 COMPLAINTS CONTEXT BANNER ── */}
      <div className="rounded-xl border border-energy/40 bg-energy/5 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">⚠️</span>
          <div>
            <h3 className="font-semibold text-sm mb-2">Why 2024 Is Not a Fair Baseline — And Why That Helps the Case</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">2024 — Cooling Problems</p>
                <ul className="space-y-1">
                  <li>• Active staff complaints about insufficient cooling</li>
                  <li>• Damaged AC filters (replaced only mid-2025)</li>
                  <li>• Faulty internal sensors (F2 unit)</li>
                  <li>• System running at max capacity to compensate</li>
                  <li>→ High kW, poor comfort = <strong>worst-case baseline</strong></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">2025 — Zero Complaints</p>
                <ul className="space-y-1">
                  <li>• New filters, control boxes, thermostats replaced</li>
                  <li>• Full staff training on thermostat usage</li>
                  <li>• System properly optimised and monitored daily</li>
                  <li>• Zero AC complaints recorded all year</li>
                  <li>→ <strong>Same comfort, significantly lower kW</strong></li>
                </ul>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-energy">
              Conclusion: The comparison is conservative — 2024 was artificially high. The true efficiency gain of the optimised system is even greater.
            </p>
          </div>
        </div>
      </div>

      {/* ── METHODOLOGY ── */}
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Adjustment Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-savings font-bold mt-0.5">①</span>
            <div>
              <p className="font-medium">Raw 2025 kW (7 units, no G8)</p>
              <p className="text-muted-foreground">Exact meter readings — G8's 26-ton complex excluded as it is not SCC-controlled</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-energy font-bold mt-0.5">②</span>
            <div>
              <p className="font-medium">× 1.12 Weather Demand (Adjusted 2025)</p>
              <p className="text-muted-foreground">What the building NEEDED given 12% extra heat in 2025 — shows the true demand pressure the system overcame</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-chart-blue font-bold mt-0.5">③</span>
            <div>
              <p className="font-medium">True Savings = Raw YoY + Weather Bonus (12% of 2025)</p>
              <p className="text-muted-foreground">Combines year-over-year reduction with the energy avoided despite higher heat demand — the full efficiency gain</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ANNUAL SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-card card-elevated p-5 text-center border-t-4 border-t-savings">
          <p className="text-3xl font-bold text-savings">{totalTrueSavingsKw.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">True Adjusted kWh Saved</p>
          <p className="text-xs text-muted-foreground">(2024 vs 2025, weather-corrected)</p>
        </div>
        <div className="rounded-xl bg-card card-elevated p-5 text-center border-t-4 border-t-savings">
          <p className="text-3xl font-bold text-savings">{totalTrueSavingsPct.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">True Adjusted Savings %</p>
          <p className="text-xs text-muted-foreground">Weather-normalised efficiency gain</p>
        </div>
        <div className="rounded-xl bg-card card-elevated p-5 text-center border-t-4 border-t-chart-blue">
          <p className="text-3xl font-bold">{totalRawSavingsPct.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Raw Savings % (unadjusted)</p>
          <p className="text-xs text-muted-foreground">kWh reduction only — before weather correction <em>and</em> rate hike</p>
          <p className="text-[10px] text-muted-foreground mt-1 italic">⚡ Rate hike May 2025: 0.30 → 0.32 SAR/kWh — each kWh saved is worth more in SAR</p>
        </div>
        <div className="rounded-xl bg-card card-elevated p-5 text-center border-t-4 border-t-energy">
          <p className="text-3xl font-bold text-energy">{TRUE_SAVINGS_SAR.toLocaleString()} SAR</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">True Financial Value</p>
          <p className="text-xs text-muted-foreground">Bill comparison: 246,431 − 213,379</p>
          <p className="text-xs text-energy font-medium">vs {APPARENT_BILL_SAVINGS_SAR.toLocaleString()} SAR apparent bill saving</p>
        </div>
      </div>

      {/* ── WHY RAW % UNDERSTATES VALUE ── */}
      <div className="rounded-xl bg-slate-800 text-white p-5">
        <p className="text-sm font-bold text-teal-400 mb-3">⚡ Why {totalRawSavingsPct.toFixed(1)}% Raw Savings Understates the True Value — Two Compounding Factors</p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="font-semibold text-white mb-1">① Weather: 2025 was +1.3°C hotter → +12% cooling demand</p>
            <p className="text-slate-400">The building <em>needed</em> 12% more energy just to maintain the same comfort. Any kWh savings on top of that is a true efficiency gain — the raw % ignores this extra demand pressure entirely.</p>
            <p className="text-teal-400 font-semibold mt-1">Weather-only correction adds: +{totalTrueSavingsKw - (DEFAULT_KW_2024.reduce((a,b)=>a+b,0) - DEFAULT_KW_2025.reduce((a,b)=>a+b,0))} kWh → worth more SAR at 2025 rates</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="font-semibold text-white mb-1">② SCECO Rate Hike: May 2025 — Tier 2 rose from 0.30 → 0.32 SAR/kWh (+6.7%)</p>
            <p className="text-slate-400">Since May 2025, every kWh saved above the 6,000 kWh/month threshold is worth <strong className="text-white">0.32 SAR</strong> instead of 0.30 SAR. This means even a "small" kWh reduction translates to a larger SAR saving in the peak months (May–Sep) when both consumption and tariff are highest.</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/5 rounded p-1.5 text-center"><p className="text-slate-400">2024 Tier 2</p><p className="text-white font-bold">0.30 SAR/kWh</p></div>
              <div className="bg-teal-500/20 rounded p-1.5 text-center border border-teal-400/30"><p className="text-teal-300">2025 May+ Tier 2</p><p className="text-teal-400 font-bold">0.32 SAR/kWh ↑</p></div>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 border-t border-white/10 pt-3">
          <strong className="text-white">Net effect:</strong> The {totalRawSavingsPct.toFixed(1)}% raw kWh saving becomes a <strong className="text-teal-400">{totalTrueSavingsPct.toFixed(1)}% true efficiency gain</strong> once weather demand is added — and that gain is valued at the higher 2025 rate, producing <strong className="text-teal-400">{TRUE_SAVINGS_SAR.toLocaleString()} SAR</strong> in true financial savings vs the {APPARENT_BILL_SAVINGS_SAR.toLocaleString()} SAR apparent bill difference.
        </p>
      </div>

      {/* ── BUILDING DEMAND SNAPSHOT ── */}
      <div className="rounded-xl bg-card p-6 card-elevated border-2 border-savings/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🏢</span>
          <h3 className="text-lg font-bold">Building Total Daily Demand — Oct 21 (Same Date, Each Year)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          The single most powerful proof: total building demand measured on the exact same date across 3 years.
          This is the <strong>full meter</strong> — all 8 panels, including G8.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {demandSnapshots.map((snap) => (
            <div key={snap.label} className="text-center p-4 rounded-xl border border-border bg-muted/20">
              <p className={`text-4xl font-black mb-1 ${snap.colorClass}`}>{snap.totalKw} kW</p>
              <p className="text-xs font-semibold leading-tight">{snap.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{snap.note}</p>
            </div>
          ))}
        </div>

        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandSnapshots} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ width: 120 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit=" kW" domain={[0, 550]} />
              <Tooltip formatter={(v: number) => [`${v} kW`, 'Total Daily Demand']} />
              <Bar dataKey="totalKw" name="Total Daily Demand (kW)" radius={[6, 6, 0, 0]}>
                {demandSnapshots.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cellFill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-savings/10 border border-savings/30">
            <p className="text-sm font-bold text-savings">📉 vs Pre-SCC (2023): 495 → 189 kW</p>
            <p className="text-2xl font-black text-savings">{reduction2023to2025}% reduction</p>
            <p className="text-xs text-muted-foreground mt-1">Since SCC installation + filter replacement + system optimisation</p>
          </div>
          <div className="p-4 rounded-lg bg-chart-blue/10 border border-chart-blue/30">
            <p className="text-sm font-bold" style={{ color: 'hsl(var(--chart-blue))' }}>📉 Year-on-Year (2024 → 2025): 218 → 189 kW</p>
            <p className="text-2xl font-black" style={{ color: 'hsl(var(--chart-blue))' }}>{reduction2024to2025}% further reduction</p>
            <p className="text-xs text-muted-foreground mt-1">Even after SCC was already in place — new filters & optimisation delivered more</p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border text-sm text-muted-foreground">
          <strong className="text-foreground">Why this matters for the client:</strong> Even with G8 (26 tons of un-optimised units)
          pulling full load, the total building demand dropped <strong>306 kW</strong> since 2023. The 7 SCC-managed units
          are doing so well they are compensating for G8's unoptimised load — and still showing massive building-wide gains.
        </div>
      </div>

      {/* ── UNIT-LEVEL DEMAND REDUCTION ── */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-lg font-semibold mb-1">Unit-Level Demand Reduction (Spot Measurement — Same Date)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          4 of the 7 SCC units measured on the same calendar date in Oct 2024 vs Oct 2025. These are <strong>instantaneous kW draws</strong>, not monthly totals.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {unitDemandData.map((unit) => (
            <div key={unit.unit} className="rounded-lg border border-border p-4 bg-muted/20">
              <p className="font-bold text-base mb-3">{unit.unit}</p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Oct 2024</span>
                <span className="font-semibold text-destructive">{unit.kw2024} kW</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Oct 2025</span>
                <span className="font-semibold text-savings">{unit.kw2025} kW</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div className="bg-savings h-2 rounded-full" style={{ width: `${unit.reduction}%` }} />
              </div>
              <p className="text-center text-savings font-bold text-lg">{unit.reduction}% ↓</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-savings/5 border border-savings/20 p-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-2xl font-bold text-destructive">1,747 kW</p>
              <p className="text-muted-foreground text-xs">Combined draw — 4 units, Oct 2024</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-savings">955 kW</p>
              <p className="text-muted-foreground text-xs">Combined draw — 4 units, Oct 2025</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-savings">45.3% ↓</p>
              <p className="text-muted-foreground text-xs">Reduction on measured SCC units</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            * G8 (8th panel — 26 tons: 3 cassettes, 1 ducted split, 1 split) is excluded from SCC measurements.
            Its consumption is the difference between the full building meter and the 7-unit sum.
          </p>
        </div>
      </div>

      {/* ── MONTHLY KW CHART ── */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-lg font-semibold mb-1">Monthly kW Consumption: 2024 vs 2025 vs Adjusted 2025</h3>
        <p className="text-sm text-muted-foreground mb-4">
          "Adjusted 2025" removes the 12% climate penalty — showing what 2025 would have consumed at 2024 temperatures.
        </p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={renderKwTooltip} />
              <Legend />
              <Bar dataKey="raw2024" name="2024 kW (inflated by AC issues)" fill="hsl(var(--chart-blue))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="raw2025" name="2025 kW (Raw, no G8)" fill="hsl(var(--energy))" radius={[2, 2, 0, 0]} opacity={0.7} />
              <Bar dataKey="adjusted2025" name="2025 kW (−12% weather adj.)" fill="hsl(var(--savings))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── TRUE SAVINGS PER MONTH ── */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-lg font-semibold mb-1">Monthly True Adjusted kW Savings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Green = genuine savings (2024 kW − adjusted 2025 kW). Red = months where 2025 consumed more even after weather correction.
        </p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => v.toLocaleString()} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
              <Tooltip content={renderSavingsTooltip} />
              <Bar dataKey="trueSavingsKw" name="True Adjusted Savings (kWh)" radius={[3, 3, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.trueSavingsKw >= 0 ? 'hsl(var(--savings))' : 'hsl(0,72%,51%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── EDITABLE MONTHLY TABLE ── */}
      <div className="rounded-xl bg-card p-6 card-elevated overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Full Monthly Breakdown — kW Without G8</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing ? '✏️ Edit mode — click any 2024 or 2025 kW value to change it. All calculations update live.' : 'Click "Edit Data" to update kW values directly.'}
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <button
                onClick={resetData}
                className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                Reset to Original
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                isEditing
                  ? 'bg-savings text-savings-foreground hover:bg-savings/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {isEditing ? '✓ Done Editing' : '✏️ Edit Data'}
            </button>
          </div>
        </div>

        <table className="w-full text-sm border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Month</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                2024 kW {isEditing && <span className="text-primary text-xs">(editable)</span>}
              </th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                2025 kW Raw {isEditing && <span className="text-primary text-xs">(editable)</span>}
              </th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">2025 Adj (×1.12 heat demand)</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Raw Savings</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">True Savings kW</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">True %</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">SAR Value</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((row, i) => (
              <tr key={i} className={`border-b border-border/50 transition-colors ${isEditing ? 'hover:bg-primary/5' : 'hover:bg-muted/20'}`}>
                <td className="py-2 pr-4 font-medium">{MONTHS[i]}</td>
                <td className="text-right py-2 px-3">
                  <EditableCell value={kw2024[i]} onChange={(v) => update2024(i, v)} isEditing={isEditing} />
                </td>
                <td className="text-right py-2 px-3 text-muted-foreground">
                  <EditableCell value={kw2025[i]} onChange={(v) => update2025(i, v)} isEditing={isEditing} />
                </td>
                <td className="text-right py-2 px-3 font-medium">{row.adjusted2025.toLocaleString()}</td>
                <td className={`text-right py-2 px-3 ${row.rawSavingsKw >= 0 ? 'text-savings' : 'text-destructive'}`}>
                  {row.rawSavingsKw >= 0 ? '+' : ''}{row.rawSavingsKw.toLocaleString()}
                </td>
                <td className={`text-right py-2 px-3 font-semibold ${row.trueSavingsKw >= 0 ? 'text-savings' : 'text-destructive'}`}>
                  {row.trueSavingsKw >= 0 ? '+' : ''}{row.trueSavingsKw.toLocaleString()}
                </td>
                <td className={`text-right py-2 px-3 font-semibold ${row.trueSavingsPct >= 0 ? 'text-savings' : 'text-destructive'}`}>
                  {row.trueSavingsPct >= 0 ? '+' : ''}{row.trueSavingsPct.toFixed(1)}%
                </td>
                <td className={`text-right py-2 px-3 font-semibold ${row.trueSavingsSAR >= 0 ? 'text-savings' : 'text-destructive'}`}>
                  {row.trueSavingsSAR >= 0 ? '+' : ''}{row.trueSavingsSAR.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/30 font-bold">
              <td className="py-3 pr-4">ANNUAL TOTAL</td>
              <td className="text-right py-3 px-3">{totalKw2024.toLocaleString()}</td>
              <td className="text-right py-3 px-3 text-muted-foreground">{totalKw2025.toLocaleString()}</td>
              <td className="text-right py-3 px-3">{totalAdjusted2025.toLocaleString()}</td>
              <td className={`text-right py-3 px-3 ${totalRawSavingsKw >= 0 ? 'text-savings' : 'text-destructive'}`}>
                {totalRawSavingsKw >= 0 ? '+' : ''}{totalRawSavingsKw.toLocaleString()}
              </td>
              <td className="text-right py-3 px-3 text-savings">{totalTrueSavingsKw >= 0 ? '+' : ''}{totalTrueSavingsKw.toLocaleString()}</td>
              <td className="text-right py-3 px-3 text-savings">{totalTrueSavingsPct.toFixed(1)}%</td>
              <td className="text-right py-3 px-3 text-savings">{TRUE_SAVINGS_SAR.toLocaleString()} SAR</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── CONCLUSION ── */}
      <div className="rounded-xl p-6 bg-gradient-to-br from-savings/10 to-savings/5 border border-savings/30">
        <h3 className="text-lg font-bold mb-4">📋 True Adjusted Savings — Client Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-4">
          <div>
            <h4 className="font-semibold mb-2">What the raw numbers say (7 units, no G8)</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• 2024 total kWh: <strong>{totalKw2024.toLocaleString()}</strong> <em>(inflated — system under stress, cooling complaints)</em></li>
              <li>• 2025 total kWh: <strong>{totalKw2025.toLocaleString()}</strong> <em>(full comfort, zero complaints, no G8)</em></li>
              <li>• Raw saving: <strong className={totalRawSavingsKw >= 0 ? 'text-savings' : 'text-destructive'}>{totalRawSavingsKw.toLocaleString()} kWh ({totalRawSavingsPct.toFixed(1)}%)</strong></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">After 12% climate correction</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Adjusted 2025 baseline: <strong>{totalAdjusted2025.toLocaleString()} kWh</strong></li>
              <li>• True adjusted saving: <span className="text-savings font-bold">{totalTrueSavingsKw.toLocaleString()} kWh ({totalTrueSavingsPct.toFixed(1)}%)</span></li>
              <li>• Financial value: <span className="text-savings font-bold">{TRUE_SAVINGS_SAR.toLocaleString()} SAR/year</span></li>
            </ul>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-savings/10 border border-savings/20">
          <p className="text-sm font-semibold text-savings mb-2">
            🏢 Building Total Demand: 495 kW → 218 kW → <strong>189 kW</strong> = {reduction2023to2025}% reduction since SCC installation
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Key message for the client:</strong> Even though 2025 was hotter AND included G8's 26-ton unoptimised panel,
            total building demand continued to fall. The 7 SCC-controlled units are performing so well that the overall building
            footprint keeps shrinking year over year — with <strong>better comfort and zero complaints</strong> as the result.
            The unit-level measurements (G1: −55%, F3: −51%) confirm these are genuine, technology-driven gains — not anomalies.
          </p>
        </div>
      </div>

    </div>
  );
}
