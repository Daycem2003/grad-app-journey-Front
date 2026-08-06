import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/admin/listes")({
  head: () => ({
    meta: [
      { title: "Listes finales d'admission — MasterTN" },
      {
        name: "description",
        content: "Classement des candidats admis par Master, selon le score final calculé.",
      },
      { property: "og:title", content: "Listes finales d'admission — MasterTN" },
      { property: "og:description", content: "Consultez et exportez les listes d'admis." },
    ],
  }),
  component: Listes,
});

function Listes() {
  const { masters, candidatures, getCandidat } = useStore();
  const [masterId, setMasterId] = useState(masters[0]?.id ?? "");
  const master = masters.find((m) => m.id === masterId);

  const classement = candidatures
    .filter((c) => c.masterId === masterId && c.statut === "Approuvée")
    .sort((a, b) => b.score - a.score);

  const places = master?.places ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Listes finales"
        subtitle="Classement des candidats approuvés par ordre de score décroissant."
        action={
          <Button variant="outline" onClick={() => toast.success("Export CSV simulé (mock).")}>
            <Download className="size-4" /> Exporter
          </Button>
        }
      />

      <div className="mb-4 max-w-md">
        <Select value={masterId} onValueChange={setMasterId}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un Master" />
          </SelectTrigger>
          <SelectContent>
            {masters.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rang</TableHead>
                <TableHead>Candidat</TableHead>
                <TableHead>CIN</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Décision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classement.map((c, i) => {
                const cand = getCandidat(c.candidatId);
                const admis = i < places;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>{cand ? `${cand.prenom} ${cand.nom}` : c.candidatId}</TableCell>
                    <TableCell className="font-mono text-xs">{cand?.cin}</TableCell>
                    <TableCell className="font-medium">{c.score.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm">
                      {admis ? "Principale" : "Liste d'attente"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {classement.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Aucun candidat approuvé pour ce Master.
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
