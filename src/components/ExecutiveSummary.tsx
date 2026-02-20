import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

export function ExecutiveSummary() {
  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Export / Print PDF
        </button>
      </div>

      <div className="exec-summary-print bg-card rounded-xl border p-10 md:p-14 max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:rounded-none print:p-0">
        {/* Title Block */}
        <div className="text-center space-y-2 pb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "hsl(var(--exec-navy))" }}>
            Thermo Dynamics Engineer
          </h1>
          <p className="text-lg font-medium text-muted-foreground tracking-wide">
            Premium Cooling Performance Optimization
          </p>
          <Separator className="mt-6" />
        </div>

        {/* 1. The Opportunity */}
        <Section number="1" title="The Opportunity">
          <p>
            Saudi Arabia's commercial cooling sector consumes <Strong>over 70% of building energy</Strong> in high-ambient environments.
            With electricity costs rising and sustainability mandates tightening, businesses face increasing pressure to reduce HVAC operational
            expenditure without capital-intensive equipment replacement. SCC addresses this gap with a retrofit-first, data-validated approach
            that delivers measurable savings from day one.
          </p>
        </Section>

        {/* 2. The Solution */}
        <Section number="2" title="The Solution">
          <p>
            SCC deploys smart control optimization systems on existing AC infrastructure, requiring no equipment replacement or operational
            disruption. Validated at Jarir Bookstore's Rawdah showroom:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <KPI label="Energy Reduction" value="14.1%" />
            <KPI label="Invoice-Backed Savings" value="33,052 SAR" />
            <KPI label="kWh Saved" value="80,762" />
            <KPI label="Capital Recovery" value="3.1 Years" />
          </div>
        </Section>

        {/* 3. Business Model */}
        <Section number="3" title="Business Model">
          <p className="mb-3">Three integrated revenue layers ensure capital efficiency and recurring value:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RevenueLayer
              title="System Sales"
              desc="175,000 SAR per installation with 37% gross margin"
            />
            <RevenueLayer
              title="Monitoring Subscriptions"
              desc="12,000 SAR/year per unit at 60% margin — recurring"
            />
            <RevenueLayer
              title="Maintenance Contracts"
              desc="Value-add service layer tied to installed base growth"
            />
          </div>
        </Section>

        {/* 4. 5-Year Growth Plan */}
        <Section number="4" title="5-Year Growth Plan">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPI label="Active Installations" value="50–60" />
            <KPI label="Annual Revenue" value="8–12M SAR" />
            <KPI label="Net Income" value="2–4M SAR" />
            <KPI label="Recurring Base" value="Growing" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Growth is controlled and capital-efficient — scaling through proven client replication without over-leveraging.
          </p>
        </Section>

        {/* 5. Strategic Positioning */}
        <Section number="5" title="Strategic Positioning">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span><Strong>First-mover</Strong> in retrofit cooling optimization for GCC commercial environments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span><Strong>Invoice-validated</Strong> performance — no theoretical projections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span><Strong>Non-disruptive</Strong> deployment model reduces client adoption friction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span><Strong>Recurring revenue</Strong> architecture creates compounding value</span>
            </li>
          </ul>
        </Section>

        {/* 6. Capital Strategy */}
        <Section number="6" title="Capital Strategy">
          <p>
            SCC prioritizes <Strong>disciplined capital allocation</Strong>: maintaining 6–12 months operating reserves before dividend
            expansion, reinvesting for controlled scaling, and preserving founder majority ownership. The holding structure separates
            operational risk from asset protection, ensuring long-term wealth preservation.
          </p>
        </Section>

        {/* 7. Vision Statement */}
        <Section number="7" title="Vision">
          <p className="text-base font-medium" style={{ color: "hsl(var(--exec-navy))" }}>
            To become the region's definitive energy optimization platform — building enduring value through engineering excellence,
            financial discipline, and measurable client impact.
          </p>
        </Section>

        {/* Footer */}
        <Separator />
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
          <span>Thermo Dynamics Engineer — Confidential</span>
          <span>Prepared {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-bold tracking-tight" style={{ color: "hsl(var(--exec-navy))" }}>
        <span className="text-primary mr-2">{number}.</span>{title}
      </h2>
      <div className="text-sm leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border bg-muted/30 text-center">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-bold text-primary mt-0.5">{value}</p>
    </div>
  );
}

function RevenueLayer({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-4 rounded-lg border bg-muted/20">
      <p className="font-semibold text-sm" style={{ color: "hsl(var(--exec-navy))" }}>{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-foreground">{children}</span>;
}
