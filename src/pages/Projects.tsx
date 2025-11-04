import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, MoreVertical, FileText, TrendingUp } from "lucide-react";

const mockProjects = [
  {
    id: "1",
    name: "마케팅 블로그",
    description: "디지털 마케팅 전략 및 팁",
    posts: 45,
    views: 12500,
    status: "active",
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "테크 블로그",
    description: "최신 기술 트렌드와 개발 가이드",
    posts: 32,
    views: 8900,
    status: "active",
    color: "bg-purple-500",
  },
  {
    id: "3",
    name: "SEO 가이드",
    description: "검색 최적화 완벽 가이드",
    posts: 28,
    views: 15300,
    status: "active",
    color: "bg-green-500",
  },
  {
    id: "4",
    name: "AI 트렌드",
    description: "인공지능 최신 소식",
    posts: 18,
    views: 5600,
    status: "draft",
    color: "bg-orange-500",
  },
];

const Projects = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">프로젝트</h1>
            <p className="mt-2 text-muted-foreground">
              블로그별로 콘텐츠를 관리하세요
            </p>
          </div>
          <Button size="lg" className="bg-gradient-primary shadow-glow">
            <Plus className="mr-2 h-5 w-5" />새 프로젝트
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockProjects.map((project) => (
            <Card
              key={project.id}
              className="group relative overflow-hidden p-6 shadow-md transition-all hover:shadow-lg"
            >
              <div className="absolute right-4 top-4">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${project.color} shadow-md`}
                >
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <Badge
                  variant={project.status === "active" ? "default" : "secondary"}
                  className={
                    project.status === "active"
                      ? "bg-success text-white"
                      : "bg-warning"
                  }
                >
                  {project.status === "active" ? "활성" : "초안"}
                </Badge>
              </div>

              <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary">
                {project.name}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {project.description}
              </p>

              <div className="flex items-center gap-6 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{project.posts}</span>
                  <span className="text-muted-foreground">포스트</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {(project.views / 1000).toFixed(1)}K
                  </span>
                  <span className="text-muted-foreground">조회</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full group-hover:bg-primary group-hover:text-white"
              >
                프로젝트 열기
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
