import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkResetStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user needs password reset
      const { data: profile } = await supabase
        .from("profiles")
        .select("needs_password_reset")
        .eq("id", user.id)
        .single();

      if (!profile?.needs_password_reset) {
        // User doesn't need to reset password, redirect to home
        navigate("/");
        return;
      }

      setChecking(false);
    };

    checkResetStatus();
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "비밀번호가 일치하지 않습니다",
        description: "새 비밀번호를 다시 확인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "비밀번호가 너무 짧습니다",
        description: "최소 6자 이상 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) throw passwordError;

      // Update needs_password_reset flag
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ needs_password_reset: false })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "비밀번호가 변경되었습니다",
        description: "새 비밀번호로 로그인할 수 있습니다.",
      });

      // Redirect to home
      navigate("/");
    } catch (error: any) {
      toast({
        title: "비밀번호 변경 실패",
        description: error.message || "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">비밀번호 재설정</CardTitle>
          <CardDescription className="text-center">
            보안을 위해 새로운 비밀번호를 설정해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                최소 6자 이상 입력해주세요
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  변경 중...
                </>
              ) : (
                "비밀번호 변경"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
