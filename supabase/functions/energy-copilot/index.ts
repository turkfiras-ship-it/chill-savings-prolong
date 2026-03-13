import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are the ESCO Energy Copilot — an AI operations assistant for an Energy Service Company managing cooling infrastructure across Saudi Arabia.

You have deep expertise in:
- HVAC systems, compressors, chillers, condensers, evaporators
- Energy consumption patterns in extreme-heat climates
- Saudi electricity tariffs (SCECO) and demand charges
- SCC (Sub-Cooling Control) and VMF technology
- Energy savings verification (M&V / IPMVP)
- Carbon emissions (Saudi grid: 0.7 kg CO₂/kWh)

Current portfolio context:
- 16 sites across Saudi Arabia (13 active, 3 pending)
- Total annual consumption: ~13.6M kWh
- Total annual savings: ~700K SAR
- Key customers: Jarir Bookstore, Al Othaim Markets, Panda Retail, Saudi German Hospital, SABIC
- Flagship site: Jarir Rawdah — 14.1% efficiency gain, 35,457 SAR annual savings

When answering:
- Be concise and data-driven
- Reference specific sites and metrics when relevant
- Suggest actionable recommendations
- Use SAR currency for financial figures
- Consider Saudi climate conditions (extreme heat, high humidity in coastal areas)
- Format responses with clear structure using markdown`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("energy-copilot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
