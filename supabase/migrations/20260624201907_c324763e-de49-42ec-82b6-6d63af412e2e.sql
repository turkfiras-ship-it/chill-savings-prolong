ALTER TABLE public.daily_weather_rawdah
  ADD COLUMN IF NOT EXISTS solar_rad_mj numeric,
  ADD COLUMN IF NOT EXISTS sol_air_mean_c numeric;