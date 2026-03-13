import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuildingPulse } from "@/components/platform/BuildingPulse";
import { ComfortCostSlider } from "@/components/platform/ComfortCostSlider";
import { SavingsConfidence } from "@/components/platform/SavingsConfidence";
import { EnergyForensics } from "@/components/platform/EnergyForensics";
import { CrossBuildingLoadShift } from "@/components/platform/CrossBuildingLoadShift";
import { Heart, SlidersHorizontal, Target, FileSearch, ArrowLeftRight, Sparkles } from "lucide-react";

export default function InnovationPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Innovation Lab</h1>
            <p className="text-sm text-muted-foreground">Breakthrough tools no one else has — your competitive edge</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pulse" className="space-y-4">
        <TabsList className="bg-secondary/50 h-9">
          <TabsTrigger value="pulse" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <Heart className="h-3 w-3" /> Building Pulse™
          </TabsTrigger>
          <TabsTrigger value="comfort" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <SlidersHorizontal className="h-3 w-3" /> Comfort vs Cost
          </TabsTrigger>
          <TabsTrigger value="confidence" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <Target className="h-3 w-3" /> Savings Confidence
          </TabsTrigger>
          <TabsTrigger value="forensics" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <FileSearch className="h-3 w-3" /> Energy Forensics
          </TabsTrigger>
          <TabsTrigger value="loadshift" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <ArrowLeftRight className="h-3 w-3" /> Load Shifting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pulse">
          <BuildingPulse />
        </TabsContent>

        <TabsContent value="comfort">
          <div className="max-w-lg mx-auto">
            <ComfortCostSlider />
          </div>
        </TabsContent>

        <TabsContent value="confidence">
          <div className="max-w-lg mx-auto">
            <SavingsConfidence />
          </div>
        </TabsContent>

        <TabsContent value="forensics">
          <EnergyForensics />
        </TabsContent>

        <TabsContent value="loadshift">
          <CrossBuildingLoadShift />
        </TabsContent>
      </Tabs>
    </div>
  );
}
