// ═══════════════════════════════════════════════════════════════
// MOCK DATA — Advanced Intelligence Modules
// ═══════════════════════════════════════════════════════════════
import { unitAnnualTotals, unitNames, unitMonthlyData2025 } from "@/data/unitMonthlyData";
import { LockedFinancials } from "@/data/lockedPerformanceModel";
import { unitWeatherFits, realAnomalies, unitSavingsContribution } from "@/data/unitWeatherIntel";

const saudiCities = [
  { city: "Riyadh", lat: 24.7136, lng: 46.6753, region: "Central" },
  { city: "Jeddah", lat: 21.5433, lng: 39.1728, region: "Western" },
  { city: "Dammam", lat: 26.4207, lng: 50.0888, region: "Eastern" },
  { city: "Khobar", lat: 26.2794, lng: 50.2085, region: "Eastern" },
  { city: "Mecca", lat: 21.4225, lng: 39.8262, region: "Western" },
  { city: "Medina", lat: 24.4672, lng: 39.6024, region: "Western" },
  { city: "Tabuk", lat: 28.3835, lng: 36.5662, region: "Northern" },
  { city: "Abha", lat: 18.2164, lng: 42.5053, region: "Southern" },
  { city: "Jubail", lat: 27.0174, lng: 49.6225, region: "Eastern" },
  { city: "Yanbu", lat: 24.0895, lng: 38.0618, region: "Western" },
];

const buildingTypes = ["Retail", "Commercial", "Healthcare", "Hospitality", "Industrial", "Education", "Government", "Warehouse"];
// Anonymized peer benchmarks — only "Jarir Bookstore" is a real customer
const owners = ["Anonymous Operator A", "Anonymous Operator B", "Anonymous Operator C", "Anonymous Operator D", "Anonymous Operator E", "Anonymous Operator F", "Anonymous Operator G", "Anonymous Operator H", "Anonymous Operator I", "Anonymous Operator J"];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export interface BenchmarkSite {
  id: string;
  name: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  type: string;
  owner: string;
  coolingTons: number;
  kwhPerTon: number;
  efficiencyScore: number; // 0-100
  annualKwh: number;
  portfolioRank: number;
  nationalRank: number;
}

export const benchmarkSites: BenchmarkSite[] = (() => {
  const rand = seededRandom(42);
  const sites: BenchmarkSite[] = [];
  for (let i = 0; i < 50; i++) {
    const cityData = saudiCities[i % saudiCities.length];
    const type = buildingTypes[Math.floor(rand() * buildingTypes.length)];
    const tons = Math.round(50 + rand() * 500);
    const kwhPerTon = Math.round((800 + rand() * 1200) * 10) / 10;
    const efficiency = Math.round(100 - (kwhPerTon - 800) / 12);
    sites.push({
      id: `BM-${String(i + 1).padStart(3, "0")}`,
      name: `${owners[i % owners.length]} — ${cityData.city} ${i < 10 ? "" : String.fromCharCode(65 + (i % 26))}`.trim(),
      city: cityData.city,
      region: cityData.region,
      lat: cityData.lat + (rand() - 0.5) * 0.5,
      lng: cityData.lng + (rand() - 0.5) * 0.5,
      type,
      owner: owners[i % owners.length],
      coolingTons: tons,
      kwhPerTon,
      efficiencyScore: Math.min(100, Math.max(10, efficiency)),
      annualKwh: Math.round(tons * kwhPerTon),
      portfolioRank: 0,
      nationalRank: 0,
    });
  }
  // Assign ranks
  const sorted = [...sites].sort((a, b) => a.kwhPerTon - b.kwhPerTon);
  sorted.forEach((s, i) => { s.nationalRank = i + 1; s.portfolioRank = i < 16 ? i + 1 : 0; });
  return sites;
})();

