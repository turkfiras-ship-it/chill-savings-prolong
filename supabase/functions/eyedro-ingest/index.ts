import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("EYEDRO_WEBHOOK_SECRET") ?? "";

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    for (const key of Object.keys(obj)) {
      if (key.toLowerCase() === k.toLowerCase()) return obj[key];
    }
  }
  return undefined;
}

function normalize(row: Record<string, unknown>) {
  const tsRaw = pick(row, ["ts", "timestamp", "time", "datetime", "date"]);
  const ts = tsRaw ? new Date(String(tsRaw)).toISOString() : new Date().toISOString();
  const power_w = num(pick(row, ["power_w", "watts", "w"]));
  const power_kw =
    num(pick(row, ["power_kw", "kw", "power"])) ??
    (power_w !== null ? power_w / 1000 : null);
  const energy_wh = num(pick(row, ["energy_wh", "wh"]));
  const energy_kwh =
    num(pick(row, ["energy_kwh", "kwh", "energy"])) ??
    (energy_wh !== null ? energy_wh / 1000 : null);
  return {
    ts,
    device_serial: (pick(row, ["device_serial", "serial", "device", "deviceid"]) as string) ?? null,
    power_kw,
    energy_kwh,
    voltage: num(pick(row, ["voltage", "v"])),
    current_a: num(pick(row, ["current", "current_a", "a", "amps"])),
    payload: row,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (WEBHOOK_SECRET) {
      const url = new URL(req.url);
      const provided =
        req.headers.get("x-webhook-secret") ?? url.searchParams.get("secret") ?? "";
      if (provided !== WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (req.method === "GET") {
      return new Response(
        JSON.stringify({ ok: true, hint: "POST JSON readings here" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const rows: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : Array.isArray((body as any).readings)
        ? (body as any).readings
        : [body as Record<string, unknown>];

    const normalized = rows.map(normalize).filter((r) => r.power_kw !== null || r.energy_kwh !== null);
    if (normalized.length === 0) {
      return new Response(JSON.stringify({ error: "no valid readings", received: rows.length }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { error } = await supabase
      .from("eyedro_readings")
      .upsert(normalized, { onConflict: "device_serial,ts", ignoreDuplicates: true });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, received: normalized.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});