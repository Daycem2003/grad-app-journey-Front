import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, FileSearch, Layers } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/coordinateur/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord coordinateur — MasterTN" },
      { name: "description", content: "Suivi des appels à candidature et des dossiers à instruire." },
      { property: "og:title", content: "Tableau de bord coordinateur — MasterTN" },
      { property: "og:description", content: "Pilotage des candidatures de vos Masters." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { masters, candidatures } = useStore();
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Tableau de bord"
        subtitle="Activité des Masters dont vous êtes coordinateur."
        action={
          <Button asChild>
            <Link to="/coordinateur/appels">Créer un appel</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Mes Masters" value={masters.length} icon={Layers} />
        <StatCard label="Candidatures" value={candidatures.length} icon={ClipboardList} />
        <StatCard
          label="À réviser"
          value={candidatures.filter((c) => c.statut === "À réviser").length}
          icon={FileSearch}
        />
        <StatCard
          label="Approuvées"
          value={candidatures.filter((c) => c.statut === "Approuvée").length}
          icon={CheckCircle2}
        />
      </div>
    </div>
  );
}
