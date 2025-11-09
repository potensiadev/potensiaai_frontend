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
import { Sparkles, Download, RefreshCw, Eye, Image as ImageIcon, History, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ContentHistory {
  id: string;
  title: string;
  created_at: string;
}

interface SeoTitleHistory {
  id: string;
  keyword: string;
  seo_title: string;
  created_at: string;
}

const Thumbnails = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailImages, setThumbnailImages] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
  const [thumbnailSize, setThumbnailSize] = useState("1024x1024");
  const [thumbnailStyle, setThumbnailStyle] = useState("modern");
  const [thumbnailCount, setThumbnailCount] = useState("1");
  const [showPreview, setShowPreview] = useState(false);
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [contentHistory, setContentHistory] = useState<ContentHistory[]>([]);
  const [seoTitleHistory, setSeoTitleHistory] = useState<SeoTitleHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      // Fetch content history
      const { data: contentData, error: contentError } = await supabase
        .from("content_history")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (contentError) throw contentError;
      setContentHistory(contentData || []);

      // Fetch SEO titles history
      const { data: seoData, error: seoError } = await supabase
        .from("seo_titles_history")
        .select("id, keyword, seo_title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (seoError) throw seoError;
      setSeoTitleHistory(seoData || []);
    } catch (err) {
      console.error("히스토리 불러오기 실패:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectTitle = (selectedTitle: string) => {
    setTitle(selectedTitle);
    setShowHistory(false);
    toast({
      title: "제목 선택됨",
      description: "선택한 제목이 입력되었습니다.",
    });
  };

  const handleGenerateThumbnail = async () => {
    if (!title.trim()) {
      toast({
        title: "제목을 입력해주세요",
        description: "썸네일 생성을 위해 제목이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingThumbnail(true);
      const count = parseInt(thumbnailCount);
      const newThumbnails: string[] = [];
      
      // Generate multiple thumbnails
      for (let i = 0; i < count; i++) {
        const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
          body: { 
            title: title.trim(),
            content: content.trim() || "Create a professional thumbnail for this title",
            size: thumbnailSize,
            style: thumbnailStyle,
          },
        });

        if (error) {
          console.error("Edge function error:", error);
          throw error;
        }

        if (data.status === "success") {
          newThumbnails.push(data.data.image);
        } else if (data.error) {
          throw new Error(data.error);
        }
      }
      
      setThumbnailImages(newThumbnails);
      if (newThumbnails.length > 0) {
        setSelectedThumbnail(newThumbnails[0]);
      }
      setShowPreview(false);
      
      toast({
        title: "썸네일 생성 완료",
        description: `${newThumbnails.length}개의 썸네일이 생성되었습니다.`,
      });
    } catch (err) {
      console.error("썸네일 생성 실패:", err);
      toast({
        title: "썸네일 생성 실패",
        description: err instanceof Error ? err.message : "썸네일 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setGeneratingThumbnail(false);
    }
  };

  const handleDownloadThumbnail = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "다운로드 완료",
      description: "썸네일이 다운로드되었습니다.",
    });
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case "1024x1024": return "정사각형";
      case "1792x1024": return "가로형";
      case "1024x1792": return "세로형";
      default: return size;
    }
  };

  const getStyleLabel = (style: string) => {
    switch (style) {
      case "minimal": return "미니멀";
      case "modern": return "모던";
      case "vibrant": return "비비드";
      case "elegant": return "우아함";
      case "playful": return "재미있는";
      default: return style;
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI 썸네일 생성</h1>
            <p className="mt-2 text-muted-foreground">
              제목과 내용을 입력하고 AI가 전문적인 썸네일을 생성합니다
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="mr-2 h-4 w-4" />
              히스토리
            </Button>
            <Badge variant="secondary" className="bg-gradient-primary text-white">
              <Sparkles className="mr-1 h-3 w-3" />
              AI 기반
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Settings Panel */}
          <div className={`space-y-6 ${showHistory ? "lg:col-span-5" : "lg:col-span-6"}`}>
            <Card className="p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                콘텐츠 정보
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    placeholder="썸네일 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">내용 설명 (선택)</Label>
                  <Textarea
                    id="content"
                    placeholder="썸네일에 반영할 내용을 입력하세요 (선택사항)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                생성 옵션
              </h3>

              <div className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="thumbnail-count">생성 개수</Label>
                  <Select value={thumbnailCount} onValueChange={setThumbnailCount}>
                    <SelectTrigger id="thumbnail-count">
                      <SelectValue placeholder="개수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1개</SelectItem>
                      <SelectItem value="2">2개</SelectItem>
                      <SelectItem value="3">3개</SelectItem>
                      <SelectItem value="4">4개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview Section */}
                {showPreview && (
                  <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">미리보기 설정</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">사이즈:</span>
                        <span className="text-foreground font-medium">{getSizeLabel(thumbnailSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">스타일:</span>
                        <span className="text-foreground font-medium">{getStyleLabel(thumbnailStyle)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">개수:</span>
                        <span className="text-foreground font-medium">{thumbnailCount}개</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">제목:</span>
                        <span className="text-foreground font-medium truncate max-w-[200px]">{title || "미입력"}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? "미리보기 숨기기" : "미리보기"}
                  </Button>
                  <Button
                    onClick={handleGenerateThumbnail}
                    disabled={generatingThumbnail || !title.trim()}
                    className="flex-1 bg-gradient-primary shadow-glow"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {generatingThumbnail ? "생성 중..." : "썸네일 생성"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className={`space-y-6 ${showHistory ? "lg:col-span-4" : "lg:col-span-6"}`}>
            <Card className="p-6 shadow-md min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  생성 결과
                </h3>
                {selectedThumbnail && (
                  <Button
                    onClick={() => handleDownloadThumbnail(selectedThumbnail)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    다운로드
                  </Button>
                )}
              </div>

              {generatingThumbnail ? (
                <div className="flex min-h-[350px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow animate-pulse">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-foreground">
                      AI가 썸네일을 생성하고 있습니다...
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      잠시만 기다려주세요
                    </p>
                  </div>
                </div>
              ) : thumbnailImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-foreground">
                      생성된 썸네일 ({thumbnailImages.length}개)
                    </h4>
                    <Button
                      onClick={() => {
                        setThumbnailImages([]);
                        setSelectedThumbnail("");
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      초기화
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {thumbnailImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-lg border-2 transition-all cursor-pointer ${
                          selectedThumbnail === img
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedThumbnail(img)}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`} 
                          className="w-full rounded-lg"
                        />
                        {selectedThumbnail === img && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-semibold">
                            선택됨
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Selected Thumbnail Preview */}
                  {selectedThumbnail && (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <h4 className="font-semibold text-sm text-foreground mb-2">선택된 썸네일</h4>
                      <img 
                        src={selectedThumbnail} 
                        alt="Selected thumbnail" 
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[350px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                      <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-foreground">
                      썸네일 생성 대기중
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      왼쪽에서 정보를 입력하고
                      <br />
                      '썸네일 생성' 버튼을 클릭하세요
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className="lg:col-span-3">
              <Card className="p-4 shadow-md h-full">
                <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                  <History className="h-5 w-5" />
                  제목 히스토리
                </h3>
                
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">불러오는 중...</p>
                  </div>
                ) : (
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="content">
                        <FileText className="mr-2 h-4 w-4" />
                        AI 글쓰기
                      </TabsTrigger>
                      <TabsTrigger value="seo">
                        <Sparkles className="mr-2 h-4 w-4" />
                        키워드 리서치
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="mt-4">
                      {contentHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">
                            생성된 콘텐츠가 없습니다.
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[calc(100vh-320px)]">
                          <div className="space-y-2">
                            {contentHistory.map((history) => (
                              <div
                                key={history.id}
                                className="group relative rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent cursor-pointer"
                                onClick={() => handleSelectTitle(history.title)}
                              >
                                <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                                  {history.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(history.created_at).toLocaleDateString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="seo" className="mt-4">
                      {seoTitleHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">
                            생성된 SEO 제목이 없습니다.
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[calc(100vh-320px)]">
                          <div className="space-y-2">
                            {seoTitleHistory.map((history) => (
                              <div
                                key={history.id}
                                className="group relative rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent cursor-pointer"
                                onClick={() => handleSelectTitle(history.seo_title)}
                              >
                                <Badge variant="outline" className="text-xs mb-2">
                                  {history.keyword}
                                </Badge>
                                <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                                  {history.seo_title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(history.created_at).toLocaleDateString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Thumbnails;
