import { assets } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Box, CheckCircle, Clock, AlertTriangle, Wrench } from "lucide-react";
import { KpiCard } from "@/components/platform/KpiCard";
import { Progress } from "@/components/ui/progress";
import { LockedFinancials } from "@/data/lockedPerformanceModel";

export default function AssetsPage() {
  const optimized = assets.filter(a => a.status === 'optimized').length;
  const monitoring = assets.length;
  const pending = assets.filter(a => a.status === 'pending').length;
  const maintenance = assets.filter(a => a.status === 'maintenance').length;
  const avgGain = LockedFinancials.efficiencyImprovement;

  const statusBadge = (s: string) => s === 'optimized' ? 'bg-primary/20 text-primary' : s === 'monitoring' ? 'bg-energy/20 text-energy' : s === 'pending' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assets & Equipment</h1>
        <p className="text-sm text-muted-foreground mt-1">{assets.length} monitored and optimized SCC units — Jarir Bookstore Rawdah</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard title="Total Assets" value={String(assets.length)} icon={Box} />
        <KpiCard title="Optimized" value={String(optimized)} icon={CheckCircle} variant="savings" />
        <KpiCard title="Monitoring" value={String(monitoring)} icon={Clock} variant="energy" />
        <KpiCard title="Pending" value={String(pending)} icon={AlertTriangle} variant="warning" />
        <KpiCard title="Avg Efficiency Gain" value={`${avgGain}%`} icon={Box} variant="savings" />
      </div>
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Asset</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Site</TableHead>
              <TableHead className="text-xs">Capacity</TableHead>
              <TableHead className="text-xs">Baseline → Current</TableHead>
              <TableHead className="text-xs">Efficiency Gain</TableHead>
              <TableHead className="text-xs">Solution</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Run Hours</TableHead>
              <TableHead className="text-xs">Flags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.slice(0, 30).map(a => (
              <TableRow key={a.id} className="cursor-pointer hover:bg-secondary/50">
                <TableCell className="text-xs font-medium">{a.name}</TableCell>
                <TableCell className="text-xs">{a.type}</TableCell>
                <TableCell className="text-xs truncate max-w-[120px]">{a.siteName}</TableCell>
                <TableCell className="text-xs">{a.capacity_tons} TR</TableCell>
                <TableCell className="text-xs font-mono">{a.baseline_kw} → {a.current_kw} kW</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min(a.efficiency_gain * 5, 100)} className="h-1.5 w-16" />
                    <span className="text-xs text-savings font-medium">{a.efficiency_gain > 0 ? `${a.efficiency_gain}%` : '—'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{a.solution || '—'}</TableCell>
                <TableCell><Badge className={`text-[9px] ${statusBadge(a.status)}`}>{a.status}</Badge></TableCell>
                <TableCell className="text-xs font-mono">{a.runHours.toLocaleString()}</TableCell>
                <TableCell className="text-xs">{a.abnormalFlags > 0 ? <span className="text-warning">{a.abnormalFlags} ⚠</span> : '✓'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
