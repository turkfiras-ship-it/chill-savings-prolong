import { projects } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/platform/KpiCard";
import { FolderKanban, DollarSign, TrendingUp, Clock } from "lucide-react";

const stageOrder = ['Lead', 'Site Survey Scheduled', 'Survey Complete', 'Audit Complete', 'Proposal Sent', 'Approved', 'Installation Planned', 'Installation Complete', 'Monitoring Live', 'M&V / Verification', 'Closed / Renewed'];
const stageColor: Record<string, string> = {
  'Lead': 'bg-muted text-muted-foreground',
  'Site Survey Scheduled': 'bg-energy/20 text-energy',
  'Survey Complete': 'bg-energy/20 text-energy',
  'Audit Complete': 'bg-energy/30 text-energy',
  'Proposal Sent': 'bg-warning/20 text-warning',
  'Approved': 'bg-primary/20 text-primary',
  'Installation Planned': 'bg-primary/20 text-primary',
  'Installation Complete': 'bg-primary/30 text-primary',
  'Monitoring Live': 'bg-primary/40 text-primary',
  'M&V / Verification': 'bg-chart-purple/20 text-chart-purple',
  'Closed / Renewed': 'bg-muted text-muted-foreground',
};

export default function ProjectsPage() {
  const totalValue = projects.reduce((a, p) => a + p.value_sar, 0);
  const totalExpSavings = projects.reduce((a, p) => a + p.expected_savings, 0);
  const activeProjects = projects.filter(p => !['Closed / Renewed'].includes(p.stage)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ESCO Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">Full project lifecycle — Lead to Verification</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard title="Total Projects" value={String(projects.length)} icon={FolderKanban} />
        <KpiCard title="Active Pipeline" value={String(activeProjects)} icon={Clock} variant="energy" />
        <KpiCard title="Portfolio Value" value={`${(totalValue / 1e6).toFixed(1)}M SAR`} icon={DollarSign} />
        <KpiCard title="Expected Savings" value={`${(totalExpSavings / 1000).toFixed(0)}K SAR/yr`} icon={TrendingUp} variant="savings" />
      </div>

      {/* Pipeline view */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pipeline</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {stageOrder.map(stage => {
            const stageProjects = projects.filter(p => p.stage === stage);
            return (
              <div key={stage} className="min-w-[220px] max-w-[220px] shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium truncate">{stage}</span>
                  <Badge variant="outline" className="text-[9px] h-4">{stageProjects.length}</Badge>
                </div>
                <div className="space-y-2">
                  {stageProjects.map(p => (
                    <Card key={p.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-xs font-semibold truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.customer}</p>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{p.value_sar.toLocaleString()} SAR</span>
                          <span className="text-savings">{p.expected_savings > 0 ? `${p.expected_savings.toLocaleString()} SAR/yr` : 'TBD'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{p.assigned}</span>
                          {p.payback_years > 0 && <span className="font-mono">{p.payback_years}yr payback</span>}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {p.products.map(pr => <Badge key={pr} variant="outline" className="text-[8px] h-4">{pr}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageProjects.length === 0 && (
                    <div className="border border-dashed border-border rounded-md p-4 text-center">
                      <p className="text-[10px] text-muted-foreground">No projects</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
