import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeather, type WeatherData } from '@/lib/weatherService';

interface UseWeatherOptions {
  lat: number;
  lng: number;
  name: string;
  refreshInterval?: number;
}

export function useWeather({ lat, lng, name, refreshInterval = 300000 }: UseWeatherOptions) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRefreshedRef = useRef<number>(0);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchWeather(lat, lng, name);
      setWeather(data);
      lastRefreshedRef.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, name]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);

    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefreshedRef.current > 120000) {
        refresh();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh, refreshInterval]);

  return { weather, loading, error, refresh };
}
