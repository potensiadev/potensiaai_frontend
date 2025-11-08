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
    const { keyword, length = "medium", tone = "professional" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting content generation for keyword:", keyword);

    // Step 1: Topic Refiner - Generate refined title
    const topicRefinerPrompt = `당신은 SEO 전문가이자 콘텐츠 전략가입니다. 
주어진 키워드를 분석하여 검색 의도에 맞는 매력적이고 클릭을 유도하는 블로그 제목을 생성하세요.

요구사항:
- 제목은 40-60자 사이로 작성
- 핵심 키워드를 자연스럽게 포함
- 독자의 관심을 끄는 질문형, 숫자형, 또는 해결책 제시형 제목
- SEO 친화적이면서도 자연스러운 한국어 표현

키워드: ${keyword}

제목만 생성하세요 (다른 설명 없이 제목만 반환):`;

    const topicResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "당신은 SEO 전문가이자 콘텐츠 전략가입니다." },
          { role: "user", content: topicRefinerPrompt },
        ],
      }),
    });

    if (!topicResponse.ok) {
      const errorText = await topicResponse.text();
      console.error("Topic refiner error:", topicResponse.status, errorText);
      
      if (topicResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (topicResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다. Lovable 워크스페이스에서 크레딧을 추가해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate topic");
    }

    const topicData = await topicResponse.json();
    const generatedTopic = topicData.choices[0].message.content.trim();
    console.log("Generated topic:", generatedTopic);

    // Step 2: Content Generator - Generate full content
    const lengthGuide: Record<string, string> = {
      short: "500-800자 분량",
      medium: "1000-1500자 분량",
      long: "2000-3000자 분량"
    };

    const toneGuide: Record<string, string> = {
      professional: "전문적이고 신뢰감 있는 톤",
      friendly: "친근하고 대화하는 듯한 톤",
      persuasive: "설득력 있고 행동을 유도하는 톤"
    };

    const selectedLengthGuide = lengthGuide[length] || "1000-1500자 분량";
    const selectedToneGuide = toneGuide[tone] || "전문적이고 신뢰감 있는 톤";

    const generatorPrompt = `당신은 전문 콘텐츠 작가이자 SEO 전문가입니다.
다음 제목으로 고품질의 SEO 최적화된 블로그 콘텐츠를 작성하세요.

제목: ${generatedTopic}
키워드: ${keyword}

요구사항:
- ${selectedLengthGuide}의 완성된 블로그 글
- ${selectedToneGuide}으로 작성
- 도입부, 본문(소제목 2-5개), 결론으로 구성
- 마크다운 형식으로 작성 (# 제목, ## 소제목, **강조** 등 사용)
- 키워드를 자연스럽게 본문에 2-3% 밀도로 포함
- 독자에게 실용적인 정보와 인사이트 제공
- SEO를 고려하여 메타 설명에 적합한 첫 문단 작성
- 읽기 쉬운 문장 구조와 단락 구성

콘텐츠를 작성하세요:`;

    const contentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "당신은 전문 콘텐츠 작가이자 SEO 전문가입니다." },
          { role: "user", content: generatorPrompt },
        ],
      }),
    });

    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      console.error("Content generator error:", contentResponse.status, errorText);
      
      if (contentResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (contentResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다. Lovable 워크스페이스에서 크레딧을 추가해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate content");
    }

    const contentData = await contentResponse.json();
    const generatedContent = contentData.choices[0].message.content.trim();
    console.log("Content generated successfully, length:", generatedContent.length);

    return new Response(
      JSON.stringify({
        status: "success",
        data: {
          topic: generatedTopic,
          content: generatedContent,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in generate-content function:", err);
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
