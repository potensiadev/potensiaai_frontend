import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, ImagePlus, Share2, Zap, BarChart3 } from "lucide-react";

const Index = () => {
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
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="p-2 shadow-lg">
              <div className="aspect-video bg-gradient-subtle rounded-lg border border-border overflow-hidden">
                <div className="w-full h-full bg-card p-6">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                      <div className="text-sm text-muted-foreground mb-1">총 게시물</div>
                      <div className="text-2xl font-bold text-foreground">1,234</div>
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                      <div className="text-sm text-muted-foreground mb-1">총 조회수</div>
                      <div className="text-2xl font-bold text-foreground">45.2K</div>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                      <div className="text-sm text-muted-foreground mb-1">AI 생성</div>
                      <div className="text-2xl font-bold text-foreground">856</div>
                    </div>
                    <div className="bg-success/10 rounded-lg p-4 border border-success/20">
                      <div className="text-sm text-muted-foreground mb-1">수익</div>
                      <div className="text-2xl font-bold text-foreground">$1.2K</div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg h-32 flex items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                </div>
              </div>
            </Card>
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
                AI가 상위 노출 가능한 키워드를 분석하고 추천합니다. 검색량, 경쟁도, 트렌드를 실시간으로 확인하세요.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                AI 글쓰기
              </h3>
              <p className="text-muted-foreground">
                SEO 최적화된 블로그 글을 자동으로 생성합니다. 자연스러운 문체와 구조로 높은 품질을 보장합니다.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <ImagePlus className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                썸네일 생성
              </h3>
              <p className="text-muted-foreground">
                콘텐츠에 어울리는 매력적인 썸네일을 AI가 자동으로 디자인합니다. 클릭률을 높이는 비주얼을 만드세요.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                WordPress 연동
              </h3>
              <p className="text-muted-foreground">
                생성된 콘텐츠를 WordPress에 자동으로 발행합니다. 별도 작업 없이 즉시 블로그에 게시하세요.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover-scale">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                빠른 생성
              </h3>
              <p className="text-muted-foreground">
                몇 분 안에 완성도 높은 블로그 콘텐츠를 생성합니다. 시간을 절약하고 더 많은 콘텐츠를 만드세요.
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
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12">
                무료로 시작하기
              </Button>
            </Link>
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
