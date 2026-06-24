import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// ====== Easy-to-edit constants ======
const RECIPIENT = "tdtmonitoringsystem@gmail.com";
const SCHEDULE_LABEL = "Every Sunday 07:00 Riyadh";
const FROM_ADDRESS = "TDE Monitoring <onboarding@resend.dev>"; // change once domain verified in Resend
const SUBJECT = "TDE Weather Normalization — Weekly Summary (Jarir Rawdah)";
// =====================================

const BASELINE_YEAR = 2024;
const SENSITIVITY = 0.097;
const LOCKED_2025_FACTOR = 1.1262;
const COOLING_MONTHS = new Set([5, 6, 7, 8, 9, 10]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function monthOf(d: string) { return Number(d.slice(5, 7)); }
function fmtDelta(v: number) { return `${v >= 0 ? "+" : ""}${v.toFixed(2)}°C`; }
function fmtTemp(v: number | null | undefined) { return v == null ? "—" : `${v.toFixed(2)}°C`; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const sb = createClient(url, key);

  const now = new Date();
  const currentYear = now.getUTCFullYear();

  // 1) Auto-finalize if past Oct 31 of current year (idempotent)
  let finalizeNote = "";
  try {
    const fin = await fetch(`${url}/functions/v1/finalize-cooling-factor`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ year: currentYear }),
    });
    const finJson = await fin.json();
    finalizeNote = finJson?.finalized
      ? `Auto-finalize: ${currentYear} ${finJson.already ? "already locked" : "locked now"} (factor ×${Number(finJson.factor).toFixed(4)}).`
      : `Auto-finalize: ${finJson?.reason ?? "skipped"}.`;
  } catch (e: any) {
    finalizeNote = `Auto-finalize check failed: ${e?.message ?? e}`;
  }

  // 2) Pull cooling-season rows for current year + baseline
  const [{ data: curRowsRaw }, { data: baseRowsRaw }, { data: locked }] = await Promise.all([
    sb.from("daily_weather_rawdah").select("date,mean_temp_c,cdd")
      .gte("date", `${currentYear}-05-01`).lte("date", `${currentYear}-10-31`)
      .order("date", { ascending: true }),
    sb.from("daily_weather_rawdah").select("date,mean_temp_c,cdd")
      .gte("date", `${BASELINE_YEAR}-05-01`).lte("date", `${BASELINE_YEAR}-10-31`)
      .order("date", { ascending: true }),
    sb.from("locked_factors").select("year,factor,delta_c,finalized_at")
      .eq("basis", "cooling_season_may_oct"),
  ]);

  const curRows = (curRowsRaw ?? []).filter((r: any) => COOLING_MONTHS.has(monthOf(r.date)) && r.mean_temp_c != null);
  const lastCsDate = curRows[curRows.length - 1]?.date;
  const baseRowsAll = (baseRowsRaw ?? []).filter((r: any) => COOLING_MONTHS.has(monthOf(r.date)) && r.mean_temp_c != null);
  const baseRows = lastCsDate ? baseRowsAll.filter((r: any) => r.date.slice(5) <= lastCsDate.slice(5)) : [];

  const avg = (arr: any[]) => arr.length ? arr.reduce((s, r) => s + Number(r.mean_temp_c), 0) / arr.length : null;
  const curAvg = avg(curRows);
  const baseAvg = avg(baseRows);
  const delta = curAvg != null && baseAvg != null ? curAvg - baseAvg : null;
  const factor = delta != null ? 1 + delta * SENSITIVITY : null;

  const lockedCurrent = (locked ?? []).find((r: any) => r.year === currentYear);
  const statusLabel = lockedCurrent
    ? `Final — locked ${lockedCurrent.finalized_at?.slice(0,10)}`
    : "In progress — finalizes after Oct 31, " + currentYear;

  // 3) Latest daily row + gap detection
  const { data: latest } = await sb.from("daily_weather_rawdah")
    .select("date,mean_temp_c,cdd").order("date", { ascending: false }).limit(1).maybeSingle();
  let gapNote = "";
  if (latest?.date) {
    const lastD = new Date(latest.date + "T00:00:00Z");
    const daysOld = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - lastD.getTime()) / 86400000);
    if (daysOld > 2) gapNote = `⚠ Daily sync gap detected — last weather row is ${daysOld} days old (${latest.date}).`;
  } else {
    gapNote = "⚠ No daily weather rows found.";
  }

  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;background:#f5f7fa;margin:0;padding:24px;color:#0B0F14;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#0B0F14;color:#fff;padding:18px 24px;">
        <div style="font-size:11px;letter-spacing:.18em;color:#7dd3fc;">TDE · DC EVOLVE</div>
        <div style="font-size:18px;font-weight:700;margin-top:4px;">Weather Normalization — Weekly Summary</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Site: Jarir Rawdah (24.7316, 46.7545) · ${now.toUTCString()}</div>
      </div>
      <div style="padding:22px 24px;">
        <h2 style="font-size:13px;margin:0 0 8px;color:#0B0F14;">${currentYear} Cooling-Season Status</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tr><td style="padding:4px 0;color:#475569;">Status</td><td style="padding:4px 0;text-align:right;font-weight:600;">${statusLabel}</td></tr>
          <tr><td style="padding:4px 0;color:#475569;">Days elapsed (vs ${BASELINE_YEAR} same window)</td><td style="padding:4px 0;text-align:right;">${curRows.length}d vs ${baseRows.length}d</td></tr>
          <tr><td style="padding:4px 0;color:#475569;">Avg mean temp — ${currentYear}</td><td style="padding:4px 0;text-align:right;">${fmtTemp(curAvg)}</td></tr>
          <tr><td style="padding:4px 0;color:#475569;">Avg mean temp — ${BASELINE_YEAR} (same window)</td><td style="padding:4px 0;text-align:right;">${fmtTemp(baseAvg)}</td></tr>
          <tr><td style="padding:4px 0;color:#475569;">ΔT vs baseline</td><td style="padding:4px 0;text-align:right;font-weight:600;">${delta != null ? fmtDelta(delta) : "—"}</td></tr>
          <tr><td style="padding:4px 0;color:#475569;">Weather factor (cooling-season basis)</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#0369a1;">${factor != null ? "×" + factor.toFixed(4) : "—"}</td></tr>
        </table>

        <h2 style="font-size:13px;margin:18px 0 8px;color:#0B0F14;">2025 Locked Reference</h2>
        <div style="font-size:12px;color:#334155;">Study-locked factor: <b>×${LOCKED_2025_FACTOR.toFixed(4)}</b> (ΔT +1.30°C, TDE Audit 11-MAY-2026).</div>

        <h2 style="font-size:13px;margin:18px 0 8px;color:#0B0F14;">Latest Daily Weather Row</h2>
        <div style="font-size:12px;color:#334155;">${latest ? `Date ${latest.date} · Mean ${fmtTemp(Number(latest.mean_temp_c))} · CDD ${latest.cdd != null ? Number(latest.cdd).toFixed(1) : "—"}` : "No data."}</div>

        ${gapNote ? `<div style="margin-top:14px;padding:10px 12px;border-radius:8px;background:#fef3c7;color:#92400e;font-size:12px;">${gapNote}</div>` : ""}
        <div style="margin-top:10px;font-size:11px;color:#64748b;">${finalizeNote}</div>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0;">
        <div style="font-size:10px;color:#94a3b8;line-height:1.5;">
          Locked savings KPIs (17.3% / 102,194 kWh / 33,286 SAR) are not affected — this engine only feeds weather normalization.
          Schedule: ${SCHEDULE_LABEL}. To change recipient/schedule, edit constants in <code>supabase/functions/weekly-weather-email/index.ts</code>.
        </div>
      </div>
    </div>
  </body></html>`;

  if (!RESEND_API_KEY) {
    const msg = "RESEND_API_KEY secret is not set — email not sent. Add it in Project Settings → Secrets to activate.";
    console.warn(msg);
    return new Response(JSON.stringify({ sent: false, reason: msg, preview: { factor, delta, curAvg, baseAvg, statusLabel } }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [RECIPIENT],
      subject: SUBJECT,
      html,
    }),
  });
  const respBody = await resp.text();
  if (!resp.ok) {
    console.error("Resend send failed", resp.status, respBody);
    return new Response(JSON.stringify({ sent: false, status: resp.status, body: respBody }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ sent: true, recipient: RECIPIENT, finalizeNote }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});