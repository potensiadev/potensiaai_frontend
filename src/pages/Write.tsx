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
import { Sparkles, Send, Save, Eye, History, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  seo_score: number;
  keyword_density: number;
  readability: string;
  improvements: string[];
  strengths: string[];
}

interface ContentHistory {
  id: string;
  title: string;
  content: string;
  thumbnail_image: string | null;
  content_length: string;
  content_tone: string;
  created_at: string;
}

const Write = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [contentLength, setContentLength] = useState("medium");
  const [contentTone, setContentTone] = useState("professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState("");
  const [thumbnailSize, setThumbnailSize] = useState("1024x1024");
  const [thumbnailStyle, setThumbnailStyle] = useState("modern");
  const [refinedTitles, setRefinedTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [contentHistory, setContentHistory] = useState<ContentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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

  // 히스토리 불러오기
  useEffect(() => {
    fetchContentHistory();
  }, []);

  const fetchContentHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("User not authenticated");
        return;
      }

      const { data, error } = await supabase
        .from("content_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      setContentHistory(data || []);
    } catch (err) {
      console.error("히스토리 불러오기 실패:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

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
        body: { 
          keyword: title.trim(),
          length: contentLength,
          tone: contentTone,
        },
      });

      if (error) throw error;

      if (data.status === "success") {
        setGeneratedContent(data.data.content);
        // 히스토리에 저장
        await saveToHistory();
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

  const handleGenerateThumbnail = async () => {
    if (!generatedContent || generatedContent.trim().length === 0) {
      alert("먼저 콘텐츠를 생성해주세요.");
      return;
    }

    try {
      setGeneratingThumbnail(true);
      
      const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: { 
          title: title.trim(),
          content: generatedContent,
          size: thumbnailSize,
          style: thumbnailStyle,
        },
      });

      if (error) throw error;

      if (data.status === "success") {
        setThumbnailImage(data.data.image);
        // 썸네일 생성 후 히스토리 업데이트
        await saveToHistory();
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("썸네일 생성 실패:", err);
      alert("썸네일 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setGeneratingThumbnail(false);
    }
  };

  const saveToHistory = async () => {
    if (!generatedContent || !title) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인이 필요합니다",
          description: "히스토리를 저장하려면 로그인해주세요.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("content_history").insert({
        user_id: user.id,
        title: title,
        content: generatedContent,
        thumbnail_image: thumbnailImage || null,
        content_length: contentLength,
        content_tone: contentTone,
      });

      if (error) throw error;

      // 히스토리 새로고침
      await fetchContentHistory();
      
      toast({
        title: "저장 완료",
        description: "콘텐츠가 히스토리에 저장되었습니다.",
      });
    } catch (err) {
      console.error("히스토리 저장 실패:", err);
      toast({
        title: "저장 실패",
        description: "히스토리 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const loadFromHistory = (history: ContentHistory) => {
    setTitle(history.title);
    setGeneratedContent(history.content);
    setThumbnailImage(history.thumbnail_image || "");
    setContentLength(history.content_length);
    setContentTone(history.content_tone);
    setShowHistory(false);
    
    toast({
      title: "불러오기 완료",
      description: "히스토리에서 콘텐츠를 불러왔습니다.",
    });
  };

  const deleteFromHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("content_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchContentHistory();
      
      toast({
        title: "삭제 완료",
        description: "히스토리에서 삭제되었습니다.",
      });
    } catch (err) {
      console.error("히스토리 삭제 실패:", err);
      toast({
        title: "삭제 실패",
        description: "히스토리 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
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
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="mr-2 h-4 w-4" />
              히스토리 {contentHistory.length > 0 && `(${contentHistory.length})`}
            </Button>
            <Badge variant="secondary" className="bg-gradient-primary text-white">
              <Sparkles className="mr-1 h-3 w-3" />
              AI 기반
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Settings Panel */}
            <Card className="p-6 shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              생성 설정
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="글 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="w-48 space-y-2">
                  <Label htmlFor="content-length">글 길이</Label>
                  <Select value={contentLength} onValueChange={setContentLength}>
                    <SelectTrigger id="content-length">
                      <SelectValue placeholder="길이 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">짧게 (500-800자)</SelectItem>
                      <SelectItem value="medium">보통 (1000-1500자)</SelectItem>
                      <SelectItem value="long">길게 (2000-3000자)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-48 space-y-2">
                  <Label htmlFor="content-tone">글 톤</Label>
                  <Select value={contentTone} onValueChange={setContentTone}>
                    <SelectTrigger id="content-tone">
                      <SelectValue placeholder="톤 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">전문적</SelectItem>
                      <SelectItem value="friendly">친근한</SelectItem>
                      <SelectItem value="persuasive">설득적</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="bg-gradient-primary shadow-glow"
                  size="lg"
                  onClick={handleGenerateContent}
                  disabled={generating || !title.trim()}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {generating ? "생성 중..." : "콘텐츠 생성"}
                </Button>
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
                  <div className="grid grid-cols-2 gap-3">
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
            </div>
          </Card>

          {/* Editor Panel */}
          <Card className="p-6 shadow-md">
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

          {/* Thumbnail Generator */}
          {generatedContent && (
            <Card className="p-6 shadow-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                🖼️ 썸네일 생성
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-size">이미지 사이즈</Label>
                    <Select value={thumbnailSize} onValueChange={setThumbnailSize}>
                      <SelectTrigger id="thumbnail-size">
                        <SelectValue placeholder="사이즈 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">정사각형 (1024x1024)</SelectItem>
                        <SelectItem value="1792x1024">가로형 (1792x1024)</SelectItem>
                        <SelectItem value="1024x1792">세로형 (1024x1792)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-style">썸네일 스타일</Label>
                    <Select value={thumbnailStyle} onValueChange={setThumbnailStyle}>
                      <SelectTrigger id="thumbnail-style">
                        <SelectValue placeholder="스타일 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">미니멀</SelectItem>
                        <SelectItem value="modern">모던</SelectItem>
                        <SelectItem value="vibrant">비비드</SelectItem>
                        <SelectItem value="elegant">우아함</SelectItem>
                        <SelectItem value="playful">재미있는</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  onClick={handleGenerateThumbnail}
                  disabled={generatingThumbnail}
                  className="w-full bg-gradient-primary"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {generatingThumbnail ? "썸네일 생성 중..." : "썸네일 생성"}
                </Button>

                {thumbnailImage && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <img 
                      src={thumbnailImage} 
                      alt="Generated thumbnail" 
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="lg:col-span-3">
            <Card className="p-4 shadow-md h-full">
              <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                <History className="h-5 w-5" />
                콘텐츠 히스토리
              </h3>
              
              {loadingHistory ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">불러오는 중...</p>
                </div>
              ) : contentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    아직 생성된 콘텐츠가 없습니다.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <div className="space-y-3">
                    {contentHistory.map((history) => (
                      <div
                        key={history.id}
                        className="group relative rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent cursor-pointer"
                        onClick={() => loadFromHistory(history)}
                      >
                        <div className="pr-8">
                          <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                            {history.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {history.content_length === "short" ? "짧게" : 
                               history.content_length === "medium" ? "보통" : "길게"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {history.content_tone === "professional" ? "전문적" :
                               history.content_tone === "friendly" ? "친근한" : "설득적"}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {new Date(history.created_at).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFromHistory(history.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default Write;
