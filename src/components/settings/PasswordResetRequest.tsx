import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const PasswordResetRequest = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-temporary-password", {
        body: { email },
      });

      if (error) throw error;

      toast({
        title: "임시 비밀번호가 발송되었습니다",
        description: data.message || "이메일을 확인하여 임시 비밀번호로 로그인해주세요.",
      });

      setEmail("");
    } catch (error: any) {
      toast({
        title: "요청 실패",
        description: error.message || "임시 비밀번호 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetRequest} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">이메일</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <p className="text-xs text-muted-foreground">
          가입한 이메일 주소로 임시 비밀번호를 발송해드립니다. 임시 비밀번호로 로그인 후 새 비밀번호로 변경해주세요.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            전송 중...
          </>
        ) : (
          "임시 비밀번호 받기"
        )}
      </Button>
    </form>
  );
};
