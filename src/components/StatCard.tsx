import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "savings" | "energy" | "neutral";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = "default",
  className 
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6 card-elevated card-hover bg-card",
        variant === "savings" && "border-l-4 border-l-savings",
        variant === "energy" && "border-l-4 border-l-energy",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            variant === "savings" && "text-savings",
            variant === "energy" && "text-energy"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "rounded-full p-3",
            variant === "savings" && "bg-savings-light text-savings",
            variant === "energy" && "bg-energy-light text-energy",
            variant === "default" && "bg-secondary text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
