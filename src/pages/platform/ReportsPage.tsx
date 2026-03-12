import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, Mail, BarChart3, Building2, DollarSign, Leaf } from "lucide-react";

const reportTypes = [
  { name: 'Monthly Energy Report', icon: BarChart3, frequency: 'Monthly', lastGenerated: '2025-02-01', status: 'ready' },
  { name: 'Site Performance Report', icon: Building2, frequency: 'Weekly', lastGenerated: '2025-03-10', status: 'ready' },
  { name: 'Savings Verification (M&V)', icon: DollarSign, frequency: 'Quarterly', lastGenerated: '2025-01-15', status: 'ready' },
  { name: 'Portfolio Summary', icon: BarChart3, frequency: 'Monthly', lastGenerated: '2025-02-28', status: 'ready' },
  { name: 'Demand Analysis Report', icon: BarChart3, frequency: 'Monthly', lastGenerated: '2025-03-01', status: 'ready' },
  { name: 'Billing / Tenant Report', icon: DollarSign, frequency: 'Monthly', lastGenerated: '2025-03-01', status: 'ready' },
  { name: 'Carbon Impact Report', icon: Leaf, frequency: 'Quarterly', lastGenerated: '2025-01-15', status: 'ready' },
  { name: 'Daily Consumption Log', icon: FileText, frequency: 'Daily', lastGenerated: '2025-03-12', status: 'generating' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Configurable reporting for sites, portfolios, and savings verification</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs"><Calendar className="h-3.5 w-3.5 mr-1.5" />Schedule</Button>
          <Button size="sm" className="h-8 text-xs"><Mail className="h-3.5 w-3.5 mr-1.5" />Email Setup</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((r, i) => (
          <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                  <r.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Badge variant="outline" className="text-[9px]">{r.frequency}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{r.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-1">Last: {r.lastGenerated}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1"><Download className="h-3 w-3 mr-1" />PDF</Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1"><Download className="h-3 w-3 mr-1" />CSV</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
