import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Outlet, useLocation } from "react-router-dom";
import { WeatherProvider } from "@/context/WeatherContext";
import { AlertNotifications } from "./AlertNotifications";
import { AnimatePresence } from "framer-motion";

export function PlatformLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <WeatherProvider>
        <AlertNotifications />
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AppHeader />
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <AnimatePresence mode="wait">
                <Outlet key={location.pathname} />
              </AnimatePresence>
            </main>
          </div>
        </div>
      </WeatherProvider>
    </SidebarProvider>
  );
}
