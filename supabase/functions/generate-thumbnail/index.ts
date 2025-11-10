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
    const { title, content, size = "1024x1024", style = "modern" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting thumbnail generation for:", title);

    // 스타일별 설명
    const styleDescriptions: Record<string, string> = {
      minimal: "minimalist design, simple, clean lines, lots of white space",
      modern: "modern design, sleek, professional, contemporary",
      vibrant: "vibrant colors, energetic, bold, eye-catching",
      elegant: "elegant design, sophisticated, refined, premium feel",
      playful: "playful design, fun, creative, dynamic colors",
    };

    // 콘텐츠에서 핵심 키워드 추출을 위한 프롬프트
    const extractPrompt = `다음 블로그 콘텐츠의 핵심 주제와 분위기를 파악하여, 썸네일 이미지 생성을 위한 간단한 설명을 영어로 작성해주세요.

제목: ${title}
콘텐츠: ${content.substring(0, 500)}...
스타일: ${styleDescriptions[style] || styleDescriptions.modern}

요구사항:
- 30단어 이내의 영어 설명
- 시각적으로 표현 가능한 요소 포함
- 블로그 썸네일에 적합한 구도
- 지정된 스타일을 반영
- 이미지 비율: ${size}

예시 형식: "Professional blog thumbnail featuring [main topic], ${styleDescriptions[style]}, ${size} aspect ratio, high quality"`;

    // Step 1: 이미지 프롬프트 생성
    const promptResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert at creating visual image prompts for AI image generation." },
          { role: "user", content: extractPrompt },
        ],
      }),
    });

    if (!promptResponse.ok) {
      const errorText = await promptResponse.text();
      console.error("Prompt generation error:", promptResponse.status, errorText);
      
      if (promptResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (promptResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다. Lovable 워크스페이스에서 크레딧을 추가해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate image prompt");
    }

    const promptData = await promptResponse.json();
    const imagePrompt = promptData.choices[0].message.content.trim();
    console.log("Generated image prompt:", imagePrompt);

    // Step 2: 이미지 생성
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: imagePrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("Image generation error:", imageResponse.status, errorText);
      
      if (imageResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (imageResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다. Lovable 워크스페이스에서 크레딧을 추가해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate image");
    }

    const imageData = await imageResponse.json();
    const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error("No image generated in response");
    }

    console.log("Thumbnail generated successfully");

    return new Response(
      JSON.stringify({
        status: "success",
        data: {
          image: generatedImage,
          prompt: imagePrompt,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in generate-thumbnail function:", err);
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
