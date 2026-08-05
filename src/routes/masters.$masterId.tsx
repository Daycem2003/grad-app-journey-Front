import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, FileText, MapPin, Users } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useStore } from "@/lib/app-store";
import { calculerScore } from "@/lib/mock-data";

export const Route = createFileRoute("/masters/$masterId")({
  head: () => ({
    meta: [
      { title: "Détail du Master — MasterTN" },
      {
        name: "description",
        content:
          "Conditions d'éligibilité, formule de score, documents demandés et dates de candidature du Master.",
      },
      { property: "og:title", content: "Détail du Master — MasterTN" },
      {
        property: "og:description",
        content: "Critères, formule de score et documents demandés pour ce Master.",
      },
    ],
  }),
  component: DetailMaster,
});

function DetailMaster() {
  const { masterId } = Route.useParams();
  const { getMaster, role, profil, postuler } = useStore();
  const master = getMaster(masterId);
  const [open, setOpen] = useState(false);

  if (!master) throw notFound();
  const p = master.ponderation;

  const soumettre = () => {
    postuler(master.id);
    setOpen(false);
    toast.success("Candidature soumise avec succès.");
  };

  return (
    <div className="min-h-screen">
      <PublicNav />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/masters">Masters</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">{master.nom}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight">{master.nom}</h1>
            <p className="mt-2 text-muted-foreground">
              {master.etablissement} — {master.universite}
            </p>
          </div>
          <StatusBadge statut={master.statut} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="leading-relaxed">{master.description}</p>
                <Separator />
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Info label="Université" value={master.universite} />
                  <Info label="Établissement" value={master.etablissement} />
                  <Info label="Ville" value={master.ville} />
                  <Info label="Domaine" value={master.domaine} />
                </dl>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Conditions d'éligibilité</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y text-sm">
                  {master.criteres.map((c) => (
                    <li key={c.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                      <span className="text-muted-foreground">{c.libelle}</span>
                      <span className="font-medium">{c.valeur}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Formule de score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="rounded-md bg-secondary px-4 py-3 font-mono text-sm">
                  Score = L1 × {p.l1}% + L2 × {p.l2}% + L3 × {p.l3}%
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Le score est calculé de façon déterministe à partir des moyennes de Licence
                  déclarées et des pondérations fixées par le coordinateur.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Documents demandés</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {master.documents.map((d) => (
                    <li key={d} className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" /> {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Dates & places</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" /> Début :{" "}
                  {new Date(master.dateDebut).toLocaleDateString("fr-FR")}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" /> Date limite :{" "}
                  {new Date(master.dateFin).toLocaleDateString("fr-FR")}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" /> {master.places} places
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" /> {master.ville}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Candidature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {role === "candidat" && profil ? (
                  <>
                    <p className="text-muted-foreground">
                      Votre score estimé pour ce Master :{" "}
                      <span className="font-semibold text-foreground">
                        {calculerScore(profil, master).toFixed(2)} / 20
                      </span>
                    </p>
                    <Button
                      className="w-full"
                      disabled={master.statut !== "Ouvert"}
                      onClick={() => setOpen(true)}
                    >
                      {master.statut === "Ouvert" ? "Postuler" : "Candidatures fermées"}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">
                      Créez votre profil candidat pour pouvoir postuler.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/profil/creer">Créer mon profil candidat</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmer la candidature</DialogTitle>
            <DialogDescription>
              Vérifiez les informations avant de soumettre votre dossier.
            </DialogDescription>
          </DialogHeader>

          {profil ? (
            <div className="space-y-4 text-sm">
              <section>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Master choisi
                </p>
                <p className="mt-1 font-medium">{master.nom}</p>
                <p className="text-muted-foreground">{master.etablissement}</p>
              </section>
              <Separator />
              <section>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Candidat
                </p>
                <p className="mt-1">
                  {profil.prenom} {profil.nom} — CIN {profil.cin}
                </p>
                <p className="text-muted-foreground">
                  {profil.email} · {profil.ville}
                </p>
              </section>
              <Separator />
              <section>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Documents disponibles
                </p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {[profil.l1.releve, profil.l2.releve, profil.l3.releve, profil.diplome.fichier]
                    .filter(Boolean)
                    .map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                </ul>
              </section>
              <Separator />
              <section>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Critères d'éligibilité
                </p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {master.criteres.map((c) => (
                    <li key={c.id}>
                      • {c.libelle} : {c.valeur}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={soumettre}>Soumettre ma candidature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
