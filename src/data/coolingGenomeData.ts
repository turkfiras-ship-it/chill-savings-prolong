// ═══════════════════════════════════════════════════════════════
// MOCK DATA — Cooling Genome™ Intelligence Layer
// ═══════════════════════════════════════════════════════════════
import { sites } from "@/data/mockData";

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ── Genome Traits ─────────────────────────────────────────
export interface GenomeTrait {
  name: string;
  key: string;
  value: number; // 0–100
  label: string; // Low / Medium / High / Fast / Slow
}

export interface CoolingGenome {
  siteId: string;
  siteName: string;
  city: string;
  type: string;
  genomeId: string;
  traits: GenomeTrait[];
  overallScore: number;
  category: "Elite" | "Strong" | "Average" | "Developing";
  evolution: { month: string; score: number }[];
  diagnostics: GenomeDiagnostic[];
  matchScore?: number;
}

export interface GenomeDiagnostic {
  trait: string;
  expected: number;
  observed: number;
  deviation: number;
  likelyCause: string;
  severity: "normal" | "warning" | "critical";
}

const traitLabeler = (value: number, type: "level" | "speed"): string => {
  if (type === "speed") return value > 70 ? "Fast" : value > 40 ? "Moderate" : "Slow";
  return value > 75 ? "High" : value > 45 ? "Medium" : "Low";
};

const traitDefs = [
  { name: "Thermal Inertia", key: "thermalInertia", type: "level" as const },
  { name: "Humidity Sensitivity", key: "humiditySensitivity", type: "level" as const },
  { name: "Compressor Stability", key: "compressorStability", type: "level" as const },
  { name: "Load Volatility", key: "loadVolatility", type: "level" as const },
  { name: "Night Cooling Recovery", key: "nightRecovery", type: "speed" as const },
  { name: "Peak Cooling Sensitivity", key: "peakSensitivity", type: "level" as const },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const causes = [
  "Refrigerant degradation",
  "Condenser fouling",
  "Thermostat drift",
  "Compressor valve wear",
  "Duct leakage",
  "Filter blockage",
  "Insulation deterioration",
  "Control logic misconfiguration",
];

export const coolingGenomes: CoolingGenome[] = (() => {
  const rand = seeded(42);
  return sites.filter(s => s.status === "active").map((s, idx) => {
    const traits: GenomeTrait[] = traitDefs.map(td => {
      const value = Math.round(25 + rand() * 70);
      return { name: td.name, key: td.key, value, label: traitLabeler(value, td.type) };
    });

    const overallScore = Math.round(traits.reduce((a, t) => a + t.value, 0) / traits.length);

    const category: CoolingGenome["category"] =
      overallScore > 75 ? "Elite" : overallScore > 60 ? "Strong" : overallScore > 45 ? "Average" : "Developing";

    const evolution = months.map((m, i) => ({
      month: m,
      score: Math.round(overallScore - 10 + rand() * 5 + i * (rand() > 0.5 ? 1.2 : 0.5)),
    }));

    const diagnostics: GenomeDiagnostic[] = traits
      .filter(() => rand() > 0.5)
      .slice(0, 3)
      .map(t => {
        const expected = t.value;
        const deviation = Math.round(-20 + rand() * 40);
        const observed = Math.max(0, Math.min(100, expected + deviation));
        return {
          trait: t.name,
          expected,
          observed,
          deviation: Math.abs(deviation),
          likelyCause: causes[Math.floor(rand() * causes.length)],
          severity: (Math.abs(deviation) > 25 ? "critical" : Math.abs(deviation) > 12 ? "warning" : "normal") as GenomeDiagnostic["severity"],
        };
      });

    return {
      siteId: s.id,
      siteName: s.name,
      city: s.city,
      type: s.type,
      genomeId: `CG-${String(idx + 1).padStart(4, "0")}`,
      traits,
      overallScore,
      category,
      evolution,
      diagnostics,
    };
  });
})();

// ── Genome Similarity Calculator ──────────────────────────
export function computeGenomeSimilarity(a: CoolingGenome, b: CoolingGenome): number {
  const diffs = a.traits.map((t, i) => Math.abs(t.value - b.traits[i].value));
  const avgDiff = diffs.reduce((s, d) => s + d, 0) / diffs.length;
  return Math.max(0, Math.round(100 - avgDiff * 1.5));
}

// ── Scenario Simulation ───────────────────────────────────
export interface ScenarioResult {
  scenario: string;
  energyReduction: number;
  comfortRisk: "Low" | "Medium" | "High";
  confidence: number;
  icon: string;
}

export function simulateScenario(genome: CoolingGenome, scenario: string): ScenarioResult {
  const rand = seeded(genome.overallScore + scenario.length);
  const r = rand;
  const scenarios: Record<string, () => ScenarioResult> = {
    setpoint: () => ({
      scenario: "Increase setpoint 1.5°C",
      energyReduction: +(6 + r() * 8).toFixed(1),
      comfortRisk: genome.traits.find(t => t.key === "thermalInertia")!.value > 60 ? "Low" : "Medium",
      confidence: Math.round(78 + r() * 18),
      icon: "🌡️",
    }),
    nightCool: () => ({
      scenario: "Night pre-cooling (2–6 AM)",
      energyReduction: +(4 + r() * 6).toFixed(1),
      comfortRisk: "Low",
      confidence: Math.round(82 + r() * 15),
      icon: "🌙",
    }),
    compressorUpgrade: () => ({
      scenario: "Upgrade compressor to inverter",
      energyReduction: +(12 + r() * 10).toFixed(1),
      comfortRisk: "Low",
      confidence: Math.round(85 + r() * 12),
      icon: "⚙️",
    }),
    heatwave: () => ({
      scenario: "Heatwave (+8°C above normal)",
      energyReduction: -(15 + r() * 12),
      comfortRisk: genome.traits.find(t => t.key === "peakSensitivity")!.value > 55 ? "High" : "Medium",
      confidence: Math.round(70 + r() * 20),
      icon: "🔥",
    }),
  };

  return (scenarios[scenario] || scenarios.setpoint)();
}

// ── Global Intelligence Stats ─────────────────────────────
export const genomeStats = {
  totalGenomes: coolingGenomes.length,
  avgScore: Math.round(coolingGenomes.reduce((s, g) => s + g.overallScore, 0) / coolingGenomes.length),
  eliteCount: coolingGenomes.filter(g => g.category === "Elite").length,
  criticalDiagnostics: coolingGenomes.reduce((s, g) => s + g.diagnostics.filter(d => d.severity === "critical").length, 0),
  traitDistribution: traitDefs.map(td => ({
    trait: td.name,
    avg: Math.round(coolingGenomes.reduce((s, g) => s + (g.traits.find(t => t.key === td.key)?.value || 0), 0) / coolingGenomes.length),
  })),
};
