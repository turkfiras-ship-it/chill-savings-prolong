
CREATE TABLE public.daily_weather_rawdah (
  date date PRIMARY KEY,
  max_temp_c numeric,
  min_temp_c numeric,
  mean_temp_c numeric,
  cdd numeric,
  source text NOT NULL DEFAULT 'era5_rawdah',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_weather_rawdah TO anon, authenticated;
GRANT ALL ON public.daily_weather_rawdah TO service_role;
ALTER TABLE public.daily_weather_rawdah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read daily_weather_rawdah" ON public.daily_weather_rawdah FOR SELECT USING (true);
