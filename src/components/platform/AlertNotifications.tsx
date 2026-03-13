import { useEffect, useRef } from "react";
import { alerts } from "@/data/mockData";
import { toast } from "sonner";
import { AlertTriangle, Bell, Info } from "lucide-react";

const ALERT_INTERVAL = 15000; // simulate new alerts every 15s

const alertPool = [
  { severity: 'critical' as const, message: 'Peak demand exceeded threshold at Jarir — Rawdah', site: 'Jarir — Rawdah' },
  { severity: 'critical' as const, message: 'Gateway offline for 30+ minutes at Panda — Khalidiyah', site: 'Panda — Khalidiyah' },
  { severity: 'warning' as const, message: 'Compressor-3 drawing 18% above baseline at SABIC Tower', site: 'SABIC — Admin Tower' },
  { severity: 'warning' as const, message: 'After-hours energy usage detected at Al Othaim — King Fahd', site: 'Al Othaim — King Fahd' },
  { severity: 'critical' as const, message: 'Chiller-1 tripped on high head pressure — Hilton Jeddah', site: 'Hilton — Jeddah Corniche' },
  { severity: 'warning' as const, message: 'AHU-2 filter differential pressure high at KSU Campus', site: 'King Saud University' },
  { severity: 'info' as const, message: 'Scheduled maintenance window starting in 1 hour — Al Rajhi HQ', site: 'Al Rajhi — HQ Tower' },
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
