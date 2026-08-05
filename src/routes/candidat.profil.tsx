import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/candidat/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil candidat — MasterTN" },
      {
        name: "description",
        content: "Vos informations personnelles, académiques, votre diplôme et vos justificatifs.",
      },
      { property: "og:title", content: "Mon profil candidat — MasterTN" },
      { property: "og:description", content: "Récapitulatif complet de votre dossier candidat." },
    ],
  }),
  component: MonProfil,
});

function MonProfil() {
  const { profil } = useStore();

  if (!profil) {
    return <p className="text-muted-foreground">Aucun profil candidat n'a encore été créé.</p>;
  }

  const annees = [
    { titre: "Licence 1", data: profil.l1 },
    { titre: "Licence 2", data: profil.l2 },
    { titre: "Licence 3", data: profil.l3 },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Mon profil" subtitle="Informations transmises avec chaque candidature." />

      <div className="space-y-6">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <Ligne label="Nom" value={profil.nom} />
            <Ligne label="Prénom" value={profil.prenom} />
            <Ligne label="CIN" value={profil.cin} />
            <Ligne label="Email" value={profil.email} />
            <Ligne label="Téléphone" value={profil.telephone} />
            <Ligne label="Ville" value={profil.ville} />
            <Ligne label="Année de naissance" value={profil.anneeNaissance} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle>Parcours académique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {annees.map((a, i) => (
              <div key={a.titre}>
                {i > 0 ? <Separator className="mb-4" /> : null}
                <p className="font-medium">{a.titre}</p>
                <p className="text-muted-foreground">
                  {a.data.anneeUniversitaire || "—"} · moyenne {a.data.moyenne || "—"}
                </p>
                {a.data.releve ? <p className="text-success">✓ {a.data.releve}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle>Diplôme de Licence</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <Ligne label="Année d'obtention" value={profil.diplome.annee || "—"} />
            <Ligne label="Université" value={profil.diplome.universite || "—"} />
            {profil.diplome.fichier ? (
              <p className="text-success sm:col-span-2">✓ {profil.diplome.fichier}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle>Redoublements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {profil.aRedouble && profil.redoublements.length > 0 ? (
              profil.redoublements.map((r) => (
                <div key={r.annee}>
                  <p className="font-medium">{r.annee}</p>
                  {r.justificatifs.map((j) => (
                    <p key={j} className="text-success">
                      ✓ {j}
                    </p>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Aucun redoublement déclaré.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Ligne({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
