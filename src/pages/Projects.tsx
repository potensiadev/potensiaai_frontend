import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Calendar, Upload, Search, Eye, Trash2, Filter } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  publish_status: string;
  wordpress_post_id: string | null;
  content_tone: string;
  content_length: string;
}

const Projects = () => {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  // Filter posts based on search query and status
  useEffect(() => {
    let filtered = posts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.publish_status === statusFilter);
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, statusFilter]);

  const loadPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("content_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error: any) {
      console.error("Error loading posts:", error);
      toast({
        title: "포스트 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (contentId: string) => {
    setPublishing(contentId);

    try {
      const { data, error } = await supabase.functions.invoke(
        "publish-to-wordpress",
        {
          body: { contentId },
        }
      );

      if (error) throw error;

      toast({
        title: "워드프레스 게시 완료",
        description: "콘텐츠가 성공적으로 게시되었습니다.",
      });

      // Reload posts to reflect the updated status
      await loadPosts();
    } catch (error: any) {
      console.error("Error publishing to WordPress:", error);
      toast({
        title: "게시 실패",
        description: error.message || "워드프레스 게시 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("정말 이 포스트를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("content_history")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "포스트가 삭제되었습니다.",
      });

      await loadPosts();
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewDetail = (post: ContentPost) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">포스트 관리</h1>
            <p className="mt-2 text-muted-foreground">
              AI로 작성된 모든 콘텐츠를 관리하세요
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            전체 {posts.length}개
          </Badge>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="제목 또는 내용으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="published">업로드완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {posts.length === 0
                  ? "아직 작성된 포스트가 없습니다"
                  : "검색 결과가 없습니다"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.created_at), "PPP", {
                            locale: ko,
                          })}
                        </span>
                        <span>톤: {post.content_tone}</span>
                        <span>길이: {post.content_length}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          post.publish_status === "published"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          post.publish_status === "published"
                            ? "bg-success text-white"
                            : "bg-warning"
                        }
                      >
                        {post.publish_status === "published"
                          ? "업로드완료"
                          : "대기중"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(post)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        상세보기
                      </Button>
                      {post.publish_status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handlePublish(post.id)}
                          disabled={publishing === post.id}
                        >
                          {publishing === post.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              게시 중...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              게시
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.content.replace(/<[^>]*>/g, "").substring(0, 200)}...
                  </p>
                  {post.wordpress_post_id && (
                    <p className="text-xs text-muted-foreground mt-2">
                      워드프레스 포스트 ID: {post.wordpress_post_id}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedPost?.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {selectedPost && format(new Date(selectedPost.created_at), "PPP", { locale: ko })}
                </span>
                <Badge
                  variant={selectedPost?.publish_status === "published" ? "default" : "secondary"}
                  className={
                    selectedPost?.publish_status === "published"
                      ? "bg-success text-white"
                      : "bg-warning"
                  }
                >
                  {selectedPost?.publish_status === "published" ? "업로드완료" : "대기중"}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] mt-4">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">글 길이</p>
                    <p className="font-medium">
                      {selectedPost?.content_length === "short"
                        ? "짧게"
                        : selectedPost?.content_length === "medium"
                        ? "보통"
                        : "길게"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">글 톤</p>
                    <p className="font-medium">
                      {selectedPost?.content_tone === "professional"
                        ? "전문적"
                        : selectedPost?.content_tone === "friendly"
                        ? "친근한"
                        : "설득적"}
                    </p>
                  </div>
                  {selectedPost?.wordpress_post_id && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">워드프레스 포스트 ID</p>
                      <p className="font-medium">{selectedPost.wordpress_post_id}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">콘텐츠</h4>
                  <div
                    className="prose prose-sm max-w-none p-4 bg-muted rounded-lg"
                    dangerouslySetInnerHTML={{ __html: selectedPost?.content || "" }}
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 mt-4">
              {selectedPost?.publish_status === "pending" && (
                <Button
                  onClick={() => {
                    if (selectedPost) {
                      handlePublish(selectedPost.id);
                      setShowDetailModal(false);
                    }
                  }}
                  disabled={publishing === selectedPost?.id}
                >
                  {publishing === selectedPost?.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      게시 중...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      워드프레스에 게시
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                닫기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Projects;
