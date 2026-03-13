import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, type WeatherData } from '@/lib/weatherService';

interface UseWeatherOptions {
  lat: number;
  lng: number;
  name: string;
  refreshInterval?: number; // ms, default 5 min
}

export function useWeather({ lat, lng, name, refreshInterval = 300000 }: UseWeatherOptions) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchWeather(lat, lng, name);
      setWeather(data);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, name]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  // Refresh when tab regains focus (stale data recovery)
  useEffect(() => {
    const onFocus = () => {
      if (lastRefreshed && Date.now() - lastRefreshed.getTime() > 120000) {
        refresh();
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onFocus();
    });
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh, lastRefreshed]);

  return { weather, loading, error, refresh, lastRefreshed };
}
