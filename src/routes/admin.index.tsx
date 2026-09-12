import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileStack, Library, Users, Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatCard } from "@/components/shared/StatCard";
import { AdminDashboardSkeleton } from "@/components/shared/PageSkeletons";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";
import { mastersService, type Master } from "@/services/masters-service";
import { coordinatorService, type CandidateDetailDTO } from "@/services/coordinator-service";
import { applicationsService, type ApplicationDTO } from "@/services/applications-service";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord administrateur — MasterTN" },
      {
        name: "description",
        content: "Vue globale des Masters, candidats et candidatures de la plateforme.",
      },
      { property: "og:title", content: "Tableau de bord administrateur — MasterTN" },
      { property: "og:description", content: "Pilotage global de la campagne de candidatures." },
    ],
  }),
  pendingComponent: AdminDashboardSkeleton,
  component: AdminDashboard,
});

function AdminDashboard() {
  const { periode } = useStore();
  const [masters, setMasters] = useState<Master[]>([]);
  const [candidates, setCandidates] = useState<CandidateDetailDTO[]>([]);
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [mList, cList, aList] = await Promise.all([
          mastersService.listMasters().catch(() => []),
          coordinatorService.listCandidates().catch(() => []),
          applicationsService.listAllApplications().catch(() => []),
        ]);

        if (!isCancelled) {
          setMasters(mList);
          setCandidates(cList);
          setApplications(aList);
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
  }, []);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  const approuvees = applications.filter(
    (c) =>
      c.statut === "ACCEPTEE" ||
      c.statut === "VALIDE" ||
      c.statut === "Approuvée"
  );

  const recentes = [...applications]
    .sort((a, b) => (b.date_soumission || "").localeCompare(a.date_soumission || ""))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Tableau de bord"
        subtitle={`Campagne du ${new Date(periode.debut).toLocaleDateString("fr-FR")} au ${new Date(periode.fin).toLocaleDateString("fr-FR")}.`}
        action={
          <Button asChild>
            <Link to="/admin/statistiques">Voir les statistiques</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Masters" value={masters.length} icon={Library} />
        <StatCard label="Candidats inscrits" value={candidates.length} icon={Users} />
        <StatCard label="Candidatures" value={applications.length} icon={FileStack} />
        <StatCard label="Admis" value={approuvees.length} icon={CheckCircle2} />
      </div>

      <Card className="mt-8 border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Dernières mises à jour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Aucune candidature déposée pour le moment.</p>
            </div>
          ) : (
            recentes.map((c) => (
              <div
                key={c.pubkey}
                className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {c.candidate_profile
                      ? `${c.candidate_profile.prenom} ${c.candidate_profile.nom}`
                      : "Candidat"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.master?.nom || "Master"}
                  </p>
                </div>
                <StatusBadge statut={c.statut} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

