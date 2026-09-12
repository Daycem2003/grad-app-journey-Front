import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BarChart3, Bell, LayoutDashboard, ListChecks, Users } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SpaceLayout, type NavItem } from "@/components/layout/SpaceLayout";

export const Route = createFileRoute("/admin")({ component: Layout });

const ITEMS: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/statistiques", label: "Statistiques", icon: BarChart3 },
  { to: "/admin/listes", label: "Listes finales", icon: ListChecks },
  { to: "/admin/candidats", label: "Candidats", icon: Users },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
];

function Layout() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <SpaceLayout espace="Espace Administrateur" items={ITEMS}>
        <Outlet />
      </SpaceLayout>
    </ProtectedRoute>
  );
}
