// ═══════════════════════════════════════════════════════════════
// MOCK DATA — Advanced Intelligence Modules
// ═══════════════════════════════════════════════════════════════

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

export const caseFiles: CaseFile[] = [
  {
    id: "EC-4821",
    status: "Active Investigation",
    site: "Jarir — Rawdah",
    siteId: "S001",
    severity: "High",
    openedAt: new Date(Date.now() - 3600000).toISOString(),
    evidence: [
      { time: "10:02", event: "G3 compressor cycling increased 340%", type: "anomaly" },
      { time: "10:05", event: "G3 supply/return ΔT dropped to 2.1°C", type: "data" },
      { time: "10:12", event: "G3 consumption spike: +12 kW above baseline", type: "alert" },
      { time: "10:18", event: "G3 condenser pressure rising — 18.4 bar", type: "anomaly" },
      { time: "10:25", event: "G3 COP degraded from 3.2 to 1.8", type: "data" },
    ],
    suspects: [
      { cause: "Compressor Valve Leak", probability: 74 },
      { cause: "Refrigerant Loss", probability: 18 },
      { cause: "Sensor Fault", probability: 8 },
    ],
    financialImpact: 3120,
    narrative: "Packaged unit G3 is cycling abnormally without a corresponding increase in cooling demand, indicating possible valve degradation. Supply-return ΔT has collapsed to 2.1°C (normal: 6–8°C), while condenser pressure continues rising. Financial exposure: 3,120 SAR/month if uncorrected.",
  },
  {
    id: "EC-4822",
    status: "Active Investigation",
    site: "Jarir — Rawdah",
    siteId: "S001",
    severity: "Medium",
    openedAt: new Date(Date.now() - 7200000).toISOString(),
    evidence: [
      { time: "08:15", event: "G2 short-cycling detected — 4 starts/hour", type: "anomaly" },
      { time: "08:30", event: "Showroom zone-2 temp rising: 22°C → 24.5°C", type: "alert" },
      { time: "08:45", event: "G2 defrost cycle duration anomaly", type: "data" },
      { time: "09:00", event: "Adjacent G1 stage-up to compensate", type: "anomaly" },
    ],
    suspects: [
      { cause: "Evaporator Coil Fouling", probability: 62 },
      { cause: "Refrigerant Undercharge", probability: 28 },
      { cause: "Thermostat Setpoint Drift", probability: 10 },
    ],
    financialImpact: 1850,
    narrative: "G2 is short-cycling while zone-2 temperatures climb, suggesting evaporator fouling restricting airflow. G1 has stepped in to compensate, increasing aggregate draw. Recommend coil cleaning during next overnight window.",
  },
  {
    id: "EC-4819",
    status: "Resolved",
    site: "Jarir — Rawdah",
    siteId: "S001",
    severity: "Medium",
    openedAt: new Date(Date.now() - 86400000).toISOString(),
    evidence: [
      { time: "14:20", event: "F2 after-hours load detected: 12 kW at 02:15", type: "alert" },
      { time: "14:35", event: "F2 running at full stage — no occupancy", type: "data" },
      { time: "15:00", event: "BMS schedule override found active on F2", type: "data" },
    ],
    suspects: [
      { cause: "BMS Schedule Override", probability: 92 },
      { cause: "Occupancy Sensor Failure", probability: 8 },
    ],
    financialImpact: 1450,
    narrative: "A manual override on F2's after-hours schedule was left active following maintenance. Override removed; nightly load returned to setback. Case closed.",
  },
  {
    id: "EC-4823",
    status: "Under Review",
    site: "Jarir — Rawdah",
    siteId: "S001",
    severity: "High",
    openedAt: new Date(Date.now() - 14400000).toISOString(),
    evidence: [
      { time: "06:00", event: "F4 efficiency dropped 9% overnight", type: "anomaly" },
      { time: "06:30", event: "F4 condenser inlet temp elevated: 47°C vs 41°C normal", type: "data" },
      { time: "07:00", event: "F4 fan vibration spike on rooftop", type: "alert" },
    ],
    suspects: [
      { cause: "Condenser Coil Fouling", probability: 55 },
      { cause: "Fan Belt Degradation", probability: 30 },
      { cause: "Refrigerant Overcharge", probability: 15 },
    ],
    financialImpact: 2200,
    narrative: "F4 showing progressive efficiency degradation linked to elevated condenser inlet temperatures. Rooftop fan vibration suggests mechanical wear. Multiple contributing factors likely. Recommend rooftop inspection within 7 days.",
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

// ── Energy Value Engine Data ──────────────────────────────
export const valueEngineData = {
  todayKwh: 1268,
  todaySavings: 312,
  ytdValue: 35457,
  tenYearProjection: 581170,
  dailyTrend: Array.from({ length: 30 }, (_, i) => {
    const day = new Date(Date.now() - (29 - i) * 86400000);
    const base = 280 + Math.random() * 120;
    return {
      date: `${day.getMonth() + 1}/${day.getDate()}`,
      savings: Math.round(base),
      cumulative: Math.round(base * (i + 1) * 0.95),
    };
  }),
  siteContributions: [
    { site: "G1", value: 5350, pct: 15.1 },
    { site: "G2", value: 5180, pct: 14.6 },
    { site: "G3", value: 4920, pct: 13.9 },
    { site: "F1", value: 5240, pct: 14.8 },
    { site: "F2", value: 4880, pct: 13.8 },
    { site: "F3", value: 5010, pct: 14.1 },
    { site: "F4", value: 4877, pct: 13.7 },
  ],
};
