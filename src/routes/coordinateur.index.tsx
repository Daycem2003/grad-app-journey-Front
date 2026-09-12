import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Layers,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type CandidateDetailDTO,
  coordinatorService,
} from "@/services/coordinator-service";
import { type Master, mastersService } from "@/services/masters-service";

export const Route = createFileRoute("/coordinateur/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord coordinateur — MasterTN" },
      {
        name: "description",
        content: "Suivi des appels à candidature et des dossiers à instruire.",
      },
      { property: "og:title", content: "Tableau de bord coordinateur — MasterTN" },
      {
        property: "og:description",
        content: "Pilotage des candidatures de vos Masters.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [candidates, setCandidates] = useState<CandidateDetailDTO[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [cands, msts] = await Promise.all([
          coordinatorService.listCandidates().catch(() => []),
          mastersService.listMasters().catch(() => []),
        ]);

        if (!isCancelled) {
          setCandidates(cands);
          setMasters(msts);
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

  const enAttenteCount = candidates.filter((c) => c.statut === "EN_ATTENTE").length;
  const valideCount = candidates.filter((c) => c.statut === "VALIDE").length;
  const rejeteCount = candidates.filter((c) => c.statut === "REJETE").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle="Activité des Masters et suivi des candidatures soumises."
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/coordinateur/candidatures">Consulter les dossiers</Link>
            </Button>
            <Button asChild>
              <Link to="/coordinateur/appels">Créer un appel</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Masters disponibles"
          value={loading ? "…" : masters.length}
          icon={Layers}
        />
        <StatCard
          label="Total Candidatures"
          value={loading ? "…" : candidates.length}
          icon={ClipboardList}
        />
        <StatCard
          label="En attente de révision"
          value={loading ? "…" : enAttenteCount}
          icon={Clock}
        />
        <StatCard
          label="Validées"
          value={loading ? "…" : valideCount}
          icon={CheckCircle2}
        />
      </div>

      {enAttenteCount > 0 ? (
        <Card className="border-warning/40 bg-warning/5 shadow-none">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-semibold text-accent-foreground">
                {enAttenteCount} dossier(s) en attente d'instruction
              </h4>
              <p className="text-sm text-muted-foreground">
                Des candidatures récentes nécessitent la vérification des pièces justificatives.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/coordinateur/revision">Accéder aux dossiers en attente</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
