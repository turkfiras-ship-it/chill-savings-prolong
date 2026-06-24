import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASELINE_YEAR = 2024;
const SENSITIVITY = 0.097;
const COOLING_MONTHS = new Set([5, 6, 7, 8, 9, 10]);

function monthOf(d: string) { return Number(d.slice(5, 7)); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(url, key);

  let year = new Date().getUTCFullYear();
  let force = false;
  try {
    const body = await req.json();
    if (body?.year) year = Number(body.year);
    if (body?.force) force = !!body.force;
  } catch (_) { /* GET / cron */ }

  // Gate: only finalize after Oct 31 of that year unless force=true
  const pastOct31 = new Date() > new Date(Date.UTC(year, 9, 31, 23, 59, 59));
  if (!pastOct31 && !force) {
    return new Response(JSON.stringify({
      finalized: false,
      reason: `Cooling season for ${year} not complete (finalizes after Oct 31, ${year}).`,
      year,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Skip if already locked
  const { data: existing } = await sb
    .from("locked_factors")
    .select("id,factor,delta_c,finalized_at")
    .eq("year", year)
    .eq("basis", "cooling_season_may_oct")
    .maybeSingle();
  if (existing && !force) {
    return new Response(JSON.stringify({ finalized: true, year, already: true, ...existing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Pull cooling-season rows for `year` and baseline
  const fetchYear = async (y: number) => {
    const { data, error } = await sb
      .from("daily_weather_rawdah")
      .select("date,mean_temp_c")
      .gte("date", `${y}-05-01`)
      .lte("date", `${y}-10-31`)
      .order("date", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).filter((r: any) => COOLING_MONTHS.has(monthOf(r.date)) && r.mean_temp_c != null);
  };

  try {
    const [curRows, baseRows] = await Promise.all([fetchYear(year), fetchYear(BASELINE_YEAR)]);
    if (!curRows.length || !baseRows.length) {
      return new Response(JSON.stringify({ finalized: false, reason: "Missing weather rows", curDays: curRows.length, baseDays: baseRows.length }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const avg = (arr: any[]) => arr.reduce((s, r) => s + Number(r.mean_temp_c), 0) / arr.length;
    const curAvg = avg(curRows);
    const baseAvg = avg(baseRows);
    const delta = curAvg - baseAvg;
    const factor = 1 + delta * SENSITIVITY;

    const { error: upErr } = await sb.from("locked_factors").upsert({
      year,
      basis: "cooling_season_may_oct",
      delta_c: Number(delta.toFixed(4)),
      factor: Number(factor.toFixed(6)),
      current_avg_c: Number(curAvg.toFixed(4)),
      baseline_avg_c: Number(baseAvg.toFixed(4)),
      current_days: curRows.length,
      baseline_days: baseRows.length,
      source: "rawdah_era5",
      finalized_at: new Date().toISOString(),
    }, { onConflict: "year,basis" });
    if (upErr) throw new Error(upErr.message);

    return new Response(JSON.stringify({
      finalized: true, year, delta_c: delta, factor, currentDays: curRows.length, baselineDays: baseRows.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ finalized: false, error: e?.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});