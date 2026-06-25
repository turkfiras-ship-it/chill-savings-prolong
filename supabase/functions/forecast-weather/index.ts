import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=24.7316&longitude=46.7545' +
  '&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,shortwave_radiation_sum' +
  '&timezone=Asia/Riyadh&forecast_days=7'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const r = await fetch(OPEN_METEO_URL)
    if (!r.ok) {
      const text = await r.text()
      console.error('Open-Meteo error', r.status, text)
      return new Response(
        JSON.stringify({ error: `Open-Meteo ${r.status}`, detail: text.slice(0, 500) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 },
      )
    }
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