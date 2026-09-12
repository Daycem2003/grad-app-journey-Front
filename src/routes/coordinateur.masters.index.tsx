import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Eye,
  GraduationCap,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type Master, mastersService } from "@/services/masters-service";

export const Route = createFileRoute("/coordinateur/masters/")({
  head: () => ({
    meta: [
      { title: "Mes Masters — Espace coordinateur | MasterTN" },
      {
        name: "description",
        content: "Liste des Masters dont vous assurez la coordination.",
      },
      { property: "og:title", content: "Mes Masters — MasterTN" },
      {
        property: "og:description",
        content: "Places, périodes, critères et dossiers de vos Masters.",
      },
    ],
  }),
  component: MesMasters,
});

function formatDate(val?: string): string {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return val;
  }
}

function MesMasters() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await mastersService.listMasters();
        if (!isCancelled) {
          setMasters(data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Impossible de charger les Masters."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredMasters = masters.filter((m) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      m.nom.toLowerCase().includes(q) ||
      m.domaine.toLowerCase().includes(q) ||
      (m.discipline && m.discipline.toLowerCase().includes(q)) ||
      (m.specialite && m.specialite.toLowerCase().includes(q)) ||
      (m.universite && m.universite.toLowerCase().includes(q)) ||
      (m.ville && m.ville.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Mes Masters"
        subtitle={`${masters.length} formation(s) enregistrée(s).`}
        action={
          <Button asChild>
            <Link to="/coordinateur/appels" className="inline-flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Créer un appel</span>
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par intitulé, domaine, spécialité, établissement…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement des Masters…</span>
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="p-6 text-center text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : filteredMasters.length === 0 ? (
        <Card className="border-border/70 shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Layers className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-foreground">Aucun Master trouvé</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Aucun résultat pour cette recherche." : "Vous n'avez pas encore créé de Master."}
            </p>
            {!search && (
              <Button asChild className="mt-4" size="sm">
                <Link to="/coordinateur/appels">Créer un premier Master</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMasters.map((m) => {
            const places = m.nombre_places ?? m.nombrePlaces ?? 0;
            const debut = m.date_debut ?? m.dateDebut;
            const fin = m.date_fin ?? m.dateFin;

            return (
              <Card
                key={m.pubkey}
                className="flex flex-col justify-between border-border/70 shadow-none transition-shadow hover:shadow-sm"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded bg-muted/60 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {m.domaine || "Formation"}
                    </span>
                    <StatusBadge statut={m.statut} />
                  </div>

                  <h3 className="mt-3 font-display text-lg font-bold leading-snug text-foreground">
                    {m.nom}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {m.universite} — {m.ville}
                    </span>
                  </div>

                  {m.specialite ? (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Spécialité : {m.specialite}</span>
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/50 pt-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Places</span>
                      <p className="font-semibold text-foreground">{places > 0 ? places : "Non spécifié"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Période</span>
                      <p className="font-semibold text-foreground">
                        {debut ? formatDate(debut) : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <div className="border-t border-border/50 bg-muted/10 p-3 px-5">
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link
                      to="/coordinateur/masters/$masterId"
                      params={{ masterId: m.pubkey }}
                      className="inline-flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Consulter les détails</span>
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
