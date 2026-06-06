import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertTriangle, TrendingUp, Zap, X, ChevronRight, Activity, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LockedFinancials } from "@/data/lockedPerformanceModel";

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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const MONTH_ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

async function loadLiveInsights(): Promise<Insight[]> {
  const out: Insight[] = [];

  // 1) Real alerts from synced sheet
  const { data: alertsRows } = await supabase
    .from("unit_alerts")
    .select("id, ts, level, unit, message, action")
    .order("ts", { ascending: false })
    .limit(5);
  (alertsRows ?? []).forEach((a) => {
    const lvl = (a.level ?? "info").toLowerCase();
    const severity: Insight["severity"] =
      lvl.includes("crit") ? "critical" : lvl.includes("warn") ? "warning" : "info";
    out.push({
      id: `ALERT-${a.id}`,
      type: "alert",
      title: `${a.unit ?? "Site"} — ${a.message ?? "Alert"}`,
      description: a.action ?? "Review event log for context.",
      severity,
      timestamp: timeAgo(a.ts),
    });
  });

  // 2) Per-unit consumption spike detection (last reading vs 30-day median)
  const { data: readings } = await supabase
    .from("daily_unit_readings")
    .select("reading_date, unit, kwh")
    .order("reading_date", { ascending: false })
    .limit(500);
  if (readings && readings.length) {
    const byUnit = new Map<string, { date: string; kwh: number }[]>();
    readings.forEach((r) => {
      if (r.kwh == null) return;
      const arr = byUnit.get(r.unit) ?? [];
      arr.push({ date: r.reading_date, kwh: Number(r.kwh) });
      byUnit.set(r.unit, arr);
    });
    byUnit.forEach((arr, unit) => {
      if (arr.length < 5) return;
      const latest = arr[0];
      const history = arr.slice(1, 31).map((r) => r.kwh).sort((a, b) => a - b);
      if (!history.length) return;
      const median = history[Math.floor(history.length / 2)];
      if (median <= 0) return;
      const delta = (latest.kwh - median) / median;
      if (delta >= 0.15) {
        out.push({
          id: `SPIKE-${unit}`,
          type: "anomaly",
          title: `${unit} consumption spike`,
          description: `${unit} drew ${latest.kwh.toFixed(1)} kWh on ${latest.date} vs ${median.toFixed(1)} kWh median (last 30d).`,
          metric: `+${(delta * 100).toFixed(0)}%`,
          metricLabel: "vs 30-day median",
          severity: delta >= 0.3 ? "critical" : "warning",
          timestamp: latest.date,
        });
      }
    });
  }

  // 3) SCECO month-over-month variance
  const { data: bills } = await supabase
    .from("sceco_monthly_bills")
    .select("year, month, kwh, bill_sar");
  if (bills && bills.length >= 2) {
    const sorted = [...bills].sort((a, b) => {
      const ay = a.year * 12 + MONTH_ORDER.indexOf(a.month);
      const by = b.year * 12 + MONTH_ORDER.indexOf(b.month);
      return by - ay;
    });
    const cur = sorted[0];
    const prev = sorted[1];
    if (cur.kwh && prev.kwh && prev.kwh > 0) {
      const delta = (Number(cur.kwh) - Number(prev.kwh)) / Number(prev.kwh);
      out.push({
        id: "SCECO-MOM",
        type: "prediction",
        title: `${cur.month}-${cur.year} SCECO bill posted`,
        description: `${Number(cur.kwh).toLocaleString()} kWh / ${Number(cur.bill_sar).toLocaleString()} SAR vs prior month ${Number(prev.kwh).toLocaleString()} kWh.`,
        metric: `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}%`,
        metricLabel: "MoM kWh",
        severity: Math.abs(delta) >= 0.2 ? "warning" : "info",
        timestamp: `${cur.month} ${cur.year}`,
      });
    }
  }

  // 4) Always-on audited savings reference (locked model)
  out.push({
    id: "TDE-LOCKED",
    type: "recommendation",
    title: "TDE-audited savings on track",
    description: `Rolling 12-mo: ${LockedFinancials.weatherAdjustedEnergyAvoided.toLocaleString()} kWh avoided across 7 SCC panels (weather-normalized).`,
    metric: `${LockedFinancials.directEnergySavingsSAR.toLocaleString()} SAR`,
    metricLabel: "Direct savings (w/o VAT)",
    severity: "info",
    timestamp: "TDE 11-MAY-26",
  });

  return out;
}

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

function routeFor(insight: Insight): string {
  if (insight.id.startsWith("SPIKE-")) return "/anomaly-detection";
  if (insight.id === "SCECO-MOM") return "/monitoring";
  if (insight.id === "TDE-LOCKED") return "/savings";
  if (insight.id.startsWith("ALERT-")) return "/alerts";
  return "/anomaly-detection";
}

export function IntelligencePanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [unitCount, setUnitCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const live = await loadLiveInsights();
        const { data: units } = await supabase
          .from("daily_unit_readings")
          .select("unit, reading_date")
          .order("reading_date", { ascending: false })
          .limit(200);
        if (!alive) return;
        setInsights(live);
        const u = new Set((units ?? []).map((r) => r.unit));
        setUnitCount(u.size);
        setLastSync(units?.[0]?.reading_date ?? null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

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
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-10 px-3 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary/70 mb-2" />
            <p className="text-[11px] font-semibold">All systems nominal</p>
            <p className="text-[10px] mt-1 opacity-70">No active alerts from live data.</p>
          </div>
        )}
        {loading && (
          <div className="text-[10px] text-muted-foreground/60 px-2 py-4">Loading live signals…</div>
        )}
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
                  <button
                    onClick={() => navigate(routeFor(insight))}
                    className="text-[9px] text-primary/60 hover:text-primary flex items-center gap-0.5 transition-colors"
                  >
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
          <span className="uppercase tracking-wider">Active signals: {visible.length}</span>
          <span className="uppercase tracking-wider">
            {unitCount} units · sync {lastSync ?? "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
