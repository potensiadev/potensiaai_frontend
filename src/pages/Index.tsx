import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  TrendingUp,
  ImagePlus,
  Share2,
  Zap,
  BarChart3,
  Loader2,
  Clock,
  DollarSign,
  Rocket,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-automation.jpg";
import coffeeImage from "@/assets/coffee-automation.jpg";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
      navigate("/dashboard");
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
      navigate("/dashboard");
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "로그아웃 완료",
        description: "다시 방문해주세요!",
      });
    } catch (error: any) {
      toast({
        title: "로그아웃 실패",
        description: error.message || "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
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
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  대시보드
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={handleOpenAuthDialog}>
                  로그인
                </Button>
                <Button onClick={handleOpenAuthDialog}>무료 시작하기</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                키워드만 입력하면
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  블로그가 알아서
                  <br />
                  돈을 벌어다 준다
                </span>
              </h1>
              <p className="text-2xl text-muted-foreground font-medium">
                키워드만 입력하세요.
                <br />
                나머지는 Potensia AI가 다 합니다.
              </p>
              <p className="text-xl text-foreground/80 italic">"내 블로그가 나 대신 일하는 순간"을 경험해보세요.</p>
              <div className="flex items-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleOpenAuthDialog}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  무료 시작하기
                </Button>
              </div>
            </div>
            <div className="relative">
              <img src={heroImage} alt="AI 블로그 자동화" className="rounded-2xl shadow-2xl border border-border" />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              블로그는 여전히 <span className="text-primary">돈이 됩니다</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              하지만 우리는 글을 쓸 시간이 없습니다.
              <br />
              그래서 AI가 글을 쓰고, 썸네일을 만들고, 업로드까지 대신합니다.
            </p>
          </div>

          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img src={coffeeImage} alt="편안한 블로그 운영" className="rounded-xl shadow-lg" />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-foreground">상상해보세요</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>출근하면서 키워드 하나를 입력합니다</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>회사에 도착하면 완성된 블로그 글이 워드프레스에 자동 발행되어 있습니다</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>
                      SEO AEO까지 최적화된 콘텐츠가 노출을 시작했고, 그 글은 '나' 대신 광고 수익을 만들어냅니다.
                    </span>
                  </p>
                </div>
                <p className="text-1xl font-bold text-foreground italic">"나는 출근했는데, 블로그는 쉬지 않습니다."</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">⚙️ 이렇게 작동합니다</h2>
            <p className="text-lg text-muted-foreground">모든 과정이 100% 자동화. 여러분은 "키워드"만 정하면 됩니다.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { num: "1", icon: TrendingUp, title: "키워드 입력", desc: "관심 주제 키워드 하나만 입력" },
              { num: "2", icon: BarChart3, title: "AI 분석", desc: "트렌드／경쟁도 자동 분석" },
              { num: "3", icon: Sparkles, title: "콘텐츠 생성", desc: "완성된 글 + 썸네일 자동 생성" },
              { num: "4", icon: Share2, title: "자동 발행", desc: "워드프레스에 원클릭 발행" },
              { num: "5", icon: BarChart3, title: "성과 분석", desc: "수익／트래픽 리포트 확인" },
            ].map((step) => (
              <Card
                key={step.num}
                className="p-6 text-center hover:shadow-lg transition-all duration-300 hover-scale relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {step.num}
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto mt-2">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">실제 사용자 후기💬</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="mb-4">
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="text-l font-bold text-foreground mb-2">"이건 진짜 비서에요"</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                예전엔 글 하나 쓰는데 3시간 걸렸는데 지금은 3분이면 끝나요. AI가 제 말투를 기억해서 점점 더 제
                목소리처럼 써요.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 border-primary">
              <div className="mb-4">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="text-x font-bold text-foreground mb-2">"부수입이 본업이 됐어요"</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                매일 자동 발행된 글들로 애드센스 수익이 납니다.키워드만 입력했는데, 돈은 계속 들어오네요.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="mb-4">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="text-x font-bold text-foreground mb-2">'시간을 사는 서비스'입니다</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                직장 다니면서 블로그 운영할 시간이 없었는데,지금은 AI가 저 대신 성장시키고 있습니다.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">🎯 왜 Potensia AI인가요?</h2>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left font-bold text-foreground">비교 항목</th>
                    <th className="p-4 text-center font-bold text-primary">Potensia AI</th>
                    <th className="p-4 text-center font-bold text-muted-foreground">일반 AI 글 생성기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { item: "SEO 최적화", us: true, them: false },
                    { item: "썸네일 생성", us: true, them: false },
                    { item: "워드프레스 연동", us: true, them: false },
                    { item: "성과 분석", us: true, them: false },
                    { item: "글 톤/스타일 학습", us: true, them: "partial" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium text-foreground">{row.item}</td>
                      <td className="p-4 text-center">
                        {row.us && <CheckCircle2 className="h-6 w-6 text-primary mx-auto" />}
                      </td>
                      <td className="p-4 text-center">
                        {row.them === false && <XCircle className="h-6 w-6 text-muted-foreground mx-auto" />}
                        {row.them === "partial" && <span className="text-muted-foreground">⚠️</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-primary/5 text-center">
              <p className="text-lg font-bold text-foreground">Potensia AI는 "그냥 글을 쓰는 도구"가 아닙니다.</p>
              <p className="text-xl font-bold text-primary mt-2">"돈을 벌어주는 콘텐츠 시스템"입니다.</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Before/After */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">🧭 Potensia AI를 쓰면 이렇게 바뀝니다</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-background border-2">
              <h3 className="text-2xl font-bold text-muted-foreground mb-6 flex items-center gap-2">
                <XCircle className="h-6 w-6" />
                Before
              </h3>
              <ul className="space-y-4">
                {["매일 '무엇을 쓸까' 고민", "블로그 관리에 시간 낭비", "글은 많은데 수익은 없음", "블로그는 취미"].map(
                  (item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-destructive mt-1">✗</span>
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary">
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                After
              </h3>
              <ul className="space-y-4">
                {[
                  "키워드만 입력하면 완성",
                  "한 번 설정으로 자동 운영",
                  "SEO+디자인+자동발행으로 수익 구조화",
                  "블로그가 자산이 됨",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="p-12 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-2">
            <div className="text-center space-y-5">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground"> 이건 투자입니다, 소비가 아닙니다</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>매일 글을 대신 써주는 AI.</p>
                <p>매일 클릭 수를 올려주는 자동화.</p>
                <p>매일 나 대신 일해주는 시스템.</p>
              </div>
              <p className="text-2xl font-bold text-primary">Potensia AI는 나의 "시간을 복제해주는 서비스"입니다.</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">강력한 AI 기능</h2>
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
              <h3 className="text-xl font-bold text-foreground mb-2">키워드 분석</h3>
              <p className="text-muted-foreground">
                검색량과 경쟁도를 분석하여 최적의 키워드를 추천합니다. 트렌드에 맞는 콘텐츠를 작성하세요.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">AI 글 생성</h3>
              <p className="text-muted-foreground">
                SEO 최적화된 고품질 블로그 글을 자동으로 생성합니다. 시간을 절약하고 효율을 높이세요.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ImagePlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">썸네일 생성</h3>
              <p className="text-muted-foreground">
                클릭을 유도하는 매력적인 썸네일을 AI가 자동으로 만들어줍니다. 디자인 걱정은 이제 그만.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">자동 발행</h3>
              <p className="text-muted-foreground">
                WordPress 블로그에 클릭 한 번으로 자동 발행됩니다. 콘텐츠 업로드가 이렇게 쉬워집니다.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">빠른 작업</h3>
              <p className="text-muted-foreground">
                몇 분 만에 완성도 높은 블로그 콘텐츠를 생성합니다. 생산성을 극대화하세요.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">성과 분석</h3>
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
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">지금 바로 시작하세요</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              PotensiaAI와 함께 블로그 운영을 자동화하고, 더 많은 수익을 창출하세요.
            </p>
            <Button size="lg" className="text-lg px-12" onClick={handleOpenAuthDialog}>
              무료 시작하기
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
            <DialogDescription className="text-center">AI 기반 블로그 자동화 플랫폼</DialogDescription>
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
                  <p className="text-xs text-muted-foreground">최소 6자 이상 입력해주세요</p>
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
