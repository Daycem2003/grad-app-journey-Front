import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2, Send, FileText, CheckCircle2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { TablePageSkeleton } from "@/components/shared/PageSkeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mastersService, type Master } from "@/services/masters-service";
import { applicationsService, type ApplicationDTO } from "@/services/applications-service";
import { notificationsService } from "@/services/notifications-service";

export const Route = createFileRoute("/admin/listes")({
  head: () => ({
    meta: [
      { title: "Listes finales d'admission — MasterTN" },
      {
        name: "description",
        content: "Classement des candidats admis par Master, selon le score final calculé.",
      },
      { property: "og:title", content: "Listes finales d'admission — MasterTN" },
      { property: "og:description", content: "Consultez et exportez les listes d'admis." },
    ],
  }),
  pendingComponent: TablePageSkeleton,
  component: Listes,
});

function Listes() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [selectedMasterPubkey, setSelectedMasterPubkey] = useState<string>("");
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);

  // Modal Notifier les N premiers
  const [openModal, setOpenModal] = useState(false);
  const [nPremiers, setNPremiers] = useState<number>(10);
  const [joindreCSV, setJoindreCSV] = useState<boolean>(true);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadMasters() {
      setMastersLoading(true);
      try {
        const data = await mastersService.listMasters();
        if (!isCancelled) {
          setMasters(data);
          if (data.length > 0) {
            setSelectedMasterPubkey(data[0]?.pubkey || "");
          }
        }
      } finally {
        if (!isCancelled) {
          setMastersLoading(false);
        }
      }
    }

    void loadMasters();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedMasterPubkey) {
      setApplications([]);
      return;
    }

    let isCancelled = false;

    async function loadApplications() {
      setAppsLoading(true);
      try {
        const data = await applicationsService.listByMaster(selectedMasterPubkey);
        if (!isCancelled) {
          setApplications(data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          toast.error("Erreur lors du chargement des candidatures du Master.");
        }
      } finally {
        if (!isCancelled) {
          setAppsLoading(false);
        }
      }
    }

    void loadApplications();

    return () => {
      isCancelled = true;
    };
  }, [selectedMasterPubkey]);

  const master = masters.find((m) => m.pubkey === selectedMasterPubkey);
  const places = master?.nombre_places ?? (master as any)?.places ?? 0;

  useEffect(() => {
    if (places > 0) {
      setNPremiers(places);
    }
  }, [places]);

  // Candidats avec score ou admis
  const classement = [...applications].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const exporterCSV = () => {
    if (!master || classement.length === 0) {
      toast.error("Aucune donnée à exporter pour ce Master.");
      return;
    }

    const headers = ["Rang", "Nom", "Prenom", "CIN", "Email", "Score", "Decision"];
    const rows = classement.map((c, i) => {
      const admis = i < places;
      const nom = c.candidate_profile?.nom || "";
      const prenom = c.candidate_profile?.prenom || "";
      const cin = c.candidate_profile?.cin || "";
      const email = c.candidate_profile?.email || "";
      const score = c.score != null ? c.score.toFixed(2) : "0.00";
      const decision = admis ? "Principale" : "Liste d'attente";
      return [i + 1, nom, prenom, cin, email, score, decision].map((v) => `"${v}"`).join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `liste_admis_${master.nom.replace(/[\s/]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Liste exportée en CSV avec succès.");
  };

  const handleNotifyTopRanked = async () => {
    if (!master) return;
    if (nPremiers <= 0) {
      toast.error("Veuillez saisir un nombre valide de candidats à notifier.");
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("master_pubkey", master.pubkey);
      formData.append("n_premiers", nPremiers.toString());
      if (customFile) {
        formData.append("piece_jointe", customFile);
      } else if (joindreCSV) {
        formData.append("joindre_classement_csv", "true");
      }

      const res = await notificationsService.notifyTopRanked(formData);
      toast.success(
        `Notification envoyée avec succès aux ${res.notified_count} premiers candidats du Master ${res.master_nom}.`
      );
      setOpenModal(false);
      setCustomFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'envoi des notifications.";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  if (mastersLoading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Listes finales"
        subtitle="Classement des candidats par ordre de score décroissant."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={exporterCSV}
              disabled={classement.length === 0}
              className="gap-2"
            >
              <Download className="size-4" /> Exporter CSV
            </Button>
            <Button
              onClick={() => setOpenModal(true)}
              disabled={classement.length === 0}
              className="gap-2"
            >
              <Send className="size-4" /> Notifier les N premiers
            </Button>
          </div>
        }
      />

      <div className="mb-4 max-w-md">
        <Select value={selectedMasterPubkey} onValueChange={setSelectedMasterPubkey}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un Master" />
          </SelectTrigger>
          <SelectContent>
            {masters.map((m) => (
              <SelectItem key={m.pubkey} value={m.pubkey}>
                {m.nom} ({m.nombre_places ?? (m as any).places ?? 0} places)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="overflow-x-auto p-0">
          {appsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Chargement du classement…</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rang</TableHead>
                  <TableHead>Candidat</TableHead>
                  <TableHead>CIN</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Décision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classement.map((c, i) => {
                  const cand = c.candidate_profile;
                  const admis = i < places;
                  return (
                    <TableRow key={c.pubkey}>
                      <TableCell className="font-medium">{c.rang ?? i + 1}</TableCell>
                      <TableCell>
                        {cand ? `${cand.prenom} ${cand.nom}` : "Candidat"}
                        {cand?.email && (
                          <span className="block text-xs text-muted-foreground">{cand.email}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{cand?.cin || "—"}</TableCell>
                      <TableCell className="font-medium">
                        {c.score != null ? Number(c.score).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        <span
                          className={
                            admis
                              ? "inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {admis ? "Principale" : "Liste d'attente"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {classement.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      {masters.length === 0
                        ? "Aucun Master disponible."
                        : "Aucune candidature enregistrée pour ce Master."}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Notifier les N premiers */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5 text-primary" /> Notifier les N premiers candidats
            </DialogTitle>
            <DialogDescription>
              Envoi automatique d'une convocation personnalisée aux candidats les mieux classés pour le Master{" "}
              <strong>{master?.nom}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="nPremiers">Nombre de candidats à notifier (N)</Label>
              <Input
                id="nPremiers"
                type="number"
                min={1}
                max={classement.length || 100}
                value={nPremiers}
                onChange={(e) => setNPremiers(parseInt(e.target.value, 10) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Sur un total de {classement.length} candidature(s) pour ce Master ({places} places prévues).
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1.5">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" /> Modèle du message généré par candidat :
              </p>
              <p className="font-mono text-muted-foreground">
                <strong>Objet :</strong> Appel au dépôt du dossier de candidature à l'administration de l'institut
              </p>
              <p className="font-mono text-muted-foreground">
                <strong>Corps :</strong> "Salut &#123;prenom&#125; &#123;nom&#125;, vous avez été sélectionné(e) pour la présélection finale pour le Master {master?.nom}. Veuillez respecter les délais."
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-semibold">Pièce jointe (Stockée sur R2)</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="joindreCSV"
                  checked={joindreCSV && !customFile}
                  disabled={Boolean(customFile)}
                  onCheckedChange={(checked) => setJoindreCSV(Boolean(checked))}
                />
                <label
                  htmlFor="joindreCSV"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Générer et attacher automatiquement la liste de classement (CSV)
                </label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customFile" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Paperclip className="size-3.5" /> Ou téléverser un fichier personnalisé (PDF, CSV, etc.) :
                </Label>
                <Input
                  id="customFile"
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setCustomFile(f);
                    if (f) setJoindreCSV(false);
                  }}
                />
                {customFile && (
                  <p className="text-xs text-primary font-medium">
                    Fichier sélectionné : {customFile.name} ({(customFile.size / 1024).toFixed(1)} Ko)
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpenModal(false)} disabled={isSending}>
              Annuler
            </Button>
            <Button onClick={handleNotifyTopRanked} disabled={isSending} className="gap-2">
              {isSending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Envoi en cours…
                </>
              ) : (
                <>
                  <Send className="size-4" /> Notifier les {nPremiers} premiers
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