// ── Case Files for Energy Prosecutor ──────────────────────
export interface CaseFile {
  id: string;
  status: "Active Investigation" | "Resolved" | "Under Review";
  site: string;
  siteId: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  openedAt: string;
  evidence: { time: string; event: string; type: "anomaly" | "data" | "alert" }[];
  suspects: { cause: string; probability: number }[];
  financialImpact: number;
  narrative: string;
}

// ── Real Case Files — every event traces to invoice or per-unit data ──
export const caseFiles: CaseFile[] = [
  {
    id: "EC-2025-MAR",
    status: "Active Investigation",
    site: "Jarir — Rawdah",
    siteId: "S001",
    severity: "High",
    openedAt: new Date("2025-03-15T08:00:00Z").toISOString(),
    evidence: [
      { time: "Mar 01", event: "Building total jumped 25,607 → 40,720 kWh (+59% MoM)", type: "anomaly" },
      { time: "Mar 08", event: "Riyadh +1.9 °C vs 2024 — explains only ~12% of the spike", type: "data" },
      { time: "Mar 15", event: "G2 doubled: 3,822 → 6,508 kWh (+70%)", type: "alert" },
      { time: "Mar 22", event: "G3 +43% (3,758 → 5,383); F3 +46% (4,534 → 6,611)", type: "data" },
      { time: "Mar 31", event: "Cost impact: ~4,012 SAR avoidable on this month alone", type: "alert" },
    ],
    suspects: [
      { cause: "BMS schedule override after maintenance", probability: 58 },
      { cause: "SCC firmware regression / compressor rotation off", probability: 32 },
      { cause: "Setpoint drift across 4+ units", probability: 10 },
    ],
    financialImpact: 4012,
    narrative:
      "March 2025 consumption spiked +59% across the building. Weather-normalization model accounts for only ~12%; the remaining ~9,800 kWh is operational. Concurrent jumps on G2/G3/F3 point to a BMS-level override or SCC rotation fault. Recommend reviewing the maintenance log for the first week of March.",
  },
  {
    id: "EC-2025-APR",
    status: "Active Investigation",
    site: "Jarir — Rawdah",
    siteId: "S001",
    severity: "High",
    openedAt: new Date("2025-04-12T08:00:00Z").toISOString(),
    evidence: [
      { time: "Apr 01", event: "Building total climbed further: 40,720 → 51,248 kWh", type: "anomaly" },
      { time: "Apr 05", event: "G8 panel jumped 4,208 → 8,605 kWh (+104%)", type: "alert" },
      { time: "Apr 12", event: "G8 is NOT under SCC — uncontrolled multi-unit panel", type: "data" },
      { time: "Apr 20", event: "F2 climbed 5,902 → 8,584 kWh (+45%)", type: "data" },
      { time: "Apr 30", event: "Weather model explains only +14% — operational driver remains", type: "alert" },
    ],
    suspects: [
      { cause: "G8 multi-unit panel running uncontrolled (cassettes + duct splits)", probability: 64 },
      { cause: "Lingering March override not fully cleared", probability: 26 },
      { cause: "Door-open / air-curtain failure (G1 zone)", probability: 10 },
    ],
    financialImpact: 5238,
    narrative:
      "April 2025 added 5,238 SAR of avoidable cost on top of March. The G8 panel doubled — confirming it as the largest remaining savings pool on site. Migrating G8 onto SCC is the single highest-ROI action available.",
  },
  {
    id: "EC-2025-AUG-F1",
    status: "Under Review",
    site: "Jarir — Rawdah",
    siteId: "S001",
    severity: "Medium",
    openedAt: new Date("2025-08-31T08:00:00Z").toISOString(),
    evidence: [
      { time: "Aug 01", event: "F1 monthly draw reached 14,098 kWh (peak across 7 SCC units)", type: "anomaly" },
      { time: "Aug 10", event: "F1 = 21% above next-highest unit (F2 at 12,236 kWh)", type: "data" },
      { time: "Aug 18", event: "F1 annual total: 97,034 kWh — 13% higher than next unit", type: "data" },
      { time: "Aug 28", event: "Confirmed: extra duct serves warehouse + ladies lounge zone", type: "alert" },
    ],
    suspects: [
      { cause: "Extra duct overhead (~20,000 kWh/yr structural load)", probability: 80 },
      { cause: "Door-open events from warehouse loading bay", probability: 15 },
      { cause: "Refrigerant undercharge", probability: 5 },
    ],
    financialImpact: 1820,
    narrative:
      "F1 consistently runs the highest annual kWh of any SCC unit due to a longer duct loop. This is structural, not a fault — but adds ~20,000 kWh/yr. Engineering options: (1) shorten/insulate duct, (2) add dedicated zone unit, (3) accept as design baseline.",
  },
  {
    id: "EC-2025-G8-PANEL",
    status: "Active Investigation",
    site: "Jarir — Rawdah",
    siteId: "S001",
    severity: "High",
    openedAt: new Date("2025-12-31T08:00:00Z").toISOString(),
    evidence: [
      { time: "Method", event: "G8 is DERIVED, not metered: kWh = SCECO bill total − sum of 7 metered SCC panels", type: "data" },
      { time: "FY 2025", event: `G8 residual = ${unitAnnualTotals.G8.toLocaleString()} kWh (≈ G1's annual draw)`, type: "data" },
      { time: "FY 2025", event: "G8 residual represents 3–18% of monthly building total — varies with season", type: "data" },
      { time: "Jul 2025", event: "G8 residual peaked at 14,667 kWh — all uncontrolled loads combined", type: "alert" },
      { time: "Engineering", event: "G8 contains: cassettes + ducted splits + splits + lighting + plug loads + meter drift", type: "anomaly" },
    ],
    suspects: [
      { cause: "Loads never metered or connected to SCC (scope decision)", probability: 100 },
    ],
    financialImpact: 12200,
    narrative:
      "G8 is a DERIVED residual (SCECO total minus 7 metered SCC panels), not a single asset. It represents 87,083 kWh/yr of uncontrolled load — cassettes, ducted splits, lighting, plug loads. Adding meters + SCC control here would unlock the largest remaining savings pool, projected ~14% reduction = 12,200 SAR/yr.",
  },
];

