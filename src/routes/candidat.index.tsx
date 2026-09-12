import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, FileStack, Library } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { CandidateDashboardSkeleton } from "@/components/shared/PageSkeletons";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";

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
  const { profil, masters, candidatures } = useStore();
  const miennes = candidatures.filter((c) => c.candidatId === profil?.id);
  const ouverts = masters.filter((m) => m.statut === "Ouvert");

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={profil ? `Bonjour ${profil.prenom}` : "Espace candidat"}
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
          value={profil ? "Complet" : "Incomplet"}
          hint={profil ? `CIN ${profil.cin}` : "Créez votre profil"}
          icon={CheckCircle2}
        />
        <StatCard label="Masters ouverts" value={ouverts.length} icon={Library} />
        <StatCard label="Mes candidatures" value={miennes.length} icon={FileStack} />
        <StatCard
          label="En cours"
          value={miennes.filter((c) => c.statut === "Soumise").length}
          icon={ClipboardList}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Approuvées" value={miennes.filter((c) => c.statut === "Approuvée").length} />
        <StatCard label="À réviser" value={miennes.filter((c) => c.statut === "À réviser").length} />
        <StatCard label="Rejetées" value={miennes.filter((c) => c.statut === "Rejetée").length} />
      </div>

      <h2 className="mt-10 font-display text-xl">Masters recommandés</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ouverts.slice(0, 6).map((m) => (
          <Card key={m.id} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {m.domaine}
                </span>
                <StatusBadge statut={m.statut} />
              </div>
              <p className="mt-3 font-display text-lg leading-snug">{m.nom}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {m.universite || m.ville || "—"} · {m.nombre_places ?? 0} places
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/masters/$masterId" params={{ masterId: String(m.id ?? m.pubkey) }}>
                  Voir & postuler
                </Link>
              </Button>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
