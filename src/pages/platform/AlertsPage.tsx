import { useState } from "react";
import { alerts } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Clock } from "lucide-react";
import { AnimatedKpiCard } from "@/components/platform/AnimatedKpiCard";
import { PageTransition } from "@/components/platform/PageTransition";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set(alerts.filter(a => a.acknowledged).map(a => a.id)));
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  const sevIcon = (s: string) => s === 'critical' ? <XCircle className="h-3.5 w-3.5 text-destructive" /> : s === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 text-warning" /> : <Info className="h-3.5 w-3.5 text-energy" />;
  const sevBadge = (s: string) => s === 'critical' ? 'bg-destructive/20 text-destructive' : s === 'warning' ? 'bg-warning/20 text-warning' : 'bg-energy/20 text-energy';

  const handleAck = (id: string) => {
    setAcknowledged(prev => new Set(prev).add(id));
  };

  const unackCount = alerts.filter(a => !acknowledged.has(a.id)).length;

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">{unackCount} unacknowledged alerts</p>
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
          <AnimatedKpiCard title="Total Alerts" value={alerts.length} icon={Bell} delay={0} />
          <AnimatedKpiCard title="Critical" value={alerts.filter(a => a.severity === 'critical').length} icon={XCircle} variant="danger" delay={100} />
          <AnimatedKpiCard title="Warning" value={alerts.filter(a => a.severity === 'warning').length} icon={AlertTriangle} variant="warning" delay={200} />
          <AnimatedKpiCard title="Acknowledged" value={acknowledged.size} icon={CheckCircle} variant="savings" delay={300} />
        </div>

        {/* Alert Timeline */}
        <Card className="bg-card border-border p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-4">Alert Timeline</p>
          <div className="space-y-0">
            {[...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((a, i) => {
              const isAck = acknowledged.has(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "flex items-start gap-3 py-3 border-l-2 pl-4 ml-2 relative",
                    a.severity === 'critical' && !isAck ? 'border-destructive' : a.severity === 'warning' && !isAck ? 'border-warning' : 'border-border',
                    isAck && 'opacity-60',
                  )}
                >
                  <div className={cn(
                    "absolute -left-[5px] top-3.5 h-2 w-2 rounded-full",
                    a.severity === 'critical' ? 'bg-destructive' : a.severity === 'warning' ? 'bg-warning' : 'bg-energy',
                    !isAck && a.severity === 'critical' && 'animate-pulse',
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {sevIcon(a.severity)}
                      <Badge className={cn("text-[9px]", sevBadge(a.severity))}>{a.severity}</Badge>
                      <span className="text-[10px] text-muted-foreground">{a.type}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />{timeAgo(a.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs">{a.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{a.siteName}</span>
                      {a.assetName && <span className="text-[10px] text-muted-foreground">· {a.assetName}</span>}
                    </div>
                  </div>
                  {!isAck && (
                    <Button size="sm" variant="outline" className="h-6 text-[10px] shrink-0" onClick={() => handleAck(a.id)}>
                      Acknowledge
                    </Button>
                  )}
                  {isAck && (
                    <Badge className="text-[9px] bg-savings/20 text-savings h-5 shrink-0">ACK</Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
