import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

export function SystemUptimeBar() {
  const days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const r = Math.random();
      return {
        day: i + 1,
        status: r > 0.08 ? 'up' as const : r > 0.03 ? 'degraded' as const : 'down' as const,
      };
    });
  }, []);

  const uptime = ((days.filter(d => d.status === 'up').length / days.length) * 100).toFixed(1);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-savings" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">System Uptime</span>
        </div>
        <span className="text-sm font-bold font-mono text-savings">{uptime}%</span>
      </div>
      <div className="flex gap-[2px]">
        {days.map((d, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
            className={cn(
              "flex-1 h-5 rounded-sm origin-bottom",
              d.status === 'up' && 'bg-savings/60 hover:bg-savings/80',
              d.status === 'degraded' && 'bg-warning/60 hover:bg-warning/80',
              d.status === 'down' && 'bg-destructive/60 hover:bg-destructive/80',
            )}
            title={`Day ${d.day}: ${d.status}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
        <span>30 days ago</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-savings/60" /> Up</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-warning/60" /> Degraded</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-destructive/60" /> Down</span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}
