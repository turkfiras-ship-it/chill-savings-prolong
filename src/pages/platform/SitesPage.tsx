import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sites } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Search, Grid3X3, List, Zap, Map } from "lucide-react";
import { SiteMapView } from "@/components/platform/SiteMapView";

export default function SitesPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const filtered = sites.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase()));

  const statusColor = (s: string) => s === 'active' ? 'bg-primary/20 text-primary' : s === 'pending' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sites</h1>
          <p className="text-sm text-muted-foreground mt-1">{sites.length} locations across Saudi Arabia</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search sites..." className="h-8 w-48 pl-8 text-xs bg-secondary border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-0.5 bg-secondary rounded-md p-0.5">
            <Button size="sm" variant={view === 'grid' ? 'default' : 'ghost'} className="h-7 w-7 p-0" onClick={() => setView('grid')}><Grid3X3 className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant={view === 'table' ? 'default' : 'ghost'} className="h-7 w-7 p-0" onClick={() => setView('table')}><List className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <Card key={s.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/sites/${s.id}`)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{s.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{s.city}</p>
                  </div>
                  <Badge className={`text-[10px] ${statusColor(s.status)}`}>{s.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-secondary rounded-md p-2">
                    <p className="text-[10px] text-muted-foreground">Consumption</p>
                    <p className="text-xs font-bold">{(s.consumption_kwh / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-secondary rounded-md p-2">
                    <p className="text-[10px] text-muted-foreground">Savings</p>
                    <p className="text-xs font-bold text-savings">{s.savings_pct > 0 ? `${s.savings_pct}%` : '—'}</p>
                  </div>
                  <div className="bg-secondary rounded-md p-2">
                    <p className="text-[10px] text-muted-foreground">Demand</p>
                    <p className="text-xs font-bold">{s.demand_kw} kW</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.devices} devices · {s.assets} assets</span>
                  <span>{s.customer}</span>
                </div>
                {s.solutions.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {s.solutions.map(sol => <Badge key={sol} variant="outline" className="text-[9px] h-5">{sol}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Site</TableHead>
                <TableHead className="text-xs">City</TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Consumption</TableHead>
                <TableHead className="text-xs text-right">Savings</TableHead>
                <TableHead className="text-xs text-right">Demand</TableHead>
                <TableHead className="text-xs">Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/sites/${s.id}`)}>
                  <TableCell className="text-xs font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs">{s.city}</TableCell>
                  <TableCell className="text-xs">{s.customer}</TableCell>
                  <TableCell><Badge className={`text-[9px] ${statusColor(s.status)}`}>{s.status}</Badge></TableCell>
                  <TableCell className="text-xs text-right font-mono">{(s.consumption_kwh / 1000).toFixed(0)}K kWh</TableCell>
                  <TableCell className="text-xs text-right font-mono text-savings">{s.savings_pct > 0 ? `${s.savings_pct}%` : '—'}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{s.demand_kw} kW</TableCell>
                  <TableCell className="text-xs">{s.projectStage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
