import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { TablePageSkeleton } from "@/components/shared/PageSkeletons";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  applicationsService,
  type ApplicationDTO,
} from "@/services/applications-service";

export const Route = createFileRoute("/admin/candidats")({
  head: () => ({
    meta: [
      { title: "Candidats inscrits — MasterTN" },
      {
        name: "description",
        content: "Annuaire des candidatures aux Masters et suivi des scores et classements.",
      },
      { property: "og:title", content: "Candidats inscrits — MasterTN" },
      { property: "og:description", content: "Recherchez un candidat par nom, CIN ou Master." },
    ],
  }),
  pendingComponent: TablePageSkeleton,
  component: Candidats,
});

function Candidats() {
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const data = await applicationsService.listAllApplications({
          q: q.trim() ? q.trim() : undefined,
        });
        if (!isCancelled) {
          setApplications(data);
        }
      } catch {
        if (!isCancelled) {
          setApplications([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      void loadData();
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Candidats & Candidatures"
        subtitle={loading ? "Chargement…" : `${applications.length} candidature(s) enregistrée(s).`}
      />

      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par nom, CIN ou Master…"
            className="pl-9"
          />
        </div>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Chargement des candidatures…</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>CIN</TableHead>
                  <TableHead>Master visé</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Rang</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((c, idx) => {
                  const cand = c.candidate_profile;
                  return (
                    <TableRow key={c.pubkey}>
                      <TableCell>
                        <span className="block font-medium">
                          {cand ? `${cand.prenom} ${cand.nom}` : "Candidat"}
                        </span>
                        {cand?.email && (
                          <span className="block text-xs text-muted-foreground">{cand.email}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{cand?.cin || "—"}</TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">{c.master?.nom || "—"}</span>
                        {c.master?.universite && (
                          <span className="block text-xs text-muted-foreground">{c.master.universite}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {c.score != null ? Number(c.score).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {c.rang != null ? `#${c.rang}` : `#${idx + 1}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge statut={c.statut} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      {q ? "Aucune candidature ne correspond à cette recherche." : "Aucune candidature enregistrée."}
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

