import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useStore } from "@/lib/app-store";
import { useAuth } from "@/lib/auth-context"; // TODO: adjust import path if auth-context lives elsewhere
import {
  mastersService,
  type CreateEligibilityRulePayload,
  type RuleValueData,
  type TypeLicence,
} from "@/services/masters-service";

export const Route = createFileRoute("/coordinateur/appels")({
  head: () => ({
    meta: [
      { title: "Créer un appel à candidature — MasterTN" },
      { name: "description", content: "Définissez les places, les dates, les critères et la formule de score." },
      { property: "og:title", content: "Créer un appel à candidature — MasterTN" },
      { property: "og:description", content: "Paramétrage complet d'un appel à candidature." },
    ],
  }),
  component: AppelPage,
});

const TYPES_VALEUR = [
  { value: "numerique", label: "Valeur numérique" },
  { value: "seuil", label: "Valeur seuil" },
  { value: "date", label: "Date" },
  { value: "intervalle_dates", label: "Intervalle de dates" },
  { value: "nationalite", label: "Nationalité" },
  { value: "licence", label: "Nom d'une licence" },
] as const;

type TypeValeur = (typeof TYPES_VALEUR)[number]["value"];

const OPERATEURS = [">=", ">", "<=", "<", "="] as const;
type Operateur = (typeof OPERATEURS)[number];


interface CritereDraft {
  id: string;
  libelle: string;
  typeValeur: TypeValeur;
  // Numérique
  numValeur: string;
  // Seuil
  seuilOperateur: Operateur;
  seuilValeur: string;
  // Date
  dateValeur: string;
  // Intervalle de dates
  intervalleDebut: string;
  intervalleFin: string;
  // Nationalité — valeurs retournées telles quelles par GET /candidates/nationalities
  nationalites: string[];
  // Nom d'une licence — on stocke les `pubkey` des TypeLicence, pas les intitulés
  licences: string[];
}

function critereVide(id: string): CritereDraft {
  return {
    id,
    libelle: "",
    typeValeur: "numerique",
    numValeur: "",
    seuilOperateur: ">=",
    seuilValeur: "",
    dateValeur: "",
    intervalleDebut: "",
    intervalleFin: "",
    nationalites: [],
    licences: [],
  };
}

/** Valide un critère selon son type. Retourne un message d'erreur, ou null si valide. */
function validerCritere(c: CritereDraft): string | null {
  if (!c.libelle.trim()) return "Le libellé du critère est obligatoire.";

  switch (c.typeValeur) {
    case "numerique": {
      if (c.numValeur.trim() === "") return "Veuillez saisir une valeur numérique.";
      if (Number.isNaN(Number(c.numValeur))) return "La valeur doit être un nombre valide.";
      return null;
    }
    case "seuil": {
      if (c.seuilValeur.trim() === "") return "Veuillez saisir une valeur seuil.";
      if (Number.isNaN(Number(c.seuilValeur))) return "La valeur seuil doit être un nombre valide.";
      if (!OPERATEURS.includes(c.seuilOperateur)) return "Veuillez choisir un opérateur de comparaison.";
      return null;
    }
    case "date": {
      if (!c.dateValeur) return "Veuillez sélectionner une date.";
      if (Number.isNaN(new Date(c.dateValeur).getTime())) return "La date saisie n'est pas valide.";
      return null;
    }
    case "intervalle_dates": {
      if (!c.intervalleDebut || !c.intervalleFin) return "Veuillez sélectionner une date de début et une date de fin.";
      if (new Date(c.intervalleDebut).getTime() > new Date(c.intervalleFin).getTime()) {
        return "La date de début ne peut pas être postérieure à la date de fin.";
      }
      return null;
    }
    case "nationalite": {
      if (c.nationalites.length === 0) return "Veuillez sélectionner au moins une nationalité.";
      return null;
    }
    case "licence": {
      if (c.licences.length === 0) return "Veuillez sélectionner au moins une licence.";
      return null;
    }
    default:
      return "Type de critère inconnu.";
  }
}

