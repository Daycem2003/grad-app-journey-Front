import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        content: "Détail du profil candidat, parcours académique et pièces justificatives.",
      },
      { property: "og:title", content: "Dossier de candidature — MasterTN" },
      {
        property: "og:description",
        content: "Consultation complète du dossier candidat.",
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

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [profData, docsData] = await Promise.all([
          coordinatorService.getCandidateProfile(candidatureId),
          coordinatorService.getCandidateDocuments(candidatureId),
        ]);

        if (!isCancelled) {
          setProfile(profData);
          setDocuments(docsData);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : "Erreur lors du chargement du dossier.";
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, [candidatureId]);

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
                <p className="font-medium text-warning">Candidat ayant redoublé</p>
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
    </div>
  );
}
