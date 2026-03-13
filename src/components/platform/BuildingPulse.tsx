import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { sites, assets, alerts } from "@/data/mockData";
import type { Site } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  if (score >= 80) return { bpm: 60, color: 'hsl(152, 60%, 48%)', status: 'Healthy' };
  if (score >= 60) return { bpm: 85, color: 'hsl(38, 92%, 50%)', status: 'Stressed' };
  if (score >= 40) return { bpm: 110, color: 'hsl(25, 95%, 53%)', status: 'Warning' };
  return { bpm: 140, color: 'hsl(0, 72%, 51%)', status: 'Critical' };
}

// Real ECG waveform template (one cardiac cycle, normalized 0-1 time, amplitude -1 to 1)
function ecgSample(t: number): number {
  // Flat baseline
  if (t < 0.08) return 0;
  // P wave (small upward bump)
  if (t < 0.18) {
    const p = (t - 0.08) / 0.10;
    return Math.sin(p * Math.PI) * 0.12;
  }
  // PR segment (flat)
  if (t < 0.24) return 0;
  // Q dip
  if (t < 0.27) {
    const q = (t - 0.24) / 0.03;
    return -Math.sin(q * Math.PI) * 0.15;
  }
  // R spike (sharp tall peak)
  if (t < 0.32) {
    const r = (t - 0.27) / 0.05;
    return Math.sin(r * Math.PI) * 1.0;
  }
  // S dip
  if (t < 0.36) {
    const s = (t - 0.32) / 0.04;
    return -Math.sin(s * Math.PI) * 0.25;
  }
  // ST segment (flat)
  if (t < 0.44) return 0;
  // T wave (broad upward bump)
  if (t < 0.58) {
    const tw = (t - 0.44) / 0.14;
    return Math.sin(tw * Math.PI) * 0.22;
  }
  // Flat until next beat
  return 0;
}

// Sweeping ECG canvas — draws left to right like a real cardiac monitor
function EcgCanvas({ bpm, color, siteId }: { bpm: number; color: string; siteId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const cursorRef = useRef(0);
  const bufferRef = useRef<Float32Array | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const mid = H / 2;
    const amp = H * 0.38;

    // Initialize buffer
    if (!bufferRef.current || bufferRef.current.length !== W) {
      bufferRef.current = new Float32Array(W);
    }
    const buf = bufferRef.current;

    // Speed: pixels per frame at 60fps. One cardiac cycle = 60/bpm seconds
    const cyclePixels = W * 0.45; // one heartbeat spans ~45% of width
    const cycleDuration = 60 / bpm; // seconds per beat
    const pixelsPerSecond = cyclePixels / cycleDuration;
    const pixelsPerFrame = pixelsPerSecond / 60;

    // Write new samples
    const newPixels = Math.max(1, Math.round(pixelsPerFrame));
    for (let i = 0; i < newPixels; i++) {
      const x = Math.floor(cursorRef.current) % W;
      const cycleT = (cursorRef.current % cyclePixels) / cyclePixels;
      buf[x] = ecgSample(cycleT);
      cursorRef.current = (cursorRef.current + 1) % (W * 1000); // large wrap
    }

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(100, 120, 140, 0.07)';
    ctx.lineWidth = 0.5;
    for (let gy = 0; gy < H; gy += H / 4) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }
    for (let gx = 0; gx < W; gx += W / 8) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }

    const cursor = Math.floor(cursorRef.current) % W;

    // Draw the ECG trace
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Draw trail (behind cursor) with fade
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < W; i++) {
      const x = (cursor - W + i + W * 2) % W;
      const screenX = i;
      const y = mid - buf[x] * amp;

      // Fade: old samples are more transparent
      const age = W - i;
      if (age > W * 0.95) continue; // gap near cursor (eraser effect)

      if (!started) {
        ctx.moveTo(screenX, y);
        started = true;
      } else {
        ctx.lineTo(screenX, y);
      }
    }

    // Create gradient along the trail
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    const cursorPct = cursor / W;
    // The newest part (cursor) is brightest, fading behind
    grad.addColorStop(0, color.replace(')', ', 0.05)').replace('hsl', 'hsla'));
    grad.addColorStop(Math.max(0, cursorPct - 0.02), color.replace(')', ', 0.9)').replace('hsl', 'hsla'));
    grad.addColorStop(cursorPct, color);
    // After cursor = gap
    if (cursorPct < 0.98) {
      grad.addColorStop(Math.min(1, cursorPct + 0.02), 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
    }

    ctx.strokeStyle = grad;
    ctx.stroke();

    // Glow effect on the bright part
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Only draw the recent ~15% for glow
    const glowLen = Math.floor(W * 0.15);
    for (let i = 0; i < glowLen; i++) {
      const x = (cursor - glowLen + i + W) % W;
      const screenX = (cursor - glowLen + i + W) % W;
      const y = mid - buf[x] * amp;
      if (i === 0) ctx.moveTo(screenX, y);
      else ctx.lineTo(screenX, y);
    }
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();

    // Cursor dot (bright pulsing dot at write position)
    const dotY = mid - buf[cursor] * amp;
    ctx.beginPath();
    ctx.arc(cursor, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cursor, dotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(')', ', 0.2)').replace('hsl', 'hsla');
    ctx.fill();

    animRef.current = requestAnimationFrame(draw);
  }, [bpm, color]);

  useEffect(() => {
    // Set canvas resolution
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * 1.5); // slightly higher than 1x for crispness
      canvas.height = Math.floor(rect.height * 1.5);
    }
    cursorRef.current = 0;
    bufferRef.current = null;
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-14 rounded"
      style={{ imageRendering: 'auto' }}
    />
  );
}

interface PulseCardProps {
  site: Site;
  onClick: () => void;
}

function PulseCard({ site, onClick }: PulseCardProps) {
  const score = useMemo(() => getSiteHealthScore(site), [site]);
  const params = getHeartbeatParams(score);
  const siteAssets = assets.filter(a => a.siteId === site.id);
  const activeAssets = siteAssets.filter(a => a.status === 'optimized' || a.status === 'monitoring').length;

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-all group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Background pulse glow */}
      <div
        className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]"
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
              className="text-[9px] h-5 border-0"
              style={{ backgroundColor: `${params.color}18`, color: params.color }}
            >
              {params.status}
            </Badge>
            <div className="text-right">
              <p className="text-lg font-bold font-mono" style={{ color: params.color }}>{score}</p>
              <p className="text-[8px] text-muted-foreground">Health</p>
            </div>
          </div>
        </div>

        {/* Real ECG Canvas */}
        <div className="my-2 rounded overflow-hidden bg-secondary/20">
          <EcgCanvas bpm={params.bpm} color={params.color} siteId={site.id} />
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-mono tabular-nums">{params.bpm} <span className="text-[8px]">BPM</span></span>
          <span>{activeAssets}/{siteAssets.length} systems</span>
          <span className="font-mono tabular-nums">{site.demand_kw} <span className="text-[8px]">kW</span></span>
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
