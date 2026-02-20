import { Link } from "react-router-dom";
import { Thermometer, Landmark } from "lucide-react";
import {
  Zap,
  TrendingDown,
  Calendar,
  Building2,
  Leaf,
  BadgePercent,
  Clock,
  Wrench,
  Target,
  Presentation,
  Printer,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";


import { EditorProvider, BlockDef, useEditor } from "@/context/EditorContext";
import { EditorShell } from "@/components/editor/EditorShell";
import { SelectableBlock } from "@/components/editor/SelectableBlock";
import { EditableText } from "@/components/editor/EditableText";
import { StatCard } from "@/components/StatCard";
import { ShowroomTable } from "@/components/ShowroomTable";
import { ConsumptionChart } from "@/components/ConsumptionChart";
import { ROITimeline } from "@/components/ROITimeline";
import { LifespanComparison } from "@/components/LifespanComparison";
import { SavingsSummary } from "@/components/SavingsSummary";
import { RawdahAnalysis } from "@/components/RawdahAnalysis";
import { ROIAnalysis } from "@/components/ROIAnalysis";
import { ExcelUpload } from "@/components/ExcelUpload";
import { UnitMonthlyAnalysis } from "@/components/UnitMonthlyAnalysis";
import { Recommendations } from "@/components/Recommendations";
import { PrintBooklet } from "@/components/PrintBooklet";
import { ROIAnalysis2 } from "@/components/ROIAnalysis2";
import { ROIAnalysis3 } from "@/components/ROIAnalysis3";
import { WeatherSensitivity } from "@/components/WeatherSensitivity";
import { ExpansionSimulator } from "@/components/ExpansionSimulator";
import { MaintenanceSimulator } from "@/components/MaintenanceSimulator";
import { InvestorDashboard } from "@/components/InvestorDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortableSections, SectionDef } from "@/components/SortableSections";
import {
  totalYearlySavings25,
  totalYearlySavings30,
  totalConsumption,
  systemCost,
  yearlySavingsConservative,
  acReplacementSavings,
} from "@/data/savingsData";

// ─── Editor block registry ─────────────────────────────────────────────────

const EDITOR_BLOCKS: BlockDef[] = [
  { id: "hero", label: "Hero Header", style: {} },
  { id: "tabs-section", label: "Report Tabs", style: {} },
  { id: "footer", label: "Footer", style: {} },
];

// ─── Individual block content components ──────────────────────────────────

function HeroBlock() {
  return (
    <header className="gradient-hero text-primary-foreground py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-savings/20">
            <Zap className="h-8 w-8 text-savings" />
          </div>
          <div>
            <EditableText
              textKey="hero-eyebrow"
              defaultValue="Energy Efficiency Report"
              as="p"
              className="text-sm text-primary-foreground/70 uppercase tracking-wider font-medium"
            />
            <EditableText
              textKey="hero-title"
              defaultValue="Jarir Bookstore - Power Saving Analysis"
              as="h1"
              className="text-3xl md:text-4xl font-bold"
            />
          </div>
        </div>
        <EditableText
          textKey="hero-subtitle"
          defaultValue="Comprehensive ROI analysis for power saving devices installed at Rawdah Showroom with 7 package AC units totaling 25+ tons capacity each."
          as="p"
          className="text-primary-foreground/80 max-w-2xl text-lg mt-4"
        />
        <div className="flex flex-wrap gap-4 mt-6 items-center">
          <div className="px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur text-sm">
            📊 2023-2025 Consumption Data
          </div>
          <div className="px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur text-sm">
            🏢 20 Showroom Locations
          </div>
          <div className="px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur text-sm">
            ❄️ 164 AC Package Units
          </div>
          <Link
            to="/presentation"
            className="px-4 py-2 rounded-full bg-savings text-white text-sm font-medium flex items-center gap-2 hover:bg-savings/90 transition-colors"
          >
            <Presentation className="h-4 w-4" />
            View Presentation
          </Link>
        </div>
      </div>
    </header>
  );
}

function TabsBlock() {
  const paybackMonths = Math.ceil((systemCost / yearlySavingsConservative) * 12);
  const co2Savings = Math.round(totalConsumption * 0.25 * 0.0007);

  const rawdahSections: SectionDef[] = [
    { id: "excel-upload", label: "Data Upload", node: <ExcelUpload /> },
    { id: "rawdah-analysis", label: "Rawdah Analysis", node: <RawdahAnalysis /> },
  ];
  const unitsSections: SectionDef[] = [
    { id: "unit-monthly", label: "Unit Monthly Data", node: <UnitMonthlyAnalysis /> },
  ];
  const recommendationsSections: SectionDef[] = [
    { id: "recommendations", label: "Recommendations", node: <Recommendations /> },
  ];
  const roiSections: SectionDef[] = [
    { id: "roi-analysis", label: "ROI Analysis", node: <ROIAnalysis /> },
  ];
  const roi2Sections: SectionDef[] = [
    { id: "roi2-analysis", label: "ROI 2 Analysis", node: <ROIAnalysis2 /> },
  ];
  const roi3Sections: SectionDef[] = [
    { id: "roi3-analysis", label: "ROI 3 Combined", node: <ROIAnalysis3 /> },
  ];
  const weatherSections: SectionDef[] = [
    { id: "weather-sensitivity", label: "Weather Sensitivity", node: <WeatherSensitivity /> },
  ];
  const expansionSections: SectionDef[] = [
    { id: "expansion-simulator", label: "Expansion Simulator", node: <ExpansionSimulator /> },
  ];
  const maintenanceSimSections: SectionDef[] = [
    { id: "maintenance-simulator", label: "Maintenance Simulator", node: <MaintenanceSimulator /> },
  ];
  const investorSections: SectionDef[] = [
    { id: "investor-dashboard", label: "Investor Dashboard", node: <InvestorDashboard /> },
  ];
  const overviewSections: SectionDef[] = [
    {
      id: "stat-cards",
      label: "KPI Cards",
      node: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Annual Savings (25%)" value={`${(totalYearlySavings25 / 1000).toFixed(0)}K SAR`} subtitle="Conservative estimate" icon={<TrendingDown className="h-5 w-5" />} variant="savings" />
          <StatCard title="Annual Savings (30%)" value={`${(totalYearlySavings30 / 1000).toFixed(0)}K SAR`} subtitle="Optimistic estimate" icon={<BadgePercent className="h-5 w-5" />} variant="savings" />
          <StatCard title="Payback Period" value={`~${Math.ceil(paybackMonths / 12)} Years`} subtitle={`${paybackMonths} months at 25% savings`} icon={<Clock className="h-5 w-5" />} variant="energy" />
          <StatCard title="CO₂ Reduction" value={`${co2Savings.toLocaleString()} tons`} subtitle="Annual environmental impact" icon={<Leaf className="h-5 w-5" />} variant="default" />
        </div>
      ),
    },
    {
      id: "key-benefits",
      label: "Key Benefits",
      node: (
        <div>
          <h2 className="text-2xl font-bold mb-6">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card card-elevated border-l-4 border-l-savings"><div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-lg bg-savings-light"><Zap className="h-5 w-5 text-savings" /></div><h3 className="font-semibold">Energy Reduction</h3></div><p className="text-muted-foreground text-sm">25-30% reduction in electricity consumption, translating to <span className="text-savings font-semibold">1M+ SAR</span> annual savings.</p></div>
            <div className="p-6 rounded-xl bg-card card-elevated border-l-4 border-l-energy"><div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-lg bg-energy-light"><Wrench className="h-5 w-5 text-energy" /></div><h3 className="font-semibold">Extended Equipment Life</h3></div><p className="text-muted-foreground text-sm">AC lifespan extended from 10 to <span className="text-energy font-semibold">15 years</span>, reducing replacement costs by millions.</p></div>
            <div className="p-6 rounded-xl bg-card card-elevated border-l-4 border-l-chart-blue"><div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-lg bg-secondary"><Building2 className="h-5 w-5 text-chart-blue" /></div><h3 className="font-semibold">Operational Efficiency</h3></div><p className="text-muted-foreground text-sm">Reduced compressor stress leads to fewer breakdowns and improved cooling performance.</p></div>
          </div>
        </div>
      ),
    },
    { id: "charts-grid", label: "Charts", node: (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ConsumptionChart /><ROITimeline /></div>) },
    { id: "savings-lifespan", label: "Savings & Lifespan", node: (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><SavingsSummary /><LifespanComparison /></div>) },
    { id: "showroom-table", label: "Showroom Table", node: <ShowroomTable /> },
    {
      id: "ten-year",
      label: "10-Year Projection",
      node: (
        <div className="gradient-savings rounded-2xl p-8 text-primary-foreground">
          <div className="flex items-center gap-3 mb-6"><Calendar className="h-8 w-8" /><h2 className="text-2xl font-bold">10-Year Financial Projection</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-primary-foreground/10 rounded-xl p-5 backdrop-blur"><p className="text-sm opacity-80 mb-1">Total Energy Savings</p><p className="text-3xl font-bold">{(totalYearlySavings25 * 10 / 1000000).toFixed(1)}M SAR</p></div>
            <div className="bg-primary-foreground/10 rounded-xl p-5 backdrop-blur"><p className="text-sm opacity-80 mb-1">Equipment Savings</p><p className="text-3xl font-bold">{(acReplacementSavings / 1000000).toFixed(1)}M SAR</p></div>
            <div className="bg-primary-foreground/10 rounded-xl p-5 backdrop-blur"><p className="text-sm opacity-80 mb-1">Total 10-Year Benefit</p><p className="text-3xl font-bold">{((totalYearlySavings25 * 10 + acReplacementSavings) / 1000000).toFixed(1)}M SAR</p></div>
            <div className="bg-primary-foreground/10 rounded-xl p-5 backdrop-blur"><p className="text-sm opacity-80 mb-1">ROI</p><p className="text-3xl font-bold">{(((totalYearlySavings25 * 10) - systemCost) / systemCost * 100).toFixed(0)}%+</p></div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 -mt-6">
      <Tabs defaultValue="rawdah" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 w-full max-w-5xl mb-6">
          <TabsTrigger value="rawdah" className="flex items-center gap-2"><Building2 className="h-4 w-4" />Rawdah Analysis</TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2"><Zap className="h-4 w-4" />Unit Data</TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2"><Leaf className="h-4 w-4" />Recommendations</TabsTrigger>
          <TabsTrigger value="roi" className="flex items-center gap-2"><Target className="h-4 w-4" />ROI</TabsTrigger>
          <TabsTrigger value="roi2" className="flex items-center gap-2"><Target className="h-4 w-4" />ROI 2</TabsTrigger>
          <TabsTrigger value="roi3" className="flex items-center gap-2"><Target className="h-4 w-4" />ROI 3</TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2"><Thermometer className="h-4 w-4" />Weather</TabsTrigger>
          <TabsTrigger value="expansion" className="flex items-center gap-2"><Building2 className="h-4 w-4" />Expansion</TabsTrigger>
          <TabsTrigger value="maintenance-sim" className="flex items-center gap-2"><Wrench className="h-4 w-4" />Simulator</TabsTrigger>
          <TabsTrigger value="investor" className="flex items-center gap-2"><Landmark className="h-4 w-4" />Investor</TabsTrigger>
          <TabsTrigger value="overview">All Showrooms</TabsTrigger>
          <TabsTrigger value="print" className="flex items-center gap-2"><Printer className="h-4 w-4" />Print</TabsTrigger>
        </TabsList>
        <TabsContent value="rawdah"><SortableSections sections={rawdahSections} isEditMode={false} /></TabsContent>
        <TabsContent value="units"><SortableSections sections={unitsSections} isEditMode={false} /></TabsContent>
        <TabsContent value="recommendations"><SortableSections sections={recommendationsSections} isEditMode={false} /></TabsContent>
        <TabsContent value="roi"><SortableSections sections={roiSections} isEditMode={false} /></TabsContent>
        <TabsContent value="roi2"><SortableSections sections={roi2Sections} isEditMode={false} /></TabsContent>
        <TabsContent value="roi3"><SortableSections sections={roi3Sections} isEditMode={false} /></TabsContent>
        <TabsContent value="weather"><SortableSections sections={weatherSections} isEditMode={false} /></TabsContent>
        <TabsContent value="expansion"><SortableSections sections={expansionSections} isEditMode={false} /></TabsContent>
        <TabsContent value="maintenance-sim"><SortableSections sections={maintenanceSimSections} isEditMode={false} /></TabsContent>
        <TabsContent value="investor"><SortableSections sections={investorSections} isEditMode={false} /></TabsContent>
        <TabsContent value="print" className="space-y-6"><PrintBooklet /></TabsContent>
        <TabsContent value="overview"><SortableSections sections={overviewSections} isEditMode={false} /></TabsContent>
      </Tabs>
    </section>
  );
}

function FooterBlock() {
  return (
    <footer className="bg-card border-t py-8 px-6 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <EditableText textKey="footer-line1" defaultValue="Energy Savings Analysis Report for Jarir Bookstore" as="p" className="text-sm text-muted-foreground" />
          <EditableText textKey="footer-line2" defaultValue="Data based on 2023-2025 SCECO meter readings • Electricity rate: 0.30 SAR/KWh • System cost: 25,000 SAR/unit" as="p" className="text-xs text-muted-foreground mt-1" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Leaf className="h-4 w-4 text-savings" />
          <EditableText textKey="footer-tagline" defaultValue="Sustainable Energy Solutions" as="span" />
        </div>
      </div>
    </footer>
  );
}

// ─── Canvas with DnD for block reordering ─────────────────────────────────

const BLOCK_CONTENT: Record<string, JSX.Element> = {
  hero: <HeroBlock />,
  "tabs-section": <TabsBlock />,
  footer: <FooterBlock />,
};

function PageContent() {
  const { blockOrder, reorderBlocks, isEditorMode, isPreviewMode } = useEditor();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      const oldIndex = blockOrder.indexOf(String(active.id));
      const newIndex = blockOrder.indexOf(String(over.id));
      reorderBlocks(oldIndex, newIndex);
    }
  };

  const isActive = isEditorMode && !isPreviewMode;

  const blocks = blockOrder.map((id) => {
    const def = EDITOR_BLOCKS.find((b) => b.id === id);
    return (
      <SelectableBlock key={id} blockId={id} label={def?.label ?? id} sortable={isActive}>
        {BLOCK_CONTENT[id]}
      </SelectableBlock>
    );
  });

  if (!isActive) {
    return <div className="min-h-screen bg-background">{blocks}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={blockOrder} strategy={verticalListSortingStrategy}>
        <div className="min-h-screen bg-background">{blocks}</div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeId && (
          <div className="opacity-80 shadow-2xl ring-2 ring-primary rounded-lg overflow-hidden bg-card">
            {BLOCK_CONTENT[activeId]}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Index (entry point) ──────────────────────────────────────────────────

const Index = () => {
  return (
    <EditorProvider defaultBlocks={EDITOR_BLOCKS}>
      <EditorShell blocks={EDITOR_BLOCKS}>
        <PageContent />
      </EditorShell>
    </EditorProvider>
  );
};

export default Index;
