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
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";

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

function Statistiques() {
  const { masters, candidatures } = useStore();

  const parStatut = ["Soumise", "À réviser", "Approuvée", "Rejetée"].map((s) => ({
    name: s,
    value: candidatures.filter((c) => c.statut === s).length,
  }));

  const parDomaine = Object.entries(
    candidatures.reduce<Record<string, number>>((acc, c) => {
      const d = masters.find((m) => m.id === c.masterId)?.domaine ?? "Autre";
      acc[d] = (acc[d] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const parUniversite = Object.entries(
    masters.reduce<Record<string, number>>((acc, m) => {
      acc[m.universite] = (acc[m.universite] ?? 0) + m.places;
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parDomaine}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} height={50} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Places offertes par université</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parUniversite} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} fontSize={11} />
                <YAxis type="category" dataKey="name" width={160} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#c8a45c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
