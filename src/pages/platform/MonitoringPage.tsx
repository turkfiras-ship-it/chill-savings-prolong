import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sites, monthlyTrends } from "@/data/mockData";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity, Zap, DollarSign, TrendingDown } from "lucide-react";
import { KpiCard } from "@/components/platform/KpiCard";

const timeRanges = ['Live', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
const liveData = Array.from({ length: 60 }, (_, i) => ({
  time: `${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
  power: 280 + Math.sin(i / 5) * 40 + Math.random() * 30,
  demand: 300 + Math.cos(i / 8) * 50 + Math.random() * 20,
}));

export default function MonitoringPage() {
  const [range, setRange] = useState('Live');
  const [selectedSite, setSelectedSite] = useState('all');
  const activeSites = sites.filter(s => s.status === 'active');
  const site = selectedSite !== 'all' ? sites.find(s => s.id === selectedSite) : null;
  const currentPower = site ? site.demand_kw : activeSites.reduce((a, s) => a + s.demand_kw, 0);
  const peakPower = site ? site.peak_kw : activeSites.reduce((a, s) => a + s.peak_kw, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Real-Time Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">Live power usage and historical data</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {activeSites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-1 bg-secondary rounded-md p-0.5">
            {timeRanges.map(r => (
              <Button key={r} size="sm" variant={range === r ? 'default' : 'ghost'} className="h-7 text-xs px-2.5" onClick={() => setRange(r)}>
                {r}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard title="Current Power" value={`${currentPower.toLocaleString()} kW`} icon={Activity} variant="energy" />
        <KpiCard title="Peak Demand" value={`${peakPower.toLocaleString()} kW`} icon={Zap} variant="warning" />
        <KpiCard title="Today's Consumption" value={`${Math.round(currentPower * 14).toLocaleString()} kWh`} icon={TrendingDown} />
        <KpiCard title="Est. Today's Cost" value={`${Math.round(currentPower * 14 * 0.30).toLocaleString()} SAR`} icon={DollarSign} variant="savings" />
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary pulse-dot" />
            Power Demand — {range}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={liveData}>
              <defs>
                <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(192, 70%, 50%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(192, 70%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} unit=" kW" />
              <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="power" stroke="hsl(192, 70%, 50%)" fill="url(#pGrad)" strokeWidth={2} name="Power (kW)" />
              <Area type="monotone" dataKey="demand" stroke="hsl(152, 60%, 48%)" fill="none" strokeWidth={1.5} strokeDasharray="5 5" name="Demand (kW)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Consumption Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="consumption" stroke="hsl(210, 80%, 55%)" strokeWidth={2} dot={false} name="kWh" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Demand Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="demand" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={false} name="kW" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
