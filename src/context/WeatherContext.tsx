import { createContext, useContext, ReactNode } from 'react';
import { useWeather } from '@/hooks/useWeather';
import type { WeatherData } from '@/lib/weatherService';

interface WeatherContextType {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | null>(null);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const value = useWeather({ lat: 24.7136, lng: 46.6753, name: 'Riyadh' });
  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useGlobalWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useGlobalWeather must be used within WeatherProvider');
  return ctx;
}
