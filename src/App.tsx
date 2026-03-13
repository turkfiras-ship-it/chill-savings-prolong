import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlatformLayout } from "@/components/platform/PlatformLayout";
import DashboardPage from "@/pages/platform/DashboardPage";
import MonitoringPage from "@/pages/platform/MonitoringPage";
import SitesPage from "@/pages/platform/SitesPage";
import DevicesPage from "@/pages/platform/DevicesPage";
import AssetsPage from "@/pages/platform/AssetsPage";
import ProjectsPage from "@/pages/platform/ProjectsPage";
import SolutionsPage from "@/pages/platform/SolutionsPage";
import AlertsPage from "@/pages/platform/AlertsPage";
import ReportsPage from "@/pages/platform/ReportsPage";
import BillingPage from "@/pages/platform/BillingPage";
import SavingsPage from "@/pages/platform/SavingsPage";
import UsersPage from "@/pages/platform/UsersPage";
import IntegrationsPage from "@/pages/platform/IntegrationsPage";
import SettingsPage from "@/pages/platform/SettingsPage";
import SiteDetailPage from "@/pages/platform/SiteDetailPage";
import WeatherPage from "@/pages/platform/WeatherPage";
import AnomalyDetectionPage from "@/pages/platform/AnomalyDetectionPage";
import InnovationPage from "@/pages/platform/InnovationPage";
import CoolingStressPage from "@/pages/platform/CoolingStressPage";
import PortfolioValuePage from "@/pages/platform/PortfolioValuePage";
import CoolingIntelligencePage from "@/pages/platform/CoolingIntelligencePage";
import EnergyProsecutorPage from "@/pages/platform/EnergyProsecutorPage";
import EnergyReputationPage from "@/pages/platform/EnergyReputationPage";
import HeatwaveCommandPage from "@/pages/platform/HeatwaveCommandPage";
import EnergyValueEnginePage from "@/pages/platform/EnergyValueEnginePage";
import AIOptimizationPage from "@/pages/platform/AIOptimizationPage";
import PortfolioAIPage from "@/pages/platform/PortfolioAIPage";
import ContractLabPage from "@/pages/platform/ContractLabPage";
import PredictiveMaintenancePage from "@/pages/platform/PredictiveMaintenancePage";
import CoolingForecastPage from "@/pages/platform/CoolingForecastPage";
import EnergyStrategyPage from "@/pages/platform/EnergyStrategyPage";
import CarbonIntelligencePage from "@/pages/platform/CarbonIntelligencePage";
import EnergyCopilotPage from "@/pages/platform/EnergyCopilotPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<PlatformLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/sites" element={<SitesPage />} />
            <Route path="/sites/:id" element={<SiteDetailPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/anomaly-detection" element={<AnomalyDetectionPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/innovation" element={<InnovationPage />} />
            <Route path="/cooling-stress" element={<CoolingStressPage />} />
            <Route path="/portfolio-value" element={<PortfolioValuePage />} />
            <Route path="/cooling-intelligence" element={<CoolingIntelligencePage />} />
            <Route path="/energy-prosecutor" element={<EnergyProsecutorPage />} />
            <Route path="/energy-reputation" element={<EnergyReputationPage />} />
            <Route path="/heatwave-command" element={<HeatwaveCommandPage />} />
            <Route path="/energy-value-engine" element={<EnergyValueEnginePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
