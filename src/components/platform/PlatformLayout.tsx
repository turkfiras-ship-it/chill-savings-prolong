import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { IntelligencePanel } from "./IntelligencePanel";
import { Outlet, useLocation } from "react-router-dom";
import { WeatherProvider } from "@/context/WeatherContext";
import { ViewModeProvider } from "@/context/ViewModeContext";
import { AlertNotifications } from "./AlertNotifications";
import { AnimatePresence } from "framer-motion";

export function PlatformLayout() {
  const location = useLocation();

  return (
    <ViewModeProvider>
      <SidebarProvider>
        <WeatherProvider>
          <AlertNotifications />
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <AppHeader />
              <div className="flex-1 flex min-h-0">
                <main className="flex-1 overflow-auto p-4 md:p-5">
                  <AnimatePresence mode="wait">
                    <Outlet key={location.pathname} />
                  </AnimatePresence>
                </main>
                <IntelligencePanel />
              </div>
            </div>
          </div>
        </WeatherProvider>
      </SidebarProvider>
    </ViewModeProvider>
  );
}
