import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    // End date = yesterday (ERA5 archive lags by ~5 days but Open-Meteo backfills with forecast where needed)
    const end = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    // Sol-air engineering assumption (documented in UI as estimate, NOT locked):
    //   alpha (solar absorptance, dark rooftop) = 0.7
    //   h_o (outside convective coeff, W/m²K) = 25
    //   I (MJ/m²/day) → avg W/m² over 24h = MJ * 1e6 / 86400 = MJ * 11.574
    //   sol_air_offset (°C) = alpha * I_avg_W / h_o = MJ * 0.7 * 11.574 / 25 ≈ MJ * 0.324
    const SOL_AIR_K = (0.7 * 11.574) / 25; // ≈ 0.3241 °C per MJ/m²/day
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=24.7316&longitude=46.7545&start_date=2024-01-01&end_date=${end}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,shortwave_radiation_sum&timezone=Asia%2FRiyadh`;
    const r = await fetch(url);
    const j = await r.json();
    const d = j.daily;
    const rows = d.time.map((dt: string, i: number) => {
      const me = d.temperature_2m_mean[i];
      if (me == null) return null;
      const sw = d.shortwave_radiation_sum?.[i] ?? null;
      const solAir = (sw != null && me != null) ? +(me + sw * SOL_AIR_K).toFixed(3) : null;
      return {
        date: dt,
        max_temp_c: d.temperature_2m_max[i],
        min_temp_c: d.temperature_2m_min[i],
        mean_temp_c: me,
        cdd: Math.max(0, me - 18),
        solar_rad_mj: sw,
        sol_air_mean_c: solAir,
        source: 'era5_rawdah',
      };
    }).filter(Boolean);
    // chunk upserts
    let upserted = 0;
    for (let i = 0; i < rows.length; i += 200) {
      const chunk = rows.slice(i, i + 200);
      const { error } = await supabase.from('daily_weather_rawdah').upsert(chunk, { onConflict: 'date' });
      if (error) throw error;
      upserted += chunk.length;
    }
    return new Response(JSON.stringify({ ok: true, upserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});