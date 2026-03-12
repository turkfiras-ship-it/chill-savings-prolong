import { useState } from "react";
import { alerts } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { KpiCard } from "@/components/platform/KpiCard";

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
  const sevIcon = (s: string) => s === 'critical' ? <XCircle className="h-3.5 w-3.5 text-destructive" /> : s === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 text-warning" /> : <Info className="h-3.5 w-3.5 text-energy" />;
  const sevBadge = (s: string) => s === 'critical' ? 'bg-destructive/20 text-destructive' : s === 'warning' ? 'bg-warning/20 text-warning' : 'bg-energy/20 text-energy';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{alerts.filter(a => !a.acknowledged).length} unacknowledged alerts</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-md p-0.5">
          {(['all', 'critical', 'warning', 'info'] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'ghost'} className="h-7 text-xs px-3 capitalize" onClick={() => setFilter(f)}>
              {f} {f !== 'all' && `(${alerts.filter(a => a.severity === f).length})`}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard title="Total Alerts" value={String(alerts.length)} icon={Bell} />
        <KpiCard title="Critical" value={String(alerts.filter(a => a.severity === 'critical').length)} icon={XCircle} variant="danger" />
        <KpiCard title="Warning" value={String(alerts.filter(a => a.severity === 'warning').length)} icon={AlertTriangle} variant="warning" />
        <KpiCard title="Acknowledged" value={String(alerts.filter(a => a.acknowledged).length)} icon={CheckCircle} variant="savings" />
      </div>
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Severity</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Message</TableHead>
              <TableHead className="text-xs">Site</TableHead>
              <TableHead className="text-xs">Asset</TableHead>
              <TableHead className="text-xs">Time</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id} className={`${!a.acknowledged ? 'bg-secondary/30' : ''}`}>
                <TableCell><div className="flex items-center gap-1.5">{sevIcon(a.severity)}<Badge className={`text-[9px] ${sevBadge(a.severity)}`}>{a.severity}</Badge></div></TableCell>
                <TableCell className="text-xs">{a.type}</TableCell>
                <TableCell className="text-xs max-w-[300px] truncate">{a.message}</TableCell>
                <TableCell className="text-xs">{a.siteName}</TableCell>
                <TableCell className="text-xs">{a.assetName || '—'}</TableCell>
                <TableCell className="text-xs">{new Date(a.timestamp).toLocaleString()}</TableCell>
                <TableCell>{a.acknowledged ? <Badge className="text-[9px] bg-primary/20 text-primary">ACK</Badge> : <Button size="sm" variant="outline" className="h-6 text-[10px]">Acknowledge</Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
