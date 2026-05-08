// Real Eyedro device inventory pulled from MyEyedro account
// Account: chadinkairouz@gmail.com  |  Site: Jarir Bookstore — Rawdah branch (SiteId 30979)
// 7 active devices, 3 amperage ports + WiFi signal each

export interface EyedroSensor {
  port: "A" | "B" | "C" | "WiFi";
  dsId: number;
  label: string;
}

export interface EyedroDevice {
  unit: string;            // G1..G3, FF1..FF4
  devId: number;
  serialHex: string;
  firmware: string;
  state: "Active" | "Inactive";
  aliasId: number;
  billProfileId: number;
  startedAt: string;       // ISO
  sensors: EyedroSensor[];
}

export const EYEDRO_SITE = {
  siteId: 30979,
  label: "Jarir Bookstore — Rawdah",
  city: "Riyadh",
  countryId: 187,
  timezoneId: 111,
};

export const EYEDRO_DEVICES: EyedroDevice[] = [
  {
    unit: "G1", devId: 31696, serialHex: "00C004EC", firmware: "4.16.6.0",
    state: "Active", aliasId: 30422, billProfileId: 15984,
    startedAt: new Date(1647960452 * 1000).toISOString(),
    sensors: [
      { port: "A", dsId: 88779, label: "Port A" },
      { port: "B", dsId: 88780, label: "Port B" },
      { port: "C", dsId: 88781, label: "Port C" },
      { port: "WiFi", dsId: 88782, label: "WiFi Signal" },
    ],
  },
  {
    unit: "G2", devId: 30055, serialHex: "00C003A3", firmware: "4.16.6.0",
    state: "Active", aliasId: 39691, billProfileId: 22943,
    startedAt: new Date(1632492297 * 1000).toISOString(),
    sensors: [
      { port: "A", dsId: 84081, label: "Port A" },
      { port: "B", dsId: 84082, label: "Port B" },
      { port: "C", dsId: 84083, label: "Port C" },
      { port: "WiFi", dsId: 84084, label: "WiFi Signal" },
    ],
  },
  {
    unit: "G3", devId: 44524, serialHex: "B1400AA4", firmware: "5.11.0.4",
    state: "Active", aliasId: 47970, billProfileId: 22943,
    startedAt: new Date(1721061029 * 1000).toISOString(),
    sensors: [
      { port: "A", dsId: 128493, label: "Port A" },
      { port: "B", dsId: 128494, label: "Port B" },
      { port: "C", dsId: 128495, label: "Port C" },
      { port: "WiFi", dsId: 128496, label: "Wireless Signal" },
    ],
  },
  {
    unit: "FF1", devId: 44525, serialHex: "B1400AA5", firmware: "5.11.0.4",
    state: "Active", aliasId: 47973, billProfileId: 22943,
    startedAt: new Date(1721061193 * 1000).toISOString(),
    sensors: [
      { port: "A", dsId: 128497, label: "Port A" },
      { port: "B", dsId: 128498, label: "Port B" },
      { port: "C", dsId: 128499, label: "Port C" },
      { port: "WiFi", dsId: 128500, label: "Wireless Signal" },
    ],
  },
  {
    unit: "FF2", devId: 44522, serialHex: "B1400AA2", firmware: "5.11.0.4",
    state: "Active", aliasId: 47975, billProfileId: 22943,
    startedAt: new Date(1721060673 * 1000).toISOString(),
    sensors: [
      { port: "A", dsId: 128485, label: "Port A" },
      { port: "B", dsId: 128486, label: "Port B" },
      { port: "C", dsId: 128487, label: "Port C" },
      { port: "WiFi", dsId: 128488, label: "Wireless Signal" },
    ],
  },
  {
    unit: "FF3", devId: 44526, serialHex: "B1400AA6", firmware: "5.11.0.4",
    state: "Active", aliasId: 49158, billProfileId: 22943,
    startedAt: new Date(1721061367 * 1000).toISOString(),
    sensors: [
      { port: "A", dsId: 128501, label: "Port A" },
      { port: "B", dsId: 128502, label: "Port B" },
      { port: "C", dsId: 128503, label: "Port C" },
      { port: "WiFi", dsId: 128504, label: "Wireless Signal" },
    ],
  },
  {
    unit: "FF4", devId: 44523, serialHex: "B1400AA3", firmware: "5.11.0.4",
    state: "Active", aliasId: 47972, billProfileId: 22943,
    startedAt: new Date(1721060850 * 1000).toISOString(),
    sensors: [
      { port: "A", dsId: 128489, label: "Port A" },
      { port: "B", dsId: 128490, label: "Port B" },
      { port: "C", dsId: 128491, label: "Port C" },
      { port: "WiFi", dsId: 128492, label: "Wireless Signal" },
    ],
  },
];

export const EYEDRO_DEVICE_BY_UNIT: Record<string, EyedroDevice> =
  EYEDRO_DEVICES.reduce((acc, d) => { acc[d.unit] = d; return acc; }, {} as Record<string, EyedroDevice>);