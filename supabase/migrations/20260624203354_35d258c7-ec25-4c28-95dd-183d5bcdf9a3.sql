CREATE TABLE public.locked_factors (
  id uuid not null default gen_random_uuid() primary key,
  year integer not null,
  basis text not null default 'cooling_season_may_oct',
  delta_c numeric not null,
  factor numeric not null,
  current_avg_c numeric,
  baseline_avg_c numeric,
  current_days integer,
  baseline_days integer,
  source text not null default 'rawdah_era5',
  finalized_at timestamp with time zone not null default now(),
  unique (year, basis)
);

GRANT SELECT ON public.locked_factors TO anon, authenticated;
GRANT ALL ON public.locked_factors TO service_role;

ALTER TABLE public.locked_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read locked_factors" ON public.locked_factors
  FOR SELECT USING (true);

-- Seed the 2025 study-locked value for reference (TDE Audit 11-MAY-2026)
INSERT INTO public.locked_factors (year, basis, delta_c, factor, source)
VALUES (2025, 'cooling_season_may_oct', 1.3, 1.1262, 'tde_audit_11may2026_locked')
ON CONFLICT (year, basis) DO NOTHING;