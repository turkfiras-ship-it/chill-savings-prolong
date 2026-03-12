import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plug, ArrowRight, CheckCircle, Clock, Zap, Database, Globe, Server } from "lucide-react";

const integrations = [
  { name: 'Eyedro Meter Ingestion', description: 'Real-time energy data feed from Eyedro monitoring hardware via API.', status: 'connected', icon: Zap },
  { name: 'Utility Bill Import', description: 'Automated utility bill parsing and import from SEC/SCECO invoices.', status: 'connected', icon: Database },
  { name: 'Webhook Notifications', description: 'Push alert events to external systems via configurable webhooks.', status: 'available', icon: Globe },
  { name: 'ERP / SAP Integration', description: 'Sync financial data, cost centers, and asset registers with SAP.', status: 'available', icon: Server },
  { name: 'CRM Integration', description: 'Push project pipeline and customer data to Salesforce or HubSpot.', status: 'coming_soon', icon: Database },
  { name: 'BMS / HVAC Protocol', description: 'BACnet/Modbus integration for direct building management system data.', status: 'available', icon: Server },
  { name: 'Export API', description: 'RESTful API for exporting energy data, reports, and analytics.', status: 'connected', icon: Globe },
  { name: 'Weather Data Feed', description: 'Automated weather normalization using WeatherSpark historical data.', status: 'connected', icon: Globe },
];

const statusBadge = (s: string) => s === 'connected' ? 'bg-primary/20 text-primary' : s === 'available' ? 'bg-energy/20 text-energy' : 'bg-muted text-muted-foreground';

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations & API</h1>
        <p className="text-sm text-muted-foreground mt-1">Enterprise-grade connectivity for meter data, billing, and external systems</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrations.map((int, i) => (
          <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                  <int.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Badge className={`text-[9px] ${statusBadge(int.status)}`}>{int.status === 'coming_soon' ? 'Coming Soon' : int.status}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{int.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{int.description}</p>
              </div>
              <Button size="sm" variant={int.status === 'connected' ? 'outline' : 'default'} className="w-full h-7 text-[10px]" disabled={int.status === 'coming_soon'}>
                {int.status === 'connected' ? 'Configure' : int.status === 'available' ? 'Connect' : 'Coming Soon'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
