import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, RefreshCw, Zap, AlertTriangle, Thermometer, DollarSign, Activity } from "lucide-react";
import { sites, alerts, assets } from "@/data/mockData";
import { useGlobalWeather } from "@/context/WeatherContext";
import { toast } from "@/hooks/use-toast";

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-anomalies`;

export default function AnomalyDetectionPage() {
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { weather } = useGlobalWeather();

  const runAnalysis = async () => {
    if (isAnalyzing) {
      abortRef.current?.abort();
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");
    abortRef.current = new AbortController();

    try {
      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          sites,
          alerts,
          assets,
          weather: weather?.current ? {
            temperature: weather.current.temperature,
            humidity: weather.current.humidity,
            feelsLike: weather.current.feelsLike,
          } : null,
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Analysis failed" }));
        toast({ title: "Analysis Error", description: err.error, variant: "destructive" });
        setIsAnalyzing(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAnalysis(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setLastAnalyzed(new Date());
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast({ title: "Error", description: "Failed to run AI analysis", variant: "destructive" });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stats = [
    { label: "Sites Monitored", value: sites.filter(s => s.status === "active").length, icon: Activity, color: "text-energy" },
    { label: "Active Alerts", value: alerts.filter(a => !a.acknowledged).length, icon: AlertTriangle, color: "text-warning" },
    { label: "Flagged Assets", value: assets.filter(a => a.abnormalFlags > 0).length, icon: Zap, color: "text-destructive" },
    { label: "Current Temp", value: weather?.current ? `${Math.round(weather.current.temperature)}°C` : "—", icon: Thermometer, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg gradient-energy flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Anomaly Detection</h1>
              <p className="text-sm text-muted-foreground">AI-powered analysis of your energy portfolio</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastAnalyzed && (
            <span className="text-[11px] text-muted-foreground">
              Last: {lastAnalyzed.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button
            onClick={runAnalysis}
            className={isAnalyzing ? "bg-destructive hover:bg-destructive/90" : "gradient-savings text-primary-foreground"}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Stop Analysis
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-energy" />
              Analysis Results
            </CardTitle>
            {isAnalyzing && (
              <Badge variant="outline" className="text-energy border-energy/30 bg-energy/5 animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Analyzing...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!analysis && !isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-2xl gradient-energy flex items-center justify-center mb-4 opacity-50">
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">No analysis yet</p>
              <p className="text-muted-foreground text-xs max-w-sm">
                Click "Run AI Analysis" to scan your entire portfolio for anomalies, inefficiencies, and savings opportunities.
              </p>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground [&_ul]:space-y-1">
              <MarkdownRenderer content={analysis} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-medium text-foreground mt-4">{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={i} className="text-base font-semibold text-foreground mt-5 pb-1 border-b border-border">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="text-lg font-bold text-foreground mt-6">{line.slice(2)}</h1>;
        if (line.startsWith("- **") || line.startsWith("* **")) {
          const text = line.slice(2);
          return <li key={i} className="text-sm text-muted-foreground list-disc ml-4" dangerouslySetInnerHTML={{ __html: formatBold(text) }} />;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-sm text-muted-foreground list-disc ml-4">{line.slice(2)}</li>;
        if (line.match(/^\d+\./)) return <li key={i} className="text-sm text-muted-foreground list-decimal ml-4" dangerouslySetInnerHTML={{ __html: formatBold(line.replace(/^\d+\.\s*/, "")) }} />;
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />;
      })}
    </div>
  );
}

function formatBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
}
