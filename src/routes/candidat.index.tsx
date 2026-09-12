import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, FileStack, Library, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { CandidateDashboardSkeleton } from "@/components/shared/PageSkeletons";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { candidateProfileService, type CandidateProfileResponse } from "@/services/candidate-profile-service";
import { applicationsService, type ApplicationDTO } from "@/services/applications-service";
import { mastersService, type Master } from "@/services/masters-service";

export const Route = createFileRoute("/candidat/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord candidat — MasterTN" },
      {
        name: "description",
        content: "Suivez vos candidatures, votre profil et les Masters recommandés.",
      },
      { property: "og:title", content: "Tableau de bord candidat — MasterTN" },
      { property: "og:description", content: "Vos candidatures et Masters recommandés." },
    ],
  }),
  pendingComponent: CandidateDashboardSkeleton,
  component: DashboardCandidat,
});

function DashboardCandidat() {
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.allSettled([
      candidateProfileService.getMyProfile(),
      applicationsService.getMyApplications(),
      mastersService.listMasters(),
    ]).then(([profileRes, appsRes, mastersRes]) => {
      if (!active) return;
      if (profileRes.status === "fulfilled") setProfile(profileRes.value);
      if (appsRes.status === "fulfilled") setApplications(appsRes.value);
      if (mastersRes.status === "fulfilled") setMasters(mastersRes.value);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const ouverts = masters.filter((m) => m.statut === "OUVERT" || m.statut === "Ouvert");
  const enCoursCount = applications.filter((a) => a.statut === "SOUMISE" || a.statut === "EN_COURS").length;
  const approuveesCount = applications.filter((a) => a.statut === "ACCEPTEE" || a.statut === "Approuvée").length;
  const rejeteesCount = applications.filter((a) => a.statut === "REJETEE" || a.statut === "Rejetée").length;

  const profileStatutLabel =
    profile?.statut === "VALIDE"
      ? "Validé"
      : profile?.statut === "A_REVISER"
        ? "À réviser"
        : profile?.statut === "REJETE"
          ? "Rejeté"
          : profile
            ? "En cours d'examen"
            : "Incomplet";

  if (loading) {
    return (
      <div className="mx-auto flex h-64 max-w-6xl items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Chargement de votre tableau de bord…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={profile ? `Bonjour ${profile.prenom} ${profile.nom}` : "Espace candidat"}
        subtitle="Vue d'ensemble de votre dossier et de vos candidatures."
        action={
          <Button asChild>
            <Link to="/masters">Parcourir les Masters</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Statut du profil"
          value={profileStatutLabel}
          hint={profile ? `CIN ${profile.cin} · ${profile.ville}` : "Créez votre profil"}
          icon={CheckCircle2}
        />
        <StatCard label="Masters ouverts" value={ouverts.length} icon={Library} />
        <StatCard label="Mes candidatures" value={applications.length} icon={FileStack} />
        <StatCard label="En cours" value={enCoursCount} icon={ClipboardList} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Acceptées" value={approuveesCount} />
        <StatCard
          label="Statut dossier"
          value={profile?.statut === "A_REVISER" ? "Révision requise" : "Conforme"}
        />
        <StatCard label="Rejetées" value={rejeteesCount} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl">Masters disponibles</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Formations actuellement ouvertes aux candidatures.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/masters">Tout voir ({ouverts.length})</Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ouverts.slice(0, 6).map((m) => {
            const hasApplied = applications.some(
              (app) => app.master?.pubkey === m.pubkey || String(app.master?.pubkey) === String(m.id)
            );
            return (
              <Card key={m.pubkey || m.id} className="border-border/70 shadow-none flex flex-col justify-between">
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                        {m.domaine || "Master"}
                      </span>
                      <StatusBadge statut={m.statut} />
                    </div>
                    <p className="mt-3 font-display text-base leading-snug">{m.nom}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m.universite || m.ville || "—"} · {m.nombre_places ?? 0} places
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <Button asChild variant={hasApplied ? "secondary" : "outline"} className="w-full text-xs">
                      <Link to="/masters/$masterId" params={{ masterId: String(m.pubkey || m.id) }}>
                        {hasApplied ? "Candidature déposée ✓" : "Voir & postuler"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
