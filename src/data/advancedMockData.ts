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
const owners = ["Jarir Bookstore", "Al Othaim Markets", "Panda Retail", "BinDawood", "SABIC", "Al Rajhi Bank", "Saudi German Hospital", "Hilton KSA", "King Saud Univ", "Ministry of Health"];

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
      { time: "10:02", event: "Compressor cycling increased 340%", type: "anomaly" },
      { time: "10:05", event: "Supply/return temperature delta dropped to 2.1°C", type: "data" },
      { time: "10:12", event: "Energy consumption spike: +38 kW above baseline", type: "alert" },
      { time: "10:18", event: "Condenser pressure rising — 18.4 bar", type: "anomaly" },
      { time: "10:25", event: "COP degraded from 3.2 to 1.8", type: "data" },
    ],
    suspects: [
      { cause: "Compressor Valve Leak", probability: 74 },
      { cause: "Refrigerant Loss", probability: 18 },
      { cause: "Sensor Fault", probability: 8 },
    ],
    financialImpact: 3120,
    narrative: "The evidence suggests that compressor #3 is cycling abnormally without a corresponding increase in cooling demand, indicating possible valve degradation. The supply-return delta has collapsed to 2.1°C (normal: 6-8°C), while condenser pressure continues rising. Financial exposure: 3,120 SAR/month if uncorrected.",
  },
  {
    id: "EC-4822",
    status: "Active Investigation",
    site: "Al Othaim — King Fahd",
    siteId: "S006",
    severity: "Critical",
    openedAt: new Date(Date.now() - 7200000).toISOString(),
    evidence: [
      { time: "08:15", event: "Refrigeration compressor #2 drawing 22% above rated capacity", type: "anomaly" },
      { time: "08:30", event: "Cold room temperature rising: -16°C → -11°C", type: "alert" },
      { time: "08:45", event: "Defrost cycle duration anomaly detected", type: "data" },
      { time: "09:00", event: "Adjacent compressor #3 auto-started to compensate", type: "anomaly" },
    ],
    suspects: [
      { cause: "Evaporator Coil Icing", probability: 62 },
      { cause: "Defrost Timer Failure", probability: 28 },
      { cause: "Refrigerant Overcharge", probability: 10 },
    ],
    financialImpact: 5800,
    narrative: "Refrigeration system at Al Othaim King Fahd showing cascading failure pattern. Compressor #2 is overdrawn while cold room temperatures are rising, suggesting evaporator coil icing blocking airflow. The defrost cycle anomaly corroborates this theory. Immediate intervention recommended.",
  },
  {
    id: "EC-4819",
    status: "Resolved",
    site: "Panda — Khalidiyah",
    siteId: "S008",
    severity: "Medium",
    openedAt: new Date(Date.now() - 86400000).toISOString(),
    evidence: [
      { time: "14:20", event: "After-hours energy consumption detected: 28 kW", type: "alert" },
      { time: "14:35", event: "HVAC running at full capacity — no occupancy signal", type: "data" },
      { time: "15:00", event: "BMS schedule override found active", type: "data" },
    ],
    suspects: [
      { cause: "BMS Schedule Override", probability: 92 },
      { cause: "Occupancy Sensor Failure", probability: 8 },
    ],
    financialImpact: 1450,
    narrative: "Investigation confirmed that a manual BMS schedule override was left active after a maintenance event, causing HVAC to run at full capacity during unoccupied hours. Override has been removed. Case closed.",
  },
  {
    id: "EC-4823",
    status: "Under Review",
    site: "Saudi German Hospital — Riyadh",
    siteId: "S010",
    severity: "High",
    openedAt: new Date(Date.now() - 14400000).toISOString(),
    evidence: [
      { time: "06:00", event: "Chiller #1 efficiency dropped 15% overnight", type: "anomaly" },
      { time: "06:30", event: "Condenser water temperature elevated: 38°C vs 32°C normal", type: "data" },
      { time: "07:00", event: "Cooling tower fan vibration alarm triggered", type: "alert" },
    ],
    suspects: [
      { cause: "Cooling Tower Fouling", probability: 55 },
      { cause: "Condenser Tube Scaling", probability: 30 },
      { cause: "Fan Belt Degradation", probability: 15 },
    ],
    financialImpact: 8200,
    narrative: "The chiller plant at Saudi German Hospital is showing progressive efficiency degradation linked to elevated condenser water temperatures. Cooling tower fan vibration suggests mechanical wear. Multiple contributing factors are likely. Recommend immediate cooling tower inspection.",
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
  const siteNames = [
    "Jarir — Rawdah", "Jarir — Olaya", "Jarir — Malaz", "Jarir — Tahlia", "Jarir — Corniche",
    "Al Othaim — King Fahd", "Al Othaim — Exit 15", "Panda — Khalidiyah", "BinDawood — Aziziyah",
    "Saudi German Hospital", "Hilton — Jeddah", "King Saud University", "SABIC — Admin Tower",
    "Al Rajhi — HQ", "Jarir — Khobar", "Panda — Madinah"
  ];
  const cities = ["Riyadh", "Riyadh", "Riyadh", "Jeddah", "Dammam", "Riyadh", "Riyadh", "Jeddah", "Makkah", "Riyadh", "Jeddah", "Riyadh", "Jubail", "Riyadh", "Khobar", "Madinah"];

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
  todayKwh: 43291,
  todaySavings: 11340,
  ytdValue: 3100000,
  tenYearProjection: 18400000,
  dailyTrend: Array.from({ length: 30 }, (_, i) => {
    const day = new Date(Date.now() - (29 - i) * 86400000);
    const base = 8000 + Math.random() * 6000;
    return {
      date: `${day.getMonth() + 1}/${day.getDate()}`,
      savings: Math.round(base),
      cumulative: Math.round(base * (i + 1) * 0.95),
    };
  }),
  siteContributions: [
    { site: "Saudi German Hospital", value: 120500, pct: 17.2 },
    { site: "Al Othaim — King Fahd", value: 84300, pct: 12.0 },
    { site: "Hilton — Jeddah", value: 84200, pct: 12.0 },
    { site: "King Saud University", value: 107000, pct: 15.3 },
    { site: "Al Rajhi — HQ", value: 69200, pct: 9.9 },
    { site: "Panda — Khalidiyah", value: 58100, pct: 8.3 },
    { site: "Jarir — Rawdah", value: 35457, pct: 5.1 },
    { site: "Jarir — Tahlia", value: 28600, pct: 4.1 },
  ],
};