/**
 * Traduit un CritereDraft du formulaire vers le `rule_value` attendu par le
 * backend (RuleValueSerializer / RuleValueData), en respectant les enums
 * ValueType / Operator et les opérateurs valides par type définis dans
 * value_types.py.
 *
 * - nationalite : `values` = intitulés renvoyés par GET /candidates/nationalities.
 * - licence     : `values` = `pubkey` des TypeLicence (pas les intitulés), afin
 *   que le backend puisse résoudre la relation sans dépendre d'un texte libre.
 */
function critereVersRuleValue(c: CritereDraft): RuleValueData {
  switch (c.typeValeur) {
    case "numerique":
      return { value_type: "NUMERIC", operator: "=", value: Number(c.numValeur) };
    case "seuil":
      return { value_type: "NUMERIC", operator: c.seuilOperateur, value: Number(c.seuilValeur) };
    case "date":
      return { value_type: "DATE", operator: "=", value: c.dateValeur };
    case "intervalle_dates":
      return {
        value_type: "DATE_RANGE",
        min_value: c.intervalleDebut,
        max_value: c.intervalleFin,
        min_inclusive: true,
        max_inclusive: true,
      };
    case "nationalite":
      return { value_type: "ENUM", operator: "IN", values: c.nationalites };
    case "licence":
      return { value_type: "ENUM", operator: "IN", values: c.licences };
  }
}

function critereVersRule(c: CritereDraft): CreateEligibilityRulePayload {
  return {
    criterion: c.libelle, // TODO: le backend pourrait à terme vouloir une clé/enum fixe plutôt qu'un texte libre
    obligatoire: true, // TODO: pas de bascule "optionnel" dans le formulaire pour l'instant
    rule_value: critereVersRuleValue(c),
  };
}

