import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const API_BASE = "https://api.eyedro.com/customer";

function num(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

async function getJson(url: string) {
  const r = await fetch(url, {
    headers: {
      "Accept": "application/json, text/plain, */*",
      "User-Agent": "Mozilla/5.0",
    },
  });
  const text = await r.text();
  let j: any;
  try { j = JSON.parse(text); } catch { j = { raw: text }; }
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 300)}`);
  return j;
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const userKey = Deno.env.get("EYEDRO_USER_KEY");
    if (!userKey) throw new Error("EYEDRO_USER_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get device list
    const devList = await getJson(`${API_BASE}/?UserKey=${userKey}&Action=GetUserDevicesList`);
    const devices: any[] = devList.Devices || devList.DeviceList || [];
    if (devices.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "No devices", sample: JSON.stringify(devList).slice(0, 500) }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Today only (UTC) — cron runs every minute, so we just refresh today's data
    const today = ymd(new Date());

    let totalInserted = 0;
    const errors: any[] = [];
    const perDevice: any[] = [];

    for (const dev of devices) {
      const sn = String(dev.SerialNumber || dev.Serial || dev.SerialHex || "").toUpperCase();
      if (!sn) continue;
      let devInserted = 0;

      try {
        // Pull live/recent data — try Minute resolution for finer granularity
        const data = await getJson(`${API_BASE}/?UserKey=${userKey}&Action=GetData&DeviceSerial=${sn}&Date=${today}&Resolution=Minute`);
        const points: any[] = data.Data || data.Points || [];
        const rows: any[] = [];
        for (const pt of points) {
          const tsRaw = pt.Time || pt.Timestamp || pt.DateTime || pt.Date;
          let ts: string | null = null;
          if (typeof tsRaw === "number") {
            ts = new Date(tsRaw * (tsRaw > 1e12 ? 1 : 1000)).toISOString();
          } else if (typeof tsRaw === "string") {
            const d = new Date(tsRaw);
            if (!isNaN(d.getTime())) ts = d.toISOString();
          }
          if (!ts) continue;

          const wh = num(pt.Wh ?? pt.WattHours ?? pt.EnergyWh);
          const kwh = num(pt.kWh ?? pt.KWh ?? pt.Energy) ?? (wh !== null ? wh / 1000 : null);
          const w = num(pt.W ?? pt.Watts ?? pt.PowerW);
          const kw = num(pt.kW ?? pt.KW ?? pt.Power) ?? (w !== null ? w / 1000 : null);

          if (kwh === null && kw === null) continue;

          rows.push({
            ts,
            device_serial: sn,
            power_kw: kw,
            energy_kwh: kwh,
            voltage: num(pt.V ?? pt.Voltage),
            current_a: num(pt.A ?? pt.Current),
            payload: pt,
          });
        }

        if (rows.length > 0) {
          const { error } = await supabase
            .from("eyedro_readings")
            .upsert(rows, { onConflict: "device_serial,ts", ignoreDuplicates: true });
          if (error) errors.push({ sn, error: error.message });
          else { devInserted = rows.length; totalInserted += rows.length; }
        }
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        errors.push({ sn, error: e instanceof Error ? e.message : String(e) });
      }
      perDevice.push({ sn, inserted: devInserted });
    }

    return new Response(JSON.stringify({
      ok: true, devices: devices.length, date: today, totalInserted, perDevice, errors,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});