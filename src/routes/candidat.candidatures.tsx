import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/candidat/candidatures")({
  head: () => ({
    meta: [
      { title: "Mes candidatures — MasterTN" },
      {
        name: "description",
        content: "Consultez le statut, le score et la date de chacune de vos candidatures.",
      },
      { property: "og:title", content: "Mes candidatures — MasterTN" },
      { property: "og:description", content: "Statuts, scores et historique de vos dossiers." },
    ],
  }),
  component: MesCandidatures,
});

function MesCandidatures() {
  const { profil, candidatures, getMaster } = useStore();
  const miennes = candidatures.filter((c) => c.candidatId === profil?.id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Mes candidatures"
        subtitle={`${miennes.length} dossier(s) déposé(s).`}
        action={
          <Button asChild variant="outline">
            <Link to="/masters">Nouvelle candidature</Link>
          </Button>
        }
      />

      <Card className="border-border/70 shadow-none">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Master</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière mise à jour</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {miennes.map((c) => {
                const master = getMaster(c.masterId);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-xs">
                      <span className="block truncate font-medium">{master?.nom}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {master?.etablissement}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(c.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="font-medium">{c.score.toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusBadge statut={c.statut} />
                    </TableCell>
                    <TableCell>{new Date(c.majLe).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      {master ? (
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/masters/$masterId" params={{ masterId: master.id }}>
                            Consulter
                          </Link>
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
              {miennes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Vous n'avez encore déposé aucune candidature.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
