import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileStack, Library, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatCard } from "@/components/shared/StatCard";
import { AdminDashboardSkeleton } from "@/components/shared/PageSkeletons";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";

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
  const { masters, candidats, candidatures, periode } = useStore();
  const approuvees = candidatures.filter((c) => c.statut === "Approuvée");

  const recentes = [...candidatures]
    .sort((a, b) => b.majLe.localeCompare(a.majLe))
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
        <StatCard label="Candidats inscrits" value={candidats.length} icon={Users} />
        <StatCard label="Candidatures" value={candidatures.length} icon={FileStack} />
        <StatCard label="Admis" value={approuvees.length} icon={CheckCircle2} />
      </div>

      <Card className="mt-8 border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Dernières mises à jour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentes.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {(() => {
                    const cand = candidats.find((x) => x.id === c.candidatId);
                    return cand ? `${cand.prenom} ${cand.nom}` : c.candidatId;
                  })()}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {masters.find((m) => m.id === c.masterId)?.nom}
                </p>
              </div>
              <StatusBadge statut={c.statut} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
