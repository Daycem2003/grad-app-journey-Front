import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BotMessageSquare, CalendarClock, FileCheck2, ListChecks } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/accueil")({
  head: () => ({
    meta: [
      { title: "Accueil — MasterTN, candidatures aux Masters en Tunisie" },
      {
        name: "description",
        content:
          "Découvrez les Masters ouverts en Tunisie, les critères d'éligibilité et créez votre profil candidat en quelques minutes.",
      },
      { property: "og:title", content: "Accueil — MasterTN" },
      {
        property: "og:description",
        content: "Consultez les Masters ouverts et préparez votre candidature.",
      },
    ],
  }),
  component: Accueil,
});

const ETAPES = [
  { icon: ListChecks, titre: "Consultez", texte: "Parcourez les Masters, leurs places et leurs critères." },
  { icon: FileCheck2, titre: "Constituez", texte: "Créez votre profil et déposez vos relevés et diplômes." },
  { icon: CalendarClock, titre: "Candidatez", texte: "Postulez en un clic pendant la période d'ouverture." },
  { icon: BotMessageSquare, titre: "Suivez", texte: "Recevez les notifications et suivez le statut du dossier." },
];

function Accueil() {
  const { masters, periode } = useStore();
  const ouverts = masters.filter((m) => m.statut === "Ouvert");
  const places = masters.reduce((t, m) => t + m.places, 0);

  return (
    <div className="min-h-screen">
      <PublicNav />

      <section className="border-b border-border/70 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
            Session universitaire 2026
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            Une seule plateforme pour candidater aux Masters des universités tunisiennes
          </h1>
          <p className="mt-5 max-w-2xl text-primary-foreground/75">
            Comparez les formations, vérifiez votre éligibilité, déposez un dossier unique et
            suivez son instruction jusqu'aux résultats.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/masters">
                Consulter les Masters <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-white/10"
            >
              <Link to="/profil/creer">Créer mon profil candidat</Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { k: "Masters", v: masters.length },
              { k: "Ouverts", v: ouverts.length },
              { k: "Places", v: places },
              { k: "Clôture", v: new Date(periode.fin).toLocaleDateString("fr-FR") },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-[11px] uppercase tracking-widest text-primary-foreground/55">
                  {s.k}
                </dt>
                <dd className="mt-1 font-display text-2xl">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-2xl">Comment ça marche</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((e, i) => (
            <Card key={e.titre} className="border-border/70 shadow-none">
              <CardContent className="p-5">
                <span className="grid size-10 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <e.icon className="size-5" />
                </span>
                <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                  Étape {i + 1}
                </p>
                <p className="mt-1 font-display text-lg">{e.titre}</p>
                <p className="mt-2 text-sm text-muted-foreground">{e.texte}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-10 border-border/70 bg-secondary shadow-none">
          <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-6 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="font-display text-xl">Une question sur votre dossier ?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                L'assistant conversationnel répond sur les critères, les documents et les dates.
              </p>
            </div>
            <Button asChild>
              <Link to="/assistant">Ouvrir l'assistant</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
