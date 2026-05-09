// ═══════════════════════════════════════════════════════════════
// ESCO PLATFORM — MOCK DATA ENGINE
// ═══════════════════════════════════════════════════════════════

export interface Site {
  id: string;
  name: string;
  city: string;
  region: string;
  type: string;
  customer: string;
  status: 'active' | 'pending' | 'offline';
  devices: number;
  assets: number;
  consumption_kwh: number;
  cost_sar: number;
  savings_pct: number;
  savings_sar: number;
  demand_kw: number;
  peak_kw: number;
  tariff: string;
  operating_hours: string;
  baseline_kwh: number;
  solutions: string[];
  projectStage: string;
  lat: number;
  lng: number;
}

export interface Device {
  id: string;
  serial: string;
  type: 'Eyedro Meter' | 'Gateway' | 'CT Sensor' | 'Sub-meter';
  siteId: string;
  siteName: string;
  status: 'online' | 'offline' | 'warning';
  lastSync: string;
  channels: number;
  firmware: string;
  installDate: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'RTU' | 'Chiller' | 'Cold Room' | 'Compressor' | 'Condenser' | 'AHU' | 'Split AC';
  siteId: string;
  siteName: string;
  meterId: string;
  capacity_tons: number;
  baseline_kw: number;
  current_kw: number;
  efficiency_gain: number;
  solution: string | null;
  status: 'optimized' | 'monitoring' | 'pending' | 'maintenance';
  runHours: number;
  abnormalFlags: number;
}

export interface Project {
  id: string;
  name: string;
  customer: string;
  siteId: string;
  siteName: string;
  stage: string;
  value_sar: number;
  expected_savings: number;
  products: string[];
  assigned: string;
  startDate: string;
  roi_pct: number;
  payback_years: number;
}

export interface Alert {
  id: string;
  siteId: string;
  siteName: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  assetName?: string;
}

// ─────────────────────────────────────────────────────────────────
// SINGLE-SITE DEPLOYMENT — Jarir Bookstore, Rawdah Showroom
// 7 packaged HVAC units (G1–G3 ground, F1–F4 first floor) monitored via Eyedro meters,
// plus G8 panel (cassettes/splits, not part of SCC).
// Locked Performance Model: 35,457 SAR direct savings, 80,762 kWh avoided.
// ─────────────────────────────────────────────────────────────────
export const sites: Site[] = [
  {
    id: 'S001',
    name: 'Jarir — Rawdah',
    city: 'Riyadh',
    region: 'Central',
    type: 'Retail',
    customer: 'Jarir Bookstore',
    status: 'active',
    devices: 3,
    assets: 7,
    consumption_kwh: 462800,
    cost_sar: 213379,
    savings_pct: 14.1,
    savings_sar: 35457,
    demand_kw: 189,
    peak_kw: 495,
    tariff: 'Commercial',
    operating_hours: '09:00–23:00',
    baseline_kwh: 543562,
    solutions: ['SCC/VMF'],
    projectStage: 'Monitoring Live',
    lat: 24.7136,
    lng: 46.6753,
  },
];

