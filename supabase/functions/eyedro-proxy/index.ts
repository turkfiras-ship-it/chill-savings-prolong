import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const EV501 = "https://my.eyedro.com/ev501";

// In-memory session cache (per edge instance). Re-login on cold start.
let cachedSID: string | null = null;
let cachedAt = 0;
const SID_TTL_MS = 25 * 60 * 1000; // 25 min

function md5Hex(s: string) {
  return createHash("md5").update(s).digest("hex");
}
function sha256Hex(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

async function ev501(params: Record<string, string>) {
  const body = new URLSearchParams(params).toString();
  const r = await fetch(EV501, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await r.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: r.ok, status: r.status, data };
}

async function login(): Promise<string> {
  const username = Deno.env.get("EYEDRO_USERNAME") || "chadinkairouz@gmail.com";
  const password = Deno.env.get("EYEDRO_PASSWORD");
  if (!password) throw new Error("EYEDRO_PASSWORD is not configured");

  const emailLower = username.toLowerCase();
  const passLower = password.toLowerCase();
  const Hash32 = md5Hex(emailLower + passLower);
  const Hash64 = sha256Hex(username + password);

  const res = await ev501({ Cmd: "Login", Username: username, Hash32, Hash64 });
  if (!res.ok) throw new Error(`Login HTTP ${res.status}`);
  const d = res.data ?? {};
  const sid =
    d.SID || d.Sid || d.sid ||
    d?.Data?.SID || d?.Data?.Sid ||
    d?.Result?.SID || d?.Result?.Sid;
  if (!sid) throw new Error("Login succeeded but no SID returned: " + JSON.stringify(d).slice(0, 300));
  cachedSID = String(sid);
  cachedAt = Date.now();
  return cachedSID;
}

async function getSID(force = false): Promise<string> {
  if (!force && cachedSID && Date.now() - cachedAt < SID_TTL_MS) return cachedSID;
  return await login();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const url = new URL(req.url);
    const command: string = body.command || url.searchParams.get("command") || "Alias.GetList";
    const extraParams: Record<string, string> = body.params || {};

    // Special: force re-login
    if (command === "Login") {
      const sid = await login();
      return new Response(JSON.stringify({ ok: true, sid }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sid = await getSID();
    let res = await ev501({ Cmd: command, SID: sid, ...extraParams });

    // If session expired, re-login once and retry
    const errStr = JSON.stringify(res.data ?? {}).toLowerCase();
    if (!res.ok || errStr.includes("session") || errStr.includes("login") || errStr.includes("invalid sid")) {
      sid = await getSID(true);
      res = await ev501({ Cmd: command, SID: sid, ...extraParams });
    }

    return new Response(JSON.stringify({ ok: res.ok, status: res.status, data: res.data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("eyedro-proxy error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});