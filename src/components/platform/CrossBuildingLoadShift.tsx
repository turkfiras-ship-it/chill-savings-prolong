import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sites, monthlyTrends } from "@/data/mockData";
import { ArrowRight, Zap, DollarSign, Clock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadShiftOpportunity {
  id: string;
  from: { name: string; city: string; peakHour: string; peakKw: number };
  to: { name: string; city: string; offPeakHour: string; availableKw: number };
  shiftableKw: number;
  savingsSar: number;
  reason: string;
  difficulty: 'easy' | 'moderate' | 'complex';
}

// Simulate peak/off-peak windows per site based on operating hours & type
function analyzeLoadShifting(): LoadShiftOpportunity[] {
  const activeSites = sites.filter(s => s.status === 'active' && s.savings_pct > 0);

  const opportunities: LoadShiftOpportunity[] = [
    {
      id: 'LS-001',
      from: { name: 'G3 (afternoon peak stage)', city: 'Rawdah', peakHour: '14:00–16:00', peakKw: 72 },
      to: { name: 'G1 + F1 (pre-cool window)', city: 'Rawdah', offPeakHour: '04:00–06:00', availableKw: 130 },
      shiftableKw: 18,
      savingsSar: 1820,
      reason: "Pre-cool the showroom thermal mass via G1 and F1 between 04:00–06:00 (off-peak tariff). G3 then stages later in the afternoon, dropping the 14:00 demand peak by ~18 kW and avoiding the upper tariff tier.",
      difficulty: 'easy',
    },
    {
      id: 'LS-002',
      from: { name: 'G2 (zone-2 daytime)', city: 'Rawdah', peakHour: '12:00–15:00', peakKw: 66 },
      to: { name: 'F3 (zone-2 evening)', city: 'Rawdah', offPeakHour: '19:00–22:00', availableKw: 60 },
      shiftableKw: 12,
      savingsSar: 980,
      reason: "G2 is short-cycling at midday. Shifting half its setpoint duty to F3 in the evening flattens the unit-level peak and reduces compressor wear on G2 while waiting for coil service.",
      difficulty: 'moderate',
    },
    {
      id: 'LS-003',
      from: { name: 'F2 (after-hours load)', city: 'Rawdah', peakHour: '23:00–06:00', peakKw: 12 },
      to: { name: 'BMS overnight setback', city: 'Rawdah', offPeakHour: 'closed hours', availableKw: 0 },
      shiftableKw: 12,
      savingsSar: 410,
      reason: "F2 is running unattended after closing. Re-enabling the BMS setback schedule eliminates the 12 kW phantom load entirely — pure waste recovery, no operational impact.",
      difficulty: 'easy',
    },
  ];

  return opportunities;
}

const difficultyConfig = {
  easy: { color: 'text-savings', bg: 'bg-savings/10', label: 'Easy' },
  moderate: { color: 'text-warning', bg: 'bg-warning/10', label: 'Moderate' },
  complex: { color: 'text-accent', bg: 'bg-accent/10', label: 'Complex' },
};

export function CrossBuildingLoadShift() {
  const opportunities = useMemo(() => analyzeLoadShifting(), []);
  const totalSavings = opportunities.reduce((a, o) => a + o.savingsSar, 0);
  const totalShiftable = opportunities.reduce((a, o) => a + o.shiftableKw, 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-energy" />
            Unit Staging & Load Shifting
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[9px] h-5 gap-1 text-savings">
              <DollarSign className="h-2.5 w-2.5" /> {(totalSavings / 1000).toFixed(1)}K SAR/mo potential
            </Badge>
            <Badge variant="outline" className="text-[9px] h-5 gap-1 text-energy">
              <Zap className="h-2.5 w-2.5" /> {totalShiftable} kW shiftable
            </Badge>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Stage G1–F4 packaged units to flatten the showroom demand profile and avoid peak-tariff hours
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {opportunities.map((opp, i) => {
          const diff = difficultyConfig[opp.difficulty];
          return (
            <div key={opp.id} className="border border-border rounded-lg p-3 space-y-3 hover:border-primary/20 transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                  <Badge className={cn("text-[8px] h-4", diff.bg, diff.color)}>{diff.label}</Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-savings font-mono font-bold">{opp.savingsSar.toLocaleString()} SAR/mo</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-energy font-mono">{opp.shiftableKw} kW</span>
                </div>
              </div>

              {/* From → To visual */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-destructive/5 border border-destructive/20 rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-destructive shrink-0" />
                    <span className="text-[11px] font-semibold truncate">{opp.from.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
                    <span>{opp.from.city}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" /> Peak: {opp.from.peakHour}
                    </span>
                    <span className="font-mono text-destructive">{opp.from.peakKw}kW</span>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                <div className="flex-1 bg-savings/5 border border-savings/20 rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-savings shrink-0" />
                    <span className="text-[11px] font-semibold truncate">{opp.to.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
                    <span>{opp.to.city}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" /> Off-peak: {opp.to.offPeakHour}
                    </span>
                    <span className="font-mono text-savings">{opp.to.availableKw}kW free</span>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <p className="text-[10px] text-muted-foreground leading-relaxed">{opp.reason}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
