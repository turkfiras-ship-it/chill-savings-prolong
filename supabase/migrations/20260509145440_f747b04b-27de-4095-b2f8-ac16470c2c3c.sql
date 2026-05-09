DELETE FROM public.eyedro_readings a
USING public.eyedro_readings b
WHERE a.device_serial = b.device_serial
  AND a.ts = b.ts
  AND a.created_at < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS eyedro_readings_serial_ts_uniq
  ON public.eyedro_readings (device_serial, ts);