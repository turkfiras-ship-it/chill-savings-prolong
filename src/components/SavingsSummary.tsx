import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { showroomsData } from "@/data/savingsData";

export function SavingsSummary() {
  // Get top 5 showrooms by savings
  const top5 = [...showroomsData]
    .sort((a, b) => b.yearlySavings25 - a.yearlySavings25)
    .slice(0, 5);
  
  const othersTotal = showroomsData
    .filter(s => !top5.includes(s))
    .reduce((sum, s) => sum + s.yearlySavings25, 0);

  const data = [
    ...top5.map(s => ({ name: s.name.replace(' Showroom', ''), value: s.yearlySavings25 })),
    { name: 'Others (15)', value: othersTotal },
  ];

  const COLORS = [
    'hsl(152, 60%, 40%)',
    'hsl(175, 70%, 45%)',
    'hsl(210, 80%, 55%)',
    'hsl(38, 92%, 50%)',
    'hsl(280, 60%, 55%)',
    'hsl(220, 15%, 65%)',
  ];

  return (
    <div className="rounded-xl bg-card p-6 card-elevated">
      <h3 className="text-xl font-semibold mb-1">Savings Distribution</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Top performing showrooms by annual energy savings
      </p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} SAR`, "Yearly Savings"]}
            />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
