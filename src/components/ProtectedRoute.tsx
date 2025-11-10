import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [needsPasswordReset, setNeedsPasswordReset] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        // Check if user needs password reset
        const { data: profile } = await supabase
          .from("profiles")
          .select("needs_password_reset")
          .eq("id", user.id)
          .single();

        setNeedsPasswordReset(profile?.needs_password_reset || false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("needs_password_reset")
          .eq("id", session.user.id)
          .single();

        setNeedsPasswordReset(profile?.needs_password_reset || false);
      } else {
        setNeedsPasswordReset(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth?from=${location.pathname}`} replace />;
  }

  // Redirect to password reset page if needed (except if already on that page)
  if (needsPasswordReset && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  return <>{children}</>;
};
