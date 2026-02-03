import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { months, aggregatedMonthlyConsumption } from "@/data/savingsData";

export function ConsumptionChart() {
  const data = months.map((month, idx) => ({
    month,
    consumption: aggregatedMonthlyConsumption[idx],
    savings25: Math.round(aggregatedMonthlyConsumption[idx] * 0.25),
    savings30: Math.round(aggregatedMonthlyConsumption[idx] * 0.30),
    afterSavings: Math.round(aggregatedMonthlyConsumption[idx] * 0.75),
  }));

  return (
    <div className="rounded-xl bg-card p-6 card-elevated">
      <h3 className="text-xl font-semibold mb-1">Monthly Energy Consumption</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Aggregated consumption across all 20 showrooms with projected savings
      </p>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAfterSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} KWh`, ""]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="consumption"
              name="Current Consumption"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorConsumption)"
            />
            <Area
              type="monotone"
              dataKey="afterSavings"
              name="After 25% Savings"
              stroke="hsl(152, 60%, 40%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAfterSavings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
