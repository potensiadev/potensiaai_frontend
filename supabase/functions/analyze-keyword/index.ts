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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const SYSTEM_PROMPT = `당신은 고급 SEO·콘텐츠 전략가이자 키워드 분석 전문가입니다.

사용자가 키워드를 입력하면 아래의 4단계 구조로 키워드 분석을 수행하세요:

1단계: 초기 키워드 생성
- 메인 키워드를 중심으로 4개 카테고리(정보탐색, 구매의도, 비교, 문제해결)로 나누어
- 각 카테고리별로 8-10개씩 키워드 생성

2단계: 키워드 상세 분석
- 상위 10개 주요 키워드 선정
- 각 키워드별로 검색량, 경쟁도, 트렌드, 난이도, 수익성, 총점, 등급 제공

3단계: 상위 10개 키워드 + 활용 방안
- 순위표 형식
- 각 키워드별 선정 이유 + 제목 예시 + 구성 방향

4단계: SEO 제목 제안 및 실행 전략
- SEO 최적 제목 5-6개 제안 (40자 이내, 클릭 유도형)
- 실행 전략 bullet 제공

응답은 JSON 형식으로 제공하세요.`;

    const USER_PROMPT = `/키워드추출 [${keyword}]

위 키워드에 대해 4단계 분석을 수행하고 다음 JSON 형식으로 응답해주세요:

{
  "initial_keywords": [
    {"category": "정보탐색", "keywords": ["키워드1", "키워드2", ...]},
    {"category": "구매의도", "keywords": [...]},
    {"category": "비교", "keywords": [...]},
    {"category": "문제해결", "keywords": [...]}
  ],
  "detailed_analysis": [
    {
      "keyword": "키워드명",
      "search_volume": "10,000",
      "competition": "중",
      "trend": "상승세",
      "difficulty": "중",
      "profitability": "높음",
      "total_score": 85,
      "grade": "A"
    }
  ],
  "top_10_usage": [
    {
      "rank": 1,
      "keyword": "키워드명",
      "reason": "선정 이유",
      "title_example": "제목 예시",
      "strategy": "구성 방향"
    }
  ],
  "seo_titles": ["제목1", "제목2", ...],
  "execution_strategy": ["전략1", "전략2", ...]
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: USER_PROMPT }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ status: "error", message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI 응답에서 분석 결과를 찾을 수 없습니다");
    }

    const analysis = JSON.parse(content);

    console.log("[OK] Keyword analysis completed");

    return new Response(
      JSON.stringify({ status: "success", analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-keyword:", error);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: error instanceof Error ? error.message : "키워드 분석 중 문제가 발생했습니다" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
