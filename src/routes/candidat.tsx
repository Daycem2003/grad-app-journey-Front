import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  Bell,
  BotMessageSquare,
  FileStack,
  LayoutDashboard,
  Library,
  UserRound,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SpaceLayout, type NavItem } from "@/components/layout/SpaceLayout";

export const Route = createFileRoute("/candidat")({
  component: CandidatLayout,
});

const ITEMS: NavItem[] = [
  { to: "/candidat", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/candidat/profil", label: "Mon profil", icon: UserRound },
  { to: "/masters", label: "Masters disponibles", icon: Library },
  { to: "/candidat/candidatures", label: "Mes candidatures", icon: FileStack },
  { to: "/candidat/notifications", label: "Notifications", icon: Bell },
  { to: "/assistant", label: "Assistant IA", icon: BotMessageSquare },
];

function CandidatLayout() {
  return (
    <ProtectedRoute requiredRole="CANDIDATE">
      <SpaceLayout espace="Espace Candidat" items={ITEMS}>
        <Outlet />
      </SpaceLayout>
    </ProtectedRoute>
  );
}
