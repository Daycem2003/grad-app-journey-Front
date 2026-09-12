import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  MapPin,
  Scale,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type EligibilityCriterion,
  type MasterDetail,
  mastersService,
} from "@/services/masters-service";

export const Route = createFileRoute("/coordinateur/masters/$masterId")({
  head: () => ({
    meta: [
      { title: "Détail du Master — Espace coordinateur | MasterTN" },
      {
        name: "description",
        content: "Consultez l'ensemble des caractéristiques, dates, places et critères du Master.",
      },
      { property: "og:title", content: "Détail du Master — MasterTN" },
      {
        property: "og:description",
        content: "Détail exhaustif du Master pour le coordinateur.",
      },
    ],
  }),
  component: MasterDetailPage,
});

function formatDate(val?: string): string {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return val;
  }
}

function formatDateOnly(val?: string): string {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return val;
  }
}

function formatDocType(type: string): string {
  switch (type) {
    case "RELEVE_NOTES_L1_L2_L3":
    case "RELEVE_LICENCE":
      return "Relevés de notes de Licence (L1, L2, L3)";
    case "DIPLOME_LICENCE":
      return "Diplôme ou attestation de réussite en Licence";
    case "RELEVE_M1":
      return "Relevé de notes Master 1 (Passerelle)";
    case "JUSTIFICATIF_REDOUBLEMENT":
      return "Justificatif de redoublement";
    case "CV":
      return "Curriculum Vitae";
    case "LETTRE_MOTIVATION":
      return "Lettre de motivation";
    case "CIN":
      return "Copie de la Carte d'Identité Nationale (CIN)";
    default:
      return type;
  }
}

function MasterDetailPage() {
  const { masterId } = useParams({ from: "/coordinateur/masters/$masterId" });
  const [master, setMaster] = useState<MasterDetail | null>(null);
  const [rules, setRules] = useState<EligibilityCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [masterData, rulesData] = await Promise.all([
          mastersService.getMasterDetail(masterId),
          mastersService.getMasterEligibilityCriteria(masterId).catch(() => []),
        ]);

        if (!isCancelled) {
          setMaster(masterData);
          setRules(rulesData);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Impossible de charger les détails du Master."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, [masterId]);

  if (loading) {
    return (
      <div className="mx-auto flex h-64 max-w-4xl items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Chargement des détails du Master…</span>
      </div>
    );
  }

  if (error || !master) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/coordinateur/masters">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux Masters
          </Link>
        </Button>
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="flex items-center gap-3 p-6 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error || "Master introuvable."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const places = master.nombre_places ?? master.nombrePlaces ?? 0;
  const debut = master.date_debut ?? master.dateDebut;
  const fin = master.date_fin ?? master.dateFin;
  const createdAt = master.created_at ?? master.createdAt;
  const updatedAt = master.updated_at ?? master.updatedAt;
  const typeLicences = master.type_licences_acceptees ?? master.typeLicencesAcceptees ?? [];
  const reqDocs = master.required_documents ?? master.requiredDocuments ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/coordinateur/masters">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mes Masters
          </Link>
        </Button>

        <Button asChild size="sm" variant="outline">
          <Link to="/coordinateur/candidatures">
            <span>Voir les candidatures</span>
          </Link>
        </Button>
      </div>

      <PageHeader
        title={master.nom}
        subtitle={`${master.universite} — ${master.ville}`}
        action={<StatusBadge statut={master.statut} />}
      />

      {/* Informations générales et académiques */}
      <Card className="border-border/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Layers className="h-4 w-4 text-primary" />
            Informations générales & Période
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Domaine</p>
              <p className="mt-1 font-medium text-foreground">{master.domaine || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Discipline</p>
              <p className="mt-1 font-medium text-foreground">{master.discipline || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Spécialité</p>
              <p className="mt-1 font-medium text-foreground">{master.specialite || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Université</p>
              <p className="mt-1 font-medium text-foreground">{master.universite || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Ville</p>
              <p className="mt-1 font-medium text-foreground">{master.ville || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Capacité d'accueil</p>
              <p className="mt-1 font-display text-lg font-bold text-foreground">
                {places > 0 ? `${places} places` : "Non spécifié"}
              </p>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dates d'ouverture & Clôture des candidatures
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">Date d'ouverture</span>
                </div>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {debut ? formatDateOnly(debut) : "Non définie"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">Date de clôture</span>
                </div>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {fin ? formatDateOnly(fin) : "Non définie"}
                </p>
              </div>
            </div>
          </div>

          {(createdAt || updatedAt) ? (
            <div className="border-t border-border/50 pt-3 text-xs text-muted-foreground flex flex-wrap gap-6">
              {createdAt ? <div>Créé le : {formatDate(createdAt)}</div> : null}
              {updatedAt ? <div>Dernière modification : {formatDate(updatedAt)}</div> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Licences & Diplômes acceptés */}
      <Card className="border-border/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <GraduationCap className="h-4 w-4 text-primary" />
            Licences acceptées & Éligibilité
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {typeLicences.length === 0 ? (
            <p className="text-muted-foreground">
              Aucune restriction de licence spécifiée (ouvert à l'ensemble des licences éligibles).
            </p>
          ) : (
            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {typeLicences.map((tl) => (
                  <div
                    key={tl.pubkey}
                    className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/20 p-3"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    <div>
                      <p className="font-medium text-foreground">{tl.intitule}</p>
                      {tl.domaine ? (
                        <p className="text-xs text-muted-foreground">{tl.domaine}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pièces justificatives requises */}
      <Card className="border-border/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Pièces justificatives demandées ({reqDocs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {reqDocs.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun document spécifique requis listé.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {reqDocs.map((doc) => (
                <div
                  key={doc.pubkey}
                  className="flex items-center gap-2.5 rounded-md border border-border/60 bg-muted/20 p-3"
                >
                  <FileCheck className="h-4 w-4 shrink-0 text-primary" />
                  <span className="font-medium text-foreground">
                    {formatDocType(doc.type)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critères d'éligibilité configurés */}
      {rules.length > 0 ? (
        <Card className="border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Scale className="h-4 w-4 text-primary" />
              Critères et règles d'éligibilité ({rules.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {rules.map((rule) => (
              <div
                key={rule.pubkey}
                className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{rule.type}</p>
                  <p className="text-xs text-muted-foreground">
                    Valeur requise : {rule.valeur}
                  </p>
                </div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {rule.obligatoire ? "Obligatoire" : "Optionnel"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
