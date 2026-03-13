import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sites, alerts, assets, weather } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert ESCO energy analyst for the Saudi Arabian market. Analyze the provided energy portfolio data and identify anomalies, risks, and optimization opportunities.

Return your analysis as a structured response with these sections:
1. **Critical Anomalies** — Urgent issues needing immediate attention
2. **Energy Patterns** — Unusual consumption patterns detected
3. **HVAC Optimization** — Equipment efficiency concerns
4. **Cost Savings Opportunities** — Actionable recommendations with estimated SAR impact
5. **Weather-Related Risks** — How current/forecast weather affects operations

For each finding, include: severity (critical/warning/info), affected site/asset, description, and recommended action.
Be specific with numbers and site names. Reference actual data values.`;

    const userPrompt = `Analyze this ESCO energy portfolio:

SITES (${sites.length} total):
${JSON.stringify(sites.map((s: any) => ({
  name: s.name, city: s.city, type: s.type, status: s.status,
  consumption_kwh: s.consumption_kwh, cost_sar: s.cost_sar,
  savings_pct: s.savings_pct, savings_sar: s.savings_sar,
  demand_kw: s.demand_kw, peak_kw: s.peak_kw,
  baseline_kwh: s.baseline_kwh, solutions: s.solutions,
})), null, 2)}

ACTIVE ALERTS (${alerts.length}):
${JSON.stringify(alerts.map((a: any) => ({
  site: a.siteName, type: a.type, severity: a.severity,
  message: a.message, acknowledged: a.acknowledged,
})), null, 2)}

ASSETS WITH FLAGS:
${JSON.stringify(assets.filter((a: any) => a.abnormalFlags > 0).map((a: any) => ({
  name: a.name, type: a.type, site: a.siteName,
  baseline_kw: a.baseline_kw, current_kw: a.current_kw,
  efficiency_gain: a.efficiency_gain, abnormalFlags: a.abnormalFlags,
  status: a.status, runHours: a.runHours,
})), null, 2)}

${weather ? `CURRENT WEATHER: ${weather.temperature}°C, ${weather.humidity}% humidity, feels like ${weather.feelsLike}°C` : ''}

Identify anomalies, patterns, and actionable recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analyze-anomalies error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
