import {
  LayoutDashboard, Activity, MapPin, Cpu, Box, FolderKanban,
  Lightbulb, Bell, FileText, Receipt, TrendingUp, Users,
  Plug, Settings, Zap, CloudSun
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { alerts } from "@/data/mockData";
import { WeatherWidget } from "./WeatherWidget";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Monitoring", url: "/monitoring", icon: Activity },
  { title: "Weather Intel", url: "/weather", icon: CloudSun },
  { title: "Sites", url: "/sites", icon: MapPin },
  { title: "Devices", url: "/devices", icon: Cpu },
  { title: "Assets", url: "/assets", icon: Box },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Solutions", url: "/solutions", icon: Lightbulb },
  { title: "Alerts", url: "/alerts", icon: Bell, badge: alerts.filter(a => !a.acknowledged).length },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Billing", url: "/billing", icon: Receipt },
  { title: "Savings & ROI", url: "/savings", icon: TrendingUp },
  { title: "Users", url: "/users", icon: Users },
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [weatherOpen, setWeatherOpen] = useState(false);

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md gradient-savings flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground tracking-tight">ESCO Command</span>
                <span className="text-[10px] text-muted-foreground">Energy Intelligence</span>
              </div>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <NavLink to={item.url} end={item.url === '/'} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="flex-1">{item.title}</span>}
                          {!collapsed && item.badge && item.badge > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-[20px] text-[10px] px-1.5">
                              {item.badge}
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-3 space-y-3">
          <Button
            variant="outline"
            size={collapsed ? "icon" : "default"}
            className="w-full border-border/50 hover:bg-sidebar-accent"
            onClick={() => setWeatherOpen(true)}
          >
            <CloudSun className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2 text-sm">Live Weather</span>}
          </Button>
          {!collapsed && (
            <div className="rounded-md bg-secondary/50 p-3">
              <p className="text-[10px] text-muted-foreground">Thermo Dynamics Engineering</p>
              <p className="text-[10px] text-muted-foreground">v2.1.0 — Command Center</p>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <Sheet open={weatherOpen} onOpenChange={setWeatherOpen}>
        <SheetContent side="left" className="w-[380px] sm:w-[420px] bg-background border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <CloudSun className="h-5 w-5 text-energy" />
              Live Weather & HVAC Impact
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <WeatherWidget />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}