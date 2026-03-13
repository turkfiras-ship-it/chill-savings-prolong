import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, type WeatherData } from '@/lib/weatherService';

interface UseWeatherOptions {
  lat: number;
  lng: number;
  name: string;
  refreshInterval?: number; // ms, default 10 min
}

export function useWeather({ lat, lng, name, refreshInterval = 600000 }: UseWeatherOptions) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchWeather(lat, lng, name);
      setWeather(data);
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

  return { weather, loading, error, refresh };
}