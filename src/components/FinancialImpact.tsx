import { LockedFinancials } from "@/data/lockedPerformanceModel";
import {
  overallFinancialImpact,
  majorSavingMonths,
  seasonalCostBehavior,
  managementConclusion,
  energyCostComparison,
} from "@/data/financialImpact";
import { EditableText } from "@/components/editor/EditableText";
import {
  TrendingDown,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  BarChart3,
} from "lucide-react";

export function FinancialImpact() {
  return (
    <div className="space-y-6">
      {/* Overall Financial Impact Header */}
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-6 w-6" />
          <EditableText textKey="fi.header.title" defaultValue="Overall Financial Impact" as="h3" className="text-xl font-bold" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overallFinancialImpact.totalCostSavings2025.toLocaleString()} SAR</p>
            <p className="text-sm opacity-80 mt-1">Apparent YoY Savings</p>
            <p className="text-xs opacity-60">Direct bill reduction (220,028 → 213,379)</p>
          </div>
          <div className="bg-savings/30 border border-savings/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overallFinancialImpact.trueAdjustedSavings2025.toLocaleString()} SAR</p>
           <p className="text-sm opacity-90 mt-1 font-semibold">True Adjusted Savings ✓</p>
38:             <p className="text-xs opacity-70">Expected 2025 without SCC: {LockedFinancials.expectedBill2025WithoutSCC.toLocaleString()} SAR</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overallFinancialImpact.trueAdjustedSavingsKwh.toLocaleString()} kWh</p>
            <p className="text-sm opacity-80 mt-1">True Adjusted kWh Saved</p>
            <p className="text-xs opacity-60">{overallFinancialImpact.trueAdjustedSavingsPct}% of 2024 baseline — efficiency improvement</p>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm opacity-90">
          <EditableText textKey="fi.header.note1" defaultValue="Even with cost increases in early months, net annual performance is positive" as="p" className="opacity-90" />
          <EditableText textKey="fi.header.note2" defaultValue="Savings are concentrated in mid-to-late year, which is when tariffs and HVAC load hurt the most" as="p" className="opacity-90" />
        </div>
      </div>

      {/* Energy Cost Comparison Summary */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <EditableText textKey="fi.costcomp.title" defaultValue="Energy Cost Comparison Summary" as="h4" className="text-lg font-semibold" />
        </div>
        <div className="space-y-4">
          {/* 2023 */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-semibold">{energyCostComparison.year2023.label}</p>
              <p className="text-2xl font-bold">{energyCostComparison.year2023.totalBill.toLocaleString()} SAR</p>
            </div>
          </div>

          {/* Arrow 2023 → 2024 */}
          <div className="flex items-center gap-2 ml-6 text-destructive text-sm">
            <ArrowUp className="h-4 w-4" />
            <span>Increase: +{energyCostComparison.year2024.changePercent}% — Spent SAR {Math.abs(energyCostComparison.year2024.changeSAR).toLocaleString()} more than last year</span>
          </div>

          {/* 2024 */}
          <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div>
              <p className="font-semibold">{energyCostComparison.year2024.label}</p>
              <p className="text-2xl font-bold">{energyCostComparison.year2024.totalBill.toLocaleString()} SAR</p>
            </div>
            <ArrowUp className="h-5 w-5 text-destructive" />
          </div>

          {/* Arrow 2024 → 2025 */}
          <div className="flex items-center gap-2 ml-6 text-savings text-sm">
            <ArrowDown className="h-4 w-4" />
            <span>Apparent: {energyCostComparison.year2025.changePercent}% — SAR {Math.abs(energyCostComparison.year2025.changeSAR).toLocaleString()} less. True adjusted savings: <strong>{LockedFinancials.directEnergySavingsSAR.toLocaleString()} SAR</strong> (Expected 2025 without SCC: {LockedFinancials.expectedBill2025WithoutSCC.toLocaleString()} SAR)</span>
          </div>

          {/* 2025 */}
          <div className="flex items-center justify-between p-4 bg-savings/5 border border-savings/20 rounded-lg">
            <div>
              <p className="font-semibold">{energyCostComparison.year2025.label}</p>
              <p className="text-2xl font-bold text-savings">{energyCostComparison.year2025.totalBill.toLocaleString()} SAR</p>
              <p className="text-xs text-muted-foreground mt-1">Expected without SCC: <strong className="text-destructive">{energyCostComparison.expected2025WithoutSCC.toLocaleString()} SAR</strong> — True savings: <strong className="text-savings">{energyCostComparison.trueSavings.toLocaleString()} SAR</strong></p>
            </div>
            <ArrowDown className="h-5 w-5 text-savings" />
          </div>
        </div>

        {/* Anomaly note */}
        <div className="mt-4 p-3 bg-muted/50 border border-border rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">{energyCostComparison.anomalyNote}</p>
          </div>
        </div>
      </div>

      {/* Major Cost-Saving Months */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="h-5 w-5 text-savings" />
          <EditableText textKey="fi.savings.title" defaultValue="Major Cost-Saving Months (Top Contributors)" as="h4" className="text-lg font-semibold" />
        </div>
        <EditableText textKey="fi.savings.subtitle" defaultValue="These months align with high cooling demand, proving that cost control measures were effective under peak tariff conditions." as="p" className="text-sm text-muted-foreground mb-4" />
        <div className="space-y-2">
          {majorSavingMonths.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-savings/20 flex items-center justify-center text-savings font-bold text-sm">
                  {idx + 1}
                </span>
                <span className="font-medium">{m.month}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-savings font-semibold">{m.costReduction}% ↓</span>
                <span className="font-bold tabular-nums">({m.savingsSAR.toLocaleString()} SAR)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Cost Behavior */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-energy" />
          <EditableText textKey="fi.seasonal.title" defaultValue="Seasonal Cost Behavior" as="h4" className="text-lg font-semibold" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Highest costs occur <strong>{seasonalCostBehavior.peakCostPeriod}</strong> in both years.
          2025 peak costs are <strong>{seasonalCostBehavior.peak2025VsPeak2024}</strong> than 2024.
        </p>
        <p className="text-sm text-muted-foreground mb-4">This indicates:</p>
        <ul className="space-y-2 mb-4">
          {seasonalCostBehavior.indicators.map((indicator, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-savings shrink-0" />
              <span>{indicator}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm font-semibold text-savings">{seasonalCostBehavior.conclusion}</p>
      </div>

      {/* Management-Ready Conclusion */}
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
        <EditableText textKey="fi.mgmt.title" defaultValue="Management-Ready Conclusion" as="h4" className="text-lg font-bold mb-3" />
        <EditableText textKey="fi.mgmt.headline" defaultValue={managementConclusion.headline} as="p" className="font-semibold mb-3" />
        <ul className="space-y-2">
          {managementConclusion.details.map((detail, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm opacity-90">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
