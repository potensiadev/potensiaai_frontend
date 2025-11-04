import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentPosts } from "@/components/dashboard/RecentPosts";
import { FileText, TrendingUp, Zap, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              안녕하세요! 👋
            </h1>
            <p className="mt-2 text-muted-foreground">
              오늘도 멋진 콘텐츠를 만들어볼까요?
            </p>
          </div>
          <Button size="lg" className="bg-gradient-primary shadow-glow">
            <Zap className="mr-2 h-5 w-5" />새 글 작성
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="총 포스트"
            value={124}
            change="+12 이번달"
            changeType="positive"
            icon={FileText}
            iconColor="bg-gradient-primary"
          />
          <StatCard
            title="총 조회수"
            value="45.2K"
            change="+18.2% 저번달 대비"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-gradient-secondary"
          />
          <StatCard
            title="생성된 글"
            value={38}
            change="이번달"
            changeType="neutral"
            icon={Zap}
            iconColor="bg-gradient-primary"
          />
          <StatCard
            title="예상 수익"
            value="₩342K"
            change="+24.5%"
            changeType="positive"
            icon={DollarSign}
            iconColor="bg-gradient-secondary"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentPosts />
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                빠른 실행
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  AI 글쓰기
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  키워드 분석
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="mr-2 h-4 w-4" />
                  썸네일 생성
                </Button>
              </div>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card className="p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                주간 성과
              </h3>
              <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  차트가 여기 표시됩니다
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
