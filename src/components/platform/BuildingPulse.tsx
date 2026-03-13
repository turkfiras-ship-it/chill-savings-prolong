import { useState, useEffect, useMemo } from "react";
import { sites, assets, alerts } from "@/data/mockData";
import type { Site } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function getSiteHealthScore(site: Site): number {
  const siteAlerts = alerts.filter(a => a.siteId === site.id && !a.acknowledged);
  const criticals = siteAlerts.filter(a => a.severity === 'critical').length;
  const warnings = siteAlerts.filter(a => a.severity === 'warning').length;
  const siteAssets = assets.filter(a => a.siteId === site.id);
  const abnormalFlags = siteAssets.reduce((a, b) => a + b.abnormalFlags, 0);
  const optimizedRatio = siteAssets.filter(a => a.status === 'optimized').length / Math.max(siteAssets.length, 1);

  let score = 100;
  score -= criticals * 25;
  score -= warnings * 10;
  score -= abnormalFlags * 5;
  score += optimizedRatio * 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getHeartbeatParams(score: number) {
  if (score >= 80) return { bpm: 60, color: 'hsl(152, 60%, 48%)', status: 'Healthy', amplitude: 1 };
  if (score >= 60) return { bpm: 85, color: 'hsl(38, 92%, 50%)', status: 'Stressed', amplitude: 1.3 };
  if (score >= 40) return { bpm: 110, color: 'hsl(25, 95%, 53%)', status: 'Warning', amplitude: 1.6 };
  return { bpm: 140, color: 'hsl(0, 72%, 51%)', status: 'Critical', amplitude: 2 };
}

// Generate ECG-like SVG path
function generateEcgPath(phase: number, amplitude: number): string {
  const w = 300, h = 60, mid = h / 2;
  const points: string[] = [];
  for (let x = 0; x < w; x += 1) {
    const t = ((x + phase) % w) / w;
    let y = mid;
    // P wave
    if (t > 0.1 && t < 0.18) y = mid - Math.sin((t - 0.1) / 0.08 * Math.PI) * 6 * amplitude;
    // QRS complex
    else if (t > 0.22 && t < 0.24) y = mid + 8 * amplitude;
    else if (t > 0.24 && t < 0.28) y = mid - 25 * amplitude;
    else if (t > 0.28 && t < 0.30) y = mid + 10 * amplitude;
    // T wave
    else if (t > 0.35 && t < 0.45) y = mid - Math.sin((t - 0.35) / 0.1 * Math.PI) * 8 * amplitude;

    points.push(`${x === 0 ? 'M' : 'L'}${x},${Math.max(2, Math.min(h - 2, y))}`);
  }
  return points.join(' ');
}

interface PulseCardProps {
  site: Site;
  onClick: () => void;
}

function PulseCard({ site, onClick }: PulseCardProps) {
  const [phase, setPhase] = useState(Math.random() * 300);
  const score = useMemo(() => getSiteHealthScore(site), [site]);
  const params = getHeartbeatParams(score);

  useEffect(() => {
    const speed = params.bpm / 30;
    const interval = setInterval(() => setPhase(p => (p + speed) % 300), 50);
    return () => clearInterval(interval);
  }, [params.bpm]);

  const path = generateEcgPath(phase, params.amplitude);
  const siteAssets = assets.filter(a => a.siteId === site.id);
  const activeAssets = siteAssets.filter(a => a.status === 'optimized' || a.status === 'monitoring').length;

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-all group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Background pulse glow */}
      <div
        className="absolute inset-0 opacity-[0.04] transition-opacity group-hover:opacity-[0.08]"
        style={{
          background: `radial-gradient(ellipse at center, ${params.color}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate">{site.name}</h3>
            <p className="text-[10px] text-muted-foreground">{site.city} · {site.type}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              className="text-[9px] h-5"
              style={{ backgroundColor: `${params.color}20`, color: params.color }}
            >
              {params.status}
            </Badge>
            <div className="text-right">
              <p className="text-lg font-bold font-mono" style={{ color: params.color }}>{score}</p>
              <p className="text-[8px] text-muted-foreground">Health</p>
            </div>
          </div>
        </div>

        {/* ECG Line */}
        <div className="my-2">
          <svg viewBox="0 0 300 60" className="w-full h-12" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`ecg-${site.id}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={params.color} stopOpacity="0" />
                <stop offset="30%" stopColor={params.color} stopOpacity="1" />
                <stop offset="70%" stopColor={params.color} stopOpacity="1" />
                <stop offset="100%" stopColor={params.color} stopOpacity="0" />
              </linearGradient>
              <filter id={`glow-${site.id}`}>
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Grid lines */}
            {[15, 30, 45].map(y => (
              <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="hsl(215, 20%, 14%)" strokeWidth="0.5" />
            ))}
            {/* ECG trace */}
            <path
              d={path}
              fill="none"
              stroke={`url(#ecg-${site.id})`}
              strokeWidth="2"
              filter={`url(#glow-${site.id})`}
            />
          </svg>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{params.bpm} BPM</span>
          <span>{activeAssets}/{siteAssets.length} systems active</span>
          <span className="font-mono">{(site.demand_kw)} kW load</span>
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

export function BuildingPulse() {
  const navigate = useNavigate();
  const activeSites = sites.filter(s => s.status === 'active');
  const sortedSites = useMemo(() =>
    [...activeSites].sort((a, b) => getSiteHealthScore(a) - getSiteHealthScore(b))
  , []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Building Pulse™</h2>
          <p className="text-xs text-muted-foreground">Live energy heartbeat — each building's vital signs in real-time</p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {[
            { color: 'hsl(152, 60%, 48%)', label: 'Healthy (60 BPM)' },
            { color: 'hsl(38, 92%, 50%)', label: 'Stressed (85 BPM)' },
            { color: 'hsl(25, 95%, 53%)', label: 'Warning (110 BPM)' },
            { color: 'hsl(0, 72%, 51%)', label: 'Critical (140 BPM)' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sortedSites.map(site => (
          <PulseCard
            key={site.id}
            site={site}
            onClick={() => navigate(`/sites/${site.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
