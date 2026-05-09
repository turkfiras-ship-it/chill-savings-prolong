CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Ensure unique constraint exists for upsert
CREATE UNIQUE INDEX IF NOT EXISTS eyedro_readings_device_ts_uidx
  ON public.eyedro_readings (device_serial, ts);

-- Set REPLICA IDENTITY FULL for realtime
ALTER TABLE public.eyedro_readings REPLICA IDENTITY FULL;

-- Add to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'eyedro_readings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.eyedro_readings;
  END IF;
END $$;