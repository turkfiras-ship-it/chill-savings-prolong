import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Thermometer } from "lucide-react";

const ACTUAL_BILL_2024 = 220028;
const ACTUAL_BILL_2025 = 213379;
const ANNUAL_TRUE_SAVINGS_KWH = 80763;

const PRESET_ROWS = [0, 5, 8, 10, 12, 15, 18, 20];

export function WeatherSensitivity() {
  const [weatherPct, setWeatherPct] = useState(12);

  const sliderResult = useMemo(() => {
    const factor = 1 + weatherPct / 100;
    const expected = Math.round(ACTUAL_BILL_2024 * factor);
    const savings = expected - ACTUAL_BILL_2025;
    const avoidedRate = savings / ANNUAL_TRUE_SAVINGS_KWH;
    return { factor, expected, savings, avoidedRate };
  }, [weatherPct]);

  const tableRows = useMemo(() => {
    return PRESET_ROWS.map((pct) => {
      const factor = 1 + pct / 100;
      const expected = Math.round(ACTUAL_BILL_2024 * factor);
      const savings = expected - ACTUAL_BILL_2025;
      return { pct, expected, savings, isLocked: pct === 12 };
    });
  }, []);

  const isPositive = sliderResult.savings > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-card p-6 card-elevated border-l-4 border-l-energy">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-energy/10 mt-1">
            <Thermometer className="h-6 w-6 text-energy" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Weather Sensitivity Analysis</h2>
            <p className="text-muted-foreground text-sm max-w-3xl">
              Scenario-only module — adjust the weather increase % to see how SCC performance holds under different heat conditions.
              This does <strong>not</strong> alter the locked master 12% performance figures.
            </p>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Weather Increase %</h3>
          <span className="text-2xl font-black text-energy">{weatherPct}%</span>
        </div>
        <Slider
          value={[weatherPct]}
          onValueChange={(v) => setWeatherPct(v[0])}
          min={0}
          max={20}
          step={1}
          className="mb-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0% (Same weather)</span>
          <span>12% (Locked actual)</span>
          <span>20% (Extreme heat)</span>
        </div>
      </div>

      {/* Live Result */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card p-5 card-elevated text-center border-t-4 border-t-destructive">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Expected 2025 (No SCC)</p>
          <p className="text-3xl font-black text-destructive">{sliderResult.expected.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">SAR at {weatherPct}% weather increase</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated text-center border-t-4 border-t-savings">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">True Savings</p>
          <p className={`text-3xl font-black ${isPositive ? 'text-savings' : 'text-destructive'}`}>
            {sliderResult.savings.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">SAR</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated text-center border-t-4 border-t-primary">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Avoided Rate</p>
          <p className="text-3xl font-black text-primary">{sliderResult.avoidedRate.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground">SAR/kWh</p>
        </div>
      </div>

      {/* Statement */}
      <div className={`rounded-xl p-5 border-2 ${isPositive ? 'bg-savings/5 border-savings/30' : 'bg-destructive/5 border-destructive/30'}`}>
        <p className={`text-sm font-bold ${isPositive ? 'text-savings' : 'text-destructive'}`}>
          {isPositive
            ? `✅ Even at ${weatherPct}% weather increase, SCC remains financially positive — saving ${sliderResult.savings.toLocaleString()} SAR.`
            : `⚠️ At ${weatherPct}% weather increase, SCC savings turn negative. This scenario is below the break-even threshold.`}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="rounded-xl bg-card p-6 card-elevated overflow-x-auto">
        <h3 className="font-semibold mb-4">Scenario Comparison Table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Weather Increase %</TableHead>
              <TableHead className="text-right">Expected 2025 (SAR)</TableHead>
              <TableHead className="text-right">True Savings (SAR)</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map((row) => (
              <TableRow
                key={row.pct}
                className={row.isLocked ? 'bg-savings/10 font-bold' : ''}
              >
                <TableCell>
                  {row.pct}%
                  {row.isLocked && <span className="ml-2 text-xs text-savings">(Locked Actual)</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.expected.toLocaleString()}
                </TableCell>
                <TableCell className={`text-right tabular-nums font-semibold ${row.savings > 0 ? 'text-savings' : 'text-destructive'}`}>
                  {row.savings.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {row.savings > 0 ? '✅ Positive' : '⚠️ Negative'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-4">
          Base: Actual 2024 Bill = {ACTUAL_BILL_2024.toLocaleString()} SAR · Actual 2025 Bill = {ACTUAL_BILL_2025.toLocaleString()} SAR · kWh Saved = {ANNUAL_TRUE_SAVINGS_KWH.toLocaleString()} kWh
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-muted/30 border border-border p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">Scenario-Based Projection (Based on Rawdah Performance):</strong> This analysis uses the locked master figures as a base and varies only the weather adjustment parameter. It does not alter the confirmed 14.1% efficiency improvement or the 80,763 kWh annual savings figure.
      </div>
    </div>
  );
}
