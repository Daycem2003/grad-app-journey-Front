import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NotificationsSkeleton } from "@/components/shared/PageSkeletons";
import { useStore } from "@/lib/app-store";

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

function NotificationsAdmin() {
  const { notifications, envoyerNotification } = useStore();
  const [destinataire, setDestinataire] = useState("Tous les candidats");
  const [objet, setObjet] = useState("");
  const [message, setMessage] = useState("");

  const envoyer = () => {
    if (!objet.trim() || !message.trim()) {
      toast.error("Renseignez un objet et un message.");
      return;
    }
    envoyerNotification({ destinataire, objet, message });
    setObjet("");
    setMessage("");
    toast.success("Annonce diffusée.");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" subtitle="Diffusion des annonces de la campagne." />

      <Card className="mb-8 border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Nouvelle annonce</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dest">Destinataire</Label>
            <Input
              id="dest"
              value={destinataire}
              onChange={(e) => setDestinataire(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objet">Objet</Label>
            <Input id="objet" value={objet} onChange={(e) => setObjet(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg">Message</Label>
            <Textarea
              id="msg"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button onClick={envoyer}>
            <Send className="size-4" /> Diffuser
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className="border-border/70 shadow-none">
            <CardContent className="flex gap-4 p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary">
                <Bell className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="font-medium">{n.objet}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {n.message}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {n.destinataire} · {new Date(n.date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
