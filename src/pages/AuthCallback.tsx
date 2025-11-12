import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if there's a hash in the URL (from email confirmation link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          if (data.session) {
            toast({
              title: "이메일 인증 완료",
              description: "환영합니다! 대시보드로 이동합니다.",
            });

            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 1000);
            return;
          }
        }

        // Fallback: Try to get existing session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          toast({
            title: "이메일 인증 완료",
            description: "환영합니다! 대시보드로 이동합니다.",
          });

          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1000);
        } else {
          toast({
            title: "인증 실패",
            description: "로그인이 필요합니다.",
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast({
          title: "인증 오류",
          description: error.message || "인증 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="text-2xl font-bold text-foreground">이메일 인증 중...</h2>
        <p className="text-muted-foreground">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
