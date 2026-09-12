import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { Award, CalendarDays, CheckCircle2, FileText, Info as InfoIcon, Loader2, MapPin, Users } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/lib/auth-context";
import { mastersService, type MasterDetail } from "@/services/masters-service";
import { candidateProfileService, type CandidateProfileResponse } from "@/services/candidate-profile-service";
import { applicationsService, type ApplicationDTO } from "@/services/applications-service";

export const Route = createFileRoute("/masters/$masterId")({
  head: () => ({
    meta: [
      { title: "Détail du Master — MasterTN" },
      {
        name: "description",
        content:
          "Conditions d'éligibilité, formule de score, documents demandés et dates de candidature du Master.",
      },
      { property: "og:title", content: "Détail du Master — MasterTN" },
      {
        property: "og:description",
        content: "Critères, formule de score et documents demandés pour ce Master.",
      },
    ],
  }),
  component: DetailMaster,
});

function DetailMaster() {
  const { masterId } = Route.useParams();
  const { user, isAuthenticated } = useAuth();

  const [master, setMaster] = useState<MasterDetail | null>(null);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [myApplications, setMyApplications] = useState<ApplicationDTO[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Chargement du Master
  useEffect(() => {
    let active = true;
    setLoadingMaster(true);
    mastersService
      .getMasterDetail(masterId)
      .then((data) => {
        if (active) setMaster(data);
      })
      .catch(() => {
        // Fallback : recherche dans la liste globale si l'endpoint détail spécifique échoue
        mastersService
          .listMasters()
          .then((list) => {
            const found = list.find((m) => m.pubkey === masterId || String((m as any).id) === masterId);
            if (active && found) setMaster(found as any);
          })
          .catch((err) => console.error("Erreur chargement master:", err));
      })
      .finally(() => {
        if (active) setLoadingMaster(false);
      });

    return () => {
      active = false;
    };
  }, [masterId]);

  // 2. Chargement du profil et des candidatures si authentifié
  useEffect(() => {
    let active = true;
    if (isAuthenticated) {
      setLoadingProfile(true);
      Promise.allSettled([
        candidateProfileService.getMyProfile(),
        applicationsService.getMyApplications(),
      ]).then(([profileRes, appsRes]) => {
        if (!active) return;
        if (profileRes.status === "fulfilled") {
          setCandidateProfile(profileRes.value);
        } else {
          setCandidateProfile(null);
        }
        if (appsRes.status === "fulfilled") {
          setMyApplications(appsRes.value);
        } else {
          setMyApplications([]);
        }
        setLoadingProfile(false);
      });
    } else {
      setCandidateProfile(null);
      setMyApplications([]);
      setLoadingProfile(false);
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (loadingMaster) {
    return (
      <div className="min-h-screen">
        <PublicNav />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">
          Chargement des informations du Master...
        </div>
      </div>
    );
  }

  if (!master) throw notFound();

  const isMasterOuvert =
    master.statut === "OUVERT" || master.statut === "Ouvert";

  // Vérifier si le candidat a déjà postulé à ce Master
  const existingApp = myApplications.find(
    (app) => app.master?.pubkey === master.pubkey || app.master?.pubkey === masterId
  );

  // Calcul d'estimation de score côté client pour affichage indicatif
  const estimateScore = () => {
    if (!candidateProfile || !candidateProfile.licence_years || candidateProfile.licence_years.length === 0) {
      return null;
    }
    const licenceAvg =
      candidateProfile.licence_years.reduce((acc, y) => acc + Number(y.moyenne || 0), 0) /
      candidateProfile.licence_years.length;
    const m1Avg = candidateProfile.master1_year?.moyenne
      ? Number(candidateProfile.master1_year.moyenne)
      : null;
    const nbRedoublements =
      candidateProfile.redoublement?.redoublement_years?.length || 0;
    const malus = 0.5 * nbRedoublements;

    if (m1Avg !== null) {
      return Math.max(0, Math.min(20, licenceAvg * 0.6 + m1Avg * 0.4 - malus));
    }
    return Math.max(0, Math.min(20, licenceAvg - malus));
  };

  const estimatedScore = estimateScore();

  const soumettre = async () => {
    setSubmitting(true);
    try {
      const newApp = await applicationsService.submitApplication(master.pubkey);
      setMyApplications((prev) => [...prev, newApp]);
      setOpen(false);
      toast.success("Votre candidature a été soumise avec succès !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la soumission de votre candidature.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PublicNav />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/masters">Masters</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">{master.nom}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight">{master.nom}</h1>
            <p className="mt-2 text-muted-foreground">
              {(master as any).etablissement || master.universite || "—"}
            </p>
          </div>

          <StatusBadge statut={master.statut} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="leading-relaxed">
                  {(master as any).description ||
                    `Formation de haut niveau en ${master.domaine || master.specialite || "sciences"}, préparant aux carrières académiques et professionnelles.`}
                </p>
                <Separator />
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Info label="Université" value={master.universite || "—"} />
                  <Info label="Établissement" value={(master as any).etablissement || master.universite || "—"} />
                  <Info label="Ville" value={master.ville || "—"} />
                  <Info label="Domaine" value={master.domaine || "—"} />
                  <Info label="Discipline" value={master.discipline || "—"} />
                  <Info label="Spécialité" value={master.specialite || "—"} />
                </dl>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Conditions d'éligibilité</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y text-sm">
                  {master.eligibility_criteria && master.eligibility_criteria.length > 0 ? (
                    master.eligibility_criteria.map((c: any, i: number) => (
                      <li key={c.pubkey || i} className="flex flex-wrap justify-between gap-2 py-2.5">
                        <span className="text-muted-foreground font-medium">
                          {c.criterion === "average"
                            ? "Moyenne minimale de Licence requise"
                            : c.criterion === "nationality"
                              ? "Nationalité requise"
                              : c.criterion}
                        </span>
                        <span className="font-semibold text-foreground">
                          {c.criterion === "average" ? ">= 11.0 / 20" : c.valeur ? String(c.valeur) : "—"}
                        </span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex flex-wrap justify-between gap-2 py-2.5">
                        <span className="text-muted-foreground">Moyenne générale de Licence</span>
                        <span className="font-medium">&ge; 11.0 / 20</span>
                      </li>
                      <li className="flex flex-wrap justify-between gap-2 py-2.5">
                        <span className="text-muted-foreground">Nationalité</span>
                        <span className="font-medium">Tunisienne</span>
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Formule de score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-muted/40 p-4 font-mono text-sm border border-border/70">
                  Score = (Moyenne Licence × 0.6) + (Moyenne M1 × 0.4) - (0.5 × Redoublements)
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Le score classe automatiquement les candidats admissibles selon leurs moyennes académiques certifiées.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Documents demandés</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-primary" /> Relevés de notes de Licence (A1, A2, A3)
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-primary" /> Diplôme ou attestation de réussite de Licence
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" /> Justificatifs de redoublement (si applicable)
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" /> Relevé de notes Master 1 (si candidature M2)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Dates & places</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" /> Début :{" "}
                  {new Date((master as any).dateDebut || master.date_debut || Date.now()).toLocaleDateString("fr-FR")}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" /> Date limite :{" "}
                  {new Date((master as any).dateFin || master.date_fin || Date.now()).toLocaleDateString("fr-FR")}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" /> {(master as any).places ?? master.nombre_places ?? 0} places
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" /> {master.ville}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Candidature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {loadingProfile ? (
                  <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Vérification de votre profil…</span>
                  </div>
                ) : isAuthenticated ? (
                  existingApp ? (
                    <div className="space-y-3">
                      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                        <p className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-emerald-600" /> Candidature soumise
                        </p>
                        <p className="mt-1">
                          Votre dossier a été enregistré le {new Date(existingApp.date_soumission).toLocaleDateString("fr-FR")}.
                        </p>
                        {existingApp.score !== undefined && existingApp.score !== null ? (
                          <p className="mt-2 font-medium">Score : {Number(existingApp.score).toFixed(2)} / 20</p>
                        ) : null}
                        {existingApp.rang ? (
                          <p className="font-semibold text-primary">Rang actuel : #{existingApp.rang}</p>
                        ) : null}
                      </div>
                      <Button className="w-full" disabled variant="secondary">
                        Candidature déjà déposée
                      </Button>
                      <Button asChild variant="outline" className="w-full text-xs">
                        <Link to="/candidat/candidatures">Voir mes candidatures</Link>
                      </Button>
                    </div>
                  ) : candidateProfile?.statut === "VALIDE" ? (
                    <div className="space-y-3">
                      {estimatedScore !== null ? (
                        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs">
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Award className="size-3.5 text-primary" /> Score estimé pour votre profil :
                          </p>
                          <p className="mt-1 text-base font-bold text-foreground">
                            {estimatedScore.toFixed(2)} / 20
                          </p>
                        </div>
                      ) : null}
                      <Button
                        className="w-full"
                        disabled={!isMasterOuvert}
                        onClick={() => setOpen(true)}
                      >
                        {isMasterOuvert ? "Postuler à ce Master" : "Candidatures fermées"}
                      </Button>
                    </div>
                  ) : candidateProfile?.statut === "A_REVISER" ? (
                    <div className="space-y-2">
                      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                        <p className="font-semibold">Dossier à réviser</p>
                        <p className="mt-1">
                          Veuillez corriger votre profil avant de postuler à de nouveaux Masters.
                        </p>
                      </div>
                      <Button asChild className="w-full">
                        <Link to="/profil/creer">Compléter mon profil</Link>
                      </Button>
                    </div>
                  ) : candidateProfile ? (
                    <div className="space-y-2">
                      <div className="rounded-md border border-muted bg-muted/40 p-3 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">Profil en cours d'examen</p>
                        <p className="mt-1">
                          Votre dossier initial est en attente de validation par la commission.
                        </p>
                      </div>
                      <Button disabled className="w-full">
                        En attente de validation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs">
                        Complétez votre profil candidat pour postuler à ce Master.
                      </p>
                      <Button asChild className="w-full">
                        <Link to="/profil/creer">Créer mon profil candidat</Link>
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-xs">
                      Créez votre profil candidat ou connectez-vous pour postuler à ce Master.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/profil/creer">Créer mon profil candidat</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-xs">
                      <Link to="/login">Se connecter</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmer votre candidature</DialogTitle>
            <DialogDescription>
              Vérifiez les informations de votre dossier avant de confirmer votre postulation.
            </DialogDescription>
          </DialogHeader>

          {candidateProfile ? (
            <div className="space-y-4 text-sm">
              <section>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Master sélectionné
                </p>
                <p className="mt-1 font-medium">{master.nom}</p>
                <p className="text-xs text-muted-foreground">{master.universite || "—"}</p>
              </section>
              <Separator />
              <section>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Candidat
                </p>
                <p className="mt-1 font-medium">
                  {candidateProfile.prenom} {candidateProfile.nom} — CIN {candidateProfile.cin}
                </p>
                <p className="text-xs text-muted-foreground">
                  {candidateProfile.email} · {candidateProfile.ville} · Nationalité : {candidateProfile.nationalite}
                </p>
              </section>
              {estimatedScore !== null ? (
                <>
                  <Separator />
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Score de calcul
                    </p>
                    <p className="mt-1 text-base font-bold text-primary">
                      {estimatedScore.toFixed(2)} / 20
                    </p>
                  </section>
                </>
              ) : null}
            </div>
          ) : null}

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button onClick={soumettre} disabled={submitting}>
              {submitting ? "Envoi en cours..." : "Confirmer et postuler"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

