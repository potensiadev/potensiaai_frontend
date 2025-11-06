import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword } = await req.json();
    
    if (!keyword || keyword.length < 2) {
      return new Response(
        JSON.stringify({ status: "error", message: "키워드가 너무 짧습니다" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `당신은 SEO 키워드 전문가입니다. 사용자가 입력한 키워드와 관련된 상위 10개의 연관 키워드를 추천해주세요.
각 키워드에 대해 예상 월간 검색량과 트렌드를 함께 제공하세요.
응답은 반드시 JSON 배열 형식으로만 제공하세요: [{"keyword": "키워드", "search_volume": "10,000", "trend": "상승세"}]`
          },
          {
            role: "user",
            content: `"${keyword}"와 관련된 상위 10개 키워드를 추천해주세요.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_keywords",
              description: "SEO 키워드 추천 결과 반환",
              parameters: {
                type: "object",
                properties: {
                  keywords: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        keyword: { type: "string", description: "추천 키워드" },
                        search_volume: { type: "string", description: "예상 월간 검색량" },
                        trend: { type: "string", description: "트렌드 (상승세/안정/하락세)" }
                      },
                      required: ["keyword", "search_volume", "trend"]
                    }
                  }
                },
                required: ["keywords"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_keywords" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ status: "error", message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ status: "error", message: "AI 사용량이 초과되었습니다." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("AI 응답에서 키워드를 찾을 수 없습니다");
    }

    const keywords = JSON.parse(toolCall.function.arguments).keywords;

    return new Response(
      JSON.stringify({ status: "success", data: keywords }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-top-keywords:", error);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: error instanceof Error ? error.message : "키워드 분석 중 문제가 발생했습니다" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
