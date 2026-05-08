import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Download, Activity, Zap, Gauge, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { EyedroDevice } from "@/data/eyedroDevices";

type Reading = {
  ts: string;
  power_kw: number | null;
  energy_kwh: number | null;
  voltage: number | null;
  current_a: number | null;
};

const RANGES = [
  { id: "live", label: "Live (last 200)", since: null as null | number, limit: 200 },
  { id: "1h",  label: "1 Hour",   since: 60 * 60 * 1000,            limit: 2000 },
  { id: "24h", label: "24 Hours", since: 24 * 60 * 60 * 1000,       limit: 5000 },
  { id: "7d",  label: "7 Days",   since: 7 * 24 * 60 * 60 * 1000,   limit: 10000 },
  { id: "30d", label: "30 Days",  since: 30 * 24 * 60 * 60 * 1000,  limit: 20000 },
];

export function DeviceDetailDialog({
  device,
  open,
  onOpenChange,
}: {
  device: EyedroDevice | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [rangeId, setRangeId] = useState("24h");
  const [rows, setRows] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);

  const range = RANGES.find(r => r.id === rangeId)!;

  useEffect(() => {
    if (!device || !open) return;
    let cancelled = false;
    setLoading(true);
    const q = supabase
      .from("eyedro_readings")
      .select("ts,power_kw,energy_kwh,voltage,current_a")
      .eq("device_serial", device.serialHex)
      .order("ts", { ascending: false })
      .limit(range.limit);
    const promise = range.since
      ? q.gte("ts", new Date(Date.now() - range.since).toISOString())
      : q;
    promise.then(({ data }) => {
      if (cancelled) return;
      setRows(((data ?? []) as Reading[]).slice().reverse());
      setLoading(false);
    });

    const channel = supabase
      .channel(`eyedro-dev-${device.serialHex}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "eyedro_readings", filter: `device_serial=eq.${device.serialHex}` },
        (payload) => {
          const r = payload.new as Reading;
          setRows(prev => [...prev.slice(-(range.limit - 1)), r]);
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [device, open, rangeId, range.limit, range.since]);

  const chartData = useMemo(
    () =>
      rows.map(r => ({
        time: new Date(r.ts).toLocaleTimeString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" } as any),
        power: Number(r.power_kw ?? 0),
        energy: r.energy_kwh != null ? Number(r.energy_kwh) : null,
      })),
    [rows],
  );

  const stats = useMemo(() => {
    if (!rows.length) return { current: 0, peak: 0, avg: 0, total: 0 };
    const powers = rows.map(r => Number(r.power_kw ?? 0));
    const energies = rows.map(r => (r.energy_kwh != null ? Number(r.energy_kwh) : null)).filter((x): x is number => x !== null);
    const total = energies.length >= 2 ? Math.max(0, energies[energies.length - 1] - energies[0]) : 0;
    return {
      current: powers[powers.length - 1],
      peak: Math.max(...powers),
      avg: powers.reduce((a, b) => a + b, 0) / powers.length,
      total,
    };
  }, [rows]);

  const downloadCsv = () => {
    if (!device) return;
    const header = "timestamp,power_kw,energy_kwh,voltage,current_a\n";
    const body = rows
      .map(r => [r.ts, r.power_kw ?? "", r.energy_kwh ?? "", r.voltage ?? "", r.current_a ?? ""].join(","))
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eyedro_${device.unit}_${device.serialHex}_${range.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-base">{device.unit}</span>
            <span className="text-xs font-mono text-muted-foreground">{device.serialHex}</span>
            <span className="text-[10px] text-muted-foreground font-normal ml-auto">
              FW {device.firmware} · DevId {device.devId}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-secondary rounded-md p-0.5">
            {RANGES.map(r => (
              <Button
                key={r.id}
                size="sm"
                variant={rangeId === r.id ? "default" : "ghost"}
                className="h-7 text-xs px-2.5"
                onClick={() => setRangeId(r.id)}
              >
                {r.label}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="ml-auto h-8 text-xs" onClick={downloadCsv} disabled={!rows.length}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV ({rows.length})
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Stat icon={Activity} label="Current" value={`${stats.current.toFixed(2)} kW`} tone="energy" />
          <Stat icon={Zap} label="Peak" value={`${stats.peak.toFixed(2)} kW`} tone="warning" />
          <Stat icon={Gauge} label="Average" value={`${stats.avg.toFixed(2)} kW`} />
          <Stat icon={TrendingUp} label="Total Used" value={`${stats.total.toFixed(1)} kWh`} tone="savings" />
        </div>

        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs font-medium mb-2">Power Demand · {range.label}</div>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading readings…
            </div>
          ) : rows.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-xs">
              No readings recorded for this device in the selected window.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`devGrad-${device.serialHex}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(192, 70%, 50%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(192, 70%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} unit=" kW" />
                <Tooltip contentStyle={{ background: "hsl(222, 40%, 9%)", border: "1px solid hsl(215, 20%, 16%)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="power" stroke="hsl(192, 70%, 50%)" fill={`url(#devGrad-${device.serialHex})`} strokeWidth={2} name="Power (kW)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs font-medium mb-2">Recent Readings (last 25)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="text-left py-1 pr-3">Timestamp</th>
                  <th className="text-right py-1 pr-3">kW</th>
                  <th className="text-right py-1 pr-3">kWh</th>
                  <th className="text-right py-1 pr-3">V</th>
                  <th className="text-right py-1">A</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(-25).reverse().map((r, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="py-1 pr-3">{new Date(r.ts).toLocaleString()}</td>
                    <td className="py-1 pr-3 text-right tabular-nums">{r.power_kw != null ? Number(r.power_kw).toFixed(3) : "—"}</td>
                    <td className="py-1 pr-3 text-right tabular-nums">{r.energy_kwh != null ? Number(r.energy_kwh).toFixed(2) : "—"}</td>
                    <td className="py-1 pr-3 text-right tabular-nums">{r.voltage != null ? Number(r.voltage).toFixed(1) : "—"}</td>
                    <td className="py-1 text-right tabular-nums">{r.current_a != null ? Number(r.current_a).toFixed(2) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone?: "energy" | "warning" | "savings" }) {
  const color =
    tone === "energy" ? "text-energy" :
    tone === "warning" ? "text-warning" :
    tone === "savings" ? "text-savings" : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-2.5">
      <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground">
        <span>{label}</span>
        <Icon className={`h-3 w-3 ${color}`} />
      </div>
      <div className={`font-mono text-base font-bold mt-1 tabular-nums ${color}`}>{value}</div>
    </div>
  );
}