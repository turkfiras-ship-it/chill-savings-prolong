import { Bell, Search, User, SidebarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { alerts } from "@/data/mockData";

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const unackAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
          <SidebarIcon className="h-4 w-4" />
        </Button>
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search sites, devices, projects..." className="h-8 w-64 pl-8 text-xs bg-secondary border-0" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 mr-2">
          <div className="h-2 w-2 rounded-full bg-primary pulse-dot" />
          <span className="text-[11px] text-muted-foreground">Live</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          {unackAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-destructive text-[9px] text-destructive-foreground flex items-center justify-center px-1">
              {unackAlerts}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
