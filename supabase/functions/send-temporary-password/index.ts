import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

// Generate random temporary password
function generateTemporaryPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "이메일 주소를 입력해주세요." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user exists
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users:", userError);
      throw new Error("사용자 조회 중 오류가 발생했습니다.");
    }

    const user = userData.users.find(u => u.email === email);

    if (!user) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          message: "이메일로 임시 비밀번호가 발송되었습니다. 이메일을 확인해주세요." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();

    // Update user password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: tempPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      throw new Error("비밀번호 업데이트 중 오류가 발생했습니다.");
    }

    // Set needs_password_reset flag in profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ needs_password_reset: true })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }

    // Send email with temporary password
    const emailResponse = await resend.emails.send({
      from: "SEO Content Studio <onboarding@resend.dev>",
      to: [email],
      subject: "임시 비밀번호 발급 안내",
      html: `
        <h1>임시 비밀번호가 발급되었습니다</h1>
        <p>안녕하세요,</p>
        <p>요청하신 임시 비밀번호는 다음과 같습니다:</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <code style="font-size: 18px; font-weight: bold;">${tempPassword}</code>
        </div>
        <p><strong>보안을 위해 다음 단계를 따라주세요:</strong></p>
        <ol>
          <li>위의 임시 비밀번호로 로그인하세요</li>
          <li>로그인 후 자동으로 비밀번호 재설정 페이지로 이동됩니다</li>
          <li>새로운 비밀번호를 설정하세요</li>
        </ol>
        <p style="color: #ff0000; font-weight: bold;">⚠️ 보안상의 이유로 첫 로그인 시 반드시 비밀번호를 변경해야 합니다.</p>
        <p>감사합니다,<br>SEO Content Studio 팀</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        message: "이메일로 임시 비밀번호가 발송되었습니다. 이메일을 확인해주세요." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-temporary-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "임시 비밀번호 발송 중 오류가 발생했습니다." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
