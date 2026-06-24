import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import { useWeatherNormalization, LOCKED_STUDY_DELTA_C, LOCKED_STUDY_FACTOR } from "@/hooks/useWeatherNormalization";

const COOLING_SEASON_DAYS = 184; // May 1 – Oct 31

function fmt(n: number | null | undefined, d = 2) {
  if (n == null || !isFinite(n)) return "—";
  return n.toFixed(d);
}
function fmtSigned(n: number | null | undefined, d = 2) {
  if (n == null || !isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(d)}`;
}

export function WeatherNarrativePanel() {
  const { loading, coolingSeason2025, coolingSeasonCurrent, lockedFactors, currentYearFinalized } =
    useWeatherNormalization();

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">What the data is telling us</CardTitle></CardHeader>
        <CardContent><p className="text-xs text-muted-foreground">Computing live narrative…</p></CardContent>
      </Card>
    );
  }

  const cs25 = coolingSeason2025;
  const csCur = coolingSeasonCurrent;
  const currentYear = csCur?.currentYear ?? new Date().getUTCFullYear();
  const locked = lockedFactors[currentYear];

  const d2025 = cs25?.tempDelta ?? null;
  const f2025 = cs25?.weatherFactor ?? null;
  const dCur = csCur?.tempDelta ?? null;
  const fCur = csCur?.weatherFactor ?? null;
  const elapsed = csCur?.currentDays ?? 0;
  const pct = Math.min(100, Math.round((elapsed / COOLING_SEASON_DAYS) * 100));
  const through = csCur?.throughDate ?? "—";

  // Verdict comparison
  let verdictHotter: "higher" | "lower" | "matching" = "matching";
  if (dCur != null && d2025 != null) {
    if (dCur > d2025 + 0.05) verdictHotter = "higher";
    else if (dCur < d2025 - 0.05) verdictHotter = "lower";
  }
  const verdictColor =
    verdictHotter === "higher" ? "text-warning"
    : verdictHotter === "lower" ? "text-savings"
    : "text-muted-foreground";

  // Reconciliation badge
  const reconciles = d2025 != null && Math.abs(d2025 - LOCKED_STUDY_DELTA_C) < 0.2;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-energy" />
          What the data is telling us
        </CardTitle>
        <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
          Live · Rawdah ERA5 · {COOLING_SEASON_DAYS}-day basis
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 2025 full cooling season */}
        <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground/90 uppercase tracking-wide">
              2025 vs 2024 — Full Cooling Season (May–Oct)
            </p>
            {reconciles && (
              <Badge variant="outline" className="text-[9px] bg-savings/10 text-savings border-savings/30">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Reconciles with locked study
              </Badge>
            )}
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            2024 (<span className="font-mono">{cs25?.baselineDays ?? 0}</span> days): <span className="font-mono font-semibold">{fmt(cs25?.baselineAvg)}°C</span>
            {" → "}
            2025 (<span className="font-mono">{cs25?.currentDays ?? 0}</span> days): <span className="font-mono font-semibold">{fmt(cs25?.currentAvg)}°C</span>.
            {" "}Delta: <span className="font-mono font-semibold text-warning">{fmtSigned(d2025)}°C</span>
            {" → "}factor <span className="font-mono font-semibold text-energy">×{fmt(f2025, 4)}</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            This reconciles with the locked study basis ({fmtSigned(LOCKED_STUDY_DELTA_C, 1)}°C / ×{LOCKED_STUDY_FACTOR.toFixed(4)}) used in the
            TDE Audit 11-MAY-2026.
          </p>
        </div>

        {/* Current year (in progress / finalized) */}
        {csCur && (
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground/90 uppercase tracking-wide">
                {currentYear} vs 2024 — Cooling Season So Far
              </p>
              <Badge variant="outline" className={`text-[9px] ${currentYearFinalized ? "bg-savings/10 text-savings border-savings/30" : "bg-warning/10 text-warning border-warning/30"}`}>
                {currentYearFinalized ? "Finalized" : "In Progress"}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              Through <span className="font-mono">{through}</span> · <span className="font-mono">{elapsed}</span> of ~{COOLING_SEASON_DAYS} cooling-season days ({pct}% in).
              {" "}Delta: <span className="font-mono font-semibold text-warning">{fmtSigned(dCur)}°C</span>
              {" → "}factor <span className="font-mono font-semibold text-energy">×{fmt(fCur, 4)}</span> (partial).
            </p>
            {d2025 != null && dCur != null && (
              <p className={`text-xs ${verdictColor} flex items-start gap-1.5`}>
                <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {currentYear} is currently running <span className="font-mono font-semibold">{fmtSigned(dCur)}°C</span> hotter than 2024 —{" "}
                  <span className="font-semibold">{verdictHotter}</span> than 2025's full-season <span className="font-mono">{fmtSigned(d2025)}°C</span>.
                  Based on only <span className="font-mono">{elapsed}</span> of ~{COOLING_SEASON_DAYS} cooling-season days ({pct}% in).
                </span>
              </p>
            )}
          </div>
        )}

        {/* Caution / Finalized box */}
        {currentYearFinalized && locked ? (
          <div className="rounded-lg border border-savings/40 bg-savings/10 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-savings mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-savings">{currentYear} cooling season — FINALIZED</p>
              <p className="text-xs text-foreground/85 leading-relaxed">
                Locked full-season delta: <span className="font-mono font-semibold">{fmtSigned(locked.delta_c)}°C</span>
                {" → "}factor <span className="font-mono font-semibold">×{locked.factor.toFixed(4)}</span>.
                Finalized {new Date(locked.finalized_at).toISOString().slice(0, 10)} from {locked.source}.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-warning">Caution — do not lock {currentYear} early</p>
              <p className="text-xs text-foreground/85 leading-relaxed">
                <span className="font-semibold">+2.1°C is NOT yet supported by the data</span> — the verified partial figure is{" "}
                <span className="font-mono font-semibold">{fmtSigned(dCur)}°C</span> over {elapsed} days.
                The hottest months (Jul–Sep) are still ahead, so the full-season figure may rise — but it could also pull back.
                The {currentYear} factor finalizes automatically after Oct 31, {currentYear} and should not be locked before then.
                This is the correct posture for the January {currentYear + 1} verified report.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherNarrativePanel;