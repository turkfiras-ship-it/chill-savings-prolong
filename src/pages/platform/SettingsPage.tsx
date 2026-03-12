import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration and preferences</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> Organization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Company Name</Label>
            <Input className="h-8 text-xs bg-secondary border-0" defaultValue="Thermo Dynamics Engineering" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Default Currency</Label>
            <Input className="h-8 text-xs bg-secondary border-0" defaultValue="SAR" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Timezone</Label>
            <Input className="h-8 text-xs bg-secondary border-0" defaultValue="Asia/Riyadh (UTC+3)" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {['Critical alert emails', 'Weekly summary reports', 'Device offline notifications', 'Project stage updates', 'Billing notifications'].map(item => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-xs">{item}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs">Two-factor authentication</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Session timeout (minutes)</span>
            <Input className="h-8 w-20 text-xs bg-secondary border-0 text-center" defaultValue="30" />
          </div>
          <Separator />
          <Button variant="outline" size="sm" className="text-xs h-8">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
