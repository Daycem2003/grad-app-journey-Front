import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Loader2, Send, Inbox, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationsSkeleton } from "@/components/shared/PageSkeletons";
import {
  notificationsService,
  type BroadcastNotificationDTO,
} from "@/services/notifications-service";
import { useWebSocketNotifications } from "@/hooks/useWebSocketNotifications";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications administrateur — MasterTN" },
      {
        name: "description",
        content: "Diffusez des annonces aux candidats et aux coordinateurs de la plateforme.",
      },
      { property: "og:title", content: "Notifications administrateur — MasterTN" },
      { property: "og:description", content: "Envoyez et consultez les annonces de la campagne." },
    ],
  }),
  pendingComponent: NotificationsSkeleton,
  component: NotificationsAdmin,
});

type TargetOption = "TOUS" | "COORDINATEURS" | "CANDIDATS";

const TARGET_LABELS: Record<TargetOption, string> = {
  TOUS: "Tous (Coordinateurs et Candidats)",
  COORDINATEURS: "Coordinateurs uniquement",
  CANDIDATS: "Candidats uniquement",
};

function NotificationsAdmin() {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [cible, setCible] = useState<TargetOption>("TOUS");
  const [objet, setObjet] = useState("");
  const [message, setMessage] = useState("");

  const loadHistory = async () => {
    try {
      const data = await notificationsService.listBroadcasts();
      setBroadcasts(data);
    } catch {
      // Échec silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  // Écoute WebSocket temps réel
  useWebSocketNotifications((event) => {
    if (event.event === "notification:broadcast") {
      const p = event.payload;
      setBroadcasts((prev) => {
        if (prev.some((b) => b.pubkey === p.pubkey)) return prev;
        return [
          {
            pubkey: p.pubkey || `bcast_${Date.now()}`,
            cible: p.cible || "TOUS",
            objet: p.objet,
            message: p.message || p.corps || "",
            envoyee_le: p.envoyee_le || new Date().toISOString(),
            created_at: p.envoyee_le || new Date().toISOString(),
          },
          ...prev,
        ];
      });
    }
  });

  const envoyer = async () => {
    if (!objet.trim()) {
      toast.error("Veuillez renseigner un objet pour l'annonce.");
      return;
    }
    if (!message.trim()) {
      toast.error("Veuillez renseigner le message de l'annonce.");
      return;
    }

    setIsSending(true);
    try {
      const created = await notificationsService.broadcastNotification({
        cible,
        objet: objet.trim(),
        message: message.trim(),
      });
      setBroadcasts((prev) => [created, ...prev]);
      setObjet("");
      setMessage("");
      toast.success("Annonce diffusée avec succès en temps réel.");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Échec de la diffusion de l'annonce.";
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Diffusion d'annonces"
        subtitle="Diffusez des annonces ciblées en temps réel sur la plateforme."
      />

      <Card className="mb-8 border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Nouvelle annonce</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cible">Destinataires cibles</Label>
            <Select value={cible} onValueChange={(v) => setCible(v as TargetOption)}>
              <SelectTrigger id="cible">
                <SelectValue placeholder="Choisir la cible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOUS">{TARGET_LABELS.TOUS}</SelectItem>
                <SelectItem value="COORDINATEURS">{TARGET_LABELS.COORDINATEURS}</SelectItem>
                <SelectItem value="CANDIDATS">{TARGET_LABELS.CANDIDATS}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objet">Objet</Label>
            <Input
              id="objet"
              value={objet}
              onChange={(e) => setObjet(e.target.value)}
              placeholder="ex : Rappel — Date limite de dépôt des dossiers"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="msg">Message</Label>
            <Textarea
              id="msg"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Rédigez le texte de votre annonce…"
            />
          </div>

          <Button onClick={envoyer} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Envoi en cours…
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" /> Diffuser l'annonce
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Historique des annonces diffusées ({broadcasts.length})
        </h3>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Chargement de l'historique…</span>
          </div>
        ) : broadcasts.length === 0 ? (
          <Card className="border-border/70 shadow-none">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Aucune annonce diffusée pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <Card key={b.pubkey} className="border-border/70 shadow-none">
                <CardContent className="flex gap-4 p-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                    <Bell className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{b.objet}</p>
                      <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        <Users className="size-3" />
                        {TARGET_LABELS[b.cible as TargetOption] || b.cible}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                      {b.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Diffusé le{" "}
                      {b.envoyee_le
                        ? new Date(b.envoyee_le).toLocaleDateString("fr-FR", {
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
    </div>
  );
}

