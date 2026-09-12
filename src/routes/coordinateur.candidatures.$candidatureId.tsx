import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileEdit,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type CandidateDetailDTO,
  type DocumentVersionDTO,
  coordinatorService,
} from "@/services/coordinator-service";

export const Route = createFileRoute(
  "/coordinateur/candidatures/$candidatureId"
)({
  head: () => ({
    meta: [
      { title: "Dossier de candidature — Espace coordinateur | MasterTN" },
      {
        name: "description",
        content: "Détail du profil candidat, parcours académique, pièces justificatives et cycle de décision.",
      },
      { property: "og:title", content: "Dossier de candidature — MasterTN" },
      {
        property: "og:description",
        content: "Consultation et évaluation complète du dossier candidat.",
      },
    ],
  }),
  component: DetailCandidature,
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getSlotTypeLabel(slotType: string, anneeLicence?: string, redoublementAnnee?: string): string {
  switch (slotType) {
    case "RELEVE_LICENCE":
      return `Relevé de notes Licence (${anneeLicence || "Année"})`;
    case "DIPLOME_LICENCE":
      return "Diplôme de Licence";
    case "RELEVE_M1":
      return "Relevé de notes Master 1";
    case "JUSTIFICATIF_REDOUBLEMENT":
      return `Justificatif redoublement (${redoublementAnnee || ""})`;
    case "AUTRE":
      return "Autre document";
    default:
      return slotType;
  }
}

function DetailCandidature() {
  const { candidatureId } = useParams({
    from: "/coordinateur/candidatures/$candidatureId",
  });

  const [profile, setProfile] = useState<CandidateDetailDTO | null>(null);
  const [documents, setDocuments] = useState<DocumentVersionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [rejectMotif, setRejectMotif] = useState("");
  const [revisionMessage, setRevisionMessage] = useState("");
  const [selectedRevisionDocs, setSelectedRevisionDocs] = useState<string[]>([]);

  const toggleDocSelection = (key: string) => {
    setSelectedRevisionDocs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllDocs = () => {
    setSelectedRevisionDocs(documents.map((d) => d.slot_pubkey || d.pubkey));
  };

  const deselectAllDocs = () => {
    setSelectedRevisionDocs([]);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profData, docsData] = await Promise.all([
        coordinatorService.getCandidateProfile(candidatureId),
        coordinatorService.getCandidateDocuments(candidatureId),
      ]);
      setProfile(profData);
      setDocuments(docsData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du chargement du dossier.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [candidatureId]);

  const handleApprove = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const res = await coordinatorService.approveCandidature(profile.pubkey);
      setProfile(res.profile);
      setIsApproveOpen(false);
      toast.success(res.message || "Candidature approuvée avec succès !");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Échec de l'approbation de la candidature."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const res = await coordinatorService.rejectCandidature(profile.pubkey, rejectMotif || undefined);
      setProfile(res.profile);
      setIsRejectOpen(false);
      setRejectMotif("");
      toast.success(res.message || "Candidature rejetée.");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Échec du rejet de la candidature."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!profile) return;
    const cleanMsg = revisionMessage.trim();
    if (!cleanMsg && selectedRevisionDocs.length === 0) {
      toast.error("Veuillez saisir un message explicatif ou sélectionner au moins un document à redéposer.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await coordinatorService.requestRevision(profile.pubkey, {
        message: cleanMsg,
        documents_a_redeposer: selectedRevisionDocs,
      });
      setProfile(res.profile);
      setIsRevisionOpen(false);
      setRevisionMessage("");
      setSelectedRevisionDocs([]);
      toast.success(res.message || "Demande de révision envoyée.");
      // Recharger les documents pour rafraîchir leur statut
      const docsData = await coordinatorService.getCandidateDocuments(candidatureId);
      setDocuments(docsData);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Échec de l'envoi de la demande de révision."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex h-64 max-w-4xl items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Chargement du dossier candidat…</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/coordinateur/candidatures">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux candidatures
          </Link>
        </Button>
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="flex items-center gap-3 p-6 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error || "Candidature introuvable."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/coordinateur/candidatures">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`${profile.prenom} ${profile.nom}`}
        subtitle={`CIN : ${profile.cin} • Candidature soumise le ${
          profile.created_at
            ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "—"
        }`}
        action={<StatusBadge statut={profile.statut} />}
      />

      {/* Barre d'actions du coordinateur (Décision) */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Cycle de décision du coordinateur
              </CardTitle>
              <CardDescription className="text-xs">
                Statut actuel : <StatusBadge statut={profile.statut} className="ml-1" />
              </CardDescription>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0">
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                onClick={() => setIsApproveOpen(true)}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Approuver
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 font-medium"
                onClick={() => setIsRevisionOpen(true)}
              >
                <FileEdit className="mr-1.5 h-4 w-4" />
                Demander révision
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="font-medium shadow-sm"
                onClick={() => setIsRejectOpen(true)}
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                Rejeter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Informations personnelles */}
      <Card className="border-border/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <User className="h-4 w-4 text-primary" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">CIN</p>
            <p className="mt-1 font-mono font-medium">{profile.cin}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Nationalité</p>
            <p className="mt-1 font-medium">{profile.nationalite || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Année de naissance</p>
            <p className="mt-1 font-medium">{profile.annee_naissance || "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
              <a href={`mailto:${profile.email}`} className="mt-0.5 font-medium text-primary hover:underline">
                {profile.email}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Téléphone</p>
              <p className="mt-0.5 font-medium">{profile.telephone || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Ville</p>
              <p className="mt-0.5 font-medium">{profile.ville || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parcours académique */}
      <Card className="border-border/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <GraduationCap className="h-4 w-4 text-primary" />
            Parcours académique & Licence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {/* Années de Licence */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes des années de Licence
            </h4>
            {profile.licence_years && profile.licence_years.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {profile.licence_years
                  .slice()
                  .sort((a, b) => a.annee - b.annee)
                  .map((ly) => (
                    <div key={ly.pubkey} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Licence {ly.annee} ({ly.annee_universitaire})
                      </p>
                      <p className="mt-1 font-display text-xl font-bold">
                        {ly.moyenne.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">/ 20</span>
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune note de licence enregistrée.</p>
            )}
          </div>

          {/* Diplôme */}
          {profile.diplomes && profile.diplomes.length > 0 ? (
            <div className="border-t border-border/50 pt-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Diplôme obtenu
              </h4>
              <div className="space-y-3">
                {profile.diplomes.map((d) => (
                  <div key={d.pubkey} className="grid gap-3 sm:grid-cols-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Filière / Type de licence</p>
                      <p className="font-medium">{d.type_licence?.intitule || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Université / Établissement</p>
                      <p className="font-medium">{d.universite}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Année d'obtention</p>
                      <p className="font-medium">{d.annee_obtention}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Master 1 (si applicable) */}
          {profile.master1_year ? (
            <div className="border-t border-border/50 pt-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Parcours Master 1 (Passerelle M2)
              </h4>
              <div className="grid gap-3 sm:grid-cols-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Établissement</p>
                  <p className="font-medium">{profile.master1_year.etablissement}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Année universitaire</p>
                  <p className="font-medium">{profile.master1_year.annee_universitaire}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Moyenne M1</p>
                  <p className="font-display text-lg font-bold">
                    {profile.master1_year.moyenne.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">/ 20</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Redoublements */}
          <div className="border-t border-border/50 pt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Redoublements
            </h4>
            {profile.redoublement?.a_redouble ? (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="font-medium text-amber-600 dark:text-amber-400">Candidat ayant redoublé</p>
                {profile.redoublement.redoublement_years &&
                profile.redoublement.redoublement_years.length > 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Années :{" "}
                    {profile.redoublement.redoublement_years
                      .map((ry) => ry.annee)
                      .join(", ")}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun redoublement déclaré.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pièces justificatives et documents Cloudflare R2 */}
      <Card className="border-border/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Documents déposés ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Aucun document joint à cette candidature.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type de pièce</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Date d'envoi</TableHead>
                  <TableHead>Statut document</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const label = getSlotTypeLabel(
                    doc.slot_type,
                    doc.annee_licence,
                    doc.redoublement_annee
                  );

                  return (
                    <TableRow key={doc.pubkey}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{label}</span>
                        </div>
                        {doc.rejection_reason ? (
                          <p className="mt-1 text-xs text-destructive">
                            Motif rejet : {doc.rejection_reason}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge statut={doc.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {doc.download_url ? (
                          <Button asChild size="sm" variant="outline">
                            <a
                              href={doc.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Télécharger</span>
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Indisponible</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal d'Approbation */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg">Approuver la candidature</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Vous êtes sur le point de valider le profil de{" "}
              <strong className="text-foreground">
                {profile.prenom} {profile.nom}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Effets de cette action :</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Le statut du dossier passera à <strong>VALIDE</strong>.</li>
              <li>Un compte utilisateur sera créé avec mot de passe temporaire inutilisable.</li>
              <li>Un email avec un <strong>lien d'activation sécurisé (48h)</strong> sera automatiquement envoyé au candidat ({profile.email}).</li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={() => setIsApproveOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              onClick={handleApprove}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionLoading ? "Validation..." : "Confirmer l'approbation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rejet */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg">Rejeter la candidature</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Le statut de la candidature passera à <strong>REJETÉ</strong> et un email d'information sera transmis au candidat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-motif" className="text-xs font-medium">
              Motif du rejet (optionnel)
            </Label>
            <Textarea
              id="reject-motif"
              placeholder="Ex. Dossier académique non conforme aux critères d'admissibilité..."
              value={rejectMotif}
              onChange={(e) => setRejectMotif(e.target.value)}
              disabled={actionLoading}
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={() => setIsRejectOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading}
              onClick={handleReject}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionLoading ? "Rejet en cours..." : "Confirmer le rejet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Demande de Révision */}
      <Dialog open={isRevisionOpen} onOpenChange={setIsRevisionOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <FileEdit className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg">Demander une révision</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Le statut passera à <strong>À RÉVISER</strong>. Vous pouvez cibler les pièces à redéposer et ajouter des consignes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Sélection ciblée des documents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pièces à redéposer par le candidat
                </Label>
                {documents.length > 0 && (
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllDocs}
                      className="text-primary hover:underline font-medium"
                    >
                      Tout cocher
                    </button>
                    <span className="text-muted-foreground">•</span>
                    <button
                      type="button"
                      onClick={deselectAllDocs}
                      className="text-muted-foreground hover:underline"
                    >
                      Tout décocher
                    </button>
                  </div>
                )}
              </div>

              {documents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic rounded-md border p-3 bg-muted/20">
                  Aucune pièce justificative n'est encore enregistrée pour cette candidature.
                </p>
              ) : (
                <div className="max-h-52 overflow-y-auto rounded-lg border border-border/70 p-2 space-y-2 bg-muted/10">
                  {documents.map((doc) => {
                    const key = doc.slot_pubkey || doc.pubkey;
                    const isSelected = selectedRevisionDocs.includes(key);
                    const label =
                      doc.display_name ||
                      getSlotTypeLabel(doc.slot_type, doc.annee_licence, doc.redoublement_annee);

                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-2.5 rounded-md border transition-colors cursor-pointer text-sm ${
                          isSelected
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                            : "border-border/60 hover:bg-muted/40"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleDocSelection(key)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm leading-tight">{label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Type : {doc.slot_type} • Version {doc.version_number}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Champ message complémentaire */}
            <div className="space-y-1.5">
              <Label
                htmlFor="revision-message"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Remarques / Consignes écrites{" "}
                {selectedRevisionDocs.length === 0 ? (
                  <span className="text-destructive">*</span>
                ) : (
                  "(optionnel)"
                )}
              </Label>
              <Textarea
                id="revision-message"
                placeholder="Ex. Le relevé de notes de L2 est illisible. Merci de téléverser une version scannée plus nette..."
                value={revisionMessage}
                onChange={(e) => setRevisionMessage(e.target.value)}
                disabled={actionLoading}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={() => setIsRevisionOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              disabled={actionLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
              onClick={handleRequestRevision}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionLoading ? "Envoi en cours..." : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
