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

  const licences = profil.licences ?? [{
    nom: "",
    universite: profil.diplome.universite,
    a1: profil.l1,
    a2: profil.l2,
    a3: profil.l3,
    moyenneGenerale: "",
    diplome: profil.diplome.fichier,
  }];

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
            {licences.map((licence, licenceIndex) => (
              <div key={`${licence.nom}-${licenceIndex}`}>
                {licenceIndex > 0 ? <Separator className="mb-4" /> : null}
                <p className="font-medium">Licence{licence.nom ? ` en ${licence.nom}` : ""} — {licence.universite || "—"}</p>
                {(["a1", "a2", "a3"] as const).map((cle, yearIndex) => (
                  <div key={cle} className="mt-2">
                    <p className="text-muted-foreground">Licence A{yearIndex + 1} — {licence[cle].anneeUniversitaire || "—"} · moyenne {licence[cle].moyenne || "—"}</p>
                    {licence[cle].releve ? <p className="text-success">✓ {licence[cle].releve}</p> : null}
                  </div>
                ))}
                <p className="mt-2">Moyenne générale : {licence.moyenneGenerale || "—"}</p>
                {licence.diplome ? <p className="text-success">✓ {licence.diplome}</p> : null}
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
            <p className="text-muted-foreground sm:col-span-2">Les diplômes sont listés avec chaque licence.</p>
          </CardContent>
        </Card>

        {profil.aFaitPremiereAnneeMaster && profil.premiereAnneeMaster ? (
          <Card className="border-border/70 shadow-none">
            <CardHeader><CardTitle>Première année de master</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Ligne label="Master" value={profil.premiereAnneeMaster.master} />
              <Ligne label="Institut" value={profil.premiereAnneeMaster.institut} />
              {profil.premiereAnneeMaster.releve ? <p className="text-success">✓ {profil.premiereAnneeMaster.releve}</p> : null}
            </CardContent>
          </Card>
        ) : null}

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
