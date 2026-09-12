import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
import { applicationsService, type ApplicationDTO } from "@/services/applications-service";

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
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    applicationsService
      .getMyApplications()
      .then((data) => {
        if (active) setApplications(data);
      })
      .catch((err) => {
        console.error("Erreur chargement candidatures:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Mes candidatures"
        subtitle={`${applications.length} dossier(s) déposé(s).`}
        action={
          <Button asChild variant="outline">
            <Link to="/masters">Nouvelle candidature</Link>
          </Button>
        }
      />

      <Card className="border-border/70 shadow-none">
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Chargement de vos candidatures…</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Master</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Rang</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((c) => {
                  const masterKey = c.master?.pubkey || (c as any).masterId;
                  return (
                    <TableRow key={c.pubkey}>
                      <TableCell className="max-w-xs">
                        <span className="block truncate font-medium">{c.master?.nom || "Master"}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {c.master?.universite || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        <span className="rounded bg-muted px-2 py-0.5">{c.niveau}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.date_soumission ? new Date(c.date_soumission).toLocaleDateString("fr-FR") : "—"}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {c.score !== null && c.score !== undefined ? Number(c.score).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {c.rang ? (
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-primary font-semibold">
                            #{c.rang}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge statut={c.statut} />
                      </TableCell>
                      <TableCell className="text-right">
                        {masterKey ? (
                          <Button asChild size="sm" variant="ghost">
                            <Link to="/masters/$masterId" params={{ masterId: String(masterKey) }}>
                              Consulter
                            </Link>
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Vous n'avez encore déposé aucune candidature.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
