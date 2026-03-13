import {
  LayoutDashboard, Activity, MapPin, Cpu, Box, FolderKanban,
  Lightbulb, Bell, FileText, Receipt, TrendingUp, Users,
  Plug, Settings, Zap, CloudSun, Brain, Sparkles, Gauge, Landmark,
  Globe, Shield, Star, Flame, DollarSign, Cpu as CpuAI, Target,
  FileText as Contract, Wrench, CloudSun as Forecast, BarChart3,
  Leaf, Bot, Dna, ChevronDown, Radar
} from "lucide-react";
import dcEvolveLogo from "@/assets/dc-evolve-logo.png";
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
import { useGlobalWeather } from "@/context/WeatherContext";
import { getWeatherInfo, estimateHvacEfficiencyImpact } from "@/lib/weatherService";
import { motion, AnimatePresence } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ── Grouped navigation structure ──────────────────────────
const navGroups = [
  {
    label: "COMMAND",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Monitoring", url: "/monitoring", icon: Activity },
      { title: "Sites", url: "/sites", icon: MapPin },
      { title: "Weather Intel", url: "/weather", icon: CloudSun },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { title: "AI Anomalies", url: "/anomaly-detection", icon: Brain },
      { title: "Cooling Stress™", url: "/cooling-stress", icon: Gauge },
      { title: "Cooling Network", url: "/cooling-intelligence", icon: Globe },
      { title: "Energy Prosecutor", url: "/energy-prosecutor", icon: Shield },
      { title: "Energy Reputation", url: "/energy-reputation", icon: Star },
      { title: "Heatwave Command", url: "/heatwave-command", icon: Flame },
      { title: "Cooling Forecast", url: "/cooling-forecast", icon: Forecast },
      { title: "Cooling Genome™", url: "/cooling-genome", icon: Dna },
      { title: "Carbon Intel", url: "/carbon-intelligence", icon: Leaf },
      { title: "Radar Detection", url: "/radar-detection", icon: Radar },
    ],
  },
  {
    label: "OPTIMIZATION",
    items: [
      { title: "AI Optimization", url: "/ai-optimization", icon: CpuAI },
      { title: "Portfolio AI", url: "/portfolio-ai", icon: Target },
      { title: "Energy Strategy", url: "/energy-strategy", icon: BarChart3 },
      { title: "Predictive Maint.", url: "/predictive-maintenance", icon: Wrench },
      { title: "Energy Copilot", url: "/energy-copilot", icon: Bot },
    ],
  },
  {
    label: "INVESTOR",
    items: [
      { title: "Portfolio Value", url: "/portfolio-value", icon: Landmark },
      { title: "Value Engine", url: "/energy-value-engine", icon: DollarSign },
      { title: "Contract Lab", url: "/contract-lab", icon: Contract },
      { title: "Savings & ROI", url: "/savings", icon: TrendingUp },
      { title: "Billing", url: "/billing", icon: Receipt },
      { title: "Reports", url: "/reports", icon: FileText },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { title: "Devices", url: "/devices", icon: Cpu },
      { title: "Assets", url: "/assets", icon: Box },
      { title: "Projects", url: "/projects", icon: FolderKanban },
      { title: "Solutions", url: "/solutions", icon: Lightbulb },
      { title: "Innovation Lab", url: "/innovation", icon: Sparkles },
      { title: "Alerts", url: "/alerts", icon: Bell, badge: alerts.filter(a => !a.acknowledged).length },
      { title: "Users", url: "/users", icon: Users },
      { title: "Integrations", url: "/integrations", icon: Plug },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

function SidebarSection({ label, items, collapsed, location }: {
  label: string;
  items: typeof navGroups[0]["items"];
  collapsed: boolean;
  location: ReturnType<typeof useLocation>;
}) {
  const hasActive = items.some(item =>
    item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url)
  );
  const [open, setOpen] = useState(hasActive);

  if (collapsed) {
    return (
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <NavLink to={item.url} end={item.url === "/"} className="flex items-center justify-center px-2 py-2 rounded-md transition-colors hover:bg-sidebar-accent sidebar-glow" activeClassName="bg-sidebar-accent text-sidebar-primary">
                  <item.icon className="h-4 w-4 shrink-0" />
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 group cursor-pointer">
        <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
          {label}
        </span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground/40 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] transition-all hover:bg-sidebar-accent sidebar-glow"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="flex-1 truncate">{item.title}</span>
                    {"badge" in item && (item as any).badge > 0 && (
                      <Badge variant="destructive" className="h-4 min-w-[16px] text-[9px] px-1 rounded-full">
                        {(item as any).badge}
                      </Badge>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [weatherOpen, setWeatherOpen] = useState(false);
  const { weather } = useGlobalWeather();

  const currentTemp = weather?.current ? Math.round(weather.current.temperature) : null;
  const weatherInfo = weather?.current ? getWeatherInfo(weather.current.weatherCode) : null;
  const hvacRisk = weather?.current
    ? estimateHvacEfficiencyImpact(weather.current.temperature, weather.current.humidity).riskLevel
    : null;

  const riskDotColor: Record<string, string> = {
    low: "bg-primary",
    moderate: "bg-warning",
    high: "bg-chart-amber",
    extreme: "bg-destructive",
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-3 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shrink-0 cmd-glow overflow-hidden border border-primary/20">
              <img src={dcEvolveLogo} alt="DC Evolve" className="h-7 w-7 object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground tracking-wider uppercase">DC Evolve</span>
                <span className="text-[9px] text-muted-foreground tracking-wide">MISSION CONTROL</span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-1.5 space-y-1 no-scrollbar">
          {navGroups.map((group) => (
            <SidebarGroup key={group.label} className="py-0">
              <SidebarGroupContent>
                <SidebarSection label={group.label} items={group.items} collapsed={collapsed} location={location} />
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="p-2 space-y-2">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className="w-full border border-border/30 hover:bg-sidebar-accent relative h-9 text-xs"
            onClick={() => setWeatherOpen(true)}
          >
            <CloudSun className="h-3.5 w-3.5 shrink-0 opacity-70" />
            {!collapsed && (
              <div className="ml-2 flex items-center gap-2 flex-1 text-left">
                <span className="font-mono text-[13px]">
                  {currentTemp !== null ? `${currentTemp}°C` : "—"}
                </span>
                {weatherInfo && (
                  <span className="text-xs opacity-60">{weatherInfo.icon}</span>
                )}
              </div>
            )}
            {hvacRisk && (
              <span className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${riskDotColor[hvacRisk]} pulse-dot`} />
            )}
          </Button>
          {!collapsed && (
            <div className="px-3 py-2">
              <p className="text-[9px] text-muted-foreground/50 tracking-wider uppercase">Thermo Dynamics Engineering</p>
              <p className="text-[9px] text-muted-foreground/40 font-mono">v2.1.0</p>
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
