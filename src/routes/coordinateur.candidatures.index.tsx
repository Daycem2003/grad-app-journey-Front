import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type CandidateDetailDTO,
  coordinatorService,
} from "@/services/coordinator-service";

export const Route = createFileRoute("/coordinateur/candidatures/")({
  head: () => ({
    meta: [
      { title: "Candidatures reçues — Espace coordinateur | MasterTN" },
      {
        name: "description",
        content: "Consultez et instruisez les dossiers de candidatures déposés.",
      },
      { property: "og:title", content: "Candidatures reçues — MasterTN" },
      {
        property: "og:description",
        content: "Tableau des dossiers de candidature avec pièces justificatives.",
      },
    ],
  }),
  component: ListeCandidatures,
});

const TOUS = "TOUS";

function ListeCandidatures() {
  const [candidates, setCandidates] = useState<CandidateDetailDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState(TOUS);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await coordinatorService.listCandidates({
          statut: statut !== TOUS ? statut : undefined,
          q: q.trim() ? q.trim() : undefined,
        });
        if (!isCancelled) {
          setCandidates(data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : "Erreur lors du chargement des candidatures.";
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      void load();
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [q, statut]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Candidatures"
        subtitle={`${candidates.length} dossier(s) trouvé(s).`}
      />

      <Card className="mb-6 border-border/70 shadow-none">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, CIN, email, ville…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statut} onValueChange={setStatut}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TOUS}>Tous les statuts</SelectItem>
              <SelectItem value="EN_ATTENTE">En attente</SelectItem>
              <SelectItem value="VALIDE">Validé</SelectItem>
              <SelectItem value="REJETE">Rejeté</SelectItem>
            </SelectContent>
          </Select>

          {statut !== TOUS || q.trim() ? (
            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setStatut(TOUS);
              }}
            >
              Réinitialiser les filtres
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Chargement des candidatures…</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-destructive">
              {error}
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aucune candidature ne correspond aux critères sélectionnés.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>CIN</TableHead>
                  <TableHead>Email / Téléphone</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c) => (
                  <TableRow key={c.pubkey}>
                    <TableCell className="font-medium">
                      {c.prenom} {c.nom}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{c.cin}</TableCell>
                    <TableCell className="text-sm">
                      <div>{c.email}</div>
                      <div className="text-xs text-muted-foreground">{c.telephone}</div>
                    </TableCell>
                    <TableCell className="text-sm">{c.ville}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge statut={c.statut} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          to="/coordinateur/candidatures/$candidatureId"
                          params={{ candidatureId: c.pubkey }}
                        >
                          Consulter
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
