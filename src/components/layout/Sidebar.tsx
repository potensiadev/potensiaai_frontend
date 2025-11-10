import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Search, 
  Image, 
  BarChart3,
  Zap,
  Settings,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI 글쓰기", href: "/write", icon: Sparkles },
  { name: "포스트 관리", href: "/projects", icon: FileText },
  { name: "키워드 리서치", href: "/keywords", icon: Search },
  { name: "썸네일 생성", href: "/thumbnails", icon: Image },
  { name: "분석", href: "/analytics", icon: BarChart3 },
  { name: "자동화", href: "/automation", icon: Zap },
  { name: "설정", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">PotensiaAI</h1>
            <p className="text-xs text-muted-foreground">Blog Automation</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Credit Info */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-gradient-primary p-4 text-white shadow-md">
            <p className="text-xs font-medium opacity-90">남은 크레딧</p>
            <p className="mt-1 text-2xl font-bold">2,450</p>
            <button className="mt-3 w-full rounded-md bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-all hover:bg-white/30">
              크레딧 충전
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
