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

    const TOPIC_PROMPT = `당신은 SEO 전문가입니다. 주어진 키워드를 자연스러운 질문형 제목으로 변환해주세요.

규칙:
1. 한국어로 질문 형태의 제목을 만드세요 (? 로 끝나야 함)
2. 25-35자 정도의 자연스러운 문장
3. 원본 키워드를 그대로 반환하지 말고, 반드시 질문으로 변환하세요
4. 따옴표나 설명 없이 제목만 출력하세요

예시:
입력: 목동 영어유치원 학비
출력: 목동 영어유치원 학비는 얼마나 될까?

입력: 겨울철 싱크대 냄새
출력: 겨울철 싱크대 냄새는 왜 생길까?

입력받은 키워드를 위 형식으로 변환해주세요.`;

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
          { role: "user", content: keyword }
        ],
        max_completion_tokens: 1500,
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
    const title = data.choices[0]?.message?.content?.trim().replace(/["']/g, "") || keyword;

    console.log("[OK] Refined title:", title);

    return new Response(
      JSON.stringify({ status: "success", title }),
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
