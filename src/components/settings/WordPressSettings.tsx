import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";

interface WordPressSettingsData {
  site_url: string;
  username: string;
  application_password: string;
}

export function WordPressSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WordPressSettingsData>({
    site_url: "",
    username: "",
    application_password: "",
  });
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "오류",
          description: "로그인이 필요합니다",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("wordpress_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          site_url: data.site_url,
          username: data.username,
          application_password: data.application_password,
        });
        setHasExistingSettings(true);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "오류",
        description: "설정을 불러오는데 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!settings.site_url || !settings.username || !settings.application_password) {
        toast({
          title: "입력 오류",
          description: "모든 필드를 입력해주세요",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const settingsData = {
        user_id: user.id,
        site_url: settings.site_url.trim(),
        username: settings.username.trim(),
        application_password: settings.application_password.trim(),
      };

      if (hasExistingSettings) {
        const { error } = await supabase
          .from("wordpress_settings")
          .update(settingsData)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wordpress_settings")
          .insert([settingsData]);

        if (error) throw error;
        setHasExistingSettings(true);
      }

      toast({
        title: "저장 완료",
        description: "워드프레스 설정이 저장되었습니다",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "저장 실패",
        description: "설정 저장 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      
      if (!settings.site_url || !settings.username || !settings.application_password) {
        toast({
          title: "입력 오류",
          description: "먼저 모든 설정을 입력해주세요",
          variant: "destructive",
        });
        return;
      }

      // Test WordPress REST API connection
      const credentials = btoa(`${settings.username}:${settings.application_password}`);
      const testUrl = `${settings.site_url.replace(/\/$/, '')}/wp-json/wp/v2/users/me`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`연결 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      toast({
        title: "연결 성공",
        description: `${data.name}님의 워드프레스에 성공적으로 연결되었습니다`,
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      toast({
        title: "연결 실패",
        description: error instanceof Error ? error.message : "워드프레스 연결에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>워드프레스 연동 설정</CardTitle>
        <CardDescription>
          워드프레스 사이트에 자동으로 포스트를 발행하기 위한 API 인증 정보를 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_url">사이트 URL</Label>
            <Input
              id="site_url"
              type="url"
              placeholder="https://yourdomain.com"
              value={settings.site_url}
              onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              워드프레스 사이트의 전체 URL을 입력하세요
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">사용자명</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              워드프레스 관리자 계정의 사용자명
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="application_password">애플리케이션 비밀번호</Label>
            <Input
              id="application_password"
              type="password"
              placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
              value={settings.application_password}
              onChange={(e) => setSettings({ ...settings, application_password: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              워드프레스에서 생성한 애플리케이션 비밀번호를 입력하세요
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">애플리케이션 비밀번호 생성 방법</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>워드프레스 관리자 페이지에 로그인</li>
                  <li>사용자 → 프로필 메뉴로 이동</li>
                  <li>"애플리케이션 비밀번호" 섹션에서 새 비밀번호 생성</li>
                  <li>생성된 비밀번호를 복사하여 위 필드에 입력</li>
                </ol>
                <a
                  href="https://wordpress.org/support/article/application-passwords/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                >
                  자세한 가이드 보기
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleTest}
            variant="outline"
            disabled={testing || saving}
          >
            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            연결 테스트
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || testing}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
