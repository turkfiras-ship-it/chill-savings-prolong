import { totalUnits, acReplacementCostPerUnit } from "@/data/savingsData";

export function LifespanComparison() {
  const normalLifespan = 10;
  const extendedLifespan = 17.5; // Average of 15-20
  
  const normalReplacements = 30 / normalLifespan; // 3 replacements in 30 years
  const extendedReplacements = 30 / extendedLifespan; // ~1.7 replacements in 30 years
  
  const normalCost = normalReplacements * totalUnits * acReplacementCostPerUnit;
  const extendedCost = extendedReplacements * totalUnits * acReplacementCostPerUnit;
  const savings = normalCost - extendedCost;

  return (
    <div className="rounded-xl bg-card p-6 card-elevated">
      <h3 className="text-xl font-semibold mb-1">AC Lifespan Extension Benefit</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Reducing equipment stress extends AC lifespan from 10 to 15-20 years
      </p>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Without System */}
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="font-medium text-sm">Without Power Saving System</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">AC Lifespan</span>
              <span className="font-medium">10 years</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Replacements (30 yrs)</span>
              <span className="font-medium">3 cycles</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost per unit</span>
              <span className="font-medium">{acReplacementCostPerUnit.toLocaleString()} SAR</span>
            </div>
            <div className="pt-2 border-t mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Total Cost</span>
                <span className="font-bold text-destructive">{normalCost.toLocaleString()} SAR</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* With System */}
        <div className="p-4 rounded-lg bg-savings/10 border border-savings/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-3 rounded-full bg-savings" />
            <span className="font-medium text-sm">With Power Saving System</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">AC Lifespan</span>
              <span className="font-medium text-savings">15-20 years</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Replacements (30 yrs)</span>
              <span className="font-medium">~1.7 cycles</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost per unit</span>
              <span className="font-medium">{acReplacementCostPerUnit.toLocaleString()} SAR</span>
            </div>
            <div className="pt-2 border-t mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Total Cost</span>
                <span className="font-bold text-savings">{Math.round(extendedCost).toLocaleString()} SAR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Savings Highlight */}
      <div className="gradient-savings rounded-lg p-4 text-center text-primary-foreground">
        <p className="text-sm opacity-90 mb-1">30-Year Equipment Savings</p>
        <p className="text-3xl font-bold">{Math.round(savings).toLocaleString()} SAR</p>
        <p className="text-sm opacity-90 mt-1">Based on {totalUnits} AC units @ {acReplacementCostPerUnit.toLocaleString()} SAR/unit</p>
      </div>
    </div>
  );
}
