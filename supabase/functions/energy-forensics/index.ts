import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an Energy Forensics AI detective for an ESCO (Energy Services Company) platform managing commercial buildings in Saudi Arabia. 

Your job is to investigate energy anomalies and write compelling, detective-style forensic narratives. For each alert/anomaly:

1. Describe WHAT happened (time, location, magnitude)
2. Analyze WHY it happened (root cause based on equipment data, weather, patterns)
3. Estimate the COST of the waste in SAR
4. Find HISTORICAL PATTERNS (reference similar past events)
5. Recommend specific ACTIONS

Write in a dramatic but professional investigative style. Use 🔍 emoji for report headers. Bold key findings. Be specific with numbers and technical details.

Return a JSON object with this structure:
{
  "reports": [
    {
      "siteName": "string",
      "severity": "critical|warning|info",
      "narrative": "string (markdown-formatted forensic narrative)",
      "estimatedWaste": number (SAR),
      "rootCause": "string"
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Investigate these energy anomalies and generate forensic reports:\n\n${JSON.stringify(context, null, 2)}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_forensic_reports",
              description: "Generate forensic investigation reports for energy anomalies",
              parameters: {
                type: "object",
                properties: {
                  reports: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        siteName: { type: "string" },
                        severity: { type: "string", enum: ["critical", "warning", "info"] },
                        narrative: { type: "string" },
                        estimatedWaste: { type: "number" },
                        rootCause: { type: "string" },
                      },
                      required: ["siteName", "severity", "narrative", "estimatedWaste", "rootCause"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["reports"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_forensic_reports" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback
    return new Response(JSON.stringify({ reports: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("energy-forensics error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
