import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const USER_KEY = Deno.env.get("EYEDRO_USER_KEY");
    if (!USER_KEY) throw new Error("EYEDRO_USER_KEY is not configured");

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const url = new URL(req.url);
    const command: string = body.command || url.searchParams.get("command") || "GetUserInfo";
    const extraParams: Record<string, string> = body.params || {};

    // MyEyedro Cloud API base
    const apiUrl = new URL("https://api.eyedro.com/customer");
    apiUrl.searchParams.set("UserKey", USER_KEY);
    apiUrl.searchParams.set(command, "1");
    for (const [k, v] of Object.entries(extraParams)) {
      apiUrl.searchParams.set(k, String(v));
    }

    const r = await fetch(apiUrl.toString(), { method: "GET" });
    const text = await r.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return new Response(JSON.stringify({ ok: r.ok, status: r.status, data }), {
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