
CREATE TABLE public.eyedro_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_serial text,
  ts timestamptz NOT NULL DEFAULT now(),
  power_kw numeric,
  energy_kwh numeric,
  voltage numeric,
  current_a numeric,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_eyedro_readings_ts ON public.eyedro_readings (ts DESC);
CREATE INDEX idx_eyedro_readings_device_ts ON public.eyedro_readings (device_serial, ts DESC);

ALTER TABLE public.eyedro_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read readings"
  ON public.eyedro_readings FOR SELECT
  USING (true);

CREATE POLICY "Public can insert readings"
  ON public.eyedro_readings FOR INSERT
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.eyedro_readings;
ALTER TABLE public.eyedro_readings REPLICA IDENTITY FULL;
