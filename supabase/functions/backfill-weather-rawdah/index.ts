import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const url = "https://archive-api.open-meteo.com/v1/archive?latitude=24.7316&longitude=46.7545&start_date=2024-01-01&end_date=2025-12-31&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min&timezone=Asia%2FRiyadh";
    const r = await fetch(url);
    const j = await r.json();
    const d = j.daily;
    const rows = d.time.map((dt: string, i: number) => {
      const me = d.temperature_2m_mean[i];
      if (me == null) return null;
      return {
        date: dt,
        max_temp_c: d.temperature_2m_max[i],
        min_temp_c: d.temperature_2m_min[i],
        mean_temp_c: me,
        cdd: Math.max(0, me - 18),
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