import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=24.7316&longitude=46.7545' +
  '&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,shortwave_radiation_sum,weather_code,precipitation_sum' +
  '&timezone=Asia/Riyadh&forecast_days=7'

// Warm-instance cache of the last successful forecast (fallback on upstream outages)
let lastGood: { days: unknown[]; fetchedAt: string } | null = null

async function fetchWithRetry(url: string, timeoutMs = 8000, attempts = 4): Promise<Response> {
  let lastErr: unknown = null
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 500 * 2 ** (i - 1)))
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const r = await fetch(url, { signal: ctrl.signal })
      clearTimeout(t)
      if (r.ok) return r
      lastErr = new Error(`status ${r.status}`)
      console.warn(`forecast-weather attempt ${i + 1} upstream status ${r.status}`)
      await r.body?.cancel()
      if (r.status < 500 && r.status !== 429) break
    } catch (e) {
      clearTimeout(t)
      lastErr = e
      console.warn(`forecast-weather attempt ${i + 1} failed`, e)
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('fetch failed')
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const r = await fetchWithRetry(OPEN_METEO_URL)
    const data = await r.json()
    const d = data?.daily
    if (!d?.time?.length) throw new Error('Empty forecast payload')
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
    lastGood = { days, fetchedAt: new Date().toISOString() }
    return json(lastGood)
  } catch (e) {
    const reason = (e as Error)?.message ?? 'unknown'
    console.error('forecast-weather upstream failure:', reason)
    // Soft-fail with 200 so the client never crashes; serve cached data if we have it
    if (lastGood) return json({ ...lastGood, stale: true, error: reason })
    return json({ days: [], unavailable: true, error: `Open-Meteo unavailable (${reason})` })
  }
})