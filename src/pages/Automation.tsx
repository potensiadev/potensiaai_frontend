import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Zap, Settings, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Automation = () => {
  const [autoPublish, setAutoPublish] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const { toast } = useToast();

  const handleSaveAutomation = () => {
    toast({
      title: "자동화 설정 저장됨",
      description: "자동화 설정이 성공적으로 저장되었습니다.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">자동화</h1>
          <p className="mt-2 text-muted-foreground">
            콘텐츠 생성 및 게시를 자동화하세요
          </p>
        </div>

        <Tabs defaultValue="publishing" className="space-y-4">
          <TabsList>
            <TabsTrigger value="publishing">자동 게시</TabsTrigger>
            <TabsTrigger value="schedule">스케줄링</TabsTrigger>
            <TabsTrigger value="workflows">워크플로우</TabsTrigger>
          </TabsList>

          {/* Auto Publishing */}
          <TabsContent value="publishing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>자동 게시 설정</CardTitle>
                <CardDescription>
                  AI로 생성된 콘텐츠를 자동으로 워드프레스에 게시합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-publish">자동 게시 활성화</Label>
                    <p className="text-sm text-muted-foreground">
                      생성된 콘텐츠를 즉시 워드프레스에 게시
                    </p>
                  </div>
                  <Switch
                    id="auto-publish"
                    checked={autoPublish}
                    onCheckedChange={setAutoPublish}
                  />
                </div>

                {autoPublish && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="post-status">게시 상태</Label>
                      <Select defaultValue="draft">
                        <SelectTrigger id="post-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">임시저장</SelectItem>
                          <SelectItem value="publish">즉시 게시</SelectItem>
                          <SelectItem value="pending">검토 대기</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">기본 카테고리</Label>
                      <Select defaultValue="uncategorized">
                        <SelectTrigger id="category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uncategorized">미분류</SelectItem>
                          <SelectItem value="ai">AI</SelectItem>
                          <SelectItem value="tech">기술</SelectItem>
                          <SelectItem value="business">비즈니스</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <Button onClick={handleSaveAutomation} className="w-full">
                  설정 저장
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduling */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>스케줄링 설정</CardTitle>
                <CardDescription>
                  콘텐츠 생성 및 게시 일정을 설정합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="schedule-enabled">스케줄 활성화</Label>
                    <p className="text-sm text-muted-foreground">
                      정해진 시간에 자동으로 콘텐츠 생성 및 게시
                    </p>
                  </div>
                  <Switch
                    id="schedule-enabled"
                    checked={scheduleEnabled}
                    onCheckedChange={setScheduleEnabled}
                  />
                </div>

                {scheduleEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="frequency">빈도</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger id="frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">매일</SelectItem>
                            <SelectItem value="weekly">주간</SelectItem>
                            <SelectItem value="monthly">월간</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">시간</Label>
                        <Input id="time" type="time" defaultValue="09:00" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="posts-per-day">하루 게시물 수</Label>
                      <Input
                        id="posts-per-day"
                        type="number"
                        min="1"
                        max="10"
                        defaultValue="2"
                      />
                    </div>
                  </div>
                )}

                <Button onClick={handleSaveAutomation} className="w-full">
                  스케줄 저장
                </Button>
              </CardContent>
            </Card>

            {/* Scheduled Posts */}
            <Card>
              <CardHeader>
                <CardTitle>예약된 게시물</CardTitle>
                <CardDescription>예정된 콘텐츠 생성 및 게시 일정</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">키워드 기반 콘텐츠 생성</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(Date.now() + item * 86400000).toLocaleDateString('ko-KR')} 09:00
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows */}
          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>자동화 워크플로우</CardTitle>
                <CardDescription>
                  콘텐츠 생성부터 게시까지의 전체 프로세스를 자동화합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "AI 콘텐츠 생성 파이프라인",
                      description: "키워드 분석 → 콘텐츠 생성 → 썸네일 생성 → 게시",
                      active: true,
                    },
                    {
                      name: "SEO 최적화 워크플로우",
                      description: "키워드 분석 → 제목 최적화 → 콘텐츠 검증 → 게시",
                      active: false,
                    },
                    {
                      name: "일괄 게시 워크플로우",
                      description: "여러 키워드 → 일괄 콘텐츠 생성 → 스케줄 게시",
                      active: false,
                    },
                  ].map((workflow) => (
                    <div
                      key={workflow.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {workflow.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={workflow.active} />
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Automation;
