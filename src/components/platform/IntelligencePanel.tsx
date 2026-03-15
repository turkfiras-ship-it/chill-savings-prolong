import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertTriangle, TrendingUp, Zap, X, ChevronRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sites, alerts } from "@/data/mockData";

interface Insight {
  id: string;
  type: "anomaly" | "recommendation" | "prediction" | "alert";
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
}

const generateInsights = (): Insight[] => [
  {
    id: "INS-001",
    type: "anomaly",
    title: "Compressor cycling anomaly",
    description: "Compressor #3 cycling increased 31% at Jarir Rawdah without corresponding demand increase. Possible valve degradation.",
    metric: "3,100 SAR/mo",
    metricLabel: "Est. cost impact",
    severity: "warning",
    timestamp: "2 min ago",
  },
  {
    id: "INS-002",
    type: "prediction",
    title: "Cooling load surge predicted",
    description: "Temperature forecast shows 47°C Thursday across Riyadh. Portfolio cooling load expected +22% above baseline.",
    metric: "+22%",
    metricLabel: "Load increase",
    severity: "critical",
    timestamp: "5 min ago",
  },
  {
    id: "INS-003",
    type: "recommendation",
    title: "Pre-cooling opportunity",
    description: "Enable pre-cooling mode for 6 Riyadh sites between 4-6 AM tomorrow. Estimated demand charge reduction: 15,200 SAR.",
    metric: "15,200 SAR",
    metricLabel: "Potential savings",
    severity: "info",
    timestamp: "12 min ago",
  },
  {
    id: "INS-004",
    type: "anomaly",
    title: "Efficiency drop detected",
    description: "Al Othaim King Fahd showing 8% efficiency decline over past 72 hours. Filter inspection recommended.",
    metric: "-8%",
    metricLabel: "Efficiency delta",
    severity: "warning",
    timestamp: "18 min ago",
  },
  {
    id: "INS-005",
    type: "prediction",
    title: "Equipment maintenance window",
    description: "Condenser Unit A at Panda Khalidiyah approaching 6,000 run hours. Schedule maintenance within 14 days.",
    metric: "14 days",
    metricLabel: "Time to service",
    severity: "info",
    timestamp: "25 min ago",
  },
];

const severityStyles: Record<string, { border: string; icon: string; dot: string }> = {
  info: {
    border: "border-primary/20",
    icon: "text-primary",
    dot: "bg-primary",
  },
  warning: {
    border: "border-warning/20",
    icon: "text-warning",
    dot: "bg-warning",
  },
  critical: {
    border: "border-destructive/20",
    icon: "text-destructive",
    dot: "bg-destructive",
  },
};

const typeIcons: Record<string, React.ElementType> = {
  anomaly: AlertTriangle,
  recommendation: Zap,
  prediction: TrendingUp,
  alert: Activity,
};

const insightRoutes: Record<string, string> = {
  "INS-001": "/anomaly-detection",
  "INS-002": "/cooling-forecast",
  "INS-003": "/ai-optimization",
  "INS-004": "/anomaly-detection",
  "INS-005": "/predictive-maintenance",
};

export function IntelligencePanel() {
  const [insights] = useState<Insight[]>(generateInsights);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const visible = insights.filter(i => !dismissed.has(i.id));

  return (
    <div className="w-72 xl:w-80 border-l border-border/30 bg-card/20 backdrop-blur-sm flex flex-col shrink-0 hidden lg:flex">
      {/* Header */}
      <div className="h-11 flex items-center px-4 border-b border-border/30 shrink-0">
        <Brain className="h-3.5 w-3.5 text-primary mr-2" />
        <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
          Operational Intelligence
        </span>
      </div>

      {/* Insights stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
        <AnimatePresence>
          {visible.map((insight, i) => {
            const style = severityStyles[insight.severity];
            const Icon = typeIcons[insight.type];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className={`rounded-lg border ${style.border} bg-card/60 p-3 group relative`}
              >
                <button
                  onClick={() => setDismissed(prev => new Set(prev).add(insight.id))}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-muted-foreground/40 hover:text-foreground" />
                </button>

                <div className="flex items-start gap-2 mb-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${style.dot} mt-1.5 shrink-0 pulse-dot`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className={`h-3 w-3 ${style.icon} shrink-0`} />
                      <span className="text-[11px] font-semibold text-foreground truncate">{insight.title}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{insight.description}</p>
                  </div>
                </div>

                {insight.metric && (
                  <div className="mt-2 pt-2 border-t border-border/20 flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">{insight.metricLabel}</span>
                    <span className={`text-xs font-bold font-mono ${style.icon}`}>{insight.metric}</span>
                  </div>
                )}

                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground/40">{insight.timestamp}</span>
                  <button className="text-[9px] text-primary/60 hover:text-primary flex items-center gap-0.5 transition-colors">
                    Details <ChevronRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer summary */}
      <div className="p-3 border-t border-border/30">
        <div className="flex items-center justify-between text-[9px] text-muted-foreground/50">
          <span className="uppercase tracking-wider">Active alerts: {alerts.filter(a => !a.acknowledged).length}</span>
          <span className="uppercase tracking-wider">{sites.filter(s => s.status === "active").length} sites online</span>
        </div>
      </div>
    </div>
  );
}
