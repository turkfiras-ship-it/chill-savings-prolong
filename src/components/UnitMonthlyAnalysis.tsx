import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  unitMonthlyData2025,
  unitAnnualTotals,
  unitInfo,
  unitNamesWithG8,
  type UnitNameWithG8,
} from "@/data/unitMonthlyData";
import { Zap, BarChart3, TrendingDown, Info } from "lucide-react";

const UNIT_COLORS: Record<UnitNameWithG8, string> = {
  G1: "hsl(200, 60%, 45%)",
  G2: "hsl(220, 50%, 55%)",
  G3: "hsl(180, 45%, 45%)",
  F1: "hsl(340, 40%, 55%)",
  F2: "hsl(260, 45%, 55%)",
  F3: "hsl(152, 50%, 40%)",
  F4: "hsl(30, 50%, 50%)",
  G8: "hsl(45, 60%, 50%)",
};

export function UnitMonthlyAnalysis() {
  const [selectedUnit, setSelectedUnit] = useState<UnitNameWithG8 | "ALL">("ALL");

  // Chart data — stacked or single unit
  const chartData = unitMonthlyData2025.map((d) => ({
    month: d.month.substring(0, 3),
    ...Object.fromEntries(unitNamesWithG8.map((u) => [u, d[u]])),
    total: d.totalWithG8,
  }));

  // Line chart data for month-over-month comparison
  const momData = unitMonthlyData2025.map((d, i) => {
    const prev = i > 0 ? unitMonthlyData2025[i - 1] : null;
    return {
      month: d.month.substring(0, 3),
      ...Object.fromEntries(
        unitNamesWithG8.map((u) => [
          `${u}_change`,
          prev ? +(((d[u] - prev[u]) / prev[u]) * 100).toFixed(1) : 0,
        ])
      ),
      total_change: prev
        ? +(((d.total - prev.total) / prev.total) * 100).toFixed(1)
        : 0,
    };
  });

  // Find peak month per unit
  const peakMonths = Object.fromEntries(
    unitNamesWithG8.map((u) => {
      const max = Math.max(...unitMonthlyData2025.map((d) => d[u]));
      const month = unitMonthlyData2025.find((d) => d[u] === max)?.month || "";
      return [u, { max, month: month.substring(0, 3) }];
    })
  );

  return (
    <div className="space-y-6">
      {/* Unit Selector Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedUnit("ALL")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedUnit === "ALL"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All Units
        </button>
        {unitNamesWithG8.map((u) => (
          <button
            key={u}
            onClick={() => setSelectedUnit(u)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedUnit === u
                ? "text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            style={selectedUnit === u ? { backgroundColor: UNIT_COLORS[u] } : {}}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Stacked Bar Chart — Monthly Consumption */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            {selectedUnit === "ALL"
              ? "Monthly Consumption — All Units"
              : `Monthly Consumption — ${selectedUnit}`}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          kW consumption per month (2025)
        </p>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} kW`,
                  name,
                ]}
              />
              <Legend />
              {selectedUnit === "ALL" ? (
                unitNamesWithG8.map((u) => (
                  <Bar
                    key={u}
                    dataKey={u}
                    stackId="units"
                    fill={UNIT_COLORS[u]}
                  />
                ))
              ) : (
                <Bar
                  dataKey={selectedUnit}
                  fill={UNIT_COLORS[selectedUnit]}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month-over-Month % Change */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Month-over-Month Change (%)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Percentage change from previous month — helps identify seasonal
          ramp-up and cool-down patterns
        </p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={momData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name.replace("_change", ""),
                ]}
              />
              <Legend
                formatter={(value) => value.replace("_change", "")}
              />
              {selectedUnit === "ALL" ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="total_change"
                    name="Total"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  {unitNamesWithG8.map((u) => (
                    <Line
                      key={u}
                      type="monotone"
                      dataKey={`${u}_change`}
                      name={u}
                      stroke={UNIT_COLORS[u]}
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="4 2"
                      opacity={0.5}
                    />
                  ))}
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey={`${selectedUnit}_change`}
                  name={selectedUnit}
                  stroke={UNIT_COLORS[selectedUnit]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl bg-card card-elevated overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-xl font-semibold">
              Per-Unit Monthly Breakdown (kW)
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Actual kW readings from each AC unit — 2025
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Month</TableHead>
                {unitNamesWithG8.map((u) => (
                  <TableHead
                    key={u}
                    className="text-right font-semibold"
                  >
                    {u}
                  </TableHead>
                ))}
                <TableHead className="text-right font-semibold">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitMonthlyData2025.map((row, idx) => {
                // Find max unit for this month
                const maxUnit = unitNamesWithG8.reduce((a, b) =>
                  row[a] > row[b] ? a : b
                );
                const minUnit = unitNamesWithG8.reduce((a, b) =>
                  row[a] < row[b] ? a : b
                );
                return (
                  <TableRow
                    key={idx}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {row.month}
                    </TableCell>
                    {unitNamesWithG8.map((u) => {
                      const pct = ((row[u] / row.totalWithG8) * 100).toFixed(1);
                      return (
                        <TableCell
                          key={u}
                          className={`text-right tabular-nums ${
                            u === maxUnit
                              ? "text-destructive font-semibold"
                              : u === minUnit
                              ? "text-savings font-medium"
                              : ""
                          }`}
                        >
                          {row[u].toLocaleString()}
                          <span className="block text-xs text-muted-foreground">{pct}%</span>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right tabular-nums font-bold">
                      {row.totalWithG8.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Annual totals row */}
              <TableRow className="bg-muted/70 font-bold border-t-2">
                <TableCell>Annual Total</TableCell>
                {unitNamesWithG8.map((u) => (
                  <TableCell key={u} className="text-right tabular-nums">
                    {unitAnnualTotals[u].toLocaleString()}
                    <span className="block text-xs text-muted-foreground">
                      {((unitAnnualTotals[u] / unitAnnualTotals.totalWithG8) * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                ))}
                <TableCell className="text-right tabular-nums text-lg">
                  {unitAnnualTotals.totalWithG8.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* G8 — Panel 8 Explanation */}
      <div className="rounded-xl bg-card p-6 card-elevated border border-[hsl(45,60%,50%)]/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white" style={{ backgroundColor: UNIT_COLORS.G8 }}>
            G8
          </div>
          <div>
            <h3 className="text-lg font-bold">Panel 8 — Multiple AC Units</h3>
            <p className="text-sm text-muted-foreground">Why G8 is different from G1–G3 & F1–F4</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* G8 Composition */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">G8 Composition (7 Units on Panel 8)</h4>
            <div className="space-y-2 text-sm">
              {[
                { type: "Cassette", model: "MCCT36HRN2", cap: 3, qty: 1, location: "Basement WH" },
                { type: "Split", model: "RYD25IAVLK", cap: 2, qty: 1, location: "Server Room" },
                { type: "Cassette", model: "MCCT48HRN2", cap: 4, qty: 1, location: "GF – Receiving Area" },
                { type: "Cassette", model: "MCCT48HRN2", cap: 4, qty: 1, location: "GF – WH / Gifts" },
                { type: "Cassette", model: "MCCT48HRN2", cap: 4, qty: 1, location: "Elevator Lobby Roof" },
                { type: "Ducted Split", model: "MHGT60HWNW3", cap: 6, qty: 1, location: "Salesman Lounge Roof" },
                { type: "Cassette", model: "MCCT36HRN2", cap: 3, qty: 1, location: "Salesman Smoking Roof" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-xs text-muted-foreground">({item.cap} ton)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.location}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">
              Total G8 capacity: 26 tons across 7 individual units — all on a single panel
            </p>
          </div>

          {/* Savings Context */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Impact on Savings Calculation</h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/40">
                <p className="font-semibold text-sm mb-1">Rawdah Showroom</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">7 package units</span> on 7 panels + <span className="font-bold text-foreground">8th panel (G8)</span> with 7 smaller units.
                  SCC device saves on <span className="font-bold text-savings">7 out of 8 systems</span> — but all 8 appear on <span className="underline">one electricity bill</span>.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/40">
                <p className="font-semibold text-sm mb-1">Ruben Showroom</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">7 package units</span> on 7 panels.
                  SCC device saves on <span className="font-bold text-savings">7 out of 7 systems</span> — full coverage.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    G8 consumes <span className="font-bold">{unitAnnualTotals.G8.toLocaleString()} kWh/year</span> (
                    {((unitAnnualTotals.G8 / unitAnnualTotals.totalWithG8) * 100).toFixed(1)}% of total) — comparable to a single package unit.
                    This <span className="font-semibold">dilutes the bill-level savings percentage</span> because G8 consumption is unaffected by the SCC system but still appears on the same meter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {unitNamesWithG8.map((u) => (
          <div
            key={u}
            className="rounded-xl bg-card p-4 card-elevated border-l-4"
            style={{ borderLeftColor: UNIT_COLORS[u] }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{u}</span>
              <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                Peak: {peakMonths[u].month}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {unitInfo[u].location}
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {unitAnnualTotals[u].toLocaleString()}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                kW/year
              </span>
            </p>
            <div className="mt-2 flex items-start gap-1">
              <Info className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {unitInfo[u].notes}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
