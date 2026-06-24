import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Jarir Rawdah / Exit 11, Riyadh
const LAT = 24.7136;
const LON = 46.6753;
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

function cdd(meanC: number | null): number | null {
  if (meanC == null || Number.isNaN(meanC)) return null;
  return Math.max(0, meanC - 18);
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function fetchArchive(start: string, end: string) {
  const url = `${ARCHIVE_URL}?latitude=${LAT}&longitude=${LON}` +
    `&start_date=${start}&end_date=${end}` +
    `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean` +
    `&timezone=Asia%2FRiyadh`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`archive ${r.status}: ${await r.text()}`);
  return await r.json();
}

async function fetchYesterdayForecastFallback() {
  // Open-Meteo forecast endpoint also serves recent past via past_days
  const url = `${FORECAST_URL}?latitude=${LAT}&longitude=${LON}` +
    `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean` +
    `&past_days=2&forecast_days=1&timezone=Asia%2FRiyadh`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`forecast ${r.status}: ${await r.text()}`);
  return await r.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let body: any = {};
    try { body = await req.json(); } catch (_) {}
    const mode: 'backfill' | 'daily' = body.mode === 'backfill' ? 'backfill' : 'daily';

    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 3600 * 1000);

    let startDate: string;
    let endDate: string = isoDate(yesterday);

    if (mode === 'backfill') {
      startDate = body.start_date || '2024-01-01';
      if (body.end_date) endDate = body.end_date;
    } else {
      startDate = isoDate(yesterday);
    }

    let json: any;
    try {
      json = await fetchArchive(startDate, endDate);
    } catch (e) {
      if (mode === 'daily') {
        json = await fetchYesterdayForecastFallback();
      } else {
        throw e;
      }
    }

    const dates: string[] = json?.daily?.time || [];
    const tMax: number[] = json?.daily?.temperature_2m_max || [];
    const tMin: number[] = json?.daily?.temperature_2m_min || [];
    const tMean: number[] = json?.daily?.temperature_2m_mean || [];

    const rows = dates.map((d, i) => {
      const mean = tMean[i] ?? ((tMax[i] != null && tMin[i] != null) ? (tMax[i] + tMin[i]) / 2 : null);
      return {
        date: d,
        max_temp_c: tMax[i] ?? null,
        min_temp_c: tMin[i] ?? null,
        mean_temp_c: mean,
        cdd: cdd(mean),
        source: mode === 'backfill' ? 'era5' : 'era5_recent',
      };
    }).filter(r => r.mean_temp_c != null);

    // chunked upsert
    const chunkSize = 500;
    let upserted = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('daily_weather')
        .upsert(chunk, { onConflict: 'date' });
      if (error) throw error;
      upserted += chunk.length;
    }

    return new Response(
      JSON.stringify({ ok: true, mode, range: [startDate, endDate], upserted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('sync-weather error', e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});