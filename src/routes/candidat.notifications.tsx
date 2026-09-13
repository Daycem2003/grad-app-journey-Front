import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, FileEdit, Info, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useNotifications } from "@/lib/notification-context";

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
  const { notifications, refreshNotifications, isConnected } = useNotifications();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);


  if (loading) {
    return (
      <div className="mx-auto flex h-48 max-w-3xl items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Chargement des notifications…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader title="Notifications" subtitle={`${notifications.length} message(s) reçu(s).`} />
      
      {notifications.length === 0 ? (
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Vous n'avez aucune notification pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isRevision = n.motif === "DOCUMENT_MANQUANT" || n.objet?.toLowerCase().includes("révision");
            return (
              <Card
                key={n.pubkey}
                className={`border-border/70 shadow-none ${
                  isRevision ? "border-amber-500/40 bg-amber-500/5" : ""
                }`}
              >
                <CardContent className="flex gap-4 p-5">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-md ${
                      isRevision
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        : "bg-secondary text-primary"
                    }`}
                  >
                    {isRevision ? <FileEdit className="size-4" /> : <Bell className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{n.objet}</p>
                      {n.envoyee_le ? (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(n.envoyee_le).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                      {n.corps}
                    </p>
                    {n.document_concerne ? (
                      <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                        Document concerné : {n.document_concerne}
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