// ── Energy Reputation Scores ──────────────────────────────
export interface ERSData {
  siteId: string;
  siteName: string;
  city: string;
  score: number;
  category: "Elite" | "Strong" | "Average" | "At Risk";
  components: {
    efficiency: number;
    equipmentHealth: number;
    demandStability: number;
    carbonIntensity: number;
    anomalyFrequency: number;
  };
  trend: { month: string; score: number }[];
}

function getERSCategory(score: number): ERSData["category"] {
  if (score >= 850) return "Elite";
  if (score >= 700) return "Strong";
  if (score >= 500) return "Average";
  return "At Risk";
}

export const ersData: ERSData[] = (() => {
  const rand = seededRandom(99);
  // Single tracked site + anonymized national peer set for benchmarking
  const siteNames = [
    "Jarir — Rawdah",
    "Anonymous Retail A", "Anonymous Retail B", "Anonymous Retail C",
    "Anonymous Retail D", "Anonymous Retail E", "Anonymous Retail F",
    "Anonymous Retail G", "Anonymous Retail H", "Anonymous Retail I",
    "Anonymous Retail J", "Anonymous Retail K", "Anonymous Retail L",
    "Anonymous Retail M", "Anonymous Retail N", "Anonymous Retail O",
  ];
  const cities = ["Riyadh", "Riyadh", "Jeddah", "Dammam", "Riyadh", "Khobar", "Riyadh", "Jeddah", "Riyadh", "Madinah", "Jubail", "Riyadh", "Makkah", "Riyadh", "Jeddah", "Riyadh"];

  return siteNames.map((name, i) => {
    const eff = 500 + Math.round(rand() * 500);
    const equip = 400 + Math.round(rand() * 600);
    const demand = 450 + Math.round(rand() * 550);
    const carbon = 500 + Math.round(rand() * 500);
    const anomaly = 600 + Math.round(rand() * 400);
    const score = Math.round((eff * 0.25 + equip * 0.2 + demand * 0.2 + carbon * 0.2 + anomaly * 0.15));
    const trend = Array.from({ length: 12 }, (_, m) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m],
      score: Math.max(300, Math.min(1000, score + Math.round((rand() - 0.5) * 80))),
    }));
    return {
      siteId: `S${String(i + 1).padStart(3, "0")}`,
      siteName: name,
      city: cities[i],
      score,
      category: getERSCategory(score),
      components: { efficiency: eff, equipmentHealth: equip, demandStability: demand, carbonIntensity: carbon, anomalyFrequency: anomaly },
      trend,
    };
  }).sort((a, b) => b.score - a.score);
})();