export const devices: Device[] = sites.filter(s => s.devices > 0).flatMap(s => {
  const devs: Device[] = [];
  for (let i = 0; i < s.devices; i++) {
    devs.push({
      id: `D-${s.id}-${i + 1}`,
      serial: `EYD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      type: i === 0 ? 'Gateway' : i <= 2 ? 'Eyedro Meter' : 'CT Sensor',
      siteId: s.id,
      siteName: s.name,
      status: s.status === 'active' ? (Math.random() > 0.1 ? 'online' : 'warning') : 'offline',
      lastSync: s.status === 'active' ? new Date(Date.now() - Math.random() * 300000).toISOString() : 'N/A',
      channels: i === 0 ? 0 : Math.floor(Math.random() * 4) + 1,
      firmware: `v${Math.floor(Math.random() * 3) + 2}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`,
      installDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    });
  }
  return devs;
});

// Real Rawdah inventory: G1–G3 (ground), F1–F4 (first floor) on SCC + G8 (non-SCC panel)
const RAWDAH_UNITS = [
  { name: 'G1', cap: 25, bkw: 62, gain: 13.5, status: 'optimized' as const, solution: 'SCC/VMF', flags: 0 },
  { name: 'G2', cap: 25, bkw: 66, gain: 14.8, status: 'optimized' as const, solution: 'SCC/VMF', flags: 0 },
  { name: 'G3', cap: 25, bkw: 64, gain: 14.1, status: 'optimized' as const, solution: 'SCC/VMF', flags: 0 },
  { name: 'F1', cap: 25, bkw: 72, gain: 12.2, status: 'monitoring' as const, solution: 'SCC/VMF', flags: 1 },
  { name: 'F2', cap: 25, bkw: 66, gain: 14.5, status: 'optimized' as const, solution: 'SCC/VMF', flags: 0 },
  { name: 'F3', cap: 25, bkw: 64, gain: 14.9, status: 'optimized' as const, solution: 'SCC/VMF', flags: 0 },
  { name: 'F4', cap: 25, bkw: 58, gain: 15.6, status: 'optimized' as const, solution: 'SCC/VMF', flags: 0 },
  { name: 'G8', cap: 18, bkw: 48, gain: 0,    status: 'pending' as const,    solution: '—',       flags: 0 },
];
export const assets: Asset[] = sites.flatMap(s =>
  RAWDAH_UNITS.map((u, i) => ({
    id: `A-${s.id}-${u.name}`,
    name: u.name,
    type: 'RTU' as const,
    siteId: s.id,
    siteName: s.name,
    meterId: `D-${s.id}-${(i % s.devices) + 1}`,
    capacity_tons: u.cap,
    baseline_kw: u.bkw,
    current_kw: Math.round(u.bkw * (1 - u.gain / 100)),
    efficiency_gain: u.gain,
    solution: u.solution,
    status: u.status,
    runHours: 3200 + i * 180,
    abnormalFlags: u.flags,
  }))
);

const stages = ['Lead', 'Site Survey Scheduled', 'Survey Complete', 'Audit Complete', 'Proposal Sent', 'Approved', 'Installation Planned', 'Installation Complete', 'Monitoring Live', 'M&V / Verification', 'Closed / Renewed'];

export const projects: Project[] = sites.map((s, i) => ({
  id: `P-${String(i + 1).padStart(3, '0')}`,
  name: `${s.name} Energy Optimization`,
  customer: s.customer,
  siteId: s.id,
  siteName: s.name,
  stage: s.projectStage || stages[Math.floor(Math.random() * stages.length)],
  value_sar: s.type === 'Healthcare' || s.type === 'Education' ? 450000 : s.type === 'Hospitality' ? 320000 : 175000,
  expected_savings: s.savings_pct > 0 ? s.savings_sar : Math.round(s.cost_sar * 0.12),
  products: s.solutions.length > 0 ? s.solutions : ['SCC/VMF'],
  assigned: ['Eng. Ahmed', 'Eng. Khalid', 'Eng. Omar', 'Eng. Faisal'][i % 4],
  startDate: `202${4 + Math.floor(i / 8)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
  roi_pct: s.savings_pct > 0 ? Math.round((s.savings_sar * 5 - 175000) / 175000 * 100) : 0,
  payback_years: s.savings_pct > 0 ? Math.round(175000 / (s.savings_sar + 22660) * 10) / 10 : 0,
}));

const alertTypes = ['Demand Threshold', 'Communication Loss', 'Abnormal Load', 'After-Hours Usage', 'Maintenance Risk', 'Outage Detected', 'Asset Anomaly'];

export const alerts: Alert[] = [
  { id: 'AL001', siteId: 'S001', siteName: 'Jarir — Rawdah', type: 'Demand Threshold', severity: 'critical', message: 'Peak demand exceeded 480 kW threshold at 14:32', timestamp: new Date(Date.now() - 1800000).toISOString(), acknowledged: false, assetName: 'G3' },
  { id: 'AL002', siteId: 'S001', siteName: 'Jarir — Rawdah', type: 'After-Hours Usage', severity: 'warning', message: 'After-hours load on F1 detected at 02:15 — 12 kW sustained', timestamp: new Date(Date.now() - 7200000).toISOString(), acknowledged: false, assetName: 'F1' },
  { id: 'AL003', siteId: 'S001', siteName: 'Jarir — Rawdah', type: 'Asset Anomaly', severity: 'warning', message: 'G3 compressor drawing 18% above baseline — possible valve degradation', timestamp: new Date(Date.now() - 14400000).toISOString(), acknowledged: false, assetName: 'G3' },
  { id: 'AL004', siteId: 'S001', siteName: 'Jarir — Rawdah', type: 'Maintenance Risk', severity: 'info', message: 'F3 runtime exceeds 4,000 hours — filter inspection recommended', timestamp: new Date(Date.now() - 28800000).toISOString(), acknowledged: true, assetName: 'F3' },
  { id: 'AL005', siteId: 'S001', siteName: 'Jarir — Rawdah', type: 'Communication Loss', severity: 'warning', message: 'Eyedro gateway D-S001-1 lost sync for 12 minutes — recovered', timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: true },
  { id: 'AL006', siteId: 'S001', siteName: 'Jarir — Rawdah', type: 'Abnormal Load', severity: 'warning', message: 'G2 short-cycling 4× in last hour — refrigerant charge suspect', timestamp: new Date(Date.now() - 43200000).toISOString(), acknowledged: true, assetName: 'G2' },
  { id: 'AL007', siteId: 'S001', siteName: 'Jarir — Rawdah', type: 'Asset Anomaly', severity: 'info', message: 'F4 supply-return ΔT narrowed to 4.2°C (target 6–8°C)', timestamp: new Date(Date.now() - 5400000).toISOString(), acknowledged: false, assetName: 'F4' },
];

export const monthlyTrends = [
  { month: 'Jan', consumption: 980000, cost: 294000, savings: 42000, demand: 3200 },
  { month: 'Feb', consumption: 920000, cost: 276000, savings: 38000, demand: 3000 },
  { month: 'Mar', consumption: 1050000, cost: 315000, savings: 51000, demand: 3400 },
  { month: 'Apr', consumption: 1280000, cost: 384000, savings: 62000, demand: 4100 },
  { month: 'May', consumption: 1560000, cost: 468000, savings: 78000, demand: 5000 },
  { month: 'Jun', consumption: 1820000, cost: 546000, savings: 95000, demand: 5800 },
  { month: 'Jul', consumption: 1950000, cost: 585000, savings: 108000, demand: 6200 },
  { month: 'Aug', consumption: 1980000, cost: 594000, savings: 112000, demand: 6300 },
  { month: 'Sep', consumption: 1680000, cost: 504000, savings: 88000, demand: 5400 },
  { month: 'Oct', consumption: 1350000, cost: 405000, savings: 65000, demand: 4300 },
  { month: 'Nov', consumption: 1050000, cost: 315000, savings: 48000, demand: 3400 },
  { month: 'Dec', consumption: 960000, cost: 288000, savings: 40000, demand: 3100 },
];

export const portfolioKPIs = {
  totalSites: sites.length,
  activeSites: sites.filter(s => s.status === 'active').length,
  totalDevices: devices.length,
  onlineDevices: devices.filter(d => d.status === 'online').length,
  totalConsumption: sites.reduce((a, s) => a + s.consumption_kwh, 0),
  totalCost: sites.reduce((a, s) => a + s.cost_sar, 0),
  totalSavings: sites.reduce((a, s) => a + s.savings_sar, 0),
  totalDemand: sites.reduce((a, s) => a + s.demand_kw, 0),
  totalPeak: sites.reduce((a, s) => a + s.peak_kw, 0),
  avgEfficiency: Math.round(sites.filter(s => s.savings_pct > 0).reduce((a, s) => a + s.savings_pct, 0) / sites.filter(s => s.savings_pct > 0).length * 10) / 10,
  carbonReduction: Math.round(sites.reduce((a, s) => a + s.savings_sar, 0) / 0.3 * 0.000727 * 100) / 100,
  activeAlerts: alerts.filter(a => !a.acknowledged).length,
  criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
  openProjects: projects.filter(p => !['Closed / Renewed', 'Monitoring Live'].includes(p.stage)).length,
  totalAssets: assets.length,
  optimizedAssets: assets.filter(a => a.status === 'optimized').length,
};

export const tariffs = [
  { id: 'T001', name: 'Commercial — Standard', fixedCharge: 0, tiers: [{ from: 0, to: 6000, rate: 0.30 }, { from: 6001, to: Infinity, rate: 0.32 }], demandCharge: 0, currency: 'SAR' },
  { id: 'T002', name: 'Government — Standard', fixedCharge: 0, tiers: [{ from: 0, to: Infinity, rate: 0.30 }], demandCharge: 0, currency: 'SAR' },
  { id: 'T003', name: 'Industrial — Standard', fixedCharge: 0, tiers: [{ from: 0, to: Infinity, rate: 0.30 }], demandCharge: 15, currency: 'SAR' },
];
