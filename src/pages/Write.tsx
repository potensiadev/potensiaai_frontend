import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

interface ValidationResult {
  seo_score: number;
  keyword_density: number;
  readability: string;
  improvements: string[];
  strengths: string[];
}

const Write = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [refinedTitles, setRefinedTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // URL 파라미터에서 제목 불러오기
  useEffect(() => {
    const titleParam = searchParams.get('title');
    if (titleParam) {
      setTitle(decodeURIComponent(titleParam));
      // URL 파라미터 제거
      searchParams.delete('title');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (!title || title.length < 2) {
      setRefinedTitles([]);
      return;
    }

    const delay = setTimeout(() => {
      fetchRefinedTitles(title);
    }, 600);

    return () => clearTimeout(delay);
  }, [title]);

  const fetchRefinedTitles = async (inputTitle: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("refine-keyword", {
        body: { keyword: inputTitle },
      });

      if (error) throw error;

      if (data.status === "success") {
        setRefinedTitles(data.titles || []);
      }
    } catch (err) {
      console.error("추천 제목 API 호출 실패:", err);
      setRefinedTitles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!title || title.trim().length === 0) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      setGenerating(true);
      setValidationResult(null);
      
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { keyword: title.trim() },
      });

      if (error) throw error;

      if (data.status === "success") {
        setGeneratedContent(data.data.content);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("콘텐츠 생성 실패:", err);
      alert("콘텐츠 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setGenerating(false);
    }
  };

  const handleValidateContent = async () => {
    if (!generatedContent || generatedContent.trim().length === 0) {
      alert("먼저 콘텐츠를 생성해주세요.");
      return;
    }

    try {
      setValidating(true);
      
      const { data, error } = await supabase.functions.invoke("validate-content", {
        body: { 
          content: generatedContent,
          keyword: title.trim(),
        },
      });

      if (error) throw error;

      if (data.status === "success") {
        setValidationResult(data.data);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("콘텐츠 검증 실패:", err);
      alert("콘텐츠 검증 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setValidating(false);
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
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="글 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  SEO 최적화된 제목
                </p>
              </div>

              {/* Refined Title Suggestions */}
              {loading && (
                <p className="text-sm text-muted-foreground">
                  AI가 추천 제목을 생성 중이에요...
                </p>
              )}

              {refinedTitles.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    ✨ 추천 제목 Top 10
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {refinedTitles.map((refinedTitle, i) => (
                      <div
                        key={i}
                        className="cursor-pointer rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                        onClick={() => setTitle(refinedTitle)}
                      >
                        <p className="font-medium text-foreground">{refinedTitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* <div className="space-y-2">
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
              </div> */}

              <Button
                className="w-full bg-gradient-primary shadow-glow"
                size="lg"
                onClick={handleGenerateContent}
                disabled={generating || !title.trim()}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {generating ? "생성 중..." : "콘텐츠 생성"}
              </Button>
            </div>
          </Card>

          {/* Editor Panel */}
          <Card className="p-6 shadow-md lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  생성된 콘텐츠
                </h3>
                {title && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    제목: {title}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {generatedContent && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleValidateContent}
                    disabled={validating}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {validating ? "검증 중..." : "검증"}
                  </Button>
                )}
                <Button variant="outline" size="sm" disabled={!generatedContent}>
                  <Save className="mr-2 h-4 w-4" />
                  임시저장
                </Button>
                <Button size="sm" className="bg-gradient-primary" disabled={!generatedContent}>
                  <Send className="mr-2 h-4 w-4" />
                  발행
                </Button>
              </div>
            </div>

            {generating ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow animate-pulse">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-foreground">
                    AI가 콘텐츠를 생성하고 있습니다...
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    잠시만 기다려주세요
                  </p>
                </div>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                />
              </div>
            ) : (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-foreground">
                    AI 콘텐츠 생성 대기중
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    왼쪽에서 키워드를 입력하고
                    <br />
                    '콘텐츠 생성' 버튼을 클릭하세요
                  </p>
                </div>
              </div>
            )}

            {/* SEO Metrics */}
            {validationResult && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">SEO 점수</p>
                    <p className="mt-1 text-2xl font-bold text-success">
                      {validationResult.seo_score}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">키워드 밀도</p>
                    <p className="mt-1 text-2xl font-bold text-primary">
                      {validationResult.keyword_density}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">가독성</p>
                    <p className="mt-1 text-2xl font-bold text-secondary">
                      {validationResult.readability}
                    </p>
                  </div>
                </div>

                {/* Validation Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="mb-3 font-semibold text-foreground">✨ 강점</h4>
                    <ul className="space-y-2">
                      {validationResult.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="mb-3 font-semibold text-foreground">💡 개선 사항</h4>
                    <ul className="space-y-2">
                      {validationResult.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Write;
