import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PublishRequest {
  contentId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get user from auth token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "인증되지 않았습니다" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { contentId }: PublishRequest = await req.json();

    if (!contentId) {
      return new Response(
        JSON.stringify({ error: "contentId가 필요합니다" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Publishing content:", contentId, "for user:", user.id);

    // Get WordPress settings
    const { data: wpSettings, error: wpError } = await supabaseClient
      .from("wordpress_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (wpError || !wpSettings) {
      console.error("WordPress settings error:", wpError);
      return new Response(
        JSON.stringify({ error: "워드프레스 설정을 찾을 수 없습니다" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get content from content_history
    const { data: content, error: contentError } = await supabaseClient
      .from("content_history")
      .select("*")
      .eq("id", contentId)
      .eq("user_id", user.id)
      .single();

    if (contentError || !content) {
      console.error("Content error:", contentError);
      return new Response(
        JSON.stringify({ error: "콘텐츠를 찾을 수 없습니다" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Prepare WordPress post data
    const postData = {
      title: content.title,
      content: content.content,
      status: "publish",
    };

    // Add featured image if available
    if (content.thumbnail_image) {
      // For now, we'll just include it in the content
      // A full implementation would upload the image to WordPress first
      console.log("Featured image URL:", content.thumbnail_image);
    }

    // Create credentials for WordPress
    const credentials = btoa(
      `${wpSettings.username}:${wpSettings.application_password}`
    );

    // Publish to WordPress
    const wpResponse = await fetch(
      `${wpSettings.site_url}/wp-json/wp/v2/posts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(postData),
      }
    );

    if (!wpResponse.ok) {
      const errorText = await wpResponse.text();
      console.error("WordPress API error:", wpResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: "워드프레스 게시 실패",
          details: errorText,
        }),
        {
          status: wpResponse.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const wpPost = await wpResponse.json();
    console.log("WordPress post created:", wpPost.id);

    // Update content_history with WordPress post ID and status
    const { error: updateError } = await supabaseClient
      .from("content_history")
      .update({
        wordpress_post_id: wpPost.id.toString(),
        publish_status: "published",
      })
      .eq("id", contentId);

    if (updateError) {
      console.error("Error updating content_history:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        wordpressPostId: wpPost.id,
        wordpressUrl: wpPost.link,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in publish-to-wordpress function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
