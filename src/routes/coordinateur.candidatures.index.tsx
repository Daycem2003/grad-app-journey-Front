import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/coordinateur/candidatures/")({
  head: () => ({
    meta: [
      { title: "Candidatures reçues — Espace coordinateur | MasterTN" },
      { name: "description", content: "Filtrez et instruisez les candidatures déposées sur vos Masters." },
      { property: "og:title", content: "Candidatures reçues — MasterTN" },
      { property: "og:description", content: "Tableau des dossiers avec scores et statuts." },
    ],
  }),
  component: ListeCandidatures,
});

const TOUS = "Tous";

function ListeCandidatures() {
  const { candidatures, getCandidat, getMaster, masters } = useStore();
  const [q, setQ] = useState("");
  const [master, setMaster] = useState(TOUS);
  const [statut, setStatut] = useState(TOUS);
  const [scoreMin, setScoreMin] = useState("");

  const lignes = candidatures.filter((c) => {
    const cand = getCandidat(c.candidatId);
    const nom = cand ? `${cand.prenom} ${cand.nom} ${cand.cin}`.toLowerCase() : "";
    return (
      nom.includes(q.toLowerCase()) &&
      (master === TOUS || c.masterId === master) &&
      (statut === TOUS || c.statut === statut) &&
      (!scoreMin || c.score >= Number(scoreMin))
    );
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Candidatures" subtitle={`${lignes.length} dossier(s).`} />
      <Card className="mb-6 border-border/70 shadow-none">
        <CardContent className="grid gap-4 p-5 md:grid-cols-4">
          <Input placeholder="Candidat ou CIN…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={master} onValueChange={setMaster}>
            <SelectTrigger><SelectValue placeholder="Master" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TOUS}>Tous les Masters</SelectItem>
              {masters.map((m) => (<SelectItem key={m.id} value={m.id}>{m.nom}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={statut} onValueChange={setStatut}>
            <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              {[TOUS, "Soumise", "À réviser", "Approuvée", "Rejetée"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Score minimum" value={scoreMin} onChange={(e) => setScoreMin(e.target.value)} />
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidat</TableHead>
                <TableHead>CIN</TableHead>
                <TableHead>Master</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lignes.map((c) => {
                const cand = getCandidat(c.candidatId);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{cand ? `${cand.prenom} ${cand.nom}` : "—"}</TableCell>
                    <TableCell>{cand?.cin}</TableCell>
                    <TableCell className="max-w-[16rem] truncate">{getMaster(c.masterId)?.nom}</TableCell>
                    <TableCell>{new Date(c.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="font-medium">{c.score.toFixed(2)}</TableCell>
                    <TableCell><StatusBadge statut={c.statut} /></TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/coordinateur/candidatures/$candidatureId" params={{ candidatureId: c.id }}>
                          Consulter
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
