import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SPREADSHEET_ID = "1FCh3sBNAz5Ht_8aqT7elb826QYE3WC2hdT4-dvokJnM";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GS_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getRange(range: string): Promise<string[][]> {
  const res = await fetch(`${GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values/${range}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GS_KEY,
    },
  });
  if (!res.ok) throw new Error(`Sheets ${range}: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.values ?? [];
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

// "06-Jun-2026" -> "2026-06-06"
function parseDate(s: string): string | null {
  if (!s) return null;
  const months: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!m) {
    const d = new Date(s);
    return isNaN(+d) ? null : d.toISOString().slice(0, 10);
  }
  return `${m[3]}-${months[m[2]]}-${m[1].padStart(2, "0")}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const result: Record<string, number> = {};

    // ---- Daily Monitor ----
    const dm = await getRange("Daily%20Monitor!A1:Q1000");
    if (dm.length > 1) {
      const headers = dm[0];
      const unitCols: { idx: number; unit: string }[] = [];
      headers.forEach((h, i) => {
        const m = String(h).match(/^([A-Z]+\d+)\s*kWh$/);
        if (m) unitCols.push({ idx: i, unit: m[1] });
      });
      const col = (name: string) => headers.findIndex((h) => h === name);
      const cFleetTotal = col("Fleet Total");
      const cFleetSar = col("Fleet SAR");
      const cStatus = headers.findIndex((h) => /Status$/.test(String(h)));
      const cNotes = col("Notes");
      const cMaxT = col("Max Temp C");
      const cMinT = col("Min Temp C");
      const cMeanT = col("Mean Temp C");
      const cCDD = col("CDD");
      const cCond = col("Condition");

      const rows: any[] = [];
      for (let i = 1; i < dm.length; i++) {
        const r = dm[i];
        const date = parseDate(r[0] ?? "");
        if (!date) continue;
        for (const { idx, unit } of unitCols) {
          rows.push({
            reading_date: date,
            unit,
            kwh: num(r[idx]),
            status: r[cStatus] ?? null,
            notes: r[cNotes] ?? null,
            max_temp_c: num(r[cMaxT]),
            min_temp_c: num(r[cMinT]),
            mean_temp_c: num(r[cMeanT]),
            cdd: num(r[cCDD]),
            condition: r[cCond] ?? null,
            fleet_total: num(r[cFleetTotal]),
            fleet_sar: num(r[cFleetSar]),
          });
        }
      }
      // chunked upsert
      for (let i = 0; i < rows.length; i += 500) {
        const chunk = rows.slice(i, i + 500);
        const { error } = await sb.from("daily_unit_readings").upsert(chunk, { onConflict: "reading_date,unit" });
        if (error) throw new Error(`daily_unit_readings: ${error.message}`);
      }
      result.daily_unit_readings = rows.length;
    }

    // ---- SCECO Tracker ----
    const sc = await getRange("SCECO%20Tracker!A1:F1000");
    if (sc.length > 1) {
      const rows = sc.slice(1).filter((r) => r[0] && r[1]).map((r) => ({
        month: String(r[0]),
        year: Number(r[1]),
        kwh: num(r[2]),
        bill_sar: num(r[3]),
        base_cost: num(r[4]),
        vat: num(r[5]),
      }));
      const { error } = await sb.from("sceco_monthly_bills").upsert(rows, { onConflict: "year,month" });
      if (error) throw new Error(`sceco_monthly_bills: ${error.message}`);
      result.sceco_monthly_bills = rows.length;
    }

    // ---- Alerts Log ----
    const al = await getRange("Alerts%20Log!A1:E2000");
    if (al.length > 1) {
      const rows = al.slice(1).filter((r) => r[0]).map((r) => {
        const ts = new Date(r[0]);
        return {
          ts: isNaN(+ts) ? new Date().toISOString() : ts.toISOString(),
          level: r[1] ?? null,
          unit: r[2] ?? null,
          message: r[3] ?? null,
          action: r[4] ?? null,
        };
      });
      if (rows.length) {
        const { error } = await sb.from("unit_alerts").upsert(rows, { onConflict: "ts,unit,message" });
        if (error) throw new Error(`unit_alerts: ${error.message}`);
      }
      result.unit_alerts = rows.length;
    }

    return json({ ok: true, synced: result, at: new Date().toISOString() });
  } catch (e) {
    console.error("sync-gsheet error", e);
    return json({ ok: false, error: String((e as Error).message ?? e) }, 500);
  }
});