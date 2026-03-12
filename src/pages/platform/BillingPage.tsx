import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/platform/KpiCard";
import { Receipt, DollarSign, TrendingDown, Building2 } from "lucide-react";
import { sites, tariffs } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const billingData = sites.filter(s => s.status === 'active').map(s => ({
  site: s.name.split('—')[1]?.trim() || s.name,
  actual: s.cost_sar,
  expected: Math.round(s.baseline_kwh * 0.31),
  saved: Math.round(s.baseline_kwh * 0.31) - s.cost_sar,
})).slice(0, 8);

export default function BillingPage() {
  const totalBilled = sites.reduce((a, s) => a + s.cost_sar, 0);
  const totalExpected = sites.reduce((a, s) => a + Math.round(s.baseline_kwh * 0.31), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Utility</h1>
        <p className="text-sm text-muted-foreground mt-1">Tariff management, tenant allocation, and bill estimation</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard title="Total Billed" value={`${(totalBilled / 1e6).toFixed(2)}M SAR`} icon={Receipt} />
        <KpiCard title="Expected Baseline" value={`${(totalExpected / 1e6).toFixed(2)}M SAR`} icon={DollarSign} />
        <KpiCard title="Avoided Cost" value={`${((totalExpected - totalBilled) / 1000).toFixed(0)}K SAR`} icon={TrendingDown} variant="savings" />
        <KpiCard title="Active Tariffs" value={String(tariffs.length)} icon={Building2} />
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Actual vs Expected Bill by Site</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={billingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
              <XAxis dataKey="site" tick={{ fontSize: 9, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="expected" fill="hsl(215, 20%, 25%)" radius={[4, 4, 0, 0]} name="Expected (SAR)" />
              <Bar dataKey="actual" fill="hsl(192, 70%, 50%)" radius={[4, 4, 0, 0]} name="Actual (SAR)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tariff Schedules</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Tariff Name</TableHead>
              <TableHead className="text-xs">Tiers</TableHead>
              <TableHead className="text-xs">Fixed Charge</TableHead>
              <TableHead className="text-xs">Demand Charge</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tariffs.map(t => (
              <TableRow key={t.id}>
                <TableCell className="text-xs font-medium">{t.name}</TableCell>
                <TableCell className="text-xs">{t.tiers.map(ti => `${ti.rate} SAR/kWh`).join(' / ')}</TableCell>
                <TableCell className="text-xs">{t.fixedCharge} SAR</TableCell>
                <TableCell className="text-xs">{t.demandCharge > 0 ? `${t.demandCharge} SAR/kW` : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
