import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { TablePageSkeleton } from "@/components/shared/PageSkeletons";
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
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/admin/candidats")({
  head: () => ({
    meta: [
      { title: "Candidats inscrits — MasterTN" },
      {
        name: "description",
        content: "Annuaire des candidats inscrits sur la plateforme et nombre de dossiers déposés.",
      },
      { property: "og:title", content: "Candidats inscrits — MasterTN" },
      { property: "og:description", content: "Recherchez un candidat par nom, CIN ou ville." },
    ],
  }),
  pendingComponent: TablePageSkeleton,
  component: Candidats,
});

function Candidats() {
  const { candidats, candidatures } = useStore();
  const [q, setQ] = useState("");

  const filtres = candidats.filter((c) =>
    `${c.prenom} ${c.nom} ${c.cin} ${c.ville}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Candidats" subtitle={`${candidats.length} candidat(s) inscrit(s).`} />

      <div className="mb-4 max-w-md">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher par nom, CIN ou ville…"
        />
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidat</TableHead>
                <TableHead>CIN</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Moyennes L1 / L2 / L3</TableHead>
                <TableHead className="text-right">Dossiers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtres.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="block font-medium">
                      {c.prenom} {c.nom}
                    </span>
                    <span className="block text-xs text-muted-foreground">{c.email}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.cin}</TableCell>
                  <TableCell>{c.ville}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {c.l1.moyenne} / {c.l2.moyenne} / {c.l3.moyenne}
                  </TableCell>
                  <TableCell className="text-right">
                    {candidatures.filter((x) => x.candidatId === c.id).length}
                  </TableCell>
                </TableRow>
              ))}
              {filtres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Aucun candidat ne correspond à cette recherche.
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
