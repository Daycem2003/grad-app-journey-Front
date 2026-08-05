import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/candidat/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Espace candidat | MasterTN" },
      { name: "description", content: "Messages reçus des coordinateurs et de l'administration." },
      { property: "og:title", content: "Notifications — MasterTN" },
      { property: "og:description", content: "Suivez les messages liés à vos candidatures." },
    ],
  }),
  component: NotificationsCandidat,
});

function NotificationsCandidat() {
  const { notifications } = useStore();
  const miennes = notifications.filter((n) => n.destinataire !== "Coordinateur");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" subtitle={`${miennes.length} message(s).`} />
      <div className="space-y-3">
        {miennes.map((n) => (
          <Card key={n.id} className="border-border/70 shadow-none">
            <CardContent className="flex gap-4 p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary">
                <Bell className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="font-medium">{n.objet}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(n.date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
