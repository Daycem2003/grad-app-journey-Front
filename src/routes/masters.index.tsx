import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Search, Users } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/masters/")({
  head: () => ({
    meta: [
      { title: "Masters disponibles — MasterTN" },
      {
        name: "description",
        content:
          "Recherchez parmi les Masters des universités tunisiennes : université, ville, domaine, places et période de candidature.",
      },
      { property: "og:title", content: "Masters disponibles — MasterTN" },
      {
        property: "og:description",
        content: "Filtrez les Masters par université, ville, domaine et statut de candidature.",
      },
    ],
  }),
  component: MastersPage,
});

const TOUS = "Tous";

function MastersPage() {
  const { masters } = useStore();
  const [q, setQ] = useState("");
  const [universite, setUniversite] = useState(TOUS);
  const [ville, setVille] = useState(TOUS);
  const [domaine, setDomaine] = useState(TOUS);
  const [statut, setStatut] = useState(TOUS);
  const [placesMin, setPlacesMin] = useState(0);

  const options = useMemo(
    () => ({
      universites: [TOUS, ...new Set(masters.map((m) => m.universite))],
      villes: [TOUS, ...new Set(masters.map((m) => m.ville))],
      domaines: [TOUS, ...new Set(masters.map((m) => m.domaine))],
    }),
    [masters],
  );

  const resultats = masters.filter((m) => {
    const texte = `${m.nom} ${m.etablissement} ${m.universite} ${m.ville} ${m.domaine}`.toLowerCase();
    return (
      texte.includes(q.toLowerCase()) &&
      (universite === TOUS || m.universite === universite) &&
      (ville === TOUS || m.ville === ville) &&
      (domaine === TOUS || m.domaine === domaine) &&
      (statut === TOUS || m.statut === statut) &&
      m.places >= placesMin
    );
  });

  return (
    <div className="min-h-screen">
      <PublicNav />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl">Masters disponibles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {resultats.length} formation(s) correspondant à votre recherche.
        </p>

        <Card className="mt-6 border-border/70 shadow-none">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <Label htmlFor="q">Recherche</Label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Nom du Master, établissement, ville…"
                  className="pl-9"
                />
              </div>
            </div>

            <FiltreSelect label="Université" value={universite} onChange={setUniversite} options={options.universites} />
            <FiltreSelect label="Ville" value={ville} onChange={setVille} options={options.villes} />
            <FiltreSelect label="Domaine" value={domaine} onChange={setDomaine} options={options.domaines} />
            <FiltreSelect
              label="Statut"
              value={statut}
              onChange={setStatut}
              options={[TOUS, "Ouvert", "Fermé", "À venir"]}
            />
            <div className="md:col-span-2">
              <Label>Nombre de places minimum : {placesMin}</Label>
              <Slider
                className="mt-4"
                value={[placesMin]}
                max={60}
                step={5}
                onValueChange={(v) => setPlacesMin(v[0] ?? 0)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resultats.map((m) => (
            <Card key={m.id} className="flex flex-col border-border/70 shadow-none">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {m.domaine}
                  </span>
                  <StatusBadge statut={m.statut} />
                </div>
                <h2 className="mt-3 font-display text-lg leading-snug">{m.nom}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{m.universite}</p>
                <p className="text-sm text-muted-foreground">{m.etablissement}</p>
                <p className="mt-3 line-clamp-2 text-sm">{m.descriptionCourte}</p>

                <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" /> {m.ville}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 shrink-0" /> {m.places} places
                  </div>
                  <div className="text-xs">
                    Du {new Date(m.dateDebut).toLocaleDateString("fr-FR")} au{" "}
                    {new Date(m.dateFin).toLocaleDateString("fr-FR")}
                  </div>
                </dl>

                <Button asChild variant="outline" className="mt-5 w-full">
                  <Link to="/masters/$masterId" params={{ masterId: m.id }}>
                    Voir les détails
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {resultats.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Aucun Master ne correspond à ces filtres.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FiltreSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1.5 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
