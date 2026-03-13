import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

interface SparklinePoint {
  value: number;
}

interface AnimatedKpiCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: 'default' | 'savings' | 'energy' | 'warning' | 'danger';
  delay?: number;
  sparkline?: SparklinePoint[];
}

function MiniSparkline({ data, color }: { data: SparklinePoint[]; color: string }) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.value - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AnimatedKpiCard({
  title, value, suffix = '', prefix = '', decimals = 0,
  subtitle, icon: Icon, trend, variant = 'default', delay = 0,
  sparkline,
}: AnimatedKpiCardProps) {
  const animatedValue = useCountUp({ end: value, decimals, delay });

  const glowClass = variant === 'savings' ? 'card-glow-green' : variant === 'energy' ? 'card-glow-blue' : '';
  const iconBg = variant === 'savings' ? 'bg-savings/10 text-savings'
    : variant === 'energy' ? 'bg-energy/10 text-energy'
    : variant === 'warning' ? 'bg-warning/10 text-warning'
    : variant === 'danger' ? 'bg-destructive/10 text-destructive'
    : 'bg-secondary text-muted-foreground';

  const sparkColor = variant === 'savings' ? 'hsl(152, 60%, 48%)'
    : variant === 'energy' ? 'hsl(192, 70%, 50%)'
    : variant === 'warning' ? 'hsl(38, 92%, 50%)'
    : variant === 'danger' ? 'hsl(0, 72%, 51%)'
    : 'hsl(210, 80%, 55%)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "rounded-lg border border-border bg-card p-4 flex flex-col gap-3 group hover:border-primary/20 transition-all duration-300",
        glowClass
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</span>
        <div className={cn("h-8 w-8 rounded-md flex items-center justify-center transition-transform group-hover:scale-110", iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight font-mono">
            {prefix}{animatedValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
          </p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {sparkline && sparkline.length > 1 && (
          <div className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
            <MiniSparkline data={sparkline} color={sparkColor} />
          </div>
        )}
      </div>
      {trend && (
        <div className={cn("text-xs font-medium flex items-center gap-1", trend.positive ? "text-savings" : "text-destructive")}>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (delay + 800) / 1000, type: "spring", stiffness: 300 }}
          >
            {trend.positive ? '↑' : '↓'}
          </motion.span>
          {trend.value}
        </div>
      )}
    </motion.div>
  );
}
