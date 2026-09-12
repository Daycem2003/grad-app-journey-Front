import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "CANDIDATE" | "COORDINATOR" | "ADMIN" | "candidat" | "coordinateur" | "admin";
}

function normalizeRole(r?: string | null): string {
  if (!r) return "";
  const upper = String(r).trim().toUpperCase();
  if (upper === "CANDIDAT" || upper === "CANDIDATE") return "CANDIDATE";
  if (upper === "COORDINATEUR" || upper === "COORDINATOR") return "COORDINATOR";
  if (upper === "ADMIN" || upper === "ADMINISTRATEUR") return "ADMIN";
  return upper;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const navigate = useNavigate();

  const userRoleNormalized = normalizeRole(role);
  const requiredRoleNormalized = requiredRole ? normalizeRole(requiredRole) : null;
  const isRoleMatching = !requiredRoleNormalized || userRoleNormalized === requiredRoleNormalized;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate({ to: "/login" });
        return;
      }

      if (!isRoleMatching) {
        if (userRoleNormalized === "CANDIDATE") {
          navigate({ to: "/candidat" });
        } else if (userRoleNormalized === "COORDINATOR") {
          navigate({ to: "/coordinateur/appels" });
        } else if (userRoleNormalized === "ADMIN") {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/" });
        }
      }
    }
  }, [isAuthenticated, isLoading, isRoleMatching, userRoleNormalized, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isRoleMatching) {
    return null;
  }

  return <>{children}</>;
}
