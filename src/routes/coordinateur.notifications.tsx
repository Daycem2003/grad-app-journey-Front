import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Loader2, Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  notificationsService,
  type InAppNotification,
} from "@/services/notifications-service";

export const Route = createFileRoute("/coordinateur/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Espace coordinateur | MasterTN" },
      { name: "description", content: "Historique des notifications envoyées et reçues." },
      { property: "og:title", content: "Notifications coordinateur — MasterTN" },
      { property: "og:description", content: "Messages échangés avec les candidats." },
    ],
  }),
  component: NotifsCoordinateur,
});

function NotifsCoordinateur() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadNotifications() {
      setLoading(true);
      try {
        const data = await notificationsService.getMyNotifications();
        if (!isCancelled) {
          setNotifications(data);
        }
      } catch {
        if (!isCancelled) {
          setNotifications([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={loading ? "Chargement…" : `${notifications.length} message(s).`}
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement des notifications…</span>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-border/70 shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-foreground">Aucune notification</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Vous n'avez reçu aucune notification pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.pubkey} className="border-border/70 shadow-none">
              <CardContent className="flex gap-4 p-5">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-md ${
                    n.is_read ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  <Bell className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{n.objet}</p>
                    {!n.is_read && (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {n.corps}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {n.envoyee_le
                      ? new Date(n.envoyee_le).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

