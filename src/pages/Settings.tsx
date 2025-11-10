import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WordPressSettings } from "@/components/settings/WordPressSettings";

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">설정</h1>
          <p className="text-muted-foreground mt-2">
            워드프레스 연동 및 기타 설정을 관리합니다
          </p>
        </div>

        <Tabs defaultValue="wordpress" className="w-full">
          <TabsList>
            <TabsTrigger value="wordpress">워드프레스</TabsTrigger>
            <TabsTrigger value="general">일반</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="wordpress" className="space-y-4">
            <WordPressSettings />
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>일반 설정</CardTitle>
                <CardDescription>
                  애플리케이션 기본 설정을 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  곧 추가될 예정입니다
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API 설정</CardTitle>
                <CardDescription>
                  외부 API 키 및 인증 정보를 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  곧 추가될 예정입니다
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
