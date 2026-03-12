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

const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'Khobar', 'Tabuk', 'Abha', 'Jubail', 'Yanbu'];
const siteTypes = ['Retail', 'Commercial', 'Industrial', 'Healthcare', 'Hospitality', 'Education', 'Government', 'Warehouse'];
const customers = ['Jarir Bookstore', 'Al Othaim Markets', 'Panda Retail', 'BinDawood Holding', 'Abdullah Al-Othaim', 'Al Rajhi Bank', 'Saudi German Hospital', 'Hilton Hotels KSA', 'King Saud University', 'SABIC'];

export const sites: Site[] = [
  { id: 'S001', name: 'Jarir — Rawdah', city: 'Riyadh', region: 'Central', type: 'Retail', customer: 'Jarir Bookstore', status: 'active', devices: 4, assets: 7, consumption_kwh: 462800, cost_sar: 213379, savings_pct: 14.1, savings_sar: 35457, demand_kw: 189, peak_kw: 495, tariff: 'Commercial', operating_hours: '09:00–23:00', baseline_kwh: 543562, solutions: ['SCC/VMF'], projectStage: 'Monitoring Live', lat: 24.7136, lng: 46.6753 },
  { id: 'S002', name: 'Jarir — Olaya', city: 'Riyadh', region: 'Central', type: 'Retail', customer: 'Jarir Bookstore', status: 'active', devices: 3, assets: 5, consumption_kwh: 389000, cost_sar: 178500, savings_pct: 11.2, savings_sar: 22400, demand_kw: 165, peak_kw: 410, tariff: 'Commercial', operating_hours: '09:00–23:00', baseline_kwh: 438000, solutions: ['SCC/VMF'], projectStage: 'Monitoring Live', lat: 24.6909, lng: 46.6856 },
  { id: 'S003', name: 'Jarir — Malaz', city: 'Riyadh', region: 'Central', type: 'Retail', customer: 'Jarir Bookstore', status: 'active', devices: 3, assets: 6, consumption_kwh: 415000, cost_sar: 191200, savings_pct: 12.5, savings_sar: 27800, demand_kw: 178, peak_kw: 445, tariff: 'Commercial', operating_hours: '09:00–23:00', baseline_kwh: 474000, solutions: ['SCC/VMF'], projectStage: 'Installation Complete', lat: 24.6537, lng: 46.7197 },
  { id: 'S004', name: 'Jarir — Tahlia', city: 'Jeddah', region: 'Western', type: 'Retail', customer: 'Jarir Bookstore', status: 'active', devices: 4, assets: 8, consumption_kwh: 520000, cost_sar: 239200, savings_pct: 10.8, savings_sar: 28600, demand_kw: 220, peak_kw: 550, tariff: 'Commercial', operating_hours: '09:00–23:00', baseline_kwh: 583000, solutions: ['SCC/VMF'], projectStage: 'Monitoring Live', lat: 21.5433, lng: 39.1728 },
  { id: 'S005', name: 'Jarir — Corniche', city: 'Dammam', region: 'Eastern', type: 'Retail', customer: 'Jarir Bookstore', status: 'active', devices: 3, assets: 5, consumption_kwh: 375000, cost_sar: 172500, savings_pct: 13.2, savings_sar: 25200, demand_kw: 160, peak_kw: 400, tariff: 'Commercial', operating_hours: '09:00–23:00', baseline_kwh: 432000, solutions: ['SCC/VMF'], projectStage: 'M&V / Verification', lat: 26.4207, lng: 50.0888 },
  { id: 'S006', name: 'Al Othaim — King Fahd', city: 'Riyadh', region: 'Central', type: 'Retail', customer: 'Al Othaim Markets', status: 'active', devices: 6, assets: 12, consumption_kwh: 890000, cost_sar: 409400, savings_pct: 18.5, savings_sar: 84300, demand_kw: 380, peak_kw: 820, tariff: 'Commercial', operating_hours: '07:00–00:00', baseline_kwh: 1092000, solutions: ['SCC/VMF', 'Refrigeration Optimization'], projectStage: 'Monitoring Live', lat: 24.7253, lng: 46.6400 },
  { id: 'S007', name: 'Al Othaim — Exit 15', city: 'Riyadh', region: 'Central', type: 'Retail', customer: 'Al Othaim Markets', status: 'pending', devices: 0, assets: 10, consumption_kwh: 780000, cost_sar: 358800, savings_pct: 0, savings_sar: 0, demand_kw: 340, peak_kw: 750, tariff: 'Commercial', operating_hours: '07:00–00:00', baseline_kwh: 780000, solutions: [], projectStage: 'Proposal Sent', lat: 24.7741, lng: 46.7380 },
  { id: 'S008', name: 'Panda — Khalidiyah', city: 'Jeddah', region: 'Western', type: 'Retail', customer: 'Panda Retail', status: 'active', devices: 5, assets: 9, consumption_kwh: 720000, cost_sar: 331200, savings_pct: 15.8, savings_sar: 58100, demand_kw: 310, peak_kw: 680, tariff: 'Commercial', operating_hours: '07:00–00:00', baseline_kwh: 855000, solutions: ['SCC/VMF', 'Refrigeration Optimization'], projectStage: 'Monitoring Live', lat: 21.5169, lng: 39.1653 },
  { id: 'S009', name: 'BinDawood — Aziziyah', city: 'Makkah', region: 'Western', type: 'Retail', customer: 'BinDawood Holding', status: 'active', devices: 4, assets: 8, consumption_kwh: 650000, cost_sar: 299000, savings_pct: 12.1, savings_sar: 40200, demand_kw: 280, peak_kw: 620, tariff: 'Commercial', operating_hours: '08:00–01:00', baseline_kwh: 739000, solutions: ['SCC/VMF'], projectStage: 'Installation Complete', lat: 21.4225, lng: 39.8262 },
  { id: 'S010', name: 'Saudi German Hospital — Riyadh', city: 'Riyadh', region: 'Central', type: 'Healthcare', customer: 'Saudi German Hospital', status: 'active', devices: 8, assets: 15, consumption_kwh: 1450000, cost_sar: 667000, savings_pct: 16.3, savings_sar: 120500, demand_kw: 620, peak_kw: 1400, tariff: 'Government', operating_hours: '24/7', baseline_kwh: 1732000, solutions: ['SCC/VMF', 'Solar Thermal'], projectStage: 'Monitoring Live', lat: 24.6877, lng: 46.6225 },
  { id: 'S011', name: 'Hilton — Jeddah Corniche', city: 'Jeddah', region: 'Western', type: 'Hospitality', customer: 'Hilton Hotels KSA', status: 'active', devices: 6, assets: 11, consumption_kwh: 1120000, cost_sar: 515200, savings_pct: 14.7, savings_sar: 84200, demand_kw: 480, peak_kw: 1100, tariff: 'Commercial', operating_hours: '24/7', baseline_kwh: 1313000, solutions: ['SCC/VMF', 'Solar Thermal'], projectStage: 'M&V / Verification', lat: 21.5485, lng: 39.1090 },
  { id: 'S012', name: 'King Saud University — Main Campus', city: 'Riyadh', region: 'Central', type: 'Education', customer: 'King Saud University', status: 'active', devices: 12, assets: 20, consumption_kwh: 2800000, cost_sar: 840000, savings_pct: 11.5, savings_sar: 107000, demand_kw: 1200, peak_kw: 2800, tariff: 'Government', operating_hours: '06:00–22:00', baseline_kwh: 3164000, solutions: ['SCC/VMF'], projectStage: 'Monitoring Live', lat: 24.7216, lng: 46.6198 },
  { id: 'S013', name: 'SABIC — Admin Tower', city: 'Jubail', region: 'Eastern', type: 'Industrial', customer: 'SABIC', status: 'active', devices: 5, assets: 8, consumption_kwh: 580000, cost_sar: 174000, savings_pct: 19.2, savings_sar: 41300, demand_kw: 250, peak_kw: 580, tariff: 'Industrial', operating_hours: '24/7', baseline_kwh: 718000, solutions: ['SCC/VMF', 'Refrigeration Optimization'], projectStage: 'Monitoring Live', lat: 27.0174, lng: 49.6225 },
  { id: 'S014', name: 'Al Rajhi — HQ Tower', city: 'Riyadh', region: 'Central', type: 'Commercial', customer: 'Al Rajhi Bank', status: 'active', devices: 7, assets: 10, consumption_kwh: 980000, cost_sar: 450800, savings_pct: 13.8, savings_sar: 69200, demand_kw: 420, peak_kw: 960, tariff: 'Commercial', operating_hours: '07:00–18:00', baseline_kwh: 1137000, solutions: ['SCC/VMF'], projectStage: 'Monitoring Live', lat: 24.6905, lng: 46.6858 },
  { id: 'S015', name: 'Jarir — Khobar', city: 'Khobar', region: 'Eastern', type: 'Retail', customer: 'Jarir Bookstore', status: 'pending', devices: 0, assets: 6, consumption_kwh: 410000, cost_sar: 188600, savings_pct: 0, savings_sar: 0, demand_kw: 175, peak_kw: 440, tariff: 'Commercial', operating_hours: '09:00–23:00', baseline_kwh: 410000, solutions: [], projectStage: 'Site Survey Scheduled', lat: 26.2794, lng: 50.2085 },
  { id: 'S016', name: 'Panda — Madinah Central', city: 'Madinah', region: 'Western', type: 'Retail', customer: 'Panda Retail', status: 'pending', devices: 0, assets: 7, consumption_kwh: 560000, cost_sar: 257600, savings_pct: 0, savings_sar: 0, demand_kw: 240, peak_kw: 530, tariff: 'Commercial', operating_hours: '07:00–00:00', baseline_kwh: 560000, solutions: [], projectStage: 'Audit Complete', lat: 24.4672, lng: 39.6024 },
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

export const assets: Asset[] = sites.flatMap(s => {
  const types: Asset['type'][] = ['RTU', 'Chiller', 'Split AC', 'AHU', 'Cold Room', 'Compressor', 'Condenser'];
  const items: Asset[] = [];
  for (let i = 0; i < s.assets; i++) {
    const t = types[i % types.length];
    const cap = t === 'Chiller' ? 200 : t === 'RTU' ? 25 : t === 'Cold Room' ? 15 : t === 'AHU' ? 40 : t === 'Compressor' ? 30 : t === 'Condenser' ? 35 : 5;
    const bkw = cap * (2 + Math.random());
    const gain = s.savings_pct > 0 ? s.savings_pct + (Math.random() * 4 - 2) : 0;
    items.push({
      id: `A-${s.id}-${i + 1}`,
      name: `${t}-${i + 1}`,
      type: t,
      siteId: s.id,
      siteName: s.name,
      meterId: s.devices > 0 ? `D-${s.id}-${Math.min(i + 1, s.devices)}` : '',
      capacity_tons: cap,
      baseline_kw: Math.round(bkw),
      current_kw: Math.round(bkw * (1 - Math.max(0, gain) / 100)),
      efficiency_gain: Math.round(Math.max(0, gain) * 10) / 10,
      solution: s.solutions.length > 0 ? s.solutions[i % s.solutions.length] : null,
      status: s.savings_pct > 0 ? (Math.random() > 0.15 ? 'optimized' : 'monitoring') : (Math.random() > 0.5 ? 'pending' : 'monitoring'),
      runHours: Math.round(2000 + Math.random() * 4000),
      abnormalFlags: Math.floor(Math.random() * 3),
    });
  }
  return items;
});

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
  { id: 'AL001', siteId: 'S006', siteName: 'Al Othaim — King Fahd', type: 'Demand Threshold', severity: 'critical', message: 'Peak demand exceeded 800 kW threshold at 14:32', timestamp: new Date(Date.now() - 1800000).toISOString(), acknowledged: false, assetName: 'Chiller-1' },
  { id: 'AL002', siteId: 'S001', siteName: 'Jarir — Rawdah', type: 'After-Hours Usage', severity: 'warning', message: 'Energy consumption detected at 02:15 AM — 12 kW sustained load', timestamp: new Date(Date.now() - 7200000).toISOString(), acknowledged: false },
  { id: 'AL003', siteId: 'S013', siteName: 'SABIC — Admin Tower', type: 'Asset Anomaly', severity: 'warning', message: 'Compressor-2 showing 22% higher draw than baseline', timestamp: new Date(Date.now() - 14400000).toISOString(), acknowledged: true, assetName: 'Compressor-2' },
  { id: 'AL004', siteId: 'S011', siteName: 'Hilton — Jeddah Corniche', type: 'Maintenance Risk', severity: 'info', message: 'AHU-3 runtime exceeds 5,000 hours — maintenance recommended', timestamp: new Date(Date.now() - 28800000).toISOString(), acknowledged: false, assetName: 'AHU-3' },
  { id: 'AL005', siteId: 'S008', siteName: 'Panda — Khalidiyah', type: 'Communication Loss', severity: 'critical', message: 'Gateway D-S008-1 offline for 45 minutes', timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: false },
  { id: 'AL006', siteId: 'S012', siteName: 'King Saud University — Main Campus', type: 'Abnormal Load', severity: 'warning', message: 'Building 7 consumption 35% above normal for this time', timestamp: new Date(Date.now() - 43200000).toISOString(), acknowledged: true },
  { id: 'AL007', siteId: 'S010', siteName: 'Saudi German Hospital — Riyadh', type: 'Demand Threshold', severity: 'warning', message: 'Approaching 1,400 kW demand limit — currently at 1,350 kW', timestamp: new Date(Date.now() - 5400000).toISOString(), acknowledged: false },
  { id: 'AL008', siteId: 'S004', siteName: 'Jarir — Tahlia', type: 'Outage Detected', severity: 'critical', message: 'Complete power loss detected on Circuit B — backup engaged', timestamp: new Date(Date.now() - 900000).toISOString(), acknowledged: false },
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
