import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { caseFiles, type CaseFile } from "@/data/advancedMockData";
import { Shield, AlertTriangle, Clock, DollarSign, FileSearch, ChevronRight, CheckCircle2, Eye } from "lucide-react";
import { PageTransition } from "@/components/platform/PageTransition";

const severityColors: Record<string, string> = {
  Critical: "bg-destructive/20 text-destructive border-destructive/30",
  High: "bg-warning/20 text-warning border-warning/30",
  Medium: "bg-accent/20 text-accent border-accent/30",
  Low: "bg-primary/20 text-primary border-primary/30",
};

const statusIcons: Record<string, any> = {
  "Active Investigation": AlertTriangle,
  "Resolved": CheckCircle2,
  "Under Review": Eye,
};

function EvidenceTimeline({ evidence }: { evidence: CaseFile["evidence"] }) {
  return (
    <div className="relative pl-6 space-y-4">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
      {evidence.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.15 }}
          className="relative"
        >
          <div className={`absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 ${
            e.type === "alert" ? "bg-destructive border-destructive" :
            e.type === "anomaly" ? "bg-warning border-warning" :
            "bg-accent border-accent"
          }`} />
          <div className="flex items-start gap-3">
            <span className="text-xs font-mono text-muted-foreground w-12 shrink-0">{e.time}</span>
            <p className="text-sm text-foreground">{e.event}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SuspectBars({ suspects }: { suspects: CaseFile["suspects"] }) {
  return (
    <div className="space-y-3">
      {suspects.map((s, i) => (
        <motion.div
          key={s.cause}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.2 }}
        >
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground">{s.cause}</span>
            <span className="font-bold text-foreground">{s.probability}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: s.probability >= 60 ? "hsl(var(--destructive))" :
                            s.probability >= 30 ? "hsl(var(--warning))" :
                            "hsl(var(--accent))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${s.probability}%` }}
              transition={{ duration: 1, delay: 0.6 + i * 0.2 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function NarrativeText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <p className="text-sm text-foreground leading-relaxed italic">
      "{displayed}<span className="animate-pulse text-primary">|</span>"
    </p>
  );
}

export default function EnergyProsecutorPage() {
  const [selectedCase, setSelectedCase] = useState<CaseFile>(caseFiles[0]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-destructive" />
            AI Energy Prosecutor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Forensic anomaly investigations — AI-powered root cause analysis</p>
        </div>

        {/* Case Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {caseFiles.map((c) => {
            const StatusIcon = statusIcons[c.status] || AlertTriangle;
            return (
              <motion.div key={c.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`cursor-pointer transition-all ${selectedCase.id === c.id ? "ring-2 ring-accent border-accent/50" : "hover:border-muted-foreground/30"}`}
                  onClick={() => setSelectedCase(c)}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                      <Badge className={severityColors[c.severity]}>{c.severity}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{c.site}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <StatusIcon className="h-3 w-3" />
                      {c.status}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Active Case Detail */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedCase.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Case Header */}
            <Card className={`border ${severityColors[selectedCase.severity].replace("bg-", "border-").split(" ")[0]}/30 mb-6`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-5 w-5 text-accent" />
                    <span className="font-mono text-lg font-bold text-foreground">{selectedCase.id}</span>
                  </div>
                  <Badge className={severityColors[selectedCase.severity]}>{selectedCase.severity}</Badge>
                  <Badge variant="outline">{selectedCase.status}</Badge>
                  <span className="text-sm text-muted-foreground">Site: <strong className="text-foreground">{selectedCase.site}</strong></span>
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Opened {new Date(selectedCase.openedAt).toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Evidence Timeline */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    Evidence Timeline
                  </CardTitle>
                  <CardDescription>Chronological evidence collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <EvidenceTimeline evidence={selectedCase.evidence} />
                </CardContent>
              </Card>

              {/* Suspect Analysis */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Suspect Analysis</CardTitle>
                    <CardDescription>Probability of root cause</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SuspectBars suspects={selectedCase.suspects} />
                  </CardContent>
                </Card>

                <Card className="border-destructive/20">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg gradient-warning flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Estimated Financial Damage</p>
                        <p className="text-xl font-bold text-destructive">{selectedCase.financialImpact.toLocaleString()} SAR / month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Narrative */}
            <Card className="mt-6 glass-card border-accent/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  AI Forensic Narrative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NarrativeText text={selectedCase.narrative} />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
