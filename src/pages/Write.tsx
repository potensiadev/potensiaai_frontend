import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Send, Save, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeywordSuggestion {
  keyword: string;
  search_volume: string;
  trend: string;
}

const Write = () => {
  const [keyword, setKeyword] = useState("");
  const [contentType, setContentType] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword || keyword.length < 2) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(() => {
      fetchKeywords(keyword);
    }, 600);

    return () => clearTimeout(delay);
  }, [keyword]);

  const fetchKeywords = async (kw: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("get-top-keywords", {
        body: { keyword: kw },
      });

      if (error) throw error;

      if (data.status === "success") {
        setSuggestions(data.data);
      }
    } catch (err) {
      console.error("키워드 API 호출 실패:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI 글쓰기</h1>
            <p className="mt-2 text-muted-foreground">
              키워드를 입력하고 AI가 SEO 최적화된 콘텐츠를 생성합니다
            </p>
          </div>
          <Badge variant="secondary" className="bg-gradient-primary text-white">
            <Sparkles className="mr-1 h-3 w-3" />
            AI 기반
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings Panel */}
          <Card className="p-6 shadow-md lg:col-span-1">
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              생성 설정
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="keyword">핵심 키워드</Label>
                <Input
                  id="keyword"
                  placeholder="예: 블로그 마케팅"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  검색 최적화를 위한 주요 키워드
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-type">글 유형</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger id="content-type">
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informative">정보형</SelectItem>
                    <SelectItem value="experience">경험형</SelectItem>
                    <SelectItem value="review">리뷰형</SelectItem>
                    <SelectItem value="guide">가이드형</SelectItem>
                    <SelectItem value="listicle">리스트형</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">프로젝트</Label>
                <Select>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="프로젝트 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">마케팅 블로그</SelectItem>
                    <SelectItem value="tech">테크 블로그</SelectItem>
                    <SelectItem value="lifestyle">라이프스타일</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">언어</Label>
                <Select defaultValue="ko">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-gradient-primary shadow-glow"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                콘텐츠 생성
              </Button>
            </div>
          </Card>

          {/* Editor Panel */}
          <Card className="p-6 shadow-md lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                생성된 콘텐츠
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  미리보기
                </Button>
                <Button variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  임시저장
                </Button>
                <Button size="sm" className="bg-gradient-primary">
                  <Send className="mr-2 h-4 w-4" />
                  발행
                </Button>
              </div>
            </div>

            {generatedContent ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-foreground">
                      AI 콘텐츠 생성 대기중
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      왼쪽에서 키워드와 설정을 입력하고
                      <br />
                      '콘텐츠 생성' 버튼을 클릭하세요
                    </p>
                  </div>
                </div>

                {/* Keyword Suggestions */}
                {loading && (
                  <p className="text-sm text-muted-foreground">
                    AI가 키워드를 분석 중이에요...
                  </p>
                )}

                {suggestions.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-foreground">
                      🔍 추천 키워드 Top 10
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {suggestions.map((item, i) => (
                        <div
                          key={i}
                          className="cursor-pointer rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                          onClick={() => setKeyword(item.keyword)}
                        >
                          <p className="font-medium text-foreground">{item.keyword}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            🔍 검색량: {item.search_volume} / 📈 {item.trend}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEO Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
              <div>
                <p className="text-xs text-muted-foreground">SEO 점수</p>
                <p className="mt-1 text-2xl font-bold text-success">85</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">키워드 밀도</p>
                <p className="mt-1 text-2xl font-bold text-primary">2.3%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">가독성</p>
                <p className="mt-1 text-2xl font-bold text-secondary">좋음</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Write;
