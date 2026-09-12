import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mastersService, type Master } from "@/services/masters-service";
import { applicationsService, type ApplicationDTO } from "@/services/applications-service";

export const Route = createFileRoute("/admin/statistiques")({
  head: () => ({
    meta: [
      { title: "Statistiques de la campagne — MasterTN" },
      {
        name: "description",
        content: "Répartition des candidatures par statut, par domaine et par université.",
      },
      { property: "og:title", content: "Statistiques de la campagne — MasterTN" },
      { property: "og:description", content: "Analyse des candidatures aux Masters tunisiens." },
    ],
  }),
  component: Statistiques,
});

const STATUT_COLORS = ["#1e3a5f", "#c8a45c", "#3f7d58", "#a33b3b"];

const STATUS_LABELS: Record<string, string> = {
  SOUMISE: "Soumise",
  EN_COURS: "En cours",
  ACCEPTEE: "Acceptée",
  REJETEE: "Rejetée",
  A_REVISER: "À réviser",
  VALIDE: "Validée",
};

function Statistiques() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [mList, aList] = await Promise.all([
          mastersService.listMasters().catch(() => []),
          applicationsService.listAllApplications().catch(() => []),
        ]);

        if (!isCancelled) {
          setMasters(mList);
          setApplications(aList);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Statistiques"
          subtitle="Indicateurs clés de la campagne de candidatures."
        />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement des statistiques…</span>
        </div>
      </div>
    );
  }

  const statusMap = ["SOUMISE", "EN_COURS", "ACCEPTEE", "REJETEE"];
  const parStatut = statusMap.map((s) => ({
    name: STATUS_LABELS[s] || s,
    value: applications.filter((c) => c.statut?.toUpperCase() === s).length,
  }));

  const parDomaine = Object.entries(
    applications.reduce<Record<string, number>>((acc, c) => {
      const d = c.master?.domaine || masters.find((m) => m.pubkey === c.master?.pubkey)?.domaine || "Autre";
      acc[d] = (acc[d] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const parUniversite = Object.entries(
    masters.reduce<Record<string, number>>((acc, m) => {
      const univ = m.universite || "Non spécifiée";
      const places = m.nombre_places ?? (m as any).places ?? 0;
      acc[univ] = (acc[univ] ?? 0) + places;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Statistiques"
        subtitle="Indicateurs clés de la campagne de candidatures."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle>Candidatures par statut</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={parStatut} dataKey="value" nameKey="name" outerRadius={90} label>
                  {parStatut.map((_, i) => (
                    <Cell key={i} fill={STATUT_COLORS[i % STATUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle>Candidatures par domaine</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {parDomaine.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Aucune candidature enregistrée pour générer la répartition par domaine.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parDomaine}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} height={50} />
                  <YAxis allowDecimals={false} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Places offertes par université</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {parUniversite.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Aucun Master enregistré.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parUniversite} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} fontSize={11} />
                  <YAxis type="category" dataKey="name" width={160} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#c8a45c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

