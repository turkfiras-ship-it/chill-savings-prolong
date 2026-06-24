CREATE TABLE public.daily_weather (
  date DATE PRIMARY KEY,
  max_temp_c NUMERIC,
  min_temp_c NUMERIC,
  mean_temp_c NUMERIC,
  cdd NUMERIC,
  source TEXT NOT NULL DEFAULT 'era5',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.daily_weather TO anon, authenticated;
GRANT ALL ON public.daily_weather TO service_role;

ALTER TABLE public.daily_weather ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read daily_weather"
  ON public.daily_weather FOR SELECT
  USING (true);

CREATE TRIGGER touch_daily_weather_updated_at
  BEFORE UPDATE ON public.daily_weather
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_daily_weather_date ON public.daily_weather(date DESC);