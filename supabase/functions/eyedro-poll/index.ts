import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHash, pbkdf2Sync, createDecipheriv, createCipheriv, randomBytes } from "node:crypto";
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
const AES_PASSWORD = "oszgbaMqXFHLj0NK3hQxy80SRob";

let cachedSID: string | null = null;
let cachedAt = 0;
let cookieJar = "";
const SID_TTL_MS = 25 * 60 * 1000;

const md5Hex = (s: string) => createHash("md5").update(s).digest("hex");
const sha256Hex = (s: string) => createHash("sha256").update(s).digest("hex");

function decryptZ(z: string): any {
  const hexBytes = Buffer.from(z.slice(0, 64), "hex");
  const salt = hexBytes.subarray(0, 16);
  const iv = hexBytes.subarray(16, 32);
  const ct = Buffer.from(z.slice(64), "base64");
  const key = pbkdf2Sync(AES_PASSWORD, salt, 10, 32, "sha1");
  const d = createDecipheriv("aes-256-cbc", key, iv);
  const out = Buffer.concat([d.update(ct), d.final()]).toString("utf8");
  try { return JSON.parse(out); } catch { return { raw: out }; }
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
    try { return decryptZ(data.z); } catch { return data; }
  }
  return data;
}

async function ev501(params: Record<string, string>) {
  const inner = new URLSearchParams({ ...params, Client: CLIENT_NAME, Version: CLIENT_VERSION, z2: Z2_CLIENT }).toString();
  const z = encryptZ(inner);
  const r = await fetch(EV501, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Origin": "https://my.eyedro.com",
      "Referer": "https://my.eyedro.com/",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": "Mozilla/5.0",
      ...(cookieJar ? { "Cookie": cookieJar } : {}),
    },
    body: new URLSearchParams({ z }).toString(),
  });
  const text = await r.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  const sc = r.headers.get("set-cookie");
  if (sc) {
    const parts = sc.split(/,(?=\s*[A-Za-z0-9_-]+=)/);
    for (const p of parts) {
      const m = p.trim().match(/^([^=]+)=([^;]+)/);
      if (m) {
        const re = new RegExp(`(^|;\\s*)${m[1]}=[^;]*`);
        cookieJar = cookieJar.match(re) ? cookieJar.replace(re, `$1${m[1]}=${m[2]}`) : (cookieJar ? cookieJar + "; " : "") + `${m[1]}=${m[2]}`;
      }
    }
  }
  return { ok: r.ok, data: unwrap(data), setCookie: sc };
}

async function login(): Promise<string> {
  const username = Deno.env.get("EYEDRO_USERNAME") || "chadinkairouz@gmail.com";
  const password = Deno.env.get("EYEDRO_PASSWORD");
  if (!password) throw new Error("EYEDRO_PASSWORD missing");
  const Hash32 = md5Hex(username.toLowerCase() + password.toLowerCase());
  const Hash64 = sha256Hex(username + password);
  const res = await ev501({ Cmd: "Login", Username: username, Hash32, Hash64 });
  const d = res.data ?? {};
  let sid = d.SID || d.Sid || d?.Data?.SID || d?.Result?.SID;
  if (!sid && res.setCookie) {
    const m = res.setCookie.match(/(?:SID|sid|PHPSESSID)=([^;]+)/);
    if (m) sid = m[1];
  }
  if (!sid) throw new Error("Login failed: no SID");
  cachedSID = String(sid); cachedAt = Date.now();
  return cachedSID;
}

async function getSID(force = false) {
  if (!force && cachedSID && Date.now() - cachedAt < SID_TTL_MS) return cachedSID;
  return await login();
}

function deepFind(obj: any, keys: string[]): any {
  if (obj == null) return undefined;
  if (typeof obj !== "object") return undefined;
  for (const k of Object.keys(obj)) {
    if (keys.some(kk => kk.toLowerCase() === k.toLowerCase())) return obj[k];
  }
  for (const k of Object.keys(obj)) {
    const v = deepFind(obj[k], keys);
    if (v !== undefined) return v;
  }
  return undefined;
}

function num(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

async function fetchAndInsert(supabase: any) {
  let sid = await getSID();
  let res = await ev501({ Cmd: "GetUserDevicesLive", SID: sid });
  const errStr = JSON.stringify(res.data ?? {}).toLowerCase();
  if (!res.ok || errStr.includes("session") || errStr.includes("invalid sid")) {
    sid = await getSID(true);
    res = await ev501({ Cmd: "GetUserDevicesLive", SID: sid });
  }

  const data = res.data ?? {};
  // Try to find a list of devices
  const list: any[] = deepFind(data, ["DeviceList", "Devices", "UserDeviceList", "List"]) ?? [];
  const rows: any[] = [];
  const ts = new Date().toISOString();

  if (Array.isArray(list)) {
    for (const dev of list) {
      const serial = String(deepFind(dev, ["SerialHex", "Serial", "DeviceSerial", "DevSerial"]) ?? "").toUpperCase();
      const power_w = num(deepFind(dev, ["PowerNowWatts", "PowerW", "Watts", "PowerNow"]));
      const power_kw_direct = num(deepFind(dev, ["PowerKW", "PowerNowKW", "kW"]));
      const power_kw = power_kw_direct ?? (power_w !== null ? power_w / 1000 : null);
      if (!serial || power_kw === null) continue;
      rows.push({ ts, device_serial: serial, power_kw, payload: dev });
    }
  }

  if (rows.length === 0) {
    return { inserted: 0, sample: JSON.stringify(data).slice(0, 500) };
  }
  const { error } = await supabase.from("eyedro_readings").insert(rows);
  if (error) throw error;
  return { inserted: rows.length };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const url = new URL(req.url);
    const loops = Math.max(1, Math.min(6, parseInt(url.searchParams.get("loops") || "6")));
    const intervalMs = Math.max(1000, parseInt(url.searchParams.get("interval") || "10000"));

    const results: any[] = [];
    for (let i = 0; i < loops; i++) {
      const start = Date.now();
      try {
        const r = await fetchAndInsert(supabase);
        results.push({ i, ...r });
      } catch (e) {
        results.push({ i, error: e instanceof Error ? e.message : String(e) });
      }
      const elapsed = Date.now() - start;
      if (i < loops - 1) await new Promise(r => setTimeout(r, Math.max(0, intervalMs - elapsed)));
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});