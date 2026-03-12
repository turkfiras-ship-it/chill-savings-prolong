import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: 'default' | 'savings' | 'energy' | 'warning' | 'danger';
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: KpiCardProps) {
  const glowClass = variant === 'savings' ? 'card-glow-green' : variant === 'energy' ? 'card-glow-blue' : '';
  const iconBg = variant === 'savings' ? 'bg-savings/10 text-savings'
    : variant === 'energy' ? 'bg-energy/10 text-energy'
    : variant === 'warning' ? 'bg-warning/10 text-warning'
    : variant === 'danger' ? 'bg-destructive/10 text-destructive'
    : 'bg-secondary text-muted-foreground';

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4 flex flex-col gap-3", glowClass)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</span>
        <div className={cn("h-8 w-8 rounded-md flex items-center justify-center", iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
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
