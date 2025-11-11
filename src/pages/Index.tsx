import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, ImagePlus, Share2, Zap, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigateToAuth = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">PotensiaAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link to="/auth">
              <Button>시작하기</Button>
            </Link>
            {!user && (
              <Button variant="ghost" onClick={handleNavigateToAuth}>
                로그인
              </Button>
            )}
            <Button onClick={handleNavigateToAuth}>시작하기</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-block">
              <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                AI 기반 블로그 자동화 플랫폼
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              키워드만 입력하면<br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                완벽한 블로그 콘텐츠
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SEO 최적화된 블로그 글부터 썸네일까지, AI가 자동으로 생성합니다.
              WordPress 자동 발행으로 콘텐츠 관리를 더욱 쉽게.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  무료로 시작하기
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  대시보드 보기
                </Button>
              </Link>
              <Button size="lg" className="text-lg px-8" onClick={handleNavigateToAuth}>
                무료로 시작하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              강력한 AI 기능
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              블로그 운영에 필요한 모든 것을 AI가 자동으로 처리합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                키워드 분석
@@ -141,45 +155,43 @@ const Index = () => {
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                성과 분석
              </h3>
              <p className="text-muted-foreground">
                조회수, 수익, 트래픽 등 주요 지표를 한눈에 확인하세요. 데이터 기반으로 전략을 개선합니다.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              PotensiaAI와 함께 블로그 운영을 자동화하고, 더 많은 수익을 창출하세요.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12">
                무료로 시작하기
              </Button>
            </Link>
            <Button size="lg" className="text-lg px-12" onClick={handleNavigateToAuth}>
              무료로 시작하기
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 PotensiaAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;