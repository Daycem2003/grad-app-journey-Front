import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, ClipboardList, FileSearch, Layers, LayoutDashboard, Megaphone } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SpaceLayout, type NavItem } from "@/components/layout/SpaceLayout";

export const Route = createFileRoute("/coordinateur")({ component: Layout });

const ITEMS: NavItem[] = [
  { to: "/coordinateur", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/coordinateur/masters", label: "Mes Masters", icon: Layers },
  { to: "/coordinateur/appels", label: "Appels à candidature", icon: Megaphone },
  { to: "/coordinateur/candidatures", label: "Candidatures", icon: ClipboardList },
  { to: "/coordinateur/revision", label: "Candidatures à réviser", icon: FileSearch },
  { to: "/coordinateur/notifications", label: "Notifications", icon: Bell },
];

function Layout() {
  return (
    <ProtectedRoute requiredRole="COORDINATOR">
      <SpaceLayout espace="Espace Coordinateur" items={ITEMS}>
        <Outlet />
      </SpaceLayout>
    </ProtectedRoute>
  );
}
