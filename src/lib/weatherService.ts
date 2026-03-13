// Open-Meteo Weather Service — Free, no API key required
// Provides current weather + forecast for any lat/lng

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
  pressure: number;
  uvIndex: number;
  visibility: number;
  cloudCover: number;
  precipitation: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationSum: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  location: { name: string; lat: number; lng: number };
  fetchedAt: string;
}

// WMO Weather interpretation codes
export const weatherCodeMap: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Moderate Drizzle', icon: '🌦️' },
  55: { label: 'Dense Drizzle', icon: '🌧️' },
  61: { label: 'Slight Rain', icon: '🌧️' },
  63: { label: 'Moderate Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Slight Snow', icon: '❄️' },
  73: { label: 'Moderate Snow', icon: '❄️' },
  75: { label: 'Heavy Snow', icon: '❄️' },
  77: { label: 'Snow Grains', icon: '❄️' },
  80: { label: 'Slight Showers', icon: '🌦️' },
  81: { label: 'Moderate Showers', icon: '🌧️' },
  82: { label: 'Violent Showers', icon: '⛈️' },
  85: { label: 'Slight Snow Showers', icon: '🌨️' },
  86: { label: 'Heavy Snow Showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm + Hail', icon: '⛈️' },
  99: { label: 'Thunderstorm + Heavy Hail', icon: '⛈️' },
};

export function getWeatherInfo(code: number) {
  return weatherCodeMap[code] || { label: 'Unknown', icon: '❓' };
}

// Estimate cooling load multiplier based on temperature
// Baseline: 25°C = 1.0x, each °C above adds ~6% load
export function estimateCoolingLoadMultiplier(tempC: number): number {
  if (tempC <= 25) return 0;
  return Math.round((1 + (tempC - 25) * 0.06) * 100) / 100;
}

// Estimate HVAC efficiency impact
export function estimateHvacEfficiencyImpact(tempC: number, humidity: number): {
  copReduction: number; // % reduction in COP
  loadIncrease: number; // % increase in cooling load
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  recommendation: string;
} {
  const loadIncrease = tempC > 25 ? Math.round((tempC - 25) * 6) : 0;
  const copReduction = tempC > 35 ? Math.round((tempC - 35) * 2.5 + (humidity > 40 ? humidity * 0.1 : 0)) : 0;
  
  let riskLevel: 'low' | 'moderate' | 'high' | 'extreme' = 'low';
  let recommendation = 'Normal operations — no action needed';
  
  if (tempC >= 48) {
    riskLevel = 'extreme';
    recommendation = 'Critical heat — reduce non-essential loads, verify compressor protection, check condenser coil temps';
  } else if (tempC >= 43) {
    riskLevel = 'high';
    recommendation = 'High heat stress — monitor compressor amps, ensure condenser fans running, pre-cool if possible';
  } else if (tempC >= 38) {
    riskLevel = 'moderate';
    recommendation = 'Elevated load — check setpoint adherence, verify SCC optimization is active';
  }

  return { copReduction, loadIncrease, riskLevel, recommendation };
}

export async function fetchWeather(lat: number, lng: number, name: string): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code,is_day,cloud_cover,precipitation,uv_index',
    hourly: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,sunrise,sunset,uv_index_max',
    timezone: 'Asia/Riyadh',
    forecast_days: '7',
    forecast_hours: '24',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
  const data = await response.json();

  const current: CurrentWeather = {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    pressure: data.current.pressure_msl,
    uvIndex: data.current.uv_index,
    visibility: 10000,
    cloudCover: data.current.cloud_cover,
    precipitation: data.current.precipitation,
  };

  const hourly: HourlyForecast[] = data.hourly.time.slice(0, 24).map((t: string, i: number) => ({
    time: t,
    temperature: data.hourly.temperature_2m[i],
    humidity: data.hourly.relative_humidity_2m[i],
    weatherCode: data.hourly.weather_code[i],
    windSpeed: data.hourly.wind_speed_10m[i],
    precipitation: data.hourly.precipitation[i],
  }));

  const daily: DailyForecast[] = data.daily.time.map((t: string, i: number) => ({
    date: t,
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    weatherCode: data.daily.weather_code[i],
    precipitationSum: data.daily.precipitation_sum[i],
    windSpeedMax: data.daily.wind_speed_10m_max[i],
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
    uvIndexMax: data.daily.uv_index_max[i],
  }));

  return {
    current,
    hourly,
    daily,
    location: { name, lat, lng },
    fetchedAt: new Date().toISOString(),
  };
}