import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=24.7316&longitude=46.7545' +
  '&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,shortwave_radiation_sum,weather_code,precipitation_sum' +
  '&timezone=Asia/Riyadh&forecast_days=7'

async function fetchWithRetry(url: string, timeoutMs = 8000, attempts = 2): Promise<Response> {
  let lastErr: unknown = null
  for (let i = 0; i < attempts; i++) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const r = await fetch(url, { signal: ctrl.signal })
      clearTimeout(t)
      if (r.ok) return r
      lastErr = new Error(`status ${r.status}`)
    } catch (e) {
      clearTimeout(t)
      lastErr = e
      console.warn(`forecast-weather attempt ${i + 1} failed`, e)
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('fetch failed')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const r = await fetchWithRetry(OPEN_METEO_URL)
    const data = await r.json()
    const d = data?.daily
    if (!d?.time?.length) {
      console.error('Open-Meteo returned empty daily payload', data)
      return new Response(
        JSON.stringify({ error: 'Empty forecast payload' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 },
      )
    }
    const days = d.time.map((date: string, i: number) => {
      const tMean = Number(d.temperature_2m_mean[i])
      const cdd = Math.max(0, tMean - 18)
      return {
        date,
        tMax: Number(d.temperature_2m_max[i]),
        tMin: Number(d.temperature_2m_min[i]),
        tMean,
        solar: Number(d.shortwave_radiation_sum?.[i] ?? 0),
        weatherCode: Number(d.weather_code?.[i] ?? 0),
        precipitation: Number(d.precipitation_sum?.[i] ?? 0),
        cdd,
      }
    })
    return new Response(
      JSON.stringify({ days, fetchedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (e) {
    console.error('forecast-weather failure', e)
    return new Response(
      JSON.stringify({ error: (e as Error).message ?? 'unknown' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})