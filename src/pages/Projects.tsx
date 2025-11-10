import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Calendar, Upload } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

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
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

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
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                아직 작성된 포스트가 없습니다
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
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
      </div>
    </Layout>
  );
};

export default Projects;
