import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { TablePageSkeleton } from "@/components/shared/PageSkeletons";
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
import { mastersService, type Master } from "@/services/masters-service";
import { applicationsService, type ApplicationDTO } from "@/services/applications-service";

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
  pendingComponent: TablePageSkeleton,
  component: Listes,
});

function Listes() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [selectedMasterPubkey, setSelectedMasterPubkey] = useState<string>("");
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadMasters() {
      setMastersLoading(true);
      try {
        const data = await mastersService.listMasters();
        if (!isCancelled) {
          setMasters(data);
          if (data.length > 0) {
            setSelectedMasterPubkey(data[0]?.pubkey || "");
          }
        }
      } finally {
        if (!isCancelled) {
          setMastersLoading(false);
        }
      }
    }

    void loadMasters();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedMasterPubkey) {
      setApplications([]);
      return;
    }

    let isCancelled = false;

    async function loadApplications() {
      setAppsLoading(true);
      try {
        const data = await applicationsService.listByMaster(selectedMasterPubkey);
        if (!isCancelled) {
          setApplications(data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          toast.error("Erreur lors du chargement des candidatures du Master.");
        }
      } finally {
        if (!isCancelled) {
          setAppsLoading(false);
        }
      }
    }

    void loadApplications();

    return () => {
      isCancelled = true;
    };
  }, [selectedMasterPubkey]);

  const master = masters.find((m) => m.pubkey === selectedMasterPubkey);
  const places = master?.nombre_places ?? (master as any)?.places ?? 0;

  // Candidats avec score ou admis
  const classement = [...applications].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const exporterCSV = () => {
    if (!master || classement.length === 0) {
      toast.error("Aucune donnée à exporter pour ce Master.");
      return;
    }

    const headers = ["Rang", "Nom", "Prenom", "CIN", "Email", "Score", "Decision"];
    const rows = classement.map((c, i) => {
      const admis = i < places;
      const nom = c.candidate_profile?.nom || "";
      const prenom = c.candidate_profile?.prenom || "";
      const cin = c.candidate_profile?.cin || "";
      const email = c.candidate_profile?.email || "";
      const score = c.score != null ? c.score.toFixed(2) : "0.00";
      const decision = admis ? "Principale" : "Liste d'attente";
      return [i + 1, nom, prenom, cin, email, score, decision].map((v) => `"${v}"`).join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `liste_admis_${master.nom.replace(/[\s/]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Liste exportée en CSV avec succès.");
  };

  if (mastersLoading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Listes finales"
        subtitle="Classement des candidats par ordre de score décroissant."
        action={
          <Button variant="outline" onClick={exporterCSV} disabled={classement.length === 0}>
            <Download className="size-4" /> Exporter CSV
          </Button>
        }
      />

      <div className="mb-4 max-w-md">
        <Select value={selectedMasterPubkey} onValueChange={setSelectedMasterPubkey}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un Master" />
          </SelectTrigger>
          <SelectContent>
            {masters.map((m) => (
              <SelectItem key={m.pubkey} value={m.pubkey}>
                {m.nom} ({m.nombre_places ?? (m as any).places ?? 0} places)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="overflow-x-auto p-0">
          {appsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Chargement du classement…</span>
            </div>
          ) : (
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
                  const cand = c.candidate_profile;
                  const admis = i < places;
                  return (
                    <TableRow key={c.pubkey}>
                      <TableCell className="font-medium">{c.rang ?? i + 1}</TableCell>
                      <TableCell>
                        {cand ? `${cand.prenom} ${cand.nom}` : "Candidat"}
                        {cand?.email && (
                          <span className="block text-xs text-muted-foreground">{cand.email}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{cand?.cin || "—"}</TableCell>
                      <TableCell className="font-medium">
                        {c.score != null ? Number(c.score).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        <span
                          className={
                            admis
                              ? "inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {admis ? "Principale" : "Liste d'attente"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {classement.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      {masters.length === 0
                        ? "Aucun Master disponible."
                        : "Aucune candidature enregistrée pour ce Master."}
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

