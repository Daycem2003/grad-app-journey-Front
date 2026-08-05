import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/coordinateur/revision")({
  head: () => ({
    meta: [
      { title: "Candidatures à réviser — MasterTN" },
      { name: "description", content: "Dossiers incomplets ou à corriger nécessitant une notification." },
      { property: "og:title", content: "Candidatures à réviser — MasterTN" },
      { property: "og:description", content: "Traitez les dossiers en attente de correction." },
    ],
  }),
  component: Revision,
});

function Revision() {
  const { candidatures, getCandidat, getMaster } = useStore();
  const lignes = candidatures.filter((c) => c.statut === "À réviser");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Candidatures à réviser" subtitle={`${lignes.length} dossier(s) en attente.`} />
      <div className="space-y-3">
        {lignes.map((c) => {
          const cand = getCandidat(c.candidatId);
          return (
            <Card key={c.id} className="border-border/70 shadow-none">
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5">
                <div className="min-w-0">
                  <p className="truncate font-medium">{cand ? `${cand.prenom} ${cand.nom}` : "—"}</p>
                  <p className="truncate text-sm text-muted-foreground">{getMaster(c.masterId)?.nom}</p>
                  <div className="mt-2"><StatusBadge statut={c.statut} /></div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/coordinateur/candidatures/$candidatureId" params={{ candidatureId: c.id }}>
                    Ouvrir le dossier
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
