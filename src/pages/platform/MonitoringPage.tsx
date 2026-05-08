import { useState, useMemo } from "react";
import readXlsxFile from "read-excel-file/browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sites, monthlyTrends } from "@/data/mockData";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity, Zap, DollarSign, TrendingDown, Clock, Gauge, Upload, FileSpreadsheet, RotateCcw } from "lucide-react";
import { AnimatedKpiCard } from "@/components/platform/AnimatedKpiCard";
import { PageTransition } from "@/components/platform/PageTransition";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const timeRanges = ['Live', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

// Generate more realistic live data with smooth sine waves
const liveData = Array.from({ length: 60 }, (_, i) => ({
  time: `${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
  power: 280 + Math.sin(i / 5) * 40 + Math.random() * 30,
  demand: 300 + Math.cos(i / 8) * 50 + Math.random() * 20,
  baseline: 310,
}));

type SheetCell = string | number | boolean | Date | null | undefined;
type MonitorPoint = { time: string; power: number; demand: number; baseline: number; consumption?: number };
type ImportedDataset = { fileName: string; points: MonitorPoint[]; hasConsumption: boolean };

const IMPORT_STORAGE_KEY = "dc-evolve-eyedro-export";

const cellText = (cell: SheetCell) => (cell instanceof Date ? cell.toISOString() : String(cell ?? "")).trim();
const cleanLabel = (cell: SheetCell) => cellText(cell).toLowerCase().replace(/[^a-z0-9/%]+/g, " ").trim();

const toNumber = (cell: SheetCell) => {
  if (typeof cell === "number" && Number.isFinite(cell)) return cell;
  const value = cellText(cell).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return value ? Number(value[0]) : null;
};

const excelSerialToDate = (value: number) => new Date(Math.round((value - 25569) * 86400 * 1000));

const formatTimestamp = (value: SheetCell, index: number, fallback?: SheetCell) => {
  const primary = value instanceof Date ? value : typeof value === "number" && value > 20000 ? excelSerialToDate(value) : null;
  if (primary) return primary.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const joined = [cellText(value), cellText(fallback)].filter(Boolean).join(" ").trim();
  return joined || `Row ${index + 1}`;
};

const parseCsvRows = (text: string): SheetCell[][] => {
  const rows: SheetCell[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(value);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const parseEyedroRows = (rows: SheetCell[][]): ImportedDataset["points"] => {
  const headerIndex = rows.slice(0, 25).findIndex(row => {
    const labels = row.map(cleanLabel);
    return labels.some(label => /date|time|timestamp/.test(label)) && labels.some(label => /kw|kwh|power|demand|energy|usage|consumption/.test(label));
  });
  const headers = rows[Math.max(headerIndex, 0)]?.map(cleanLabel) ?? [];
  const findCol = (test: (label: string) => boolean) => headers.findIndex(test);
  const timestampCol = findCol(label => /timestamp|date time|datetime/.test(label));
  const dateCol = timestampCol >= 0 ? timestampCol : findCol(label => /date/.test(label));
  const timeCol = findCol(label => /time/.test(label) && !/runtime|uptime/.test(label));
  const energyCol = findCol(label => /kwh|energy|consumption|usage/.test(label));
  const demandCol = findCol(label => /demand|peak/.test(label));
  const powerCol = findCol(label => (/\bkw\b|power|load/.test(label) && !/kwh|factor|cost/.test(label))) >= 0
    ? findCol(label => (/\bkw\b|power|load/.test(label) && !/kwh|factor|cost/.test(label)))
    : demandCol;
  const valueCol = powerCol >= 0 ? powerCol : energyCol;
  if (valueCol < 0) return [];

  const dataRows = rows.slice(Math.max(headerIndex, 0) + 1);
  const points = dataRows.map((row, index) => {
    const power = toNumber(row[valueCol]);
    const consumption = energyCol >= 0 ? toNumber(row[energyCol]) : null;
    const demand = demandCol >= 0 ? toNumber(row[demandCol]) : power;
    if (power === null) return null;
    return {
      time: formatTimestamp(dateCol >= 0 ? row[dateCol] : null, index, timeCol >= 0 && timeCol !== dateCol ? row[timeCol] : null),
      power,
      demand: demand ?? power,
      baseline: Math.max(power, demand ?? power) * 1.08,
      consumption: consumption ?? undefined,
    };
  }).filter(Boolean) as MonitorPoint[];

  return points.slice(-500);
};

export default function MonitoringPage() {
  const [range, setRange] = useState('Live');
  const [selectedSite, setSelectedSite] = useState('all');
  const [importedData, setImportedData] = useState<ImportedDataset | null>(() => {
    try {
      const stored = localStorage.getItem(IMPORT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const { toast } = useToast();
  const activeSites = sites.filter(s => s.status === 'active');
  const site = selectedSite !== 'all' ? sites.find(s => s.id === selectedSite) : null;
  const importedPoints = importedData?.points ?? [];
  const hasImportedData = importedPoints.length > 0;
  const chartData = hasImportedData ? importedPoints.slice(-120) : liveData;
  const latestImported = importedPoints.at(-1);
  const importedPeak = hasImportedData ? Math.max(...importedPoints.map(d => Math.max(d.power, d.demand))) : 0;
  const currentPower = hasImportedData ? Math.round(latestImported?.power ?? 0) : site ? site.demand_kw : activeSites.reduce((a, s) => a + s.demand_kw, 0);
  const peakPower = hasImportedData ? Math.round(importedPeak) : site ? site.peak_kw : activeSites.reduce((a, s) => a + s.peak_kw, 0);
  const utilization = peakPower > 0 ? Math.round((currentPower / peakPower) * 100) : 0;
  const importedUsage = hasImportedData
    ? importedPoints.reduce((sum, point) => sum + (point.consumption ?? 0), 0)
    : null;
  const usageValue = hasImportedData && importedUsage ? Math.round(importedUsage) : Math.round(currentPower * 14);
  const consumptionTrend = hasImportedData && importedData?.hasConsumption ? chartData : monthlyTrends;
  const trendTimeKey = hasImportedData ? "time" : "month";

  const powerSpark = useMemo(() => chartData.slice(-20).map(d => ({ value: d.power })), [chartData]);
  const demandSpark = useMemo(() => chartData.slice(-20).map(d => ({ value: d.demand })), [chartData]);

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const rows = file.name.match(/\.csv$/i)
        ? parseCsvRows(await file.text())
        : (await readXlsxFile(file) as unknown as SheetCell[][]);
      const points = parseEyedroRows(rows);
      if (points.length < 2) throw new Error("No usable kW/kWh columns found");
      const dataset = { fileName: file.name, points, hasConsumption: points.some(point => point.consumption !== undefined) };
      localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(dataset));
      setImportedData(dataset);
      toast({ title: "Eyedro export loaded", description: `${points.length} monitoring rows extracted from ${file.name}.` });
    } catch (error) {
      toast({ title: "Could not read file", description: error instanceof Error ? error.message : "Upload the CSV/XLSX export from Eyedro.", variant: "destructive" });
    } finally {
      event.target.value = "";
    }
  };

  const clearImportedData = () => {
    localStorage.removeItem(IMPORT_STORAGE_KEY);
    setImportedData(null);
    toast({ title: "Live model restored", description: "Monitoring is back to the built-in live simulation." });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Real-Time Monitoring</h1>
            <p className="text-sm text-muted-foreground mt-1">Live power usage and historical data</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-muted">
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
              <Upload className="h-3.5 w-3.5 text-energy" />
              Import Export
            </label>
            {hasImportedData && (
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={clearImportedData}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            )}
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

        {hasImportedData && (
          <Card className="border-energy/30 bg-energy-light/40">
            <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs">
                <FileSpreadsheet className="h-4 w-4 text-energy" />
                <span className="font-medium text-foreground">{importedData?.fileName}</span>
                <span className="text-muted-foreground">{importedPoints.length} rows extracted locally</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">Eyedro export mode</span>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <AnimatedKpiCard title="Current Power" value={currentPower} suffix=" kW" icon={Activity} variant="energy" delay={0} sparkline={powerSpark} />
          <AnimatedKpiCard title="Peak Demand" value={peakPower} suffix=" kW" icon={Zap} variant="warning" delay={100} sparkline={demandSpark} />
          <AnimatedKpiCard title={hasImportedData ? "Imported Usage" : "Today's Usage"} value={usageValue} suffix=" kWh" icon={TrendingDown} delay={200} />
          <AnimatedKpiCard title="Est. Cost" value={Math.round(usageValue * 0.30)} suffix=" SAR" icon={DollarSign} variant="savings" delay={300} />
          <AnimatedKpiCard title="Utilization" value={utilization} suffix="%" icon={Gauge} variant={utilization > 85 ? 'danger' : utilization > 70 ? 'warning' : 'savings'} delay={400} />
          <AnimatedKpiCard title="Uptime" value={99.7} suffix="%" decimals={1} icon={Clock} variant="savings" delay={500} />
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-savings pulse-dot" />
              Power Demand — {range}
              <span className="ml-auto text-[10px] text-muted-foreground font-normal">
                {hasImportedData ? "Uploaded Eyedro Export" : selectedSite === 'all' ? 'All Sites Aggregated' : site?.name}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
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
                <Area type="monotone" dataKey="baseline" stroke="hsl(38, 92%, 50%)" fill="none" strokeWidth={1} strokeDasharray="2 4" name="Baseline (kW)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Consumption Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={consumptionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                  <XAxis dataKey={trendTimeKey} tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
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
                <LineChart data={hasImportedData ? chartData : monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                  <XAxis dataKey={trendTimeKey} tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(215, 20%, 16%)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="demand" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={false} name="kW" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
