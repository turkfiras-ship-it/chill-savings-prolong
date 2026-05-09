import { useEffect, useRef } from "react";
import { alerts } from "@/data/mockData";
import { toast } from "sonner";
import { AlertTriangle, Bell, Info } from "lucide-react";

const ALERT_INTERVAL = 15000; // simulate new alerts every 15s

const alertPool = [
  { severity: 'critical' as const, message: 'Peak demand exceeded 480 kW threshold', site: 'Jarir — Rawdah · G3' },
  { severity: 'warning' as const, message: 'G3 compressor drawing 18% above baseline', site: 'Jarir — Rawdah' },
  { severity: 'warning' as const, message: 'After-hours load detected — 12 kW sustained at 02:15', site: 'Jarir — Rawdah · F2' },
  { severity: 'info' as const, message: 'F3 runtime exceeds 4,000 hrs — filter inspection recommended', site: 'Jarir — Rawdah' },
  { severity: 'warning' as const, message: 'G2 short-cycling 4× in last hour', site: 'Jarir — Rawdah' },
  { severity: 'info' as const, message: 'F4 supply-return ΔT narrowed to 4.2°C', site: 'Jarir — Rawdah' },
  { severity: 'warning' as const, message: 'Eyedro gateway D-S001-1 lost sync for 12 min — recovered', site: 'Jarir — Rawdah' },
];

export function AlertNotifications() {
  const indexRef = useRef(0);

  useEffect(() => {
    // Show first toast after a short delay
    const initialTimeout = setTimeout(() => {
      fireAlert();
    }, 5000);

    const interval = setInterval(() => {
      fireAlert();
    }, ALERT_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  function fireAlert() {
    const alert = alertPool[indexRef.current % alertPool.length];
    indexRef.current++;

    const icon = alert.severity === 'critical'
      ? <AlertTriangle className="h-4 w-4 text-destructive" />
      : alert.severity === 'warning'
      ? <Bell className="h-4 w-4 text-warning" />
      : <Info className="h-4 w-4 text-energy" />;

    const toastFn = alert.severity === 'critical' ? toast.error
      : alert.severity === 'warning' ? toast.warning
      : toast.info;

    toastFn(alert.message, {
      description: alert.site,
      duration: 6000,
      icon,
    });
  }

  return null; // Headless component
}
