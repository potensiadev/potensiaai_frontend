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
    const { content, keyword } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting content validation for keyword:", keyword);

    const validatorPrompt = `당신은 SEO 전문가이자 콘텐츠 품질 검증자입니다.
다음 콘텐츠를 분석하고 SEO 관점에서 검증 및 개선 사항을 제공하세요.

키워드: ${keyword}

콘텐츠:
${content}

다음 항목들을 분석하고 JSON 형식으로 응답하세요:
1. SEO 점수 (0-100)
2. 키워드 밀도 (%)
3. 가독성 평가 (좋음/보통/나쁨)
4. 개선 사항 (3-5개 항목의 배열)
5. 강점 (2-3개 항목의 배열)

응답 형식:
{
  "seo_score": 85,
  "keyword_density": 2.3,
  "readability": "좋음",
  "improvements": ["개선사항1", "개선사항2", ...],
  "strengths": ["강점1", "강점2", ...]
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
          { role: "system", content: "당신은 SEO 전문가이자 콘텐츠 품질 검증자입니다. 항상 유효한 JSON 형식으로 응답하세요." },
          { role: "user", content: validatorPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Validator error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다. Lovable 워크스페이스에서 크레딧을 추가해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to validate content");
    }

    const data = await response.json();
    const validationResult = data.choices[0].message.content.trim();
    
    // Extract JSON from markdown code blocks if present
    let parsedResult;
    try {
      const jsonMatch = validationResult.match(/```json\s*([\s\S]*?)\s*```/) || 
                       validationResult.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : validationResult;
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse validation result:", parseError);
      // Fallback to default values if parsing fails
      parsedResult = {
        seo_score: 75,
        keyword_density: 2.0,
        readability: "보통",
        improvements: ["AI가 분석 결과를 생성하는 중 오류가 발생했습니다."],
        strengths: ["콘텐츠가 생성되었습니다."],
      };
    }

    console.log("Validation completed:", parsedResult);

    return new Response(
      JSON.stringify({
        status: "success",
        data: parsedResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in validate-content function:", err);
    return new Response(
      JSON.stringify({
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