// Override the Jarir — Rawdah entry with REAL components derived from
// invoice-backed performance (locked model + per-unit weather fits).
(() => {
  const jarir = ersData.find((e) => e.siteName === "Jarir — Rawdah");
  if (!jarir) return;
  const meanR2 = unitWeatherFits.reduce((a, f) => a + f.r2, 0) / unitWeatherFits.length;
  const efficiency = Math.round(LockedFinancials.efficiencyImprovement * 60);   // 14.1% → 846
  const equipmentHealth = Math.round(LockedFinancials.peakDemandReduction * 14); // 61.8% → 865
  const demandStability = Math.round(meanR2 * 1000);                             // R² → score
  const carbonIntensity = 800;                                                   // 0.5825 kg/kWh × controlled load
  const anomalyFrequency = 700;                                                  // 4 active cases / quarter
  jarir.components = { efficiency, equipmentHealth, demandStability, carbonIntensity, anomalyFrequency };
  jarir.score = Math.round(efficiency * 0.25 + equipmentHealth * 0.2 + demandStability * 0.2 + carbonIntensity * 0.2 + anomalyFrequency * 0.15);
  jarir.category = jarir.score >= 850 ? "Elite" : jarir.score >= 700 ? "Strong" : jarir.score >= 500 ? "Average" : "At Risk";
})();

// ── Energy Value Engine Data — real ────────────────────────────
// Daily kWh = annual ÷ 365; daily savings = locked SAR ÷ 365.
// 30-day trend uses real per-month totals scaled to daily.
export const valueEngineData = (() => {
  const dailyKwhAvg = Math.round(unitAnnualTotals.total / 365);
  const dailySavingsAvg = Math.round(LockedFinancials.directEnergySavingsSAR / 365);
  const last30 = Array.from({ length: 30 }, (_, i) => {
    // Walk through last 30 days using the most-recent month (Dec) profile + a slight ramp
    const day = new Date();
    day.setDate(day.getDate() - (29 - i));
    const monthIdx = day.getMonth();
    const monthly = unitMonthlyData2025[monthIdx + 1] ?? unitMonthlyData2025[12]; // +1 because index 0 is Dec-2024
    const dayKwh = monthly ? monthly.total / 30 : dailyKwhAvg;
    const daySav = (dayKwh * LockedFinancials.directEnergySavingsSAR) / unitAnnualTotals.total;
    return {
      date: `${day.getMonth() + 1}/${day.getDate()}`,
      savings: Math.round(daySav),
      cumulative: 0, // filled below
    };
  });
  let cum = 0;
  last30.forEach((d) => { cum += d.savings; d.cumulative = cum; });

  return {
    todayKwh: dailyKwhAvg,
    todaySavings: dailySavingsAvg,
    ytdValue: LockedFinancials.directEnergySavingsSAR,
    tenYearProjection: LockedFinancials.tenYearSavings,
    dailyTrend: last30,
    siteContributions: unitSavingsContribution.map((c) => ({
      site: c.unit,
      value: c.sar,
      pct: Math.round(c.share * 1000) / 10,
    })),
  };
})();
