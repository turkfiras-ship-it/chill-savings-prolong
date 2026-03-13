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
            <Route path="/sites" element={<SitesPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
