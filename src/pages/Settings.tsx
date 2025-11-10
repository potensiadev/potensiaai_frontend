import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordPressSettings } from "@/components/settings/WordPressSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { PasswordSettings } from "@/components/settings/PasswordSettings";

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">설정</h1>
          <p className="text-muted-foreground mt-2">
            프로필, 워드프레스 연동 및 기타 설정을 관리합니다
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">프로필</TabsTrigger>
                <TabsTrigger value="password">비밀번호</TabsTrigger>
                <TabsTrigger value="wordpress">워드프레스</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">프로필 설정</h3>
                  <p className="text-sm text-muted-foreground">
                    프로필 정보를 수정합니다
                  </p>
                </div>
                <ProfileSettings />
              </TabsContent>

              <TabsContent value="password" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">비밀번호 변경</h3>
                  <p className="text-sm text-muted-foreground">
                    계정 비밀번호를 변경합니다
                  </p>
                </div>
                <PasswordSettings />
              </TabsContent>

              <TabsContent value="wordpress" className="space-y-4 mt-6">
                <WordPressSettings />
              </TabsContent>

              <TabsContent value="api" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">API 설정</h3>
                  <p className="text-sm text-muted-foreground">
                    외부 API 키 및 인증 정보를 관리합니다
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  곧 추가될 예정입니다
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
