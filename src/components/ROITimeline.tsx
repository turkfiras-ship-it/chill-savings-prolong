import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { yearlySavingsConservative, systemCost } from "@/data/savingsData";

export function ROITimeline() {
  // Generate 15-year projection
  const data = Array.from({ length: 16 }, (_, year) => ({
    year,
    cumulativeSavings: year * yearlySavingsConservative,
    investment: systemCost,
    netROI: (year * yearlySavingsConservative) - systemCost,
  }));

  const paybackYear = Math.ceil(systemCost / yearlySavingsConservative * 10) / 10;

  return (
    <div className="rounded-xl bg-card p-6 card-elevated">
      <h3 className="text-xl font-semibold mb-1">ROI Timeline</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Cumulative savings projection over 15 years (at 25% savings rate)
      </p>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="year" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Years', position: 'bottom', offset: -5 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} SAR`, ""]}
            />
            <ReferenceLine
              y={systemCost}
              stroke="hsl(0, 72%, 51%)"
              strokeDasharray="5 5"
              label={{
                value: "Initial Investment",
                fill: "hsl(0, 72%, 51%)",
                fontSize: 11,
                position: "right"
              }}
            />
            <ReferenceLine
              x={paybackYear}
              stroke="hsl(152, 60%, 40%)"
              strokeDasharray="5 5"
              label={{
                value: `Payback: ~${paybackYear.toFixed(1)} years`,
                fill: "hsl(152, 60%, 40%)",
                fontSize: 11,
                position: "top"
              }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeSavings"
              name="Cumulative Savings"
              stroke="hsl(152, 60%, 40%)"
              strokeWidth={3}
              dot={{ fill: "hsl(152, 60%, 40%)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-2xl font-bold text-savings">~{paybackYear.toFixed(1)} yrs</p>
          <p className="text-xs text-muted-foreground">Payback Period</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{((yearlySavingsConservative * 10 - systemCost) / systemCost * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">10-Year ROI</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-savings">{(yearlySavingsConservative * 15 / 1000000).toFixed(1)}M SAR</p>
          <p className="text-xs text-muted-foreground">15-Year Savings</p>
        </div>
      </div>
    </div>
  );
}
