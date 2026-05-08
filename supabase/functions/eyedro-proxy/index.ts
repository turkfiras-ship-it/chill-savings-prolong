import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHash } from "node:crypto";
import { pbkdf2Sync, createDecipheriv, createCipheriv, randomBytes } from "node:crypto";
import { Buffer } from "node:buffer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const EV501 = "https://my.eyedro.com/ev501";
const Z2_CLIENT = "8rnlPFXgI9jw";
const CLIENT_NAME = "MyEyedro";
const CLIENT_VERSION = "5.8.2.3";

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

const AES_PASSWORD = "oszgbaMqXFHLj0NK3hQxy80SRob";

function decryptZ(z: string): any {
  // Layout: hex(64 chars = 32 bytes) = salt(16) + iv(16) || base64(ciphertext)
  // PBKDF2-SHA1, 10 iterations, AES-256-CBC
  const hexPart = z.slice(0, 64);
  const b64Part = z.slice(64);
  const hexBytes = Buffer.from(hexPart, "hex");
  const salt = hexBytes.subarray(0, 16);
  const iv = hexBytes.subarray(16, 32);
  const ct = Buffer.from(b64Part, "base64");
  const key = pbkdf2Sync(AES_PASSWORD, salt, 10, 32, "sha1");
  const d = createDecipheriv("aes-256-cbc", key, iv);
  const out = Buffer.concat([d.update(ct), d.final()]);
  const text = out.toString("utf8");
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

function encryptZ(plain: string): string {
  const salt = randomBytes(16);
  const iv = randomBytes(16);
  const key = pbkdf2Sync(AES_PASSWORD, salt, 10, 32, "sha1");
  const c = createCipheriv("aes-256-cbc", key, iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return salt.toString("hex") + iv.toString("hex") + ct.toString("base64");
}

function unwrap(data: any): any {
  if (data && typeof data === "object" && typeof data.z === "string") {
    try { return decryptZ(data.z); } catch (e) { return { ...data, _decryptError: String(e) }; }
  }
  return data;
}

async function ev501(params: Record<string, string>) {
  // Real client always sends Client + Version envelope params and the z2 token.
  // Inner payload (the part that gets encrypted into z) is querystring-encoded.
  const plainForm = new URLSearchParams(params).toString();
  const z = encryptZ(plainForm);
  const envelope = new URLSearchParams({
    z,
    z2: Z2_CLIENT,
    Client: CLIENT_NAME,
    Version: CLIENT_VERSION,
  }).toString();
  const attempts: Array<{label:string; init: RequestInit}> = [
    { label: "envelope-form", init: { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body: envelope }},
    { label: "envelope-json", init: { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ z, z2: Z2_CLIENT, Client: CLIENT_NAME, Version: CLIENT_VERSION }) }},
    { label: "z-only-form", init: { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body: new URLSearchParams({ z }).toString() }},
  ];
  const debug: any[] = [];
  let r: Response | null = null;
  let text = "";
  let data: any = null;
  for (const a of attempts) {
    r = await fetch(EV501, a.init);
    text = await r.text();
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    const decoded = unwrap(data);
    debug.push({ label: a.label, status: r.status, decoded });
    // Heuristic: success if decoded has more than just DateMsUtc/Errors
    if (decoded && typeof decoded === "object") {
      const keys = Object.keys(decoded);
      const interesting = keys.filter(k => !["DateMsUtc","Errors","_decryptError"].includes(k));
      if (interesting.length > 0 || (Array.isArray(decoded.Errors) && decoded.Errors.length > 0)) {
        return { ok: r.ok, status: r.status, data: decoded, raw: data, debug };
      }
    }
  }
  // None matched — return last + debug
  const decoded = unwrap(data);
  return { ok: r?.ok ?? false, status: r?.status ?? 0, data: decoded, raw: data, debug, setCookie: r?.headers.get("set-cookie") };
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
  let sid =
    d.SID || d.Sid || d.sid ||
    d?.Data?.SID || d?.Data?.Sid ||
    d?.Result?.SID || d?.Result?.Sid;
  if (!sid && res.setCookie) {
    const m = res.setCookie.match(/(?:SID|sid|PHPSESSID|JSESSIONID)=([^;]+)/);
    if (m) sid = m[1];
  }
  if (!sid) throw new Error("Login: no SID. debug=" + JSON.stringify((res as any).debug).slice(0, 1500));
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