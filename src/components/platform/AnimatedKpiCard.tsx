import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";

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
}

export function AnimatedKpiCard({
  title, value, suffix = '', prefix = '', decimals = 0,
  subtitle, icon: Icon, trend, variant = 'default', delay = 0,
}: AnimatedKpiCardProps) {
  const animatedValue = useCountUp({ end: value, decimals, delay });

  const glowClass = variant === 'savings' ? 'card-glow-green' : variant === 'energy' ? 'card-glow-blue' : '';
  const iconBg = variant === 'savings' ? 'bg-savings/10 text-savings'
    : variant === 'energy' ? 'bg-energy/10 text-energy'
    : variant === 'warning' ? 'bg-warning/10 text-warning'
    : variant === 'danger' ? 'bg-destructive/10 text-destructive'
    : 'bg-secondary text-muted-foreground';

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4 flex flex-col gap-3 animate-fade-in", glowClass)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</span>
        <div className={cn("h-8 w-8 rounded-md flex items-center justify-center", iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight font-mono">
          {prefix}{animatedValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {trend && (
        <div className={cn("text-xs font-medium", trend.positive ? "text-savings" : "text-destructive")}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  );
}
