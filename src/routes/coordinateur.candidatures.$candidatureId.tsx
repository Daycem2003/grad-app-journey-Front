import { createFileRoute, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/coordinateur/candidatures/$candidatureId")({
  head: () => ({
    meta: [
      { title: "Dossier de candidature — MasterTN" },
      { name: "description", content: "Détail du dossier, score calculé et décision du coordinateur." },
      { property: "og:title", content: "Dossier de candidature — MasterTN" },
      { property: "og:description", content: "Instruisez le dossier : approuver, réviser ou rejeter." },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { candidatureId } = useParams({ from: "/coordinateur/candidatures/$candidatureId" });
  const { candidatures, getCandidat, getMaster, changerStatut } = useStore();
  const c = candidatures.find((x) => x.id === candidatureId);
  if (!c) return <p className="text-muted-foreground">Candidature introuvable.</p>;
  const cand = getCandidat(c.candidatId);
  const master = getMaster(c.masterId);

  const decider = (statut: "Approuvée" | "À réviser" | "Rejetée") => {
    changerStatut(c.id, statut);
    toast.success(`Dossier marqué « ${statut} ». Le candidat a été notifié.`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={cand ? `${cand.prenom} ${cand.nom}` : "Dossier"}
        subtitle={master?.nom ?? ""}
        action={<StatusBadge statut={c.statut} />}
      />
      <div className="space-y-6">
        <Card className="border-border/70 shadow-none">
          <CardHeader><CardTitle>Parcours académique</CardTitle></CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
            <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Moyenne L1</p><p className="mt-0.5 font-medium">{cand?.l1.moyenne}</p></div>
            <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Moyenne L2</p><p className="mt-0.5 font-medium">{cand?.l2.moyenne}</p></div>
            <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Moyenne L3</p><p className="mt-0.5 font-medium">{cand?.l3.moyenne}</p></div>
            <div className="sm:col-span-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Score calculé</p>
              <p className="mt-0.5 font-display text-2xl">{c.score.toFixed(2)}</p>
              {master ? (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  L1×{master.ponderation.l1}% + L2×{master.ponderation.l2}% + L3×{master.ponderation.l3}%
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader><CardTitle>Décision</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => decider("Approuvée")}>Approuver</Button>
            <Button variant="outline" onClick={() => decider("À réviser")}>Demander une révision</Button>
            <Button variant="destructive" onClick={() => decider("Rejetée")}>Rejeter</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
