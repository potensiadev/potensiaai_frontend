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

    const TOPIC_PROMPT = `당신은 SEO 전문가입니다. 주어진 키워드를 자연스러운 질문형 제목 10개로 변환해주세요.

규칙:
1. 한국어로 질문 형태의 제목을 만드세요 (? 로 끝나야 함)
2. 25-35자 정도의 자연스러운 문장
3. 원본 키워드를 그대로 반환하지 말고, 반드시 질문으로 변환하세요
4. 다양한 관점과 각도에서 접근하세요 (비용, 방법, 효과, 비교, 추천 등)
5. 각 제목은 클릭을 유도하는 매력적인 문구여야 합니다
6. JSON 형식으로 응답하세요: {"titles": ["제목1", "제목2", ...]}

예시:
입력: 목동 영어유치원 학비
출력: {"titles": ["목동 영어유치원 학비는 얼마나 될까?", "목동에서 가장 합리적인 영어유치원은?", "목동 영어유치원 학비 비교, 어디가 좋을까?", "영어유치원 비용 절약하는 방법은?", "목동 영어유치원 추천 TOP 5", "목동 영어유치원, 투자 가치가 있을까?", "학부모들이 선택한 목동 영어유치원은?", "목동 영어유치원 등록금 완벽 가이드", "목동 영어유치원 학비, 어떻게 준비할까?", "합리적인 목동 영어유치원 찾는 법"]}

입력받은 키워드를 위 형식으로 10개의 제목으로 변환해주세요.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: TOPIC_PROMPT },
          { role: "user", content: `키워드: ${keyword}\n\n위 키워드로 10개의 SEO 최적화 제목을 생성해주세요.` }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000,
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
      throw new Error("AI 응답에서 제목을 찾을 수 없습니다");
    }

    let titles: string[];
    try {
      const parsed = JSON.parse(content);
      titles = parsed.titles || [keyword];
    } catch {
      // JSON 파싱 실패 시 원본 키워드 반환
      titles = [keyword];
    }

    console.log("[OK] Refined titles:", titles.length);

    return new Response(
      JSON.stringify({ status: "success", titles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in refine-keyword:", error);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: error instanceof Error ? error.message : "제목 변환 중 문제가 발생했습니다" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
