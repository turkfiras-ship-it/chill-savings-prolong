import { useState } from "react";
import { useWeather } from "@/hooks/useWeather";
import { getWeatherInfo, estimateHvacEfficiencyImpact, estimateCoolingLoadMultiplier } from "@/lib/weatherService";
import { sites } from "@/data/mockData";
import { Cloud, Thermometer, Droplets, Wind, Sun, ChevronDown, ChevronUp, RefreshCw, MapPin, AlertTriangle, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const siteLocations = sites.filter(s => s.status === 'active').map(s => ({ id: s.id, name: s.name, city: s.city, lat: s.lat, lng: s.lng }));

export function WeatherWidget() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedSite, setSelectedSite] = useState(siteLocations[0]);
  const { weather, loading, error, refresh } = useWeather({ lat: selectedSite.lat, lng: selectedSite.lng, name: selectedSite.city });

  const handleSiteChange = (siteId: string) => {
    const site = siteLocations.find(s => s.id === siteId);
    if (site) setSelectedSite(site);
  };

  if (loading && !weather) {
    return (
      <div className="rounded-lg bg-secondary/50 p-3 animate-pulse">
        <div className="h-3 bg-muted rounded w-20 mb-2" />
        <div className="h-6 bg-muted rounded w-16 mb-1" />
        <div className="h-2 bg-muted rounded w-24" />
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="rounded-lg bg-secondary/50 p-3">
        <p className="text-[10px] text-destructive">Weather unavailable</p>
      </div>
    );
  }

  if (!weather) return null;

  const info = getWeatherInfo(weather.current.weatherCode);
  const hvacImpact = estimateHvacEfficiencyImpact(weather.current.temperature, weather.current.humidity);
  const coolingMultiplier = estimateCoolingLoadMultiplier(weather.current.temperature);

  const riskColors = {
    low: 'text-savings border-savings/30 bg-savings/5',
    moderate: 'text-warning border-warning/30 bg-warning/5',
    high: 'text-orange-400 border-orange-400/30 bg-orange-400/5',
    extreme: 'text-destructive border-destructive/30 bg-destructive/5',
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg bg-secondary/50 border border-border overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 hover:bg-secondary/80 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-lg">{info.icon}</span>
              <div className="text-left">
                <p className="text-sm font-bold">{Math.round(weather.current.temperature)}°C</p>
                <p className="text-[9px] text-muted-foreground">{selectedSite.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={`text-[8px] h-4 px-1 ${riskColors[hvacImpact.riskLevel]}`}>
                {hvacImpact.riskLevel.toUpperCase()}
              </Badge>
              {isOpen ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {/* Site Selector */}
            <Select value={selectedSite.id} onValueChange={handleSiteChange}>
              <SelectTrigger className="h-7 text-[10px] bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {siteLocations.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-[10px]">
                    <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{s.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Current Conditions */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-medium">Current Conditions</p>
              <p className="text-[10px] text-muted-foreground">{info.label}</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Thermometer className="h-3 w-3 text-warning" />
                  <span>Feels {Math.round(weather.current.feelsLike)}°C</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Droplets className="h-3 w-3 text-energy" />
                  <span>{weather.current.humidity}% RH</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Wind className="h-3 w-3 text-muted-foreground" />
                  <span>{Math.round(weather.current.windSpeed)} km/h</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Sun className="h-3 w-3 text-warning" />
                  <span>UV {weather.current.uvIndex}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Cloud className="h-3 w-3 text-muted-foreground" />
                  <span>{weather.current.cloudCover}% cover</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Gauge className="h-3 w-3 text-muted-foreground" />
                  <span>{Math.round(weather.current.pressure)} hPa</span>
                </div>
              </div>
            </div>

            {/* HVAC Impact Panel */}
            <div className={`rounded-md border p-2 ${riskColors[hvacImpact.riskLevel]}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3 w-3" />
                <p className="text-[10px] font-semibold">HVAC Impact</p>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <span>Load increase: <strong>+{hvacImpact.loadIncrease}%</strong></span>
                <span>COP reduction: <strong>-{hvacImpact.copReduction}%</strong></span>
                {coolingMultiplier > 0 && <span className="col-span-2">Cooling multiplier: <strong>{coolingMultiplier}x</strong></span>}
              </div>
              <p className="text-[9px] mt-1 opacity-80">{hvacImpact.recommendation}</p>
            </div>

            {/* 7-Day Forecast */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-medium">7-Day Forecast</p>
              <div className="space-y-1">
                {weather.daily.slice(0, 7).map((day, i) => {
                  const dayInfo = getWeatherInfo(day.weatherCode);
                  const dayName = i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
                  return (
                    <div key={day.date} className="flex items-center justify-between text-[10px]">
                      <span className="w-10 text-muted-foreground">{dayName}</span>
                      <span className="text-xs">{dayInfo.icon}</span>
                      <div className="flex items-center gap-1 w-20 justify-end">
                        <span className="text-muted-foreground">{Math.round(day.tempMin)}°</span>
                        <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-energy to-warning"
                            style={{ width: `${Math.min(100, ((day.tempMax - day.tempMin) / 20) * 100)}%` }}
                          />
                        </div>
                        <span className="font-medium">{Math.round(day.tempMax)}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hourly Preview */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-medium">Next 12 Hours</p>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {weather.hourly.slice(0, 12).map((h, i) => {
                  const hourInfo = getWeatherInfo(h.weatherCode);
                  const hour = new Date(h.time).getHours();
                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center gap-0.5 min-w-[28px] text-[9px] cursor-default">
                          <span className="text-muted-foreground">{hour}h</span>
                          <span className="text-xs">{hourInfo.icon}</span>
                          <span className="font-medium">{Math.round(h.temperature)}°</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-[10px]">
                        <p>{hourInfo.label} · {h.humidity}% RH · Wind {Math.round(h.windSpeed)} km/h</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[8px] text-muted-foreground">
                Updated {new Date(weather.fetchedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => refresh()}>
                <RefreshCw className="h-2.5 w-2.5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}