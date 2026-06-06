CREATE TABLE public.daily_unit_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_date date NOT NULL,
  unit text NOT NULL,
  kwh numeric,
  status text,
  notes text,
  max_temp_c numeric,
  min_temp_c numeric,
  mean_temp_c numeric,
  cdd numeric,
  condition text,
  fleet_total numeric,
  fleet_sar numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reading_date, unit)
);
GRANT SELECT ON public.daily_unit_readings TO anon, authenticated;
GRANT ALL ON public.daily_unit_readings TO service_role;
ALTER TABLE public.daily_unit_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read daily_unit_readings" ON public.daily_unit_readings FOR SELECT USING (true);

CREATE TABLE public.sceco_monthly_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year int NOT NULL,
  month text NOT NULL,
  kwh numeric,
  bill_sar numeric,
  base_cost numeric,
  vat numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(year, month)
);
GRANT SELECT ON public.sceco_monthly_bills TO anon, authenticated;
GRANT ALL ON public.sceco_monthly_bills TO service_role;
ALTER TABLE public.sceco_monthly_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sceco_monthly_bills" ON public.sceco_monthly_bills FOR SELECT USING (true);

CREATE TABLE public.unit_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ts timestamptz NOT NULL,
  level text,
  unit text,
  message text,
  action text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ts, unit, message)
);
GRANT SELECT ON public.unit_alerts TO anon, authenticated;
GRANT ALL ON public.unit_alerts TO service_role;
ALTER TABLE public.unit_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read unit_alerts" ON public.unit_alerts FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_dur_updated BEFORE UPDATE ON public.daily_unit_readings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_smb_updated BEFORE UPDATE ON public.sceco_monthly_bills
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();