function AppelPage() {
  const { masters, creerMaster } = useStore();
  const { accessToken } = useAuth();
  const premier = masters[0];
const [nom, setNom] = useState("");
const [description, setDescription] = useState(""); // TODO: toujours pas de champ description côté backend
const [domaine, setDomaine] = useState("");
const [discipline, setDiscipline] = useState("");
const [specialite, setSpecialite] = useState("");
  const [places, setPlaces] = useState("30");
  const [debut, setDebut] = useState("2026-07-01");
  const [fin, setFin] = useState("2026-08-31");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [criteres, setCriteres] = useState<CritereDraft[]>([
    { ...critereVide("c1"), libelle: "Moyenne minimale", typeValeur: "seuil", seuilOperateur: ">=", seuilValeur: "11" },
  ]);

  const [p, setP] = useState({ l1: 30, l2: 30, l3: 40 });
  const total = p.l1 + p.l2 + p.l3;

  // Données de référence fournies par le backend (remplacent les tableaux
  // hardcodés NATIONALITES / LICENCES).
  const [nationalitesRef, setNationalitesRef] = useState<string[]>([]);
  const [licencesRef, setLicencesRef] = useState<TypeLicence[]>([]);
  const [refDataLoading, setRefDataLoading] = useState(true);
  const [refDataError, setRefDataError] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    setRefDataLoading(true);
    setRefDataError(null);

    Promise.all([mastersService.getNationalities(), mastersService.getTypeLicences()])
      .then(([nationalites, licences]) => {
        if (annule) return;
        setNationalitesRef(nationalites);
        setLicencesRef(licences);
      })
      .catch((err) => {
        if (annule) return;
        const message =
          err instanceof Error ? err.message : "Impossible de charger les nationalités et licences.";
        setRefDataError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!annule) setRefDataLoading(false);
      });

    return () => {
      annule = true;
    };
  }, []);

  const majCritere = (id: string, patch: Partial<CritereDraft>) => {
    setCriteres((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const toggleNationalite = (id: string, nat: string) => {
    setCriteres((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const deja = c.nationalites.includes(nat);
        return { ...c, nationalites: deja ? c.nationalites.filter((n) => n !== nat) : [...c.nationalites, nat] };
      }),
    );
  };

  // pubkey du TypeLicence, pas son intitulé
  const toggleLicence = (id: string, licencePubkey: string) => {
    setCriteres((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const deja = c.licences.includes(licencePubkey);
        return {
          ...c,
          licences: deja ? c.licences.filter((l) => l !== licencePubkey) : [...c.licences, licencePubkey],
        };
      }),
    );
  };

  const publier = async () => {
    if (!nom) {
      toast.error("Le nom du Master est obligatoire.");
      return;
    }
    if (!domaine) {
      toast.error("Le domaine est obligatoire.");
      return;
    }
    if (!discipline) {
      toast.error("La discipline est obligatoire.");
      return;
    }
    if (!specialite) {
      toast.error("La spécialité est obligatoire.");
      return;
    } 
    if (total !== 100) {
      toast.error("La somme des pondérations doit être égale à 100%.");
      return;
    }

    for (const c of criteres) {
      const erreur = validerCritere(c);
      if (erreur) {
        toast.error(`Critère « ${c.libelle || "sans libellé"} » : ${erreur}`);
        return;
      }
    }

    if (!accessToken) {
      toast.error("Vous devez être connecté pour publier un appel.");
      return;
    }

    setIsSubmitting(true);
    try {
      await creerMaster(
        {
          master: {
            nom,
            universite: premier?.universite ?? "Université de Tunis El Manar",
            ville: premier?.ville ?? "Tunis",
            domaine,
            discipline,
            nombre_places: Number(places) || 0,
            date_debut: debut,
            date_fin: fin,
          },
          requiredDocuments: ["RELEVE_NOTES_L1_L2_L3", "DIPLOME_LICENCE"], // TODO: confirmer les valeurs exactes attendues par le backend
          scoreCriteria: [
            { critere: "moyenne_l1", poids: p.l1 / 100 }, // TODO: confirmer si `poids` attend une fraction (0-1) ou un pourcentage (0-100)
            { critere: "moyenne_l2", poids: p.l2 / 100 },
            { critere: "moyenne_l3", poids: p.l3 / 100 },
          ],
          eligibilityRules: criteres.map(critereVersRule),
        },
        accessToken,
      );
      toast.success("Appel à candidature publié.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la publication de l'appel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Appel à candidature" subtitle="Créez et paramétrez un nouvel appel." />
      <div className="space-y-6">
        <Card className="border-border/70 shadow-none">
          <CardHeader><CardTitle>Informations du Master</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Master</Label>
              <Input className="mt-1.5" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom du Master" />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Domaine</Label>
              <Input className="mt-1.5" value={domaine} onChange={(e) => setDomaine(e.target.value)} placeholder="ex : Informatique" />
            </div>
            <div>
              <Label>Discipline</Label>
              <Input className="mt-1.5" value={discipline} onChange={(e) => setDiscipline(e.target.value)} placeholder="ex : Génie Logiciel" />
            </div>
            <div>
              <Label>Spécialité</Label>
              <Input className="mt-1.5" value={specialite} onChange={(e) => setSpecialite(e.target.value)} placeholder="ex : Génie Logiciel et Systèmes d'Information" />
            </div>
            <div>
              <Label>Nombre de places</Label>
              <Input className="mt-1.5" value={places} onChange={(e) => setPlaces(e.target.value)} />
            </div>
            <div />
            <div>
              <Label>Date de début</Label>
              <Input className="mt-1.5" type="date" value={debut} onChange={(e) => setDebut(e.target.value)} />
            </div>
            <div>
              <Label>Date de fin</Label>
              <Input className="mt-1.5" type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader><CardTitle>Critères d'éligibilité</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {refDataError && (
              <p className="text-xs text-destructive">
                {refDataError} — les critères de type « Nationalité » et « Nom d'une licence » sont indisponibles pour le moment.
              </p>
            )}
            {criteres.map((c) => {
              const erreur = validerCritere(c);
              return (
                <div key={c.id} className="space-y-3 rounded-md border border-border/70 p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <div>
                      <Label className="text-xs text-muted-foreground">Libellé</Label>
                      <Input
                        className="mt-1"
                        value={c.libelle}
                        placeholder="Libellé du critère"
                        onChange={(e) => majCritere(c.id, { libelle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Type de valeur</Label>
                      <select
                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={c.typeValeur}
                        onChange={(e) => majCritere(c.id, { typeValeur: e.target.value as TypeValeur })}
                      >
                        {TYPES_VALEUR.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end justify-end sm:justify-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Supprimer"
                        onClick={() => setCriteres((prev) => prev.filter((x) => x.id !== c.id))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Composant de saisie dynamique selon le type de valeur */}
                  {c.typeValeur === "numerique" && (
                    <div className="max-w-xs">
                      <Label className="text-xs text-muted-foreground">Valeur numérique</Label>
                      <Input
                        className="mt-1"
                        type="number"
                        step="any"
                        value={c.numValeur}
                        placeholder="ex : 3"
                        onChange={(e) => majCritere(c.id, { numValeur: e.target.value })}
                      />
                    </div>
                  )}

                  {c.typeValeur === "seuil" && (
                    <div className="flex max-w-sm gap-2">
                      <div className="w-28">
                        <Label className="text-xs text-muted-foreground">Opérateur</Label>
                        <select
                          className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={c.seuilOperateur}
                          onChange={(e) => majCritere(c.id, { seuilOperateur: e.target.value as Operateur })}
                        >
                          {OPERATEURS.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Valeur</Label>
                        <Input
                          className="mt-1"
                          type="number"
                          step="any"
                          value={c.seuilValeur}
                          placeholder="ex : 12"
                          onChange={(e) => majCritere(c.id, { seuilValeur: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {c.typeValeur === "date" && (
                    <div className="max-w-xs">
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <Input
                        className="mt-1"
                        type="date"
                        value={c.dateValeur}
                        onChange={(e) => majCritere(c.id, { dateValeur: e.target.value })}
                      />
                    </div>
                  )}

                  {c.typeValeur === "intervalle_dates" && (
                    <div className="flex max-w-sm gap-2">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Date de début</Label>
                        <Input
                          className="mt-1"
                          type="date"
                          value={c.intervalleDebut}
                          onChange={(e) => majCritere(c.id, { intervalleDebut: e.target.value })}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Date de fin</Label>
                        <Input
                          className="mt-1"
                          type="date"
                          value={c.intervalleFin}
                          onChange={(e) => majCritere(c.id, { intervalleFin: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {c.typeValeur === "nationalite" && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Nationalité(s)</Label>
                      {refDataLoading ? (
                        <p className="mt-1.5 text-xs text-muted-foreground">Chargement des nationalités…</p>
                      ) : (
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {nationalitesRef.map((nat) => {
                            const selectionnee = c.nationalites.includes(nat);
                            return (
                              <button
                                key={nat}
                                type="button"
                                onClick={() => toggleNationalite(c.id, nat)}
                                className={
                                  selectionnee
                                    ? "rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                                    : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary"
                                }
                              >
                                {nat}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {c.typeValeur === "licence" && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Licence(s)</Label>
                      {refDataLoading ? (
                        <p className="mt-1.5 text-xs text-muted-foreground">Chargement des licences…</p>
                      ) : (
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {licencesRef.map((licence) => {
                            const selectionnee = c.licences.includes(licence.pubkey);
                            return (
                              <button
                                key={licence.pubkey}
                                type="button"
                                onClick={() => toggleLicence(c.id, licence.pubkey)}
                                className={
                                  selectionnee
                                    ? "rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                                    : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary"
                                }
                              >
                                {licence.intitule}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {erreur && <p className="text-xs text-destructive">{erreur}</p>}
                </div>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCriteres((prev) => [...prev, critereVide(`c-${Date.now()}`)])}
            >
              <Plus className="size-4" /> Ajouter un critère
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader><CardTitle>Formule de calcul du score</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {(["l1", "l2", "l3"] as const).map((k, i) => (
              <div key={k}>
                <Label>Moyenne L{i + 1} → {p[k]}%</Label>
                <Slider
                  className="mt-3"
                  value={[p[k]]}
                  max={100}
                  step={5}
                  onValueChange={(v) => setP((prev) => ({ ...prev, [k]: v[0] ?? 0 }))}
                />
              </div>
            ))}
            <p className={total === 100 ? "text-sm text-success" : "text-sm text-destructive"}>
              Total : {total}%
            </p>
            <p className="rounded-md bg-secondary px-4 py-3 font-mono text-sm">
              Score = L1 × {p.l1}% + L2 × {p.l2}% + L3 × {p.l3}%
            </p>
          </CardContent>
        </Card>

        <Button onClick={publier} disabled={isSubmitting}>
          {isSubmitting ? "Publication en cours..." : "Publier l'appel à candidature"}
        </Button>
      </div>
    </div>
  );
}