import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Cpu, Wifi, WifiOff, AlertTriangle, RefreshCw, Radio } from "lucide-react";
import { KpiCard } from "@/components/platform/KpiCard";
import { EYEDRO_DEVICES, EYEDRO_SITE } from "@/data/eyedroDevices";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DevicesPage() {
  const total = EYEDRO_DEVICES.length;
  const active = EYEDRO_DEVICES.filter(d => d.state === "Active").length;

  const [feedStatus, setFeedStatus] = useState<"idle"|"loading"|"ok"|"error">("idle");
  const [feedError, setFeedError] = useState<string>("");
  const [lastPoll, setLastPoll] = useState<Date | null>(null);
  const [aliasCount, setAliasCount] = useState<number | null>(null);

  const pingLive = async () => {
    setFeedStatus("loading"); setFeedError("");
    try {
      const { data, error } = await supabase.functions.invoke("eyedro-proxy", {
        body: { command: "Alias.GetList", params: { IncludeCsv: "SiteId,BillProfileId,DevIdList" } },
      });
      if (error) throw error;
      setLastPoll(new Date());
      const aliases = data?.data?.AliasList || data?.data?.Aliases || data?.data?.Result?.AliasList;
      if (Array.isArray(aliases)) {
        setAliasCount(aliases.length);
        setFeedStatus("ok");
      } else {
        setFeedStatus("error");
        setFeedError("Login succeeds but Eyedro returned an empty payload — your User Key is not yet enabled for API access. Email support@eyedro.com to enable it.");
      }
    } catch (e: any) {
      setFeedStatus("error");
      // 503 from proxy = scrape disabled (Eyedro auth changed). Show friendly text.
      const ctx = e?.context;
      if (ctx?.status === 503 || /no SID|unavailable/i.test(e?.message || "")) {
        setFeedError("MyEyedro live scrape unavailable — Eyedro changed their dashboard auth. Import your CSV export from /monitoring instead.");
      } else {
        setFeedError(e?.message || "Request failed");
      }
    }
  };

  // Auto-poll disabled — endpoint is currently broken upstream. User can click "Poll Live Feed" to retry.
  // useEffect(() => { pingLive(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Devices & Meters</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} Eyedro monitors at {EYEDRO_SITE.label} (SiteId {EYEDRO_SITE.siteId})
          </p>
        </div>
        <Button onClick={pingLive} disabled={feedStatus === "loading"} size="sm" variant="outline">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${feedStatus === "loading" ? "animate-spin" : ""}`} />
          Poll Live Feed
        </Button>
      </div>

      <Alert className={feedStatus === "ok" ? "border-primary/40 bg-primary/5" : feedStatus === "error" ? "border-warning/40 bg-warning/5" : "border-border"}>
        <Radio className={`h-4 w-4 ${feedStatus === "ok" ? "text-primary" : feedStatus === "error" ? "text-warning" : ""}`} />
        <AlertDescription className="text-xs">
          <span className="font-mono">my.eyedro.com/ev501</span> →
          {feedStatus === "loading" && " connecting…"}
          {feedStatus === "ok" && ` LIVE — ${aliasCount} aliases received at ${lastPoll?.toLocaleTimeString()}`}
          {feedStatus === "error" && ` ${feedError}`}
          {feedStatus === "idle" && " idle"}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard title="Total Monitors" value={String(total)} icon={Cpu} />
        <KpiCard title="Active" value={String(active)} icon={Wifi} variant="savings" />
        <KpiCard title="Sensor Ports" value={String(total * 3)} icon={Radio} />
        <KpiCard title="Offline" value="0" icon={WifiOff} />
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Unit</TableHead>
              <TableHead className="text-xs">State</TableHead>
              <TableHead className="text-xs">Serial (Hex)</TableHead>
              <TableHead className="text-xs">Device ID</TableHead>
              <TableHead className="text-xs">Firmware</TableHead>
              <TableHead className="text-xs">Sensor DsIds</TableHead>
              <TableHead className="text-xs">Commissioned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EYEDRO_DEVICES.map(d => (
              <TableRow key={d.devId} className="hover:bg-secondary/50">
                <TableCell className="text-xs font-bold">{d.unit}</TableCell>
                <TableCell>
                  <Badge className="text-[9px] bg-primary/20 text-primary">
                    <Wifi className="h-2.5 w-2.5 mr-1" />{d.state}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-mono">{d.serialHex}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{d.devId}</TableCell>
                <TableCell className="text-xs font-mono">{d.firmware}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {d.sensors.filter(s => s.port !== "WiFi").map(s => s.dsId).join(" / ")}
                </TableCell>
                <TableCell className="text-xs">{new Date(d.startedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
