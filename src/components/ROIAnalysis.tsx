import {
  PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { lifespanExtension, environmentalImpact, technologySummary } from "@/data/roiCalculations";
import { weatherSummary } from "@/data/weatherData";
import { useEditableData } from "@/context/EditableDataContext";
import { EditableField } from "@/components/EditableField";
import { useWeatherFactor } from "@/hooks/useWeatherFactor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  TrendingUp, DollarSign, Calendar, Target, Wrench, Shield,
  CheckCircle, Timer, Leaf, TreePine, Globe, Cpu,
} from "lucide-react";

export function ROIAnalysis() {
  const { data, derived, updateNested, updateMaintenanceItem, isEditMode } = useEditableData();
  const wf = useWeatherFactor();
  const {
    totalSystemCost, annualOperationalSavings, paybackYears, paybackMonths,
    fiveYearROI, fiveYearNet, fiveYearTotal, fiveYearOp,
    tenYearTotal, tenYearROI, tenYearOp,
    maintenanceTotal, downtimeSavingsAnnual,
    replacementAvg, replacementMin, replacementMax,
    replacementAnnualized, replacementFiveYearProrated,
    monthlyOperationalSavings, totalAnnualSavingsWithReplacement,
  } = derived;

  // Direct Savings (used for payback calculation)
  const directSavings = data.energySav.annualSavingsRawdah;
  const energyPaybackYears = directSavings > 0 ? totalSystemCost / directSavings : 0;
  const energyPaybackMonths = energyPaybackYears * 12;

  const directPieData = [
    { name: 'Energy Performance Savings', value: data.energySav.annualSavingsRawdah, color: 'hsl(152, 60%, 40%)' },
  ];

  const indirectPieData = [
    { name: 'Maintenance Savings', value: maintenanceTotal, color: 'hsl(220, 70%, 50%)' },
    { name: 'Downtime Avoidance', value: downtimeSavingsAnnual, color: 'hsl(280, 60%, 55%)' },
    { name: 'Lifespan Extension', value: replacementAnnualized, color: 'hsl(38, 92%, 50%)' },
  ];

  const allPieData = [...directPieData, ...indirectPieData];

  const roiTimelineData = Array.from({ length: 11 }, (_, year) => {
    const replacementBonus = year >= 10 ? replacementAvg : (year >= 5 ? replacementFiveYearProrated : 0);
    return {
      year,
      cumulativeSavings: (year * annualOperationalSavings) + replacementBonus,
      investment: totalSystemCost,
      netProfit: (year * annualOperationalSavings) + replacementBonus - totalSystemCost,
    };
  });

  return (
    <div className="space-y-8">
      {/* ROI Header Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              <h2 className="text-2xl font-bold">ROI Analysis - Rawdah Showroom</h2>
            </div>
            <p className="opacity-90 mt-1 ml-8">
              Power Saving System Investment Return (
              <EditableField value={data.systemCfg.numberOfUnits} onChange={v => updateNested('systemCfg','numberOfUnits',Math.round(v))} isEditMode={isEditMode} format={v=>`${v}`} className="text-white" />
              {' '}Units × {data.systemCfg.costPerUnit.toLocaleString()} SAR each)
            </p>
          </div>
          {isEditMode && <span className="text-xs bg-white/20 rounded-full px-3 py-1">✏️ Edit Mode</span>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">System Investment</p>
            <p className="text-2xl font-bold">
              <EditableField value={totalSystemCost} onChange={v => updateNested('systemCfg','costPerUnit', Math.round(v / data.systemCfg.numberOfUnits))} isEditMode={isEditMode} format={v => `${v.toLocaleString()} SAR`} className="text-white" />
            </p>
            <p className="text-xs opacity-70">
              <EditableField value={data.systemCfg.numberOfUnits} onChange={v => updateNested('systemCfg','numberOfUnits',Math.round(v))} isEditMode={isEditMode} format={v=>`${v}`} className="text-white" /> units ×{' '}
              <EditableField value={data.systemCfg.costPerUnit} onChange={v => updateNested('systemCfg','costPerUnit',v)} isEditMode={isEditMode} format={v=>`${v.toLocaleString()}`} className="text-white" /> SAR
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Energy Performance Savings</p>
            <p className="text-2xl font-bold">{Math.round(directSavings).toLocaleString()} SAR</p>
            <p className="text-xs opacity-70">Direct — used for payback</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Payback Period</p>
            <p className="text-2xl font-bold">{energyPaybackYears.toFixed(1)} Years</p>
            <p className="text-xs opacity-70">~{Math.round(energyPaybackMonths)} months (energy-only)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">5-Year ROI</p>
            <p className="text-2xl font-bold">{fiveYearROI.toFixed(0)}%</p>
            <p className="text-xs opacity-70">Net profit: {Math.round(fiveYearNet).toLocaleString()} SAR</p>
          </div>
        </div>
      </div>

      {/* Weather-Adjusted True ROI */}
      {(() => {
        const adjustedEnergyLow = weatherSummary.adjustedSavingsLow;
        const adjustedEnergyHigh = weatherSummary.adjustedSavingsHigh;
        const adjustedAnnualLow = adjustedEnergyLow + maintenanceTotal + downtimeSavingsAnnual;
        const adjustedAnnualHigh = adjustedEnergyHigh + maintenanceTotal + downtimeSavingsAnnual;
        const adjustedAnnualMid = (adjustedAnnualLow + adjustedAnnualHigh) / 2;
        const adjustedPayback = totalSystemCost / adjustedAnnualMid;
        const adjusted5Year = adjustedAnnualMid * 5;
        const adjusted10Year = adjustedAnnualMid * 10;
        const adjusted5YearROI = ((adjusted5Year - totalSystemCost) / totalSystemCost) * 100;
        return (
          <div className="rounded-xl bg-card p-6 card-elevated border-2 border-savings/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-savings" />
              <h3 className="text-xl font-bold">Weather-Adjusted True ROI</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              2025 was {weatherSummary.avgTempDiff}°C hotter than 2024, adding {weatherSummary.coolingDegreeIncrease} cooling load.
            </p>
            <div className="mb-4 rounded-md border border-border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <strong className="text-foreground">Locked study factor:</strong> ×{wf.locked.factor.toFixed(4)} (+{wf.locked.deltaC}°C)
              </span>
              <span>
                <strong className="text-foreground">Live data-derived (Rawdah cooling-season):</strong>{" "}
                {wf.live?.factor != null
                  ? `×${wf.live.factor.toFixed(4)} (+${wf.live.deltaC?.toFixed(2)}°C, ${wf.live.days} days${wf.live.inProgress ? " — in progress" : ""})`
                  : wf.live2025?.factor != null
                    ? `2025 full season ×${wf.live2025.factor.toFixed(4)} (+${wf.live2025.deltaC?.toFixed(2)}°C)`
                    : "loading…"}
              </span>
              <span className="italic">Headline uses locked study; live figure is reconciliation context.</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Adjusted Energy Savings</p>
                <p className="text-2xl font-bold">{adjustedEnergyLow.toLocaleString()}–{adjustedEnergyHigh.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">SAR/year</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">+ Maintenance & Downtime</p>
                <p className="text-2xl font-bold">{(maintenanceTotal + downtimeSavingsAnnual).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">SAR/year</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-savings/15 to-savings/5 border-2 border-savings/40 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Adjusted Annual</p>
                <p className="text-2xl font-bold text-savings">{Math.round(adjustedAnnualLow).toLocaleString()}–{Math.round(adjustedAnnualHigh).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">SAR/year</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-savings/15 to-savings/5 border-2 border-savings/40 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Adjusted Payback Period</p>
                <p className="text-2xl font-bold text-savings">{adjustedPayback.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Years</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-savings/10 border border-savings/20 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Adjusted 5-Year Savings</p>
                <p className="text-xl font-bold text-savings">{Math.round(adjusted5Year).toLocaleString()} SAR</p>
              </div>
              <div className="p-4 bg-savings/10 border border-savings/20 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Adjusted 10-Year Savings</p>
                <p className="text-xl font-bold text-savings">{Math.round(adjusted10Year).toLocaleString()} SAR</p>
              </div>
              <div className="p-4 bg-savings/10 border border-savings/20 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Adjusted 5-Year ROI</p>
                <p className="text-xl font-bold text-savings">{adjusted5YearROI.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Lifespan Extension */}
      <div className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="h-6 w-6" />
          <h3 className="text-xl font-bold">AC Unit Lifespan Extension Savings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-white/90 mb-4">
              Your system extends AC lifespan from{' '}
              <strong><EditableField value={data.systemCfg.normalLifespan} onChange={v => updateNested('systemCfg','normalLifespan',Math.round(v))} isEditMode={isEditMode} format={v=>`${v}`} className="text-white" /> years</strong>{' '}
              to <strong><EditableField value={data.systemCfg.extendedLifespan} onChange={v => updateNested('systemCfg','extendedLifespan',Math.round(v))} isEditMode={isEditMode} format={v=>`${v}`} className="text-white" /> years</strong>.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                <span>Normal replacement cycle:</span><span className="font-bold">Every {data.systemCfg.normalLifespan} years</span>
              </div>
              <div className="flex justify-between items-center bg-white/20 rounded-lg p-3">
                <span>With power saving system:</span><span className="font-bold">Every {data.systemCfg.extendedLifespan} years</span>
              </div>
              <div className="flex justify-between items-center bg-white/30 rounded-lg p-3">
                <span>Years extended:</span><span className="font-bold text-lg">+{data.systemCfg.extendedLifespan - data.systemCfg.normalLifespan} years</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80 mb-2">Replacement Cost Avoided</p>
            <p className="text-sm opacity-70 mb-1">
              Cost per unit:{' '}
              <EditableField value={data.acReplacement.minCostPerUnit} onChange={v => updateNested('acReplacement','minCostPerUnit',v)} isEditMode={isEditMode} format={v=>`${v.toLocaleString()}`} className="text-white" /> –{' '}
              <EditableField value={data.acReplacement.maxCostPerUnit} onChange={v => updateNested('acReplacement','maxCostPerUnit',v)} isEditMode={isEditMode} format={v=>`${v.toLocaleString()}`} className="text-white" /> SAR
            </p>
            <div className="mt-4 p-4 bg-white/20 rounded-lg">
              <p className="text-sm opacity-80">
                Total ({data.systemCfg.numberOfUnits} units × avg.{' '}
                <EditableField value={data.acReplacement.avgCostPerUnit} onChange={v => updateNested('acReplacement','avgCostPerUnit',v)} isEditMode={isEditMode} format={v=>`${v.toLocaleString()}`} className="text-white" /> SAR)
              </p>
              <p className="text-4xl font-bold mt-1">{replacementAvg.toLocaleString()} SAR</p>
              <p className="text-sm opacity-80 mt-2">Range: {replacementMin.toLocaleString()} – {replacementMax.toLocaleString()} SAR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key ROI Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-savings">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">5-Year Total Savings</span>
            <Calendar className="h-4 w-4 text-savings" />
          </div>
          <p className="text-3xl font-bold text-savings">{Math.round(fiveYearTotal).toLocaleString()} SAR</p>
          <p className="text-sm text-muted-foreground mt-1">Net Profit: <span className="text-savings font-medium">{Math.round(fiveYearNet).toLocaleString()} SAR</span></p>
          <div className="mt-2 text-xs text-muted-foreground">
            <p>Operational: {Math.round(fiveYearOp).toLocaleString()} SAR</p>
            <p>Lifespan (prorated): {Math.round(replacementFiveYearProrated).toLocaleString()} SAR</p>
          </div>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-energy">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">10-Year Total Savings</span>
            <TrendingUp className="h-4 w-4 text-energy" />
          </div>
          <p className="text-3xl font-bold text-energy">{Math.round(tenYearTotal).toLocaleString()} SAR</p>
          <p className="text-sm text-muted-foreground mt-1">ROI: <span className="text-energy font-medium">{tenYearROI.toFixed(0)}%</span></p>
          <div className="mt-2 text-xs text-muted-foreground">
            <p>Operational: {Math.round(tenYearOp).toLocaleString()} SAR</p>
            <p>Replacement avoided: {Math.round(replacementAvg).toLocaleString()} SAR</p>
          </div>
        </div>
        <div className="rounded-xl bg-card p-5 card-elevated border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Monthly Operational Savings</span>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-500">{Math.round(monthlyOperationalSavings).toLocaleString()} SAR</p>
          <p className="text-sm text-muted-foreground mt-1">Average per month</p>
        </div>
      </div>

      {/* Savings Breakdown — Direct vs Indirect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card p-6 card-elevated">
          <h3 className="text-xl font-semibold mb-1">Savings Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">Direct (Energy) vs Indirect (Operational)</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {allPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  formatter={(value: number) => [`${Math.round(value).toLocaleString()} SAR/year`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-card p-6 card-elevated">
          <h3 className="text-xl font-semibold mb-4">Savings by Category</h3>
          <div className="space-y-4">
            {/* Direct */}
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Direct — Energy Performance Savings</p>
            {directPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-savings/10 border border-savings/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-savings">{Math.round(item.value).toLocaleString()} SAR</p>
                  <p className="text-xs text-muted-foreground">100% of payback basis</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-lg bg-savings/10 border border-savings/30">
              <span className="font-semibold text-savings">Payback Basis (Energy Only)</span>
              <span className="font-bold text-savings text-lg">{Math.round(directSavings).toLocaleString()} SAR/yr</span>
            </div>

            {/* Indirect */}
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mt-2">Indirect — Operational Efficiency Benefits</p>
            {indirectPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{Math.round(item.value).toLocaleString()} SAR</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground italic mt-2">
              ⓘ Indirect operational benefits are not included in payback calculation.
            </p>
          </div>
        </div>
      </div>

      {/* ROI Timeline Chart */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <h3 className="text-xl font-semibold mb-1">ROI Timeline - Cumulative Savings</h3>
        <p className="text-sm text-muted-foreground mb-6">Investment recovery and profit projection over 10 years</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={roiTimelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Years', position: 'bottom', offset: -5 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(value: number) => [`${Math.round(value).toLocaleString()} SAR`, '']} />
              <Legend />
              <Line type="monotone" dataKey="cumulativeSavings" name="Cumulative Savings" stroke="hsl(152, 60%, 40%)" strokeWidth={3} dot={{ fill: "hsl(152, 60%, 40%)", strokeWidth: 0, r: 4 }} />
              <Line type="monotone" dataKey="investment" name="Initial Investment" stroke="hsl(0, 72%, 51%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-savings/10 border border-savings/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-savings" />
            <span className="font-semibold text-savings">Investment Recovery</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The system investment of <strong>{totalSystemCost.toLocaleString()} SAR</strong> will be fully recovered in approximately <strong>{energyPaybackYears.toFixed(1)} years</strong> based on Energy Performance Savings alone.
            By year 10, you'll also avoid AC replacement costs of <strong>{replacementAvg.toLocaleString()} SAR</strong>.
          </p>
        </div>
      </div>

      {/* Maintenance & Repair Savings Detailed Table */}
      <div className="rounded-xl bg-card card-elevated overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-semibold">Maintenance & Operational Cost Savings</h3>
          </div>
          <p className="text-sm text-muted-foreground">Detailed breakdown — click values to edit in Edit Mode</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="text-right font-semibold">Without System</TableHead>
                <TableHead className="text-right font-semibold">With System</TableHead>
                <TableHead className="text-right font-semibold">Annual Savings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.maintenanceItems.map((item, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                  <TableCell><p className="font-medium">{item.category}</p></TableCell>
                  <TableCell className="text-right tabular-nums text-destructive">
                    <EditableField value={item.withoutSystem} onChange={v => updateMaintenanceItem(idx,'withoutSystem',v)} isEditMode={isEditMode} format={v=>`${v.toLocaleString()} SAR`} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <EditableField value={item.withSystem} onChange={v => updateMaintenanceItem(idx,'withSystem',v)} isEditMode={isEditMode} format={v=>`${v.toLocaleString()} SAR`} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-savings font-medium">
                    {Math.round(item.annualSavings).toLocaleString()} SAR
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <p className="font-medium">Downtime Avoidance</p>
                  <p className="text-xs text-muted-foreground">Rate: <EditableField value={data.downtime.hourlyRevenueLoss} onChange={v => updateNested('downtime','hourlyRevenueLoss',v)} isEditMode={isEditMode} suffix=" SAR/hr" /></p>
                </TableCell>
                <TableCell className="text-right tabular-nums text-destructive">
                  <EditableField value={data.downtime.hoursWithout} onChange={v => updateNested('downtime','hoursWithout',v)} isEditMode={isEditMode} format={v=>`${v} hrs = ${(v*data.downtime.hourlyRevenueLoss).toLocaleString()} SAR`} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <EditableField value={data.downtime.hoursWith} onChange={v => updateNested('downtime','hoursWith',v)} isEditMode={isEditMode} format={v=>`${v} hrs = ${(v*data.downtime.hourlyRevenueLoss).toLocaleString()} SAR`} />
                </TableCell>
                <TableCell className="text-right tabular-nums text-savings font-medium">{downtimeSavingsAnnual.toLocaleString()} SAR</TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/30 transition-colors border-t">
                <TableCell>
                  <p className="font-medium">Energy Cost Reduction</p>
                  <p className="text-xs text-muted-foreground">Direct electricity bill savings</p>
                </TableCell>
                <TableCell className="text-right tabular-nums text-destructive">—</TableCell>
                <TableCell className="text-right tabular-nums">—</TableCell>
                <TableCell className="text-right tabular-nums text-savings font-medium">
                  <EditableField value={data.energySav.annualSavingsRawdah} onChange={v => updateNested('energySav','annualSavingsRawdah',v)} isEditMode={isEditMode} format={v=>`${v.toLocaleString()} SAR`} className="text-savings font-medium" />
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableCell>
                  <p className="font-medium">AC Unit Replacement (Avoided)</p>
                  <p className="text-xs text-muted-foreground">Lifespan: {data.systemCfg.normalLifespan}→{data.systemCfg.extendedLifespan} yrs</p>
                </TableCell>
                <TableCell className="text-right tabular-nums text-destructive">{replacementAvg.toLocaleString()} SAR <p className="text-xs">(at year 10)</p></TableCell>
                <TableCell className="text-right tabular-nums text-savings">0 SAR</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground font-bold">{replacementAvg.toLocaleString()} SAR <p className="text-xs font-normal">one-time at year 10</p></TableCell>
              </TableRow>
              <TableRow className="bg-muted/70 font-bold border-t-2">
                <TableCell>TOTAL ANNUAL OPERATIONAL SAVINGS</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right tabular-nums text-savings text-lg">
                  {Math.round(annualOperationalSavings).toLocaleString()} SAR
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 5-Year Projection Summary */}
      <div className="gradient-savings rounded-xl p-6 text-primary-foreground">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-6 w-6" />
          <h3 className="text-xl font-bold">5-Year Investment Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Total Investment</p>
            <p className="text-2xl font-bold">{totalSystemCost.toLocaleString()} SAR</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">5-Year Total Savings</p>
            <p className="text-2xl font-bold">{Math.round(fiveYearTotal).toLocaleString()} SAR</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Net Profit (5 Years)</p>
            <p className="text-2xl font-bold">{Math.round(fiveYearNet).toLocaleString()} SAR</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm opacity-80">Return on Investment</p>
            <p className="text-2xl font-bold">{fiveYearROI.toFixed(0)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
          <CheckCircle className="h-8 w-8" />
          <div>
            <p className="font-semibold">Investment Fully Recovered in {energyPaybackYears.toFixed(1)} Years (Energy-Only Basis)</p>
            <p className="text-sm opacity-90">
              Based on Energy Performance Savings of <strong>{Math.round(directSavings).toLocaleString()} SAR/yr</strong>.
              Indirect operational benefits of <strong>{Math.round(maintenanceTotal + downtimeSavingsAnnual).toLocaleString()} SAR/yr</strong> provide additional value but are excluded from payback calculation.
            </p>
          </div>
        </div>
      </div>

      {/* CO2 & Environmental Impact */}
      <div className="rounded-xl bg-card p-6 card-elevated">
        <div className="flex items-center gap-2 mb-1">
          <Leaf className="h-5 w-5 text-savings" />
          <h3 className="text-xl font-semibold">Environmental Impact — CO₂ Reduction</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Carbon emission savings from reduced energy consumption</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-savings/10 border border-savings/20 text-center">
            <Leaf className="h-6 w-6 text-savings mx-auto mb-2" />
            <p className="text-2xl font-bold text-savings">{environmentalImpact.annualCo2SavedTons}</p>
            <p className="text-xs text-muted-foreground">Tons CO₂ saved/year</p>
          </div>
          <div className="p-4 rounded-lg bg-savings/10 border border-savings/20 text-center">
            <TreePine className="h-6 w-6 text-savings mx-auto mb-2" />
            <p className="text-2xl font-bold text-savings">{environmentalImpact.treesEquivalent.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Trees equivalent/year</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border text-center">
            <Globe className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold">{environmentalImpact.fiveYearCo2Tons}</p>
            <p className="text-xs text-muted-foreground">5-Year CO₂ reduction (tons)</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border text-center">
            <Globe className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold">{environmentalImpact.tenYearCo2Tons}</p>
            <p className="text-xs text-muted-foreground">10-Year CO₂ reduction (tons)</p>
          </div>
        </div>
      </div>

      {/* Technology Summary */}
      <div className="rounded-xl bg-card card-elevated overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
          <div className="flex items-center gap-2">
            <Cpu className="h-6 w-6" />
            <div>
              <h3 className="text-xl font-bold">Our Technology</h3>
              <p className="text-sm opacity-80">{technologySummary.tagline}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-1">Core Technology: {technologySummary.coreTech}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              The {technologySummary.product} enables any compressor to be controlled replicating a DC inverter-driven system,
              achieving <strong>{technologySummary.energyReductionRange}</strong> energy reduction with typical ROI in {technologySummary.roiTypical}.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold mb-2">Key Features</h5>
                <ul className="space-y-2">
                  {technologySummary.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-savings shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold mb-2">Benefits</h5>
                <div className="space-y-2">
                  {technologySummary.benefits.map((benefit, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm font-medium">{benefit.category}</p>
                      <p className="text-xs text-muted-foreground mt-1">{benefit.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">{technologySummary.differentiator}</p>
              <p className="text-xs text-muted-foreground">{technologySummary.certifications}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
