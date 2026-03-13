import { Bell, Search, User, SidebarIcon, Monitor, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";
import { alerts } from "@/data/mockData";
import { CommandPalette } from "./CommandPalette";
import { useViewMode } from "@/context/ViewModeContext";

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const unackAlerts = alerts.filter(a => !a.acknowledged).length;
  const { viewMode, setViewMode } = useViewMode();

  return (
    <>
      <CommandPalette />
      <header className="h-11 border-b border-border/50 bg-card/30 backdrop-blur-md flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <SidebarIcon className="h-3.5 w-3.5" />
          </Button>
          <div className="hidden md:flex items-center h-7 rounded-md bg-secondary/50 border border-border/30">
            <Search className="h-3 w-3 text-muted-foreground/60 ml-2.5" />
            <Input
              placeholder="Search… ⌘K"
              className="h-7 w-56 pl-2 text-[11px] bg-transparent border-0 focus-visible:ring-0 text-muted-foreground placeholder:text-muted-foreground/40"
              readOnly
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-secondary/40 rounded-md border border-border/30 p-0.5 mr-2">
            <button
              onClick={() => setViewMode("command")}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                viewMode === "command"
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor className="h-3 w-3" /> Command
            </button>
            <button
              onClick={() => setViewMode("executive")}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                viewMode === "executive"
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="h-3 w-3" /> Executive
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <div className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
            <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">Live</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 relative text-muted-foreground hover:text-foreground">
            <Bell className="h-3.5 w-3.5" />
            {unackAlerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] rounded-full bg-destructive text-[8px] text-destructive-foreground flex items-center justify-center px-1">
                {unackAlerts}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <User className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>
    </>
  );
}
