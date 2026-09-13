import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Loader2, Send, Inbox, Users, Paperclip, Download } from "lucide-react";
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
import { mastersService, type Master } from "@/services/masters-service";
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

type TargetOption = "TOUS" | "COORDINATEURS" | "CANDIDATS" | "MASTER_RANG";

const TARGET_LABELS: Record<TargetOption, string> = {
  TOUS: "Tous (Coordinateurs et Candidats)",
  COORDINATEURS: "Coordinateurs uniquement",
  CANDIDATS: "Candidats uniquement",
  MASTER_RANG: "Par rang sur un Master spécifique",
};

function NotificationsAdmin() {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotificationDTO[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [cible, setCible] = useState<TargetOption>("TOUS");
  const [selectedMaster, setSelectedMaster] = useState<string>("");
  const [nPremiers, setNPremiers] = useState<number>(10);
  const [objet, setObjet] = useState("");
  const [message, setMessage] = useState("");
  const [pieceJointe, setPieceJointe] = useState<File | null>(null);

  const loadData = async () => {
    try {
      const [bData, mData] = await Promise.all([
        notificationsService.listBroadcasts(),
        mastersService.listMasters().catch(() => []),
      ]);
      setBroadcasts(bData);
      setMasters(mData);
      if (mData.length > 0) {
        setSelectedMaster(mData[0]?.pubkey || "");
      }
    } catch {
      // Échec silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    const interval = window.setInterval(async () => {
      try {
        const bData = await notificationsService.listBroadcasts();
        setBroadcasts(bData);
      } catch {
        // Silencieux
      }
    }, 4000);
    return () => window.clearInterval(interval);
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
            piece_jointe_nom: p.piece_jointe_nom || null,
            envoyee_le: p.envoyee_le || new Date().toISOString(),
            created_at: p.envoyee_le || new Date().toISOString(),
          },
          ...prev,
        ];
      });
    }
  });

  const envoyer = async () => {
    if (cible === "MASTER_RANG") {
      if (!selectedMaster) {
        toast.error("Veuillez sélectionner un Master.");
        return;
      }
      if (nPremiers <= 0) {
        toast.error("Veuillez saisir un nombre valide de candidats à notifier.");
        return;
      }

      setIsSending(true);
      try {
        const formData = new FormData();
        formData.append("master_pubkey", selectedMaster);
        formData.append("n_premiers", nPremiers.toString());
        if (objet.trim()) formData.append("objet", objet.trim());
        if (pieceJointe) formData.append("piece_jointe", pieceJointe);

        const res = await notificationsService.notifyTopRanked(formData);
        toast.success(
          `Notification envoyée avec succès aux ${res.notified_count} premiers candidats du Master ${res.master_nom}.`
        );
        setBroadcasts((prev) => [res.broadcast, ...prev]);
        setObjet("");
        setMessage("");
        setPieceJointe(null);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Échec de l'envoi de la notification ciblée.";
        toast.error(errorMsg);
      } finally {
        setIsSending(false);
      }
      return;
    }

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
      const formData = new FormData();
      formData.append("cible", cible);
      formData.append("objet", objet.trim());
      formData.append("message", message.trim());
      if (pieceJointe) formData.append("piece_jointe", pieceJointe);

      const created = await notificationsService.broadcastNotification(formData);
      setBroadcasts((prev) => [created, ...prev]);
      setObjet("");
      setMessage("");
      setPieceJointe(null);
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
        subtitle="Diffusez des annonces ciblées ou par rang de Master en temps réel sur la plateforme."
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
                <SelectItem value="MASTER_RANG">{TARGET_LABELS.MASTER_RANG}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cible === "MASTER_RANG" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
              <div className="space-y-1.5">
                <Label htmlFor="selMaster">Master concerné</Label>
                <Select value={selectedMaster} onValueChange={setSelectedMaster}>
                  <SelectTrigger id="selMaster">
                    <SelectValue placeholder="Choisir le Master" />
                  </SelectTrigger>
                  <SelectContent>
                    {masters.map((m) => (
                      <SelectItem key={m.pubkey} value={m.pubkey}>
                        {m.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nRank">Nombre de candidats (N)</Label>
                <Input
                  id="nRank"
                  type="number"
                  min={1}
                  value={nPremiers}
                  onChange={(e) => setNPremiers(parseInt(e.target.value, 10) || 1)}
                />
              </div>

              <p className="col-span-full text-xs text-muted-foreground">
                Chaque candidat sélectionné recevra automatiquement un message personnalisé avec son prénom, nom et le nom du Master.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="objet">Objet</Label>
            <Input
              id="objet"
              value={objet}
              onChange={(e) => setObjet(e.target.value)}
              placeholder={
                cible === "MASTER_RANG"
                  ? "Appel au dépôt du dossier de candidature à l'administration de l'institut"
                  : "ex : Rappel — Date limite de dépôt des dossiers"
              }
            />
          </div>

          {cible !== "MASTER_RANG" && (
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
          )}

          <div className="space-y-2">
            <Label htmlFor="attachment" className="flex items-center gap-1.5">
              <Paperclip className="size-3.5 text-muted-foreground" /> Pièce jointe optionnelle (Stockée sur R2)
            </Label>
            <Input
              id="attachment"
              type="file"
              onChange={(e) => setPieceJointe(e.target.files?.[0] || null)}
            />
            {pieceJointe && (
              <p className="text-xs font-medium text-primary">
                Fichier sélectionné : {pieceJointe.name} ({(pieceJointe.size / 1024).toFixed(1)} Ko)
              </p>
            )}
          </div>

          <Button onClick={envoyer} disabled={isSending} className="gap-2">
            {isSending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Envoi en cours…
              </>
            ) : (
              <>
                <Send className="size-4" /> Diffuser l'annonce
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
                        {b.cible === "MASTER_RANG"
                          ? `Par rang (Top ${b.rang_max || 0}${b.master_nom ? ` - ${b.master_nom}` : ""})`
                          : TARGET_LABELS[b.cible as TargetOption] || b.cible}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                      {b.message}
                    </p>

                    {b.piece_jointe_nom && (
                      <div className="mt-2.5">
                        {b.piece_jointe_url ? (
                          <a
                            href={b.piece_jointe_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={b.piece_jointe_nom}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-primary hover:bg-accent transition-colors"
                          >
                            <Download className="size-3.5" />
                            {b.piece_jointe_nom}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                            <Paperclip className="size-3.5" /> {b.piece_jointe_nom}
                          </span>
                        )}
                      </div>
                    )}

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
