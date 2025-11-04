import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical, Eye, TrendingUp } from "lucide-react";

interface Post {
  id: string;
  title: string;
  status: "published" | "draft" | "scheduled";
  views: number;
  createdAt: string;
  project: string;
}

const mockPosts: Post[] = [
  {
    id: "1",
    title: "2024년 블로그 마케팅 완벽 가이드",
    status: "published",
    views: 1247,
    createdAt: "2시간 전",
    project: "마케팅 블로그",
  },
  {
    id: "2",
    title: "SEO 최적화를 위한 10가지 팁",
    status: "published",
    views: 892,
    createdAt: "5시간 전",
    project: "SEO 가이드",
  },
  {
    id: "3",
    title: "콘텐츠 자동화로 생산성 높이기",
    status: "draft",
    views: 0,
    createdAt: "1일 전",
    project: "테크 블로그",
  },
  {
    id: "4",
    title: "AI 글쓰기 도구 비교 분석",
    status: "scheduled",
    views: 0,
    createdAt: "2일 후",
    project: "AI 트렌드",
  },
];

const statusConfig = {
  published: { label: "발행됨", color: "bg-success" },
  draft: { label: "초안", color: "bg-warning" },
  scheduled: { label: "예약됨", color: "bg-secondary" },
};

export const RecentPosts = () => {
  return (
    <Card className="p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">최근 포스트</h3>
        <Button variant="ghost" size="sm">
          전체보기
        </Button>
      </div>

      <div className="space-y-4">
        {mockPosts.map((post) => (
          <div
            key={post.id}
            className="group flex items-center gap-4 rounded-lg border border-border p-4 transition-all hover:border-primary hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex-1 space-y-1">
              <h4 className="font-medium text-foreground group-hover:text-primary">
                {post.title}
              </h4>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{post.project}</span>
                <span>•</span>
                <span>{post.createdAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {post.status === "published" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{post.views.toLocaleString()}</span>
                </div>
              )}
              <Badge
                variant="secondary"
                className={`${statusConfig[post.status].color} text-white`}
              >
                {statusConfig[post.status].label}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
