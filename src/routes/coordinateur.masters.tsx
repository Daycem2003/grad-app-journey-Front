import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/coordinateur/masters")({
  head: () => ({
    meta: [
      { title: "Mes Masters — Espace coordinateur | MasterTN" },
      { name: "description", content: "Liste des Masters dont vous assurez la coordination." },
      { property: "og:title", content: "Mes Masters — MasterTN" },
      { property: "og:description", content: "Places, périodes et pondérations de vos Masters." },
    ],
  }),
  component: MesMasters,
});

function MesMasters() {
  const { masters, candidatures } = useStore();
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Mes Masters" subtitle={`${masters.length} formations coordonnées.`} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {masters.map((m) => (
          <Card key={m.id} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{m.domaine}</span>
                <StatusBadge statut={m.statut} />
              </div>
              <p className="mt-3 font-display text-lg leading-snug">{m.nom}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.etablissement}</p>
              <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
                <div>{m.places} places</div>
                <div>{candidatures.filter((c) => c.masterId === m.id).length} candidatures</div>
                <div className="font-mono text-xs">
                  Score = L1×{m.ponderation.l1}% + L2×{m.ponderation.l2}% + L3×{m.ponderation.l3}%
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
