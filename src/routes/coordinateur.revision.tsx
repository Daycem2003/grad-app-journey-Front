import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Eye, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type CandidateDetailDTO,
  coordinatorService,
} from "@/services/coordinator-service";

export const Route = createFileRoute("/coordinateur/revision")({
  head: () => ({
    meta: [
      { title: "Candidatures en attente de révision — MasterTN" },
      {
        name: "description",
        content: "Dossiers de candidature soumis en attente d'instruction.",
      },
      { property: "og:title", content: "Candidatures à réviser — MasterTN" },
      {
        property: "og:description",
        content: "Consultez les dossiers de candidatures en attente de révision.",
      },
    ],
  }),
  component: Revision,
});

function Revision() {
  const [candidates, setCandidates] = useState<CandidateDetailDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await coordinatorService.listCandidates({
          statut: "EN_ATTENTE",
        });
        if (!isCancelled) {
          setCandidates(data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : "Erreur lors du chargement des dossiers.";
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Candidatures en attente"
        subtitle={`${candidates.length} dossier(s) en attente d'instruction.`}
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement des dossiers en attente…</span>
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="p-6 text-center text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : candidates.length === 0 ? (
        <Card className="border-border/70 shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-foreground">Aucune candidature en attente</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tous les dossiers soumis ont été traités.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <Card key={c.pubkey} className="border-border/70 shadow-none transition-colors hover:border-border">
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {c.prenom} {c.nom}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    CIN : <span className="font-mono">{c.cin}</span> • Ville : {c.ville} • {c.email}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <StatusBadge statut={c.statut} />
                    {c.created_at ? (
                      <span className="text-xs text-muted-foreground">
                        Soumis le {new Date(c.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    ) : null}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link
                    to="/coordinateur/candidatures/$candidatureId"
                    params={{ candidatureId: c.pubkey }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Ouvrir le dossier</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
