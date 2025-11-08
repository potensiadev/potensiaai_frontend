import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

interface KeywordSuggestion {
  keyword: string;
  search_volume: string;
  trend: string;
}

interface KeywordAnalysis {
  initial_keywords: {
    category: string;
    keywords: string[];
  }[];
  detailed_analysis: {
    keyword: string;
    search_volume: string;
    competition: string;
    trend: string;
    difficulty: string;
    profitability: string;
    total_score: number;
    grade: string;
  }[];
  top_10_usage: {
    rank: number;
    keyword: string;
    reason: string;
    title_example: string;
    strategy: string;
  }[];
  seo_titles: string[];
  execution_strategy: string[];
}

const Keywords = () => {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [refinedTitle, setRefinedTitle] = useState<string>("");
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const fetchKeywords = async () => {
    if (!keyword.trim() || keyword.length < 2) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-top-keywords", {
        body: { keyword: keyword.trim() },
      });

      if (error) throw error;

      if (data.status === "success") {
        setSuggestions(data.data);
      } else {
        toast({
          title: "오류",
          description: data.message || "키워드를 가져오는데 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "키워드를 가져오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefineKeyword = async (kw: string) => {
    setSelectedKeyword(kw);
    setRefining(true);
    setRefinedTitle("");

    try {
      const { data, error } = await supabase.functions.invoke("refine-keyword", {
        body: { keyword: kw },
      });

      if (error) throw error;

      if (data.status === "success") {
        setRefinedTitle(data.title);
      } else {
        toast({
          title: "오류",
          description: data.message || "제목 생성에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "제목 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setRefining(false);
    }
  };

  const handleAnalyzeKeyword = async () => {
    if (!keyword.trim()) return;

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-keyword", {
        body: { keyword: keyword.trim() },
      });

      if (error) throw error;

      if (data.status === "success") {
        setAnalysis(data.analysis);
      } else {
        toast({
          title: "오류",
          description: data.message || "키워드 분석에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "키워드 분석에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend.includes("상승")) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend.includes("하락")) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">키워드 분석</h1>
          <p className="text-muted-foreground">
            SEO 최적화된 키워드를 찾고 분석하세요
          </p>
        </div>

        <div className="grid gap-6">
          {/* 키워드 입력 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>키워드 입력</CardTitle>
              <CardDescription>
                분석하고 싶은 메인 키워드를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="예: 청약가점, 목동 영어유치원"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") fetchKeywords();
                  }}
                  className="flex-1"
                />
                <Button onClick={fetchKeywords} disabled={loading || !keyword.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">검색</span>
                </Button>
                <Button
                  onClick={handleAnalyzeKeyword}
                  disabled={analyzing || !keyword.trim()}
                  variant="secondary"
                >
                  {analyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "상세 분석"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 추천 키워드 TOP 10 */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>추천 키워드 TOP 10</CardTitle>
                <CardDescription>
                  키워드를 선택하면 SEO 최적화된 제목으로 변환됩니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleRefineKeyword(suggestion.keyword)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant="outline" className="font-mono">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{suggestion.keyword}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(suggestion.trend)}
                          <span className="text-sm text-muted-foreground">
                            {suggestion.trend}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">
                          {suggestion.search_volume}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 변환된 제목 */}
          {selectedKeyword && (
            <Card>
              <CardHeader>
                <CardTitle>SEO 최적화 제목</CardTitle>
                <CardDescription>
                  선택한 키워드: <strong>{selectedKeyword}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {refining ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : refinedTitle ? (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-lg font-medium">{refinedTitle}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* 상세 분석 결과 */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>키워드 상세 분석</CardTitle>
                <CardDescription>
                  4단계 SEO 키워드 분석 리포트
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="initial">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="initial">초기 키워드</TabsTrigger>
                    <TabsTrigger value="detailed">상세 분석</TabsTrigger>
                    <TabsTrigger value="top10">TOP 10 활용</TabsTrigger>
                    <TabsTrigger value="seo">SEO 제목</TabsTrigger>
                  </TabsList>

                  <TabsContent value="initial" className="space-y-4">
                    {analysis.initial_keywords.map((cat, idx) => (
                      <div key={idx}>
                        <h3 className="font-semibold mb-2">{cat.category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {cat.keywords.map((kw, i) => (
                            <Badge key={i} variant="secondary">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="detailed">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">키워드</th>
                            <th className="text-left p-2">검색량</th>
                            <th className="text-left p-2">경쟁도</th>
                            <th className="text-left p-2">트렌드</th>
                            <th className="text-left p-2">난이도</th>
                            <th className="text-left p-2">수익성</th>
                            <th className="text-left p-2">총점</th>
                            <th className="text-left p-2">등급</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.detailed_analysis.map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2 font-medium">{item.keyword}</td>
                              <td className="p-2">{item.search_volume}</td>
                              <td className="p-2">{item.competition}</td>
                              <td className="p-2">{item.trend}</td>
                              <td className="p-2">{item.difficulty}</td>
                              <td className="p-2">{item.profitability}</td>
                              <td className="p-2 font-mono">{item.total_score}</td>
                              <td className="p-2">
                                <Badge>{item.grade}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="top10" className="space-y-4">
                    {analysis.top_10_usage.map((item) => (
                      <div key={item.rank} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <Badge className="font-mono">#{item.rank}</Badge>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.keyword}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.reason}
                            </p>
                            <div className="bg-accent/50 p-2 rounded mb-2">
                              <p className="text-sm">
                                <strong>제목 예시:</strong> {item.title_example}
                              </p>
                            </div>
                            <p className="text-sm">
                              <strong>구성 방향:</strong> {item.strategy}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">SEO 최적 제목 제안</h3>
                      <div className="space-y-2">
                        {analysis.seo_titles.map((title, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-primary/5 border border-primary/20 rounded"
                          >
                            {title}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">실행 전략</h3>
                      <ul className="space-y-2">
                        {analysis.execution_strategy.map((strategy, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Keywords;
