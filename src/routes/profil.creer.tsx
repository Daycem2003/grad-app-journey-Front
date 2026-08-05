import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { FileUpload, MultiFileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/app-store";
import { UNIVERSITES, VILLES_TUNISIENNES } from "@/lib/mock-data";
import type { AnneeLicence, Candidat, Redoublement } from "@/lib/types";

export const Route = createFileRoute("/profil/creer")({
  head: () => ({
    meta: [
      { title: "Créer mon profil candidat — MasterTN" },
      {
        name: "description",
        content:
          "Renseignez vos informations personnelles, vos moyennes de Licence et vos justificatifs pour candidater aux Masters.",
      },
      { property: "og:title", content: "Créer mon profil candidat — MasterTN" },
      {
        property: "og:description",
        content: "Formulaire guidé en quatre étapes pour constituer votre dossier.",
      },
    ],
  }),
  component: CreationProfil,
});

const ETAPES = ["Informations personnelles", "Parcours de Licence", "Diplôme & redoublement", "Récapitulatif"];
const ANNEES_REDOUBLEES: Redoublement["annee"][] = ["Licence 1", "Licence 2", "Licence 3"];

const anneeVide: AnneeLicence = { anneeUniversitaire: "", moyenne: "", releve: null };

function CreationProfil() {
  const { creerProfil } = useStore();
  const navigate = useNavigate();
  const [etape, setEtape] = useState(0);
  const [erreurs, setErreurs] = useState<string[]>([]);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    cin: "",
    email: "",
    telephone: "",
    ville: "",
    anneeNaissance: "",
    l1: { ...anneeVide },
    l2: { ...anneeVide },
    l3: { ...anneeVide },
    diplomeAnnee: "",
    diplomeUniversite: "",
    diplomeFichier: null as string | null,
    aRedouble: "non",
    redoublements: [] as Redoublement[],
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setAnnee = (cle: "l1" | "l2" | "l3", patch: Partial<AnneeLicence>) =>
    setForm((f) => ({ ...f, [cle]: { ...f[cle], ...patch } }));

  const toggleRedoublement = (annee: Redoublement["annee"], checked: boolean) =>
    setForm((f) => ({
      ...f,
      redoublements: checked
        ? [...f.redoublements, { annee, justificatifs: [] }]
        : f.redoublements.filter((r) => r.annee !== annee),
    }));

  const valider = () => {
    const e: string[] = [];
    if (!form.nom || !form.prenom) e.push("Le nom et le prénom sont obligatoires.");
    if (!/^\d{8}$/.test(form.cin)) e.push("Le CIN doit contenir 8 chiffres.");
    if (!form.email.includes("@")) e.push("L'adresse email est invalide.");
    if (!form.telephone) e.push("Le numéro de téléphone est obligatoire.");
    if (!form.ville) e.push("La ville de résidence est obligatoire.");
    if (!form.anneeNaissance) e.push("L'année de naissance est obligatoire.");
    (["l1", "l2", "l3"] as const).forEach((k, i) => {
      const a = form[k];
      if (!a.moyenne) e.push(`La moyenne de Licence ${i + 1} est obligatoire.`);
      if (!a.releve) e.push(`Le relevé de notes de Licence ${i + 1} est manquant.`);
    });
    if (!form.diplomeFichier) e.push("Le diplôme de Licence (PDF) est manquant.");
    if (!form.diplomeUniversite) e.push("L'université d'obtention est obligatoire.");
    form.redoublements.forEach((r) => {
      if (r.justificatifs.length === 0)
        e.push(`Aucun justificatif fourni pour le redoublement de ${r.annee}.`);
    });
    setErreurs(e);
    return e.length === 0;
  };

  const soumettre = () => {
    if (!valider()) {
      toast.error("Le formulaire contient des erreurs.");
      return;
    }
    const candidat: Candidat = {
      id: `me-${Date.now()}`,
      nom: form.nom,
      prenom: form.prenom,
      cin: form.cin,
      email: form.email,
      telephone: form.telephone,
      ville: form.ville,
      anneeNaissance: form.anneeNaissance,
      l1: form.l1,
      l2: form.l2,
      l3: form.l3,
      diplome: {
        annee: form.diplomeAnnee,
        universite: form.diplomeUniversite,
        fichier: form.diplomeFichier,
      },
      aRedouble: form.aRedouble === "oui",
      redoublements: form.aRedouble === "oui" ? form.redoublements : [],
    };
    creerProfil(candidat);
    toast.success("Profil candidat créé avec succès.");
    navigate({ to: "/candidat" });
  };

  return (
    <div className="min-h-screen">
      <PublicNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl">Créer mon profil candidat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Étape {etape + 1} sur {ETAPES.length} — {ETAPES[etape]}
        </p>
        <Progress value={((etape + 1) / ETAPES.length) * 100} className="mt-4" />

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {ETAPES.map((e, i) => (
            <span
              key={e}
              className={`rounded-full border px-3 py-1 ${
                i === etape
                  ? "border-primary bg-primary text-primary-foreground"
                  : i < etape
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i < etape ? <Check className="mr-1 inline size-3" /> : null}
              {e}
            </span>
          ))}
        </div>

        <Card className="mt-6 border-border/70 shadow-none">
          <CardContent className="space-y-6 p-6">
            {etape === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Champ label="Nom" value={form.nom} onChange={(v) => set("nom", v)} />
                <Champ label="Prénom" value={form.prenom} onChange={(v) => set("prenom", v)} />
                <Champ label="CIN" value={form.cin} onChange={(v) => set("cin", v)} placeholder="8 chiffres" />
                <Champ label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" />
                <Champ
                  label="Numéro de téléphone"
                  value={form.telephone}
                  onChange={(v) => set("telephone", v)}
                  placeholder="+216 …"
                />
                <div>
                  <Label>Ville</Label>
                  <Select value={form.ville} onValueChange={(v) => set("ville", v)}>
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {VILLES_TUNISIENNES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Champ
                  label="Année de naissance"
                  value={form.anneeNaissance}
                  onChange={(v) => set("anneeNaissance", v)}
                  placeholder="1999"
                />
              </div>
            ) : null}

            {etape === 1 ? (
              <div className="space-y-6">
                {(["l1", "l2", "l3"] as const).map((cle, i) => (
                  <section key={cle} className="rounded-lg border border-border/70 p-4">
                    <h2 className="font-display text-lg">Licence {i + 1}</h2>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <Champ
                        label="Année universitaire"
                        value={form[cle].anneeUniversitaire}
                        onChange={(v) => setAnnee(cle, { anneeUniversitaire: v })}
                        placeholder={`${2020 + i}/${2021 + i}`}
                      />
                      <Champ
                        label="Moyenne générale"
                        value={form[cle].moyenne}
                        onChange={(v) => setAnnee(cle, { moyenne: v })}
                        placeholder="12.50"
                      />
                    </div>
                    <div className="mt-4">
                      <FileUpload
                        label={`Joindre le relevé de notes L${i + 1} (PDF)`}
                        value={form[cle].releve}
                        placeholderName={`Releve_L${i + 1}.pdf`}
                        onChange={(name) => setAnnee(cle, { releve: name })}
                      />
                    </div>
                  </section>
                ))}
              </div>
            ) : null}

            {etape === 2 ? (
              <div className="space-y-6">
                <section className="rounded-lg border border-border/70 p-4">
                  <h2 className="font-display text-lg">Diplôme de Licence</h2>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Champ
                      label="Année d'obtention"
                      value={form.diplomeAnnee}
                      onChange={(v) => set("diplomeAnnee", v)}
                      placeholder="2023"
                    />
                    <div>
                      <Label>Université d'obtention</Label>
                      <Select
                        value={form.diplomeUniversite}
                        onValueChange={(v) => set("diplomeUniversite", v)}
                      >
                        <SelectTrigger className="mt-1.5 w-full">
                          <SelectValue placeholder="Sélectionner une université" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIVERSITES.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <FileUpload
                      label="Joindre le diplôme de Licence (PDF)"
                      value={form.diplomeFichier}
                      placeholderName="Diplome_Licence.pdf"
                      onChange={(name) => set("diplomeFichier", name)}
                    />
                  </div>
                </section>

                <section className="rounded-lg border border-border/70 p-4">
                  <h2 className="font-display text-lg">Redoublement</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Avez-vous redoublé une année ?
                  </p>
                  <RadioGroup
                    className="mt-3 flex gap-6"
                    value={form.aRedouble}
                    onValueChange={(v) => set("aRedouble", v)}
                  >
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="oui" /> Oui
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="non" /> Non
                    </Label>
                  </RadioGroup>

                  {form.aRedouble === "oui" ? (
                    <div className="mt-5 space-y-5">
                      <p className="text-sm font-medium">
                        Quelle(s) année(s) avez-vous redoublée(s) ?
                      </p>
                      <div className="flex flex-wrap gap-5">
                        {ANNEES_REDOUBLEES.map((a) => (
                          <Label key={a} className="flex items-center gap-2 font-normal">
                            <Checkbox
                              checked={form.redoublements.some((r) => r.annee === a)}
                              onCheckedChange={(c) => toggleRedoublement(a, c === true)}
                            />
                            {a}
                          </Label>
                        ))}
                      </div>

                      {form.redoublements.map((r) => (
                        <div key={r.annee} className="rounded-md border border-border/70 p-3">
                          <p className="text-sm font-medium">{r.annee}</p>
                          <div className="mt-2">
                            <MultiFileUpload
                              label="Ajouter un autre document"
                              values={r.justificatifs}
                              onChange={(vals) =>
                                setForm((f) => ({
                                  ...f,
                                  redoublements: f.redoublements.map((x) =>
                                    x.annee === r.annee ? { ...x, justificatifs: vals } : x,
                                  ),
                                }))
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              </div>
            ) : null}

            {etape === 3 ? (
              <div className="space-y-5 text-sm">
                <Recap titre="Informations personnelles">
                  <p>
                    {form.prenom} {form.nom} — CIN {form.cin || "—"}
                  </p>
                  <p className="text-muted-foreground">
                    {form.email || "—"} · {form.telephone || "—"} · {form.ville || "—"} ·{" "}
                    {form.anneeNaissance || "—"}
                  </p>
                </Recap>
                <Separator />
                <Recap titre="Informations académiques">
                  {(["l1", "l2", "l3"] as const).map((cle, i) => (
                    <p key={cle}>
                      Licence {i + 1} — {form[cle].anneeUniversitaire || "—"} · moyenne{" "}
                      {form[cle].moyenne || "—"}
                    </p>
                  ))}
                </Recap>
                <Separator />
                <Recap titre="Documents">
                  {[form.l1.releve, form.l2.releve, form.l3.releve, form.diplomeFichier]
                    .filter(Boolean)
                    .map((f) => (
                      <p key={f} className="text-success">
                        ✓ {f}
                      </p>
                    ))}
                </Recap>
                <Separator />
                <Recap titre="Redoublements">
                  {form.aRedouble === "oui" && form.redoublements.length > 0 ? (
                    form.redoublements.map((r) => (
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
                </Recap>

                {erreurs.length > 0 ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/8 p-4">
                    <p className="font-medium text-destructive">Erreurs à corriger</p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-destructive">
                      {erreurs.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={etape === 0}
            onClick={() => setEtape((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="size-4" /> Précédent
          </Button>
          {etape < ETAPES.length - 1 ? (
            <Button onClick={() => setEtape((s) => s + 1)}>
              Suivant <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={soumettre}>Créer mon profil candidat</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Champ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        className="mt-1.5"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Recap({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {titre}
      </p>
      <div className="mt-1.5 space-y-1">{children}</div>
    </section>
  );
}
