import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, TrendingDown, Calculator, Clock } from "lucide-react";

const DEFAULT_WEATHER = 12;
const DEFAULT_EFFICIENCY = 14.1;
const DEFAULT_SYSTEM_COST = 162500; // 25000 SAR × 6.5 avg units

export function ExpansionSimulator() {
  const [branches, setBranches] = useState(20);
  const [avgBill, setAvgBill] = useState(220028);
  const [weatherAdj, setWeatherAdj] = useState(DEFAULT_WEATHER);
  const [efficiencyGain, setEfficiencyGain] = useState(DEFAULT_EFFICIENCY);
  const [systemCostPerBranch, setSystemCostPerBranch] = useState(DEFAULT_SYSTEM_COST);

  const results = useMemo(() => {
    const weatherFactor = 1 + weatherAdj / 100;
    const expectedNoSCC = Math.round(avgBill * weatherFactor);
    const actualWithSCC = Math.round(avgBill * (1 - efficiencyGain / 100));
    const avoidedPerBranch = expectedNoSCC - actualWithSCC;
    const totalAvoided = avoidedPerBranch * branches;
    const totalSystemCost = systemCostPerBranch * branches;
    const paybackYears = totalSystemCost > 0 && avoidedPerBranch > 0
      ? totalSystemCost / totalAvoided
      : 0;

    return {
      expectedNoSCC,
      actualWithSCC,
      avoidedPerBranch,
      totalAvoided,
      totalSystemCost,
      paybackYears,
    };
  }, [branches, avgBill, weatherAdj, efficiencyGain, systemCostPerBranch]);

  // Branch breakdown table
  const branchRows = useMemo(() => {
    return Array.from({ length: Math.min(branches, 50) }, (_, i) => ({
      branch: i + 1,
      avoided: results.avoidedPerBranch,
      cumulative: results.avoidedPerBranch * (i + 1),
    }));
  }, [branches, results.avoidedPerBranch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-card p-6 card-elevated border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 mt-1">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">SCC Expansion Simulator</h2>
            <p className="text-muted-foreground text-sm max-w-3xl">
              Scenario-Based Projection (Based on Rawdah Performance) — model the financial impact of rolling out SCC across multiple branches.
            </p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-muted-foreground" />
          Simulation Inputs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Number of Branches</Label>
            <Input
              type="number"
              value={branches}
              onChange={(e) => setBranches(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={500}
            />
          </div>
          <div className="space-y-2">
            <Label>Average Annual Bill per Branch (SAR)</Label>
            <Input
              type="number"
              value={avgBill}
              onChange={(e) => setAvgBill(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
          <div className="space-y-2">
            <Label>System Cost per Branch (SAR)</Label>
            <Input
              type="number"
              value={systemCostPerBranch}
              onChange={(e) => setSystemCostPerBranch(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
          <div className="space-y-2">
            <Label>Weather Adjustment: {weatherAdj}%</Label>
            <Slider
              value={[weatherAdj]}
              onValueChange={(v) => setWeatherAdj(v[0])}
              min={0}
              max={20}
              step={1}
            />
            <p className="text-xs text-muted-foreground">Default: 12% (based on Rawdah)</p>
          </div>
          <div className="space-y-2">
            <Label>Expected Efficiency Gain: {efficiencyGain}%</Label>
            <Slider
              value={[efficiencyGain]}
              onValueChange={(v) => setEfficiencyGain(parseFloat(v[0].toFixed(1)))}
              min={5}
              max={30}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">Default: 14.1% (Rawdah proven)</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl bg-card p-5 card-elevated text-center border-t-4 border-t-muted-foreground">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Initial Investment</p>
          <p className="text-3xl font-black text-foreground">{results.totalSystemCost.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">SAR ({branches} branches)</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated text-center border-t-4 border-t-destructive">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Expected Bill (No SCC)</p>
          <p className="text-3xl font-black text-destructive">{results.expectedNoSCC.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">SAR per branch</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated text-center border-t-4 border-t-savings">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingDown className="h-3 w-3 text-savings" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Avoided per Branch</p>
          </div>
          <p className="text-3xl font-black text-savings">{results.avoidedPerBranch.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">SAR/year</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated text-center border-t-4 border-t-primary">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Network Avoided</p>
          <p className="text-3xl font-black text-primary">{results.totalAvoided.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">SAR/year ({branches} branches)</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated text-center border-t-4 border-t-energy">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-3 w-3 text-energy" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Payback Period</p>
          </div>
          <p className="text-3xl font-black text-energy">
            {results.paybackYears > 0 ? results.paybackYears.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-muted-foreground">years</p>
        </div>
      </div>

      {/* 5-Year Projection */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="font-semibold mb-4">5-Year Network Projection</h3>
        <div className="grid grid-cols-5 gap-3 text-center">
          {[1, 2, 3, 4, 5].map((yr) => {
            const cumSavings = results.totalAvoided * yr;
            const netGain = cumSavings - results.totalSystemCost;
            return (
              <div
                key={yr}
                className={`rounded-xl p-4 border ${netGain >= 0 ? 'bg-savings/5 border-savings/30' : 'bg-muted/30 border-border'}`}
              >
                <p className="text-xs text-muted-foreground uppercase">Year {yr}</p>
                <p className="text-lg font-black tabular-nums">{(cumSavings / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">SAR saved</p>
                <p className={`text-sm font-bold mt-2 ${netGain >= 0 ? 'text-savings' : 'text-destructive'}`}>
                  {netGain >= 0 ? '+' : ''}{(netGain / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-muted-foreground">net ROI</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Branch Table (show first 20 max) */}
      <div className="rounded-xl bg-card p-6 card-elevated overflow-x-auto">
        <h3 className="font-semibold mb-4">Per-Branch Cumulative Savings</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch #</TableHead>
              <TableHead className="text-right">Avoided SAR/Year</TableHead>
              <TableHead className="text-right">Cumulative Network SAR/Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branchRows.slice(0, 20).map((row) => (
              <TableRow key={row.branch}>
                <TableCell>Branch {row.branch}</TableCell>
                <TableCell className="text-right tabular-nums text-savings font-medium">
                  {row.avoided.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold">
                  {row.cumulative.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {branches > 20 && (
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                  ... showing first 20 of {branches} branches
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-muted/30 border border-border p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">Scenario-Based Projection (Based on Rawdah Performance):</strong> These projections assume each branch achieves similar efficiency gains to the Rawdah showroom. Actual results may vary based on building size, AC configuration, and local climate conditions.
      </div>
    </div>
  );
}
