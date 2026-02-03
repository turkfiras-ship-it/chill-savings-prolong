import { 
  Zap, 
  TrendingDown, 
  Calendar, 
  Building2,
  Leaf,
  BadgePercent,
  Clock,
  Wrench
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ShowroomTable } from "@/components/ShowroomTable";
import { ConsumptionChart } from "@/components/ConsumptionChart";
import { ROITimeline } from "@/components/ROITimeline";
import { LifespanComparison } from "@/components/LifespanComparison";
import { SavingsSummary } from "@/components/SavingsSummary";
import {
  totalYearlySavings25,
  totalYearlySavings30,
  totalConsumption,
  systemCost,
  yearlySavingsConservative,
  totalUnits,
} from "@/data/savingsData";

const Index = () => {
  const paybackMonths = Math.ceil((systemCost / yearlySavingsConservative) * 12);
  const co2Savings = Math.round((totalConsumption * 0.25 * 0.0007)); // ~0.7kg CO2 per kWh in Saudi

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="gradient-hero text-primary-foreground py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-savings/20">
              <Zap className="h-8 w-8 text-savings" />
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70 uppercase tracking-wider font-medium">
                Energy Efficiency Report
              </p>
              <h1 className="text-3xl md:text-4xl font-bold">
                Jarir Bookstore - Power Saving Analysis
              </h1>
            </div>
          </div>
          <p className="text-primary-foreground/80 max-w-2xl text-lg mt-4">
            Comprehensive ROI analysis for power saving devices installed across 20 showroom locations
            with 164 package AC units totaling over 25+ tons capacity each.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur text-sm">
              📊 2023-2024 Consumption Data
            </div>
            <div className="px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur text-sm">
              🏢 20 Showroom Locations
            </div>
            <div className="px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur text-sm">
              ❄️ 164 AC Package Units
            </div>
          </div>
        </div>
      </header>

      {/* Main Stats */}
      <section className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Annual Savings (25%)"
            value={`${(totalYearlySavings25 / 1000).toFixed(0)}K SAR`}
            subtitle="Conservative estimate"
            icon={<TrendingDown className="h-5 w-5" />}
            variant="savings"
          />
          <StatCard
            title="Annual Savings (30%)"
            value={`${(totalYearlySavings30 / 1000).toFixed(0)}K SAR`}
            subtitle="Optimistic estimate"
            icon={<BadgePercent className="h-5 w-5" />}
            variant="savings"
          />
          <StatCard
            title="Payback Period"
            value={`~${Math.ceil(paybackMonths / 12)} Years`}
            subtitle={`${paybackMonths} months at 25% savings`}
            icon={<Clock className="h-5 w-5" />}
            variant="energy"
          />
          <StatCard
            title="CO₂ Reduction"
            value={`${co2Savings.toLocaleString()} tons`}
            subtitle="Annual environmental impact"
            icon={<Leaf className="h-5 w-5" />}
            variant="default"
          />
        </div>
      </section>

      {/* Key Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Key Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-card card-elevated border-l-4 border-l-savings">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-savings-light">
                <Zap className="h-5 w-5 text-savings" />
              </div>
              <h3 className="font-semibold">Energy Reduction</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              25-30% reduction in electricity consumption across all AC units, 
              translating to <span className="text-savings font-semibold">1M+ SAR</span> annual savings.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card card-elevated border-l-4 border-l-energy">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-energy-light">
                <Wrench className="h-5 w-5 text-energy" />
              </div>
              <h3 className="font-semibold">Extended Equipment Life</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              AC lifespan extended from 10 to <span className="text-energy font-semibold">15-20 years</span>, 
              reducing replacement costs by millions over the equipment lifecycle.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card card-elevated border-l-4 border-l-chart-blue">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Building2 className="h-5 w-5 text-chart-blue" />
              </div>
              <h3 className="font-semibold">Operational Efficiency</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Reduced compressor stress leads to fewer breakdowns, 
              lower maintenance costs, and improved cooling performance.
            </p>
          </div>
        </div>
      </section>

      {/* Charts Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ConsumptionChart />
          <ROITimeline />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SavingsSummary />
          <LifespanComparison />
        </div>
      </section>

      {/* Showroom Table */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <ShowroomTable />
      </section>

      {/* 10-Year Projection */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="gradient-savings rounded-2xl p-8 text-primary-foreground">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-8 w-8" />
            <h2 className="text-2xl font-bold">10-Year Financial Projection</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-primary-foreground/10 rounded-xl p-5 backdrop-blur">
              <p className="text-sm opacity-80 mb-1">Total Energy Savings</p>
              <p className="text-3xl font-bold">
                {(totalYearlySavings25 * 10 / 1000000).toFixed(1)}M SAR
              </p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-5 backdrop-blur">
              <p className="text-sm opacity-80 mb-1">Equipment Savings</p>
              <p className="text-3xl font-bold">~9.2M SAR</p>
              <p className="text-xs opacity-70 mt-1">Avoided replacements</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-5 backdrop-blur">
              <p className="text-sm opacity-80 mb-1">Total 10-Year Benefit</p>
              <p className="text-3xl font-bold">
                {((totalYearlySavings25 * 10 + 9200000) / 1000000).toFixed(1)}M SAR
              </p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-5 backdrop-blur">
              <p className="text-sm opacity-80 mb-1">ROI</p>
              <p className="text-3xl font-bold">
                {(((totalYearlySavings25 * 10) - systemCost) / systemCost * 100).toFixed(0)}%+
              </p>
              <p className="text-xs opacity-70 mt-1">On initial investment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              Energy Savings Analysis Report for Jarir Bookstore
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Data based on 2023-2024 SCECO meter readings • Electricity rate: 0.30 SAR/KWh
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-savings" />
            <span>Sustainable Energy Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
