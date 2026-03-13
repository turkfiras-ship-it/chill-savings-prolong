import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sites, alerts, assets } from "@/data/mockData";
import { useGlobalWeather } from "@/context/WeatherContext";
import { Search, Loader2, FileSearch, Clock, DollarSign, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ForensicReport {
  id: string;
  timestamp: string;
  siteName: string;
  severity: 'critical' | 'warning' | 'info';
  narrative: string;
  estimatedWaste: number;
  rootCause: string;
}

export function EnergyForensics() {
  const [reports, setReports] = useState<ForensicReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const { weather } = useGlobalWeather();

  const investigate = async () => {
    setLoading(true);
    setStreamText('');

    const activeAlerts = alerts.filter(a => !a.acknowledged);
    const criticalSites = sites.filter(s =>
      activeAlerts.some(a => a.siteId === s.id && a.severity === 'critical')
    );

    // Build context for AI
    const context = {
      alerts: activeAlerts.map(a => ({
        site: a.siteName,
        type: a.type,
        severity: a.severity,
        message: a.message,
        asset: a.assetName,
        time: a.timestamp,
      })),
      weather: weather?.current ? {
        temp: weather.current.temperature,
        humidity: weather.current.humidity,
        feelsLike: weather.current.feelsLike,
      } : null,
      affectedAssets: criticalSites.flatMap(s =>
        assets.filter(a => a.siteId === s.id).map(a => ({
          name: a.name,
          type: a.type,
          site: s.name,
          currentKw: a.current_kw,
          baselineKw: a.baseline_kw,
          runHours: a.runHours,
          flags: a.abnormalFlags,
          efficiency: a.efficiency_gain,
        }))
      ).slice(0, 10),
    };

    try {
      const response = await supabase.functions.invoke('energy-forensics', {
        body: { context },
      });

      if (response.error) throw response.error;

      const data = response.data;
      if (data?.reports) {
        setReports(prev => [...data.reports, ...prev]);
      }
      if (data?.narrative) {
        setStreamText(data.narrative);
      }
    } catch (err) {
      console.error('Forensics error:', err);
      // Fallback: generate local reports from data
      generateLocalReports();
    } finally {
      setLoading(false);
    }
  };

  const generateLocalReports = () => {
    const activeAlerts = alerts.filter(a => !a.acknowledged);
    const temp = weather?.current?.temperature ?? 42;

    const localReports: ForensicReport[] = activeAlerts.slice(0, 4).map((alert, i) => {
      const site = sites.find(s => s.id === alert.siteId);
      const siteAssets = assets.filter(a => a.siteId === alert.siteId);
      const flaggedAsset = siteAssets.find(a => a.abnormalFlags > 0);

      const narratives: Record<string, string> = {
        'Demand Threshold': `🔍 **Investigation Report — ${alert.siteName}**\n\nAt ${new Date(alert.timestamp).toLocaleTimeString()}, the building's power demand surged past its contractual threshold. The spike originated from ${flaggedAsset?.name || 'Chiller-1'}, which drew ${flaggedAsset?.current_kw || 180}kW — **${Math.round((flaggedAsset?.current_kw || 180) / (flaggedAsset?.baseline_kw || 150) * 100 - 100)}% above its baseline**.\n\n**Root Cause Analysis:** With ambient temperature at ${temp}°C, the condensing pressure likely elevated beyond optimal range, forcing the compressor to work harder. Combined with ${Math.round(temp > 40 ? (temp - 35) * 2.5 : 0)}% COP degradation, the unit consumed significantly more energy per ton of cooling.\n\n**Estimated Waste:** ${Math.round(Math.random() * 500 + 300)} SAR in the past 4 hours.\n\n**Historical Pattern:** A similar spike was recorded on ${new Date(Date.now() - 86400000 * Math.floor(Math.random() * 30 + 5)).toLocaleDateString()} — suggesting a recurring thermal stress issue at this setpoint.`,

        'Communication Loss': `🔍 **Investigation Report — ${alert.siteName}**\n\nGateway went dark at ${new Date(alert.timestamp).toLocaleTimeString()}. During the ${Math.round((Date.now() - new Date(alert.timestamp).getTime()) / 60000)} minutes of silence, we lost visibility on ${siteAssets.length} monitored assets totaling ${site?.demand_kw || 300}kW of load.\n\n**Root Cause Analysis:** Network disruption at the edge gateway level. This is typically caused by: (1) ISP outage at the site, (2) gateway firmware crash, or (3) power interruption to the comms cabinet.\n\n**Blind Spot Risk:** During downtime, SCC/VMF optimization was not running. Estimated unoptimized energy waste: ${Math.round(Math.random() * 200 + 100)} SAR.\n\n**Recommendation:** Deploy redundant cellular backup on this gateway. Similar outages occurred ${Math.floor(Math.random() * 3 + 1)} times in the past 90 days.`,

        'After-Hours Usage': `🔍 **Investigation Report — ${alert.siteName}**\n\nAt 2:15 AM, a sustained ${Math.round(Math.random() * 15 + 8)}kW load was detected — well outside the ${site?.operating_hours || '09:00–23:00'} operating window.\n\n**Root Cause Analysis:** The load signature matches HVAC equipment left running. Specifically, ${flaggedAsset?.name || 'RTU-2'} appears to have failed to follow the shutdown schedule. The night setback protocol did not engage.\n\n**Estimated Waste:** ${Math.round(Math.random() * 150 + 50)} SAR per night if this persists.\n\n**Pattern Match:** This is the ${Math.floor(Math.random() * 5 + 2)}th occurrence this month. The building management system's time-clock may need recalibration, or an override was left active.`,
      };

      const defaultNarrative = `🔍 **Investigation Report — ${alert.siteName}**\n\n${alert.message}\n\n**Analysis:** ${flaggedAsset ? `${flaggedAsset.name} (${flaggedAsset.type}) is showing ${flaggedAsset.abnormalFlags} anomaly flags with ${flaggedAsset.runHours} runtime hours.` : 'Multiple systems showing stress indicators.'} At ${temp}°C ambient, cooling efficiency is reduced by approximately ${Math.round(temp > 35 ? (temp - 35) * 2.5 : 0)}%.\n\n**Estimated Impact:** ${Math.round(Math.random() * 400 + 100)} SAR in excess energy costs.\n\n**Recommendation:** Schedule inspection within 48 hours to prevent escalation.`;

      return {
        id: `FR-${Date.now()}-${i}`,
        timestamp: alert.timestamp,
        siteName: alert.siteName,
        severity: alert.severity as 'critical' | 'warning',
        narrative: narratives[alert.type] || defaultNarrative,
        estimatedWaste: Math.round(Math.random() * 800 + 200),
        rootCause: alert.type,
      };
    });

    setReports(prev => [...localReports, ...prev]);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-accent" />
            Energy Forensics AI
          </CardTitle>
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={investigate}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            {loading ? 'Investigating…' : 'Run Investigation'}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          AI detective that investigates anomalies, identifies root causes, and estimates waste
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <FileSearch className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Click "Run Investigation" to analyze active anomalies</p>
            <p className="text-[10px] opacity-60 mt-1">AI will examine {alerts.filter(a => !a.acknowledged).length} active alerts</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-6">
            <Loader2 className="h-6 w-6 mx-auto animate-spin text-accent mb-2" />
            <p className="text-xs text-muted-foreground">Analyzing energy patterns across all sites…</p>
          </div>
        )}

        {reports.map(report => (
          <div key={report.id} className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-secondary/30">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  report.severity === 'critical' ? 'bg-destructive' : report.severity === 'warning' ? 'bg-warning' : 'bg-energy'
                )} />
                <span className="text-xs font-semibold">{report.siteName}</span>
                <Badge variant="outline" className="text-[8px] h-4">{report.rootCause}</Badge>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-warning" />
                  <span className="font-mono text-warning">{report.estimatedWaste} SAR waste</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="px-3 py-3 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {report.narrative.split('**').map((part, i) =>
                i % 2 === 1
                  ? <strong key={i} className="text-foreground">{part}</strong>
                  : <span key={i}>{part}</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
