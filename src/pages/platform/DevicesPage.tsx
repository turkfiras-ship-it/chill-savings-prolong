import { devices } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cpu, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/platform/KpiCard";

export default function DevicesPage() {
  const online = devices.filter(d => d.status === 'online').length;
  const warning = devices.filter(d => d.status === 'warning').length;
  const offline = devices.filter(d => d.status === 'offline').length;

  const statusIcon = (s: string) => s === 'online' ? <Wifi className="h-3 w-3 text-primary" /> : s === 'warning' ? <AlertTriangle className="h-3 w-3 text-warning" /> : <WifiOff className="h-3 w-3 text-destructive" />;
  const statusBadge = (s: string) => s === 'online' ? 'bg-primary/20 text-primary' : s === 'warning' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Devices & Meters</h1>
        <p className="text-sm text-muted-foreground mt-1">{devices.length} connected devices across all sites</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard title="Total Devices" value={String(devices.length)} icon={Cpu} />
        <KpiCard title="Online" value={String(online)} icon={Wifi} variant="savings" />
        <KpiCard title="Warning" value={String(warning)} icon={AlertTriangle} variant="warning" />
        <KpiCard title="Offline" value={String(offline)} icon={WifiOff} variant="danger" />
      </div>
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Serial</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Site</TableHead>
              <TableHead className="text-xs">Channels</TableHead>
              <TableHead className="text-xs">Firmware</TableHead>
              <TableHead className="text-xs">Last Sync</TableHead>
              <TableHead className="text-xs">Installed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map(d => (
              <TableRow key={d.id} className="cursor-pointer hover:bg-secondary/50">
                <TableCell><div className="flex items-center gap-1.5">{statusIcon(d.status)}<Badge className={`text-[9px] ${statusBadge(d.status)}`}>{d.status}</Badge></div></TableCell>
                <TableCell className="text-xs font-mono">{d.serial}</TableCell>
                <TableCell className="text-xs">{d.type}</TableCell>
                <TableCell className="text-xs">{d.siteName}</TableCell>
                <TableCell className="text-xs text-center">{d.channels || '—'}</TableCell>
                <TableCell className="text-xs font-mono">{d.firmware}</TableCell>
                <TableCell className="text-xs">{d.lastSync !== 'N/A' ? new Date(d.lastSync).toLocaleTimeString() : '—'}</TableCell>
                <TableCell className="text-xs">{d.installDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
