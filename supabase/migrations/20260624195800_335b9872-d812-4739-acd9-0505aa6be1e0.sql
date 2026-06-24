SELECT cron.unschedule('daily-sync-weather') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='daily-sync-weather');

SELECT cron.schedule(
  'daily-sync-weather',
  '10 3 * * *', -- 03:10 UTC = 06:10 Riyadh
  $$
  SELECT net.http_post(
    url:='https://zxgiwgrbrigpavngziyx.supabase.co/functions/v1/sync-weather',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:='{"mode":"daily"}'::jsonb
  );
  $$
);