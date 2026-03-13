import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Activity, MapPin, Cpu, Box, FolderKanban,
  Lightbulb, Bell, FileText, Receipt, TrendingUp, Users,
  Plug, Settings, CloudSun, Search, Brain, Sparkles
} from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { sites, alerts, projects } from "@/data/mockData";

const navRoutes = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, keywords: "home overview command center" },
  { name: "Monitoring", path: "/monitoring", icon: Activity, keywords: "live power real-time energy" },
  { name: "Weather Intel", path: "/weather", icon: CloudSun, keywords: "weather temperature hvac" },
  { name: "Sites", path: "/sites", icon: MapPin, keywords: "buildings locations portfolio" },
  { name: "Devices", path: "/devices", icon: Cpu, keywords: "meters gateways sensors iot" },
  { name: "Assets", path: "/assets", icon: Box, keywords: "equipment hvac chiller rtu" },
  { name: "Projects", path: "/projects", icon: FolderKanban, keywords: "pipeline esco proposals" },
  { name: "Solutions", path: "/solutions", icon: Lightbulb, keywords: "scc vmf optimization" },
  { name: "Alerts", path: "/alerts", icon: Bell, keywords: "warnings notifications critical" },
  { name: "Reports", path: "/reports", icon: FileText, keywords: "m&v billing documents" },
  { name: "Billing", path: "/billing", icon: Receipt, keywords: "invoices tariff cost" },
  { name: "Savings & ROI", path: "/savings", icon: TrendingUp, keywords: "roi return investment payback" },
  { name: "Users", path: "/users", icon: Users, keywords: "team members access" },
  { name: "Integrations", path: "/integrations", icon: Plug, keywords: "api connect eyedro" },
  { name: "Settings", path: "/settings", icon: Settings, keywords: "config preferences" },
  { name: "AI Anomaly Detection", path: "/anomaly-detection", icon: Brain, keywords: "ai anomaly detection intelligence" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  const activeSites = sites.filter(s => s.status === "active");
  const criticalAlerts = alerts.filter(a => a.severity === "critical" && !a.acknowledged);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, sites, alerts..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {navRoutes.map(r => (
            <CommandItem key={r.path} onSelect={() => go(r.path)} keywords={[r.keywords]}>
              <r.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{r.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Active Sites">
          {activeSites.slice(0, 8).map(s => (
            <CommandItem key={s.id} onSelect={() => go(`/sites/${s.id}`)} keywords={[s.city, s.customer, s.type]}>
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{s.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{s.city}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {criticalAlerts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Critical Alerts">
              {criticalAlerts.map(a => (
                <CommandItem key={a.id} onSelect={() => go("/alerts")} keywords={[a.type, a.siteName]}>
                  <Bell className="mr-2 h-4 w-4 text-destructive" />
                  <span className="truncate">{a.message}</span>
                  <span className="ml-auto text-[10px] text-destructive">{a.siteName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
