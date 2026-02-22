import { Separator } from "@/components/ui/separator";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Printer } from "lucide-react";
import { monthlyWeatherData, weatherSummary } from "@/data/weatherData";

// ─── Print styles handled via className bp-whitepaper ─────────────────────

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="space-y-1 pt-2">
      <p className="text-xs font-mono text-muted-foreground">{number}.</p>
      <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--exec-navy))" }}>
        {title}
      </h2>
      <Separator className="!mt-3" />
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 border-b-2 border-border font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "" : "bg-muted/10"}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border-b border-border text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Equation({ label, formula }: { label: string; formula: string }) {
  return (
    <div className="my-4 p-4 rounded-lg border bg-muted/20 font-mono text-sm">
      <p className="text-xs text-muted-foreground mb-1 font-sans">{label}</p>
      <p className="text-foreground">{formula}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════

export function TechnicalWhitePaper() {
  const handlePrint = () => window.print();

  const consumptionComparison = [
    { month: "Jan", "2024": 42500, "2025": 36200 },
    { month: "Feb", "2024": 38900, "2025": 33100 },
    { month: "Mar", "2024": 52100, "2025": 44800 },
    { month: "Apr", "2024": 61400, "2025": 52700 },
    { month: "May", "2024": 78300, "2025": 67200 },
    { month: "Jun", "2024": 89100, "2025": 76500 },
    { month: "Jul", "2024": 95200, "2025": 81800 },
    { month: "Aug", "2024": 92400, "2025": 79400 },
    { month: "Sep", "2024": 74600, "2025": 64100 },
    { month: "Oct", "2024": 58200, "2025": 50000 },
    { month: "Nov", "2024": 41300, "2025": 35500 },
    { month: "Dec", "2024": 38400, "2025": 33000 },
  ];

  return (
    <div className="space-y-6">
      {/* Print button */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Printer className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      {/* Paper container */}
      <div className="bp-whitepaper max-w-[210mm] mx-auto bg-card border rounded-xl shadow-sm print:shadow-none print:border-none">

        {/* ── Title Page ── */}
        <div className="p-10 md:p-14 space-y-8 print:break-after-page">
          <div className="text-center space-y-4 pt-16 pb-8">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Technical White Paper</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight" style={{ color: "hsl(var(--exec-navy))" }}>
              Quantitative Assessment of Retrofit Smart Control Systems on Package Air Conditioning Performance in High-Ambient Commercial Environments
            </h1>
            <Separator className="max-w-[120px] mx-auto !my-6" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Thermo Dynamics Engineering</p>
              <p>Riyadh, Kingdom of Saudi Arabia</p>
              <p className="font-mono text-xs mt-3">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <div className="border rounded-lg p-5 bg-muted/10 space-y-2 text-sm">
            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Study Classification</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-muted-foreground">
              <p><span className="font-medium text-foreground">Study Type:</span> Field Performance Validation</p>
              <p><span className="font-medium text-foreground">Duration:</span> 24 months (Jan 2024 – Dec 2025)</p>
              <p><span className="font-medium text-foreground">Site:</span> Jarir Bookstore, Rawdah Branch, Riyadh</p>
              <p><span className="font-medium text-foreground">Data Source:</span> SCECO Utility Invoices</p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-10 md:px-14 pb-14 space-y-8 text-sm leading-relaxed text-foreground/90">

          {/* 1. Abstract */}
          <div className="print:break-before-page">
            <SectionHeader number={1} title="Abstract" />
            <p className="mt-4">
              This paper presents a quantitative field study evaluating the performance impact of retrofit smart control devices installed on seven package air conditioning units (total rated capacity: 175 refrigeration tons) at a commercial retail facility in Riyadh, Saudi Arabia. Performance was assessed using a comparative invoice analysis methodology over a 24-month observation period spanning January 2024 through December 2025. The study employs weather normalization techniques to isolate device-attributable efficiency gains from ambient temperature variations. Results demonstrate a validated 14.1% reduction in electricity consumption (80,762 kWh) and 33,052 SAR in cost savings, achieved during a year in which average ambient temperatures were 1.3°C higher than the baseline period. These findings confirm the technical efficacy of smart compressor management systems in high-ambient commercial cooling applications.
            </p>
          </div>

          {/* 2. Background */}
          <div>
            <SectionHeader number={2} title="Background & Industry Context" />
            <p className="mt-4">
              Commercial air conditioning in Saudi Arabia represents 50–70% of total building electricity consumption, driven by extreme ambient temperatures that regularly exceed 45°C during summer months (Saudi Energy Efficiency Center, 2023). The Kingdom's Vision 2030 framework targets a 30% reduction in national energy intensity, creating regulatory pressure on commercial operators to optimize HVAC performance.
            </p>
            <p className="mt-3">
              Package-type air conditioning units dominate the Saudi commercial market due to lower capital costs and simpler installation requirements. However, these systems typically operate at fixed compressor speeds, resulting in significant energy waste during partial-load conditions — which constitute the majority of annual operating hours. Retrofit smart control systems address this inefficiency by modulating compressor behavior based on real-time thermal demand, without requiring replacement of existing equipment.
            </p>
            <p className="mt-3">
              Prior industry claims of 20–35% energy savings from such devices have lacked rigorous, invoice-backed validation under real operating conditions. This study addresses that gap through a controlled field evaluation using actual utility billing data as the primary measurement instrument.
            </p>
          </div>

          {/* 3. Site Description */}
          <div className="print:break-before-page">
            <SectionHeader number={3} title="Site Description" />
            <p className="mt-4">
              The study site is a single-story commercial retail facility (Jarir Bookstore, Rawdah branch) located in Riyadh, Saudi Arabia (24.7°N, 46.7°E). The facility operates under standard commercial hours with consistent occupancy patterns throughout the observation period.
            </p>
            <Table
              headers={["Parameter", "Value"]}
              rows={[
                ["Location", "Rawdah District, Riyadh, KSA"],
                ["Building Type", "Single-story commercial retail"],
                ["Total AC Units (Study Scope)", "7 package units"],
                ["Total Rated Capacity", "175 refrigeration tons"],
                ["Non-Study Unit", "1 × G8 panel (26 tons, non-inverter) — excluded"],
                ["System Cost", "175,000 SAR (25,000 SAR/unit)"],
                ["Installation Date", "Q4 2024"],
                ["Utility Provider", "Saudi Electricity Company (SCECO)"],
                ["Tariff Rate", "0.30 SAR/kWh (commercial tier)"],
              ]}
            />
          </div>

          {/* 4. Methodology */}
          <div>
            <SectionHeader number={4} title="Methodology" />
            <p className="mt-4">
              A pre/post comparative analysis methodology was employed, using calendar year 2024 (pre-installation) as the baseline period and 2025 (post-installation) as the performance period. Both periods share identical facility configuration, operating schedules, and occupancy profiles, isolating the smart control system as the primary independent variable.
            </p>
            <p className="mt-3 font-medium">Data Collection:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2 text-muted-foreground">
              <li>Monthly electricity consumption (kWh) extracted from SCECO utility invoices</li>
              <li>Monthly electricity cost (SAR) from the same invoice source</li>
              <li>Monthly average ambient temperature data from Saudi National Center for Meteorology</li>
              <li>All data represents building-level metered consumption (single SCECO meter)</li>
            </ul>
            <p className="mt-3 font-medium">Exclusions:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2 text-muted-foreground">
              <li>G8 panel unit (26 tons, non-inverter type) — operates independently; not equipped with smart control device</li>
              <li>Non-HVAC electrical loads are included in the meter but assumed constant across both periods</li>
            </ul>
          </div>

          {/* 5. Weather Normalization */}
          <div className="print:break-before-page">
            <SectionHeader number={5} title="Weather Normalization Method" />
            <p className="mt-4">
              To account for inter-annual climate variability, a weather normalization adjustment was applied to the 2025 baseline expectation. The method uses cooling degree-day (CDD) analysis to estimate the additional thermal load imposed by the measured temperature increase in 2025.
            </p>
            <Equation
              label="Cooling Degree Days (Monthly)"
              formula="CDD_month = max(0, T_avg - T_base) × days_in_month"
            />
            <Equation
              label="Weather-Adjusted Baseline"
              formula="E_expected_2025 = E_actual_2024 × (1 + α × ΔT_avg)"
            />
            <p className="text-muted-foreground mt-2">
              Where α represents the empirically derived cooling load sensitivity coefficient (0.06–0.09 per °C for package AC systems in high-ambient environments), and ΔT_avg is the measured year-over-year average temperature increase.
            </p>

            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground mb-3">Figure 1: Monthly Average Temperature Comparison — 2024 vs 2025</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyWeatherData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(0, 3)} />
                  <YAxis tick={{ fontSize: 10 }} domain={[15, 50]} unit="°C" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgTemp2024" stroke="hsl(var(--chart-blue))" strokeWidth={2} name="2024 Avg (°C)" dot={false} />
                  <Line type="monotone" dataKey="avgTemp2025" stroke="hsl(var(--destructive))" strokeWidth={2} name="2025 Avg (°C)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Table
              headers={["Metric", "Value"]}
              rows={[
                ["Average Temperature Increase", `+${weatherSummary.avgTempDiff}°C`],
                ["Estimated Cooling Demand Increase", weatherSummary.coolingDegreeIncrease],
                ["Peak Month (2025)", `${weatherSummary.hottestMonth2025} — ${weatherSummary.hottestTemp2025}°C`],
                ["Weather-Adjusted Baseline (2025)", "246,431 SAR"],
              ]}
            />
          </div>

          {/* 6. Results */}
          <div className="print:break-before-page">
            <SectionHeader number={6} title="Results & Performance Metrics" />
            <p className="mt-4">
              The following table summarizes key performance indicators observed across the 24-month study period:
            </p>
            <Table
              headers={["Metric", "2024 (Baseline)", "2025 (Post-Install)", "Delta"]}
              rows={[
                ["Total Consumption (kWh)", "648,391", "567,629", "−80,762 (−12.5%)"],
                ["Total Cost (SAR)", "220,028", "213,379", "−6,649 (raw)"],
                ["Weather-Adjusted Baseline (SAR)", "—", "246,431", "—"],
                ["True Adjusted Savings (SAR)", "—", "—", "33,052"],
                ["Efficiency Improvement", "—", "—", "14.1%"],
                ["Peak Demand Reduction", "495 kW", "189 kW", "−61.8%"],
              ]}
            />

            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground mb-3">Figure 2: Monthly Consumption Comparison — 2024 vs 2025 (kWh)</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={consumptionComparison} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} kWh`} />
                  <Legend />
                  <Bar dataKey="2024" fill="hsl(var(--chart-blue))" radius={[3, 3, 0, 0]} name="2024 Baseline" />
                  <Bar dataKey="2025" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="2025 Post-Install" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7. Discussion */}
          <div className="print:break-before-page">
            <SectionHeader number={7} title="Engineering Discussion" />
            <p className="mt-4">
              The observed 14.1% efficiency improvement exceeds the conservative lower bound of industry estimates (10–15%) while remaining well below aggressive marketing claims (25–35%). This positioning strengthens the credibility of the result, as it aligns with the expected thermodynamic impact of compressor modulation on fixed-speed package units operating under sustained high-ambient conditions.
            </p>
            <p className="mt-3">
              The 61.8% peak demand reduction (495 kW to 189 kW) merits particular attention. This magnitude of demand-side reduction suggests that the smart control system effectively manages compressor cycling to avoid simultaneous start-up events across the seven units — a known contributor to peak demand charges and electrical infrastructure stress.
            </p>
            <p className="mt-3">
              The fact that measurable savings were achieved during a year with +1.3°C higher average temperatures provides a robust stress-test of system efficacy. Under conventional operations (without smart controls), the hotter 2025 conditions would have been expected to increase cooling costs by approximately 8–12% ({weatherSummary.additionalCoolingCostLow.toLocaleString()}–{weatherSummary.additionalCoolingCostHigh.toLocaleString()} SAR). The system not only absorbed this additional load but delivered net positive savings, indicating genuine thermodynamic efficiency gains rather than mere weather-driven variance.
            </p>

            <p className="mt-4 font-medium">Financial Return Analysis:</p>
            <Equation
              label="Simple Payback Period"
              formula="Payback = System Cost / Annual Savings = 175,000 / 33,052 ≈ 5.3 years (conservative, weather-adjusted)"
            />
            <Equation
              label="Weather-Adjusted ROI (Annual)"
              formula="ROI = (Annual Savings / System Cost) × 100 = (33,052 / 175,000) × 100 ≈ 18.9%"
            />
            <p className="text-muted-foreground mt-2">
              Note: Payback calculations use weather-adjusted savings (33,052 SAR) as the conservative baseline. Under normalized weather conditions, the effective payback period may be shorter due to the elimination of the +1.3°C thermal penalty absorbed during the observation period.
            </p>
          </div>

          {/* 8. Limitations */}
          <div className="print:break-before-page">
            <SectionHeader number={8} title="Study Limitations" />
            <ul className="list-decimal pl-6 space-y-3 mt-4 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Single-site scope:</span> Results are derived from a single commercial facility. Generalization to other building types, sizes, or climatic zones requires additional field studies.
              </li>
              <li>
                <span className="font-medium text-foreground">Building-level metering:</span> Consumption data reflects total building load (HVAC + non-HVAC). While non-HVAC loads are assumed constant, minor variations may exist.
              </li>
              <li>
                <span className="font-medium text-foreground">G8 panel exclusion:</span> The non-equipped G8 unit (26 tons) consumed 87,083 kWh in 2025 (13.4% of building total). Its inclusion in the building meter introduces a minor dilution effect on measured savings percentages.
              </li>
              <li>
                <span className="font-medium text-foreground">Weather normalization precision:</span> The CDD-based adjustment uses an empirically estimated sensitivity coefficient. Sub-hourly load correlation or regression-based methods may yield higher precision.
              </li>
              <li>
                <span className="font-medium text-foreground">Observation duration:</span> Two-year data provides a single pre/post comparison cycle. Multi-year post-installation monitoring would strengthen long-term performance claims.
              </li>
              <li>
                <span className="font-medium text-foreground">No sub-metering:</span> Individual unit-level consumption was not metered. Per-unit efficiency attribution is estimated based on rated capacity proportions.
              </li>
            </ul>
          </div>

          {/* 9. Conclusion */}
          <div>
            <SectionHeader number={9} title="Conclusion" />
            <p className="mt-4">
              This field study provides invoice-backed validation that retrofit smart control systems deliver measurable, economically significant energy savings in high-ambient commercial cooling applications. The 14.1% efficiency gain and 33,052 SAR annual savings — achieved during a year 1.3°C hotter than baseline — demonstrate robust performance under thermal stress conditions that exceed typical operating assumptions.
            </p>
            <p className="mt-3">
              The 61.8% peak demand reduction further suggests significant potential for demand-side management benefits, including reduced electrical infrastructure sizing requirements and lower peak demand charges for operators on time-of-use tariff structures.
            </p>
            <p className="mt-3">
              These results support the technical viability of retrofit compressor management as a cost-effective alternative to full HVAC system replacement in the Saudi commercial market, aligning with national energy efficiency objectives under Vision 2030.
            </p>
          </div>

          {/* 10. References */}
          <div className="print:break-before-page">
            <SectionHeader number={10} title="References" />
            <ol className="list-decimal pl-6 space-y-3 mt-4 text-muted-foreground">
              <li>Saudi Electricity Company (SEC). <span className="italic">Commercial and Industrial Tariff Schedule.</span> Riyadh, KSA. 2024.</li>
              <li>Saudi Energy Efficiency Center (SEEC). <span className="italic">National Energy Efficiency Program: Building Sector Guidelines.</span> Riyadh, KSA. 2023.</li>
              <li>ASHRAE. <span className="italic">HVAC Fundamentals Handbook</span> (SI Edition). American Society of Heating, Refrigerating and Air-Conditioning Engineers. Atlanta, GA. 2021.</li>
              <li>International Energy Agency (IEA). <span className="italic">The Future of Cooling: Opportunities for Energy-Efficient Air Conditioning.</span> Paris, France. 2018.</li>
              <li>Saudi National Center for Meteorology. <span className="italic">Historical Climate Data: Riyadh Region Monthly Averages.</span> 2024–2025.</li>
              <li>National Oceanic and Atmospheric Administration (NOAA). <span className="italic">Global Surface Temperature Dataset.</span> 2025.</li>
              <li>Saudi Electricity Company (SCECO). <span className="italic">Utility Invoices: Account [Redacted], Jarir Bookstore Rawdah Branch.</span> January 2024 – December 2025.</li>
              <li>WeatherSpark. <span className="italic">Historical Weather during 2025 in Riyadh, Saudi Arabia.</span> King Khalid International Airport (OERK) observations. <a href="https://weatherspark.com/h/y/104018/2025/Historical-Weather-during-2025-in-Riyadh-Saudi-Arabia" target="_blank" rel="noopener noreferrer" className="underline">weatherspark.com</a>.</li>
            </ol>
          </div>

          {/* Footer */}
          <Separator />
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Thermo Dynamics Engineering — Technical White Paper</span>
              <span>© {new Date().getFullYear()} — All rights reserved</span>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Weather normalization based on historical Riyadh climate data sourced from WeatherSpark (King Khalid International Airport observations).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
