import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Thermometer, Snowflake, Sun, ArrowRight, CheckCircle } from "lucide-react";
import { sites } from "@/data/mockData";

const solutions = [
  {
    id: 'scc',
    name: 'Smart Compressor Control (SCC/VMF)',
    icon: Thermometer,
    description: 'Variable Mass Flow technology that dynamically optimizes compressor operation in real-time, reducing energy consumption by 12–25% while maintaining cooling performance.',
    targets: ['Rooftop Units (RTUs)', 'Split AC Systems', 'Packaged Units', 'Multi-compressor Racks'],
    savingsRange: '12–25%',
    payback: '2.5–4.5 years',
    deploySites: sites.filter(s => s.solutions.includes('SCC/VMF')).length,
    features: ['Real-time compressor staging', 'Adaptive load matching', 'Sub-cooling optimization', 'Anti-short-cycling protection', 'Remote monitoring integration'],
  },
  {
    id: 'refrig',
    name: 'Refrigeration Optimization',
    icon: Snowflake,
    description: 'Advanced control algorithms for commercial refrigeration systems that reduce energy waste while maintaining precise temperature control for food safety compliance.',
    targets: ['Cold Rooms', 'Display Cases', 'Walk-in Freezers', 'Refrigeration Racks'],
    savingsRange: '15–30%',
    payback: '1.5–3.0 years',
    deploySites: sites.filter(s => s.solutions.includes('Refrigeration Optimization')).length,
    features: ['Defrost optimization', 'Floating suction pressure', 'Night setback scheduling', 'Temperature fault detection', 'Compliance logging'],
  },
  {
    id: 'solar',
    name: 'Solar Thermal Integration',
    icon: Sun,
    description: 'Hybrid solar thermal systems that offset cooling energy demand by leveraging solar absorption for pre-cooling and hot water generation, ideal for high-ambient regions.',
    targets: ['Hospital HVAC Systems', 'Hotel Hot Water', 'Industrial Process Cooling', 'District Cooling Plants'],
    savingsRange: '20–40%',
    payback: '3.0–5.0 years',
    deploySites: sites.filter(s => s.solutions.includes('Solar Thermal')).length,
    features: ['Solar absorption chilling', 'Thermal storage integration', 'Hybrid electric/solar modes', 'Peak demand shaving', 'Carbon offset tracking'],
  },
];

export default function SolutionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Energy Solutions</h1>
        <p className="text-sm text-muted-foreground mt-1">HVAC-R optimization products for commercial and industrial applications</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {solutions.map(sol => (
          <Card key={sol.id} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <sol.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px]">{sol.deploySites} deployments</Badge>
              </div>
              <CardTitle className="text-base">{sol.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">{sol.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-md p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Expected Savings</p>
                  <p className="text-lg font-bold text-savings">{sol.savingsRange}</p>
                </div>
                <div className="bg-secondary rounded-md p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Typical Payback</p>
                  <p className="text-lg font-bold text-energy">{sol.payback}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Target Applications</p>
                <div className="flex flex-wrap gap-1">
                  {sol.targets.map(t => <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Key Features</p>
                <div className="space-y-1">
                  {sol.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
