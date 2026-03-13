import { useMemo } from "react";
import { sites, alerts } from "@/data/mockData";
import { motion } from "framer-motion";

interface HealthSegment {
  label: string;
  count: number;
  color: string;
  cssClass: string;
}

export function PortfolioHealthRing() {
  const segments: HealthSegment[] = useMemo(() => {
    const healthy = sites.filter(s => {
      if (s.status !== 'active') return false;
      const siteAlerts = alerts.filter(a => a.siteId === s.id && !a.acknowledged);
      return !siteAlerts.some(a => a.severity === 'critical' || a.severity === 'warning');
    }).length;
    const warning = sites.filter(s => {
      if (s.status !== 'active') return false;
      const siteAlerts = alerts.filter(a => a.siteId === s.id && !a.acknowledged);
      return !siteAlerts.some(a => a.severity === 'critical') && siteAlerts.some(a => a.severity === 'warning');
    }).length;
    const critical = sites.filter(s => {
      if (s.status !== 'active') return false;
      const siteAlerts = alerts.filter(a => a.siteId === s.id && !a.acknowledged);
      return siteAlerts.some(a => a.severity === 'critical');
    }).length;
    const offline = sites.filter(s => s.status !== 'active').length;
    return [
      { label: 'Healthy', count: healthy, color: 'hsl(152, 60%, 48%)', cssClass: 'text-savings' },
      { label: 'Warning', count: warning, color: 'hsl(38, 92%, 50%)', cssClass: 'text-warning' },
      { label: 'Critical', count: critical, color: 'hsl(0, 72%, 51%)', cssClass: 'text-destructive' },
      { label: 'Offline', count: offline, color: 'hsl(215, 15%, 55%)', cssClass: 'text-muted-foreground' },
    ];
  }, []);

  const total = segments.reduce((a, s) => a + s.count, 0);
  const healthyPct = total > 0 ? Math.round((segments[0].count / total) * 100) : 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-4">Portfolio Health</p>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width="130" height="130" viewBox="0 0 130 130">
            {segments.map((seg, i) => {
              const pct = total > 0 ? seg.count / total : 0;
              const dash = pct * circumference;
              const gap = circumference - dash;
              const currentOffset = offset;
              offset += dash;
              return (
                <motion.circle
                  key={seg.label}
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={10}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono">{healthyPct}%</span>
            <span className="text-[10px] text-muted-foreground">Healthy</span>
          </div>
        </div>
        <div className="space-y-2.5 flex-1">
          {segments.map(seg => (
            <div key={seg.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: seg.color }} />
                <span className="text-xs text-foreground">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono">{seg.count}</span>
                <span className="text-[10px] text-muted-foreground w-8 text-right">
                  {total > 0 ? Math.round((seg.count / total) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
