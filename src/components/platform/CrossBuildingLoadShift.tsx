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
      from: { name: 'Al Othaim — King Fahd', city: 'Riyadh', peakHour: '13:00–15:00', peakKw: 820 },
      to: { name: 'King Saud University', city: 'Riyadh', offPeakHour: '13:00–15:00', availableKw: 600 },
      shiftableKw: 120,
      savingsSar: 4200,
      reason: "KSU's academic break leaves 600kW headroom during Al Othaim's peak grocery rush. Pre-cool KSU buildings earlier, shift Al Othaim's cold room defrost cycles to KSU's off-peak window.",
      difficulty: 'moderate',
    },
    {
      id: 'LS-002',
      from: { name: 'Saudi German Hospital', city: 'Riyadh', peakHour: '10:00–14:00', peakKw: 1400 },
      to: { name: 'Al Rajhi — HQ Tower', city: 'Riyadh', offPeakHour: '18:00–07:00', availableKw: 500 },
      shiftableKw: 80,
      savingsSar: 2800,
      reason: "Hospital's non-critical loads (laundry, water heating) can shift to evening. Al Rajhi Tower's HVAC shuts down at 18:00, freeing grid capacity. Shared transformer benefits from flattened aggregate demand.",
      difficulty: 'easy',
    },
    {
      id: 'LS-003',
      from: { name: 'Hilton — Jeddah Corniche', city: 'Jeddah', peakHour: '14:00–17:00', peakKw: 1100 },
      to: { name: 'Panda — Khalidiyah', city: 'Jeddah', offPeakHour: '01:00–06:00', availableKw: 400 },
      shiftableKw: 150,
      savingsSar: 5500,
      reason: "Hotel pool chillers and ice-making can pre-charge overnight using Panda's idle cold-storage compressors. Thermal storage strategy reduces Hilton's afternoon peak by 14%.",
      difficulty: 'complex',
    },
    {
      id: 'LS-004',
      from: { name: 'Jarir — Rawdah', city: 'Riyadh', peakHour: '15:00–19:00', peakKw: 495 },
      to: { name: 'Jarir — Malaz', city: 'Riyadh', offPeakHour: '09:00–12:00', availableKw: 200 },
      shiftableKw: 60,
      savingsSar: 1800,
      reason: "Same-brand portfolio optimization: stagger store pre-cooling. Rawdah opens later on weekends — shift its pre-cool to Malaz's morning off-peak. Both share the same SEC transformer district.",
      difficulty: 'easy',
    },
    {
      id: 'LS-005',
      from: { name: 'SABIC — Admin Tower', city: 'Jubail', peakHour: '09:00–12:00', peakKw: 580 },
      to: { name: 'Jarir — Corniche', city: 'Dammam', offPeakHour: '09:00–12:00', availableKw: 180 },
      shiftableKw: 45,
      savingsSar: 1200,
      reason: "SABIC's data center cooling peaks in morning server load hours. Jarir Dammam's retail traffic is low before noon. Shift SABIC's non-essential lighting and AHU scheduling to flatten the Eastern Province grid contribution.",
      difficulty: 'moderate',
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
            Cross-Building Load Shifting
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
          Portfolio-level demand optimization — shift loads between buildings to flatten aggregate demand
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
