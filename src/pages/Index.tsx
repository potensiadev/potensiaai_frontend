import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, ImagePlus, Share2, Zap, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOpenAuthDialog = () => {
    setShowAuthDialog(true);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "계정이 생성되었습니다!",
        description: "자동으로 로그인되었습니다.",
      });

      setShowAuthDialog(false);
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });

      setShowAuthDialog(false);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            {!user && (
              <Button variant="ghost" onClick={handleOpenAuthDialog}>
                로그인
              </Button>
            )}
            <Button onClick={handleOpenAuthDialog}>시작하기</Button>
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
              <Button size="lg" className="text-lg px-8" onClick={handleOpenAuthDialog}>
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
              </h3>
              <p className="text-muted-foreground">
                검색량과 경쟁도를 분석하여 최적의 키워드를 추천합니다. 트렌드에 맞는 콘텐츠를 작성하세요.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                AI 글 생성
              </h3>
              <p className="text-muted-foreground">
                SEO 최적화된 고품질 블로그 글을 자동으로 생성합니다. 시간을 절약하고 효율을 높이세요.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ImagePlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                썸네일 생성
              </h3>
              <p className="text-muted-foreground">
                클릭을 유도하는 매력적인 썸네일을 AI가 자동으로 만들어줍니다. 디자인 걱정은 이제 그만.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                자동 발행
              </h3>
              <p className="text-muted-foreground">
                WordPress 블로그에 클릭 한 번으로 자동 발행됩니다. 콘텐츠 업로드가 이렇게 쉬워집니다.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                빠른 작업
              </h3>
              <p className="text-muted-foreground">
                몇 분 만에 완성도 높은 블로그 콘텐츠를 생성합니다. 생산성을 극대화하세요.
              </p>
            </Card>

            {/* Feature 6 */}
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
            <Button size="lg" className="text-lg px-12" onClick={handleOpenAuthDialog}>
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

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">PotensiaAI</DialogTitle>
            <DialogDescription className="text-center">
              AI 기반 블로그 자동화 플랫폼
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    "로그인"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">이름</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="홍길동"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    최소 6자 이상 입력해주세요
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      회원가입 중...
                    </>
                  ) : (
                    "회원가입"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
