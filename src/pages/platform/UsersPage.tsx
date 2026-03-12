import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, Shield, UserPlus, Eye, Edit, Settings } from "lucide-react";
import { KpiCard } from "@/components/platform/KpiCard";

const users = [
  { id: 1, name: 'Ahmed Al-Rashid', email: 'ahmed@thermodynamics.sa', role: 'Super Admin', status: 'active', lastActive: '2025-03-12', sites: 'All' },
  { id: 2, name: 'Khalid Al-Dosari', email: 'khalid@thermodynamics.sa', role: 'ESCO Admin', status: 'active', lastActive: '2025-03-12', sites: 'All' },
  { id: 3, name: 'Omar Bin Faisal', email: 'omar@thermodynamics.sa', role: 'Operations Manager', status: 'active', lastActive: '2025-03-11', sites: '12 sites' },
  { id: 4, name: 'Faisal Al-Harbi', email: 'faisal@thermodynamics.sa', role: 'Engineer', status: 'active', lastActive: '2025-03-12', sites: '8 sites' },
  { id: 5, name: 'Mohammed Jarir', email: 'mohammed@jarir.com', role: 'Client Viewer', status: 'active', lastActive: '2025-03-10', sites: '6 sites (Jarir)' },
  { id: 6, name: 'Sara Al-Othaim', email: 'sara@othaim.com', role: 'Client Viewer', status: 'active', lastActive: '2025-03-08', sites: '2 sites (Al Othaim)' },
  { id: 7, name: 'Yusuf Khan', email: 'yusuf@thermodynamics.sa', role: 'Finance / Billing', status: 'active', lastActive: '2025-03-11', sites: 'All' },
  { id: 8, name: 'Ali Panda', email: 'ali@panda.sa', role: 'Tenant Viewer', status: 'invited', lastActive: '—', sites: '2 sites (Panda)' },
];

const roleBadge: Record<string, string> = {
  'Super Admin': 'bg-destructive/20 text-destructive',
  'ESCO Admin': 'bg-warning/20 text-warning',
  'Operations Manager': 'bg-energy/20 text-energy',
  'Engineer': 'bg-primary/20 text-primary',
  'Finance / Billing': 'bg-chart-purple/20 text-chart-purple',
  'Client Viewer': 'bg-secondary text-secondary-foreground',
  'Tenant Viewer': 'bg-secondary text-secondary-foreground',
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Role-based access control for teams and clients</p>
        </div>
        <Button size="sm" className="h-8 text-xs"><UserPlus className="h-3.5 w-3.5 mr-1.5" />Invite User</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard title="Total Users" value={String(users.length)} icon={Users} />
        <KpiCard title="Active" value={String(users.filter(u => u.status === 'active').length)} icon={Users} variant="savings" />
        <KpiCard title="Roles" value="7" icon={Shield} />
        <KpiCard title="Pending Invites" value={String(users.filter(u => u.status === 'invited').length)} icon={UserPlus} variant="warning" />
      </div>
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Access</TableHead>
              <TableHead className="text-xs">Last Active</TableHead>
              <TableHead className="text-xs"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell className="text-xs font-medium">{u.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                <TableCell><Badge className={`text-[9px] ${roleBadge[u.role] || 'bg-secondary'}`}>{u.role}</Badge></TableCell>
                <TableCell><Badge className={`text-[9px] ${u.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'}`}>{u.status}</Badge></TableCell>
                <TableCell className="text-xs">{u.sites}</TableCell>
                <TableCell className="text-xs">{u.lastActive}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3 w-3" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
