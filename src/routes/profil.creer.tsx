import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { FileUpload, MultiFileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { mastersService, type Master } from "@/services/masters-service";
import { referenceDataService, type ReferenceDataItem } from "@/services/reference-data-service";
import { typeLicenceService, type TypeLicenceRef } from "@/services/type-licence-service";
import { candidateProfileService } from "@/services/candidate-profile-service";
import { academicRecordService } from "@/services/academic-record-service";
import { uploadDocument, type SlotType } from "@/services/documents-service";

const renommerFichier = (file: File, nouveauNom: string): File =>
  new File([file], nouveauNom, { type: file.type, lastModified: file.lastModified });

// Normalise une chaîne : retrait des accents, espaces et caractères spéciaux.
const enleverAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normaliser = (s: string) => enleverAccents(s).trim().replace(/[^a-zA-Z0-9]/g, "");

// Extrait l'extension d'origine du fichier (ex: ".pdf") pour ne jamais la perdre.
const extension = (fileName: string) => {
  const m = /\.[a-zA-Z0-9]+$/.exec(fileName);
  return m ? m[0].toLowerCase() : "";
};

// Génère un nom de fichier lisible à partir du nom/prénom du candidat et
// de segments (ex: "DupontJean_licence_A1_Releve.pdf").
const nomFichier = (nom: string, prenom: string, ...segments: string[]): string =>
  [normaliser(nom), normaliser(prenom), ...segments].join("_");

// Renomme le fichier DÈS sa sélection : ainsi le nom affiché dans le
// composant FileUpload et dans le récapitulatif est déjà le nom final
// (ex: "DupontJean_licence_A1_Releve.pdf"), et non le nom d'origine
// du fichier choisi par l'utilisateur (souvent "document.pdf").
const nommerFichier = (nom: string, prenom: string, file: File, ...segments: string[]): File =>
  renommerFichier(file, nomFichier(nom, prenom, ...segments) + extension(file.name));

// Code court d'une année de redoublement ("Licence 1" -> "A1", etc.)
const codeAnneeRedoublement = (annee: RedoublementForm["annee"]): string =>
  ({ "Licence 1": "A1", "Licence 2": "A2", "Licence 3": "A3" })[annee];

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

// ASSOMPTION : FileUpload/MultiFileUpload retournent désormais l'objet File
// réel sélectionné par l'utilisateur (nécessaire pour l'upload multipart),
// et non plus seulement un nom de fichier généré. Le nom "généré" reste
// utilisé comme suggestion d'affichage / nom envoyé au backend.

interface AnneeLicenceForm {
  anneeUniversitaire: string;
  moyenne: string;
  releve: File | null;
}

interface LicenceObtenueForm {
  nom: string; // intitulé affiché
  typeLicencePubkey: string; // pubkey réel du TypeLicence backend
  universite: string;
  a1: AnneeLicenceForm;
  a2: AnneeLicenceForm;
  a3: AnneeLicenceForm;
  moyenneGenerale: string;
  diplome: File | null;
}

interface RedoublementForm {
  annee: "Licence 1" | "Licence 2" | "Licence 3";
  justificatifs: File[];
}

const ETAPES = ["Informations personnelles", "Parcours de Licence", "Diplôme & redoublement", "Récapitulatif"];
const ANNEES_REDOUBLEES: RedoublementForm["annee"][] = ["Licence 1", "Licence 2", "Licence 3"];
const ANNEES_UNIVERSITAIRES = ["2018/2019", "2019/2020", "2020/2021", "2021/2022", "2022/2023", "2023/2024", "2024/2025", "2025/2026"];

const anneeVide: AnneeLicenceForm = { anneeUniversitaire: "", moyenne: "", releve: null };
const licenceVide = (typeLicence: TypeLicenceRef): LicenceObtenueForm => ({
  nom: typeLicence.intitule,
  typeLicencePubkey: typeLicence.pubkey,
  universite: "",
  a1: { ...anneeVide },
  a2: { ...anneeVide },
  a3: { ...anneeVide },
  moyenneGenerale: "",
  diplome: null,
});

function CreationProfil() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(0);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [soumissionEnCours, setSoumissionEnCours] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    cin: "",
    email: "",
    telephone: "",
    ville: "",
    nationalite: "",
    anneeNaissance: "",
    licences: [] as LicenceObtenueForm[],
    aRedouble: "non",
    redoublements: [] as RedoublementForm[],
    aFaitPremiereAnneeMaster: "non",
    premiereAnneeMaster: {
      master: "",
      institut: "",
      anneeUniversitaire: "",
      moyenne: "",
      releve: null as File | null,
    },
  });

  const [villes, setVilles] = useState<ReferenceDataItem[]>([]);
  const [universites, setUniversites] = useState<ReferenceDataItem[]>([]);
  const [nationalites, setNationalites] = useState<ReferenceDataItem[]>([]);
  const [typesLicence, setTypesLicence] = useState<TypeLicenceRef[]>([]);
  const [mastersList, setMastersList] = useState<Master[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    setDataLoading(true);
    setDataError(null);

    // IMPORTANT : on utilise Promise.allSettled (et non Promise.all).
    // Avec Promise.all, si UN SEUL des appels rejette (ex: l'endpoint
    // masters indisponible), le .then() global n'est jamais exécuté et
    // AUCUNE liste n'est peuplée — même celles dont l'appel a réussi
    // avec un 200. C'était la cause du bug : villes/universités/licences
    // restaient vides malgré des réponses HTTP 200, dès qu'un des 4
    // appels échouait.
    // Avec allSettled, chaque résultat est traité indépendamment : les
    // listes qui ont réussi s'affichent, seules celles en échec sont
    // signalées.
    Promise.allSettled([
      referenceDataService.getCities(),
      referenceDataService.getUniversities(),
      referenceDataService.getNationalities(),
      typeLicenceService.list(),
      mastersService.listMasters(),
    ]).then((resultats) => {
      if (annule) return;

      const [villesRes, universitesRes, nationalitesRes, typesLicenceRes, mastersRes] = resultats;
      const echecs: string[] = [];

      if (villesRes.status === "fulfilled") {
        setVilles(villesRes.value);
      } else {
        echecs.push("villes");
      }

      if (universitesRes.status === "fulfilled") {
        setUniversites(universitesRes.value);
      } else {
        echecs.push("universités");
      }

      if (nationalitesRes.status === "fulfilled") {
        setNationalites(nationalitesRes.value);
      } else {
        echecs.push("nationalités");
      }

      if (typesLicenceRes.status === "fulfilled") {
        setTypesLicence(typesLicenceRes.value);
      } else {
        echecs.push("licences");
      }

      if (mastersRes.status === "fulfilled") {
        setMastersList(mastersRes.value);
      } else {
        echecs.push("masters");
      }

      if (echecs.length > 0) {
        const message = `Certaines listes n'ont pas pu être chargées (${echecs.join(", ")}).`;
        setDataError(message);
        toast.error(message);
      }

      setDataLoading(false);
    });

    return () => {
      annule = true;
    };
  }, []);

  // Instituts de réalisation de la première année de master, déduits des
  // Masters réellement récupérés (pas de champ "établissement" dédié côté
  // backend — on utilise l'université du Master).
  const instituts = Array.from(
    new Set(mastersList.map((master) => master.universite).filter((v): v is string => Boolean(v))),
  );

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setLicence = (index: number, patch: Partial<LicenceObtenueForm>) =>
    setForm((f) => ({ ...f, licences: f.licences.map((licence, i) => (i === index ? { ...licence, ...patch } : licence)) }));
  const setLicenceAnnee = (index: number, cle: "a1" | "a2" | "a3", patch: Partial<AnneeLicenceForm>) =>
    setForm((f) => ({
      ...f,
      licences: f.licences.map((licence, i) => (i === index ? { ...licence, [cle]: { ...licence[cle], ...patch } } : licence)),
    }));
  const toggleLicence = (typeLicence: TypeLicenceRef, checked: boolean) =>
    setForm((f) => ({
      ...f,
      licences: checked
        ? [...f.licences, licenceVide(typeLicence)]
        : f.licences.filter((licence) => licence.typeLicencePubkey !== typeLicence.pubkey),
    }));

  const toggleRedoublement = (annee: RedoublementForm["annee"], checked: boolean) =>
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
    if (!form.nationalite) e.push("La nationalité est obligatoire.");
    if (!form.anneeNaissance) e.push("L'année de naissance est obligatoire.");
    if (form.licences.length === 0) e.push("Sélectionnez au moins une licence obtenue.");
    form.licences.forEach((licence) => {
      if (!licence.universite) e.push(`L'université de la licence ${licence.nom} est obligatoire.`);
      (["a1", "a2", "a3"] as const).forEach((cle, i) => {
        if (!licence[cle].anneeUniversitaire) e.push(`L'année de ${licence.nom} A${i + 1} est obligatoire.`);
        if (!licence[cle].moyenne) e.push(`La moyenne de ${licence.nom} A${i + 1} est obligatoire.`);
        if (!licence[cle].releve) e.push(`Le relevé de ${licence.nom} A${i + 1} est manquant.`);
      });
      if (!licence.moyenneGenerale) e.push(`La moyenne générale de ${licence.nom} est obligatoire.`);
      if (!licence.diplome) e.push(`Le diplôme de ${licence.nom} est manquant.`);
    });
    if (
      form.aFaitPremiereAnneeMaster === "oui" &&
      (!form.premiereAnneeMaster.master ||
        !form.premiereAnneeMaster.institut ||
        !form.premiereAnneeMaster.anneeUniversitaire ||
        !form.premiereAnneeMaster.moyenne ||
        !form.premiereAnneeMaster.releve)
    )
      e.push("Les informations et le relevé de la première année de master sont obligatoires.");
    form.redoublements.forEach((r) => {
      if (r.justificatifs.length === 0) e.push(`Aucun justificatif fourni pour le redoublement de ${r.annee}.`);
    });
    setErreurs(e);
    return e.length === 0;
  };

  const soumettre = async () => {
    if (!valider()) {
      toast.error("Le formulaire contient des erreurs.");
      return;
    }

    setSoumissionEnCours(true);
    try {
      // 1. Création du profil candidat de base
      const profilCree = await candidateProfileService.createProfile({
        nom: form.nom,
        prenom: form.prenom,
        cin: form.cin,
        email: form.email,
        telephone: form.telephone,
        ville: form.ville,
        nationalite: form.nationalite,
        annee_naissance: Number(form.anneeNaissance),
      });

      const onboardingToken = profilCree.onboarding_token;

      // 2. Licences : 3 années + 1 diplôme par licence sélectionnée
      for (const licence of form.licences) {
        const annees: Array<["a1" | "a2" | "a3", number]> = [
          ["a1", 1],
          ["a2", 2],
          ["a3", 3],
        ];
        for (const [cle, annee] of annees) {
          await academicRecordService.addLicenceYear(
            {
              type_licence_pubkey: licence.typeLicencePubkey,
              annee,
              annee_universitaire: licence[cle].anneeUniversitaire,
              moyenne: Number(licence[cle].moyenne),
            },
            onboardingToken,
          );
        }
        await academicRecordService.setDiplome(
          {
            type_licence_pubkey: licence.typeLicencePubkey,
            annee_obtention: licence.a3.anneeUniversitaire,
            universite: licence.universite,
          },
          onboardingToken,
        );
      }

      // 3. Première année de master (optionnelle)
      if (form.aFaitPremiereAnneeMaster === "oui") {
        const masterChoisi = mastersList.find((m) => m.nom === form.premiereAnneeMaster.master);
        await academicRecordService.setMaster1Year(
          {
            annee_universitaire: form.premiereAnneeMaster.anneeUniversitaire,
            moyenne: Number(form.premiereAnneeMaster.moyenne),
            etablissement: form.premiereAnneeMaster.institut,
            master_pubkey: masterChoisi?.pubkey ?? null,
          },
          onboardingToken,
        );
      }

      // 4. Redoublement (optionnel)
      if (form.aRedouble === "oui") {
        await academicRecordService.setRedoublement(
          {
            a_redouble: true,
            annees: form.redoublements.map((r) => r.annee),
          },
          onboardingToken,
        );
      }



      // 5. Upload des documents joints
      const uploads: Promise<unknown>[] = [];
      const anneesCodes: Array<"A1" | "A2" | "A3"> = ["A1", "A2", "A3"];

      form.licences.forEach((licence) => {
        (["a1", "a2", "a3"] as const).forEach((cle, i) => {
          const releve = licence[cle].releve;
          if (releve) {
            const nom = nomFichier(form.nom, form.prenom, "licence", `A${i + 1}`, "Releve");
            uploads.push(
              uploadDocument(
                renommerFichier(releve, nom + extension(releve.name)),
                {
                  slotType: "RELEVE_LICENCE" as SlotType,
                  domaine: licence.nom,
                  anneeLicence: anneesCodes[i],
                },
                onboardingToken,
              ),
            );
          }
        });
        if (licence.diplome) {
          const nom = nomFichier(form.nom, form.prenom, `licence${licence.nom.replace(/[^a-zA-Z0-9]/g, "")}`, "Diplome");
          uploads.push(
            uploadDocument(
              renommerFichier(licence.diplome, nom + extension(licence.diplome.name)),
              {
                slotType: "DIPLOME_LICENCE" as SlotType,
                domaine: licence.nom,
              },
              onboardingToken,
            ),
          );
        }
      });

      if (form.aFaitPremiereAnneeMaster === "oui" && form.premiereAnneeMaster.releve) {
        const nom = nomFichier(form.nom, form.prenom, "masterM1", "Releve");
        uploads.push(
          uploadDocument(
            renommerFichier(form.premiereAnneeMaster.releve, nom + extension(form.premiereAnneeMaster.releve.name)),
            {
              slotType: "RELEVE_M1" as SlotType,
            },
            onboardingToken,
          ),
        );
      }

      if (form.aRedouble === "oui") {
        form.redoublements.forEach((r) => {
          r.justificatifs.forEach((file, index) => {
            const nom = nomFichier(form.nom, form.prenom, "licence", codeAnneeRedoublement(r.annee), "Redoublement", String(index + 1));
            uploads.push(
              uploadDocument(
                renommerFichier(file, nom + extension(file.name)),
                {
                  slotType: "JUSTIFICATIF_REDOUBLEMENT" as SlotType,
                  redoublementAnnee: r.annee,
                  justificatifIndex: index,
                },
                onboardingToken,
              ),
            );
          });
        });
      }

      const resultats = await Promise.allSettled(uploads);
      const echecs = resultats.filter((r) => r.status === "rejected");

      if (echecs.length > 0) {
        toast.error(
          `Profil créé, mais ${echecs.length} document(s) n'ont pas pu être envoyés. Vous pourrez les renvoyer depuis votre espace candidat.`,
        );
      } else {
        toast.success("Profil candidat créé avec succès. Il sera examiné par un coordinateur.");
      }
      navigate({ to: "/candidat" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création du profil.");
    } finally {
      setSoumissionEnCours(false);
    }
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

        {dataError ? (
          <p className="mt-3 text-sm text-destructive">
            {dataError} — certaines listes (villes, universités, licences, masters) peuvent être indisponibles.
          </p>
        ) : null}

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
                  <Select value={form.ville} onValueChange={(v) => set("ville", v)} disabled={dataLoading}>
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue placeholder={dataLoading ? "Chargement..." : "Sélectionner une ville"} />
                    </SelectTrigger>
                    <SelectContent>
                      {villes.map((v) => (
                        <SelectItem key={v.pubkey} value={v.value}>
                          {v.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!dataLoading && villes.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">Aucune ville disponible pour le moment.</p>
                  ) : null}
                </div>
                <div>
                  <Label>Nationalité</Label>
                  <Select value={form.nationalite} onValueChange={(v) => set("nationalite", v)} disabled={dataLoading}>
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue placeholder={dataLoading ? "Chargement..." : "Sélectionner une nationalité"} />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalites.map((n) => (
                        <SelectItem key={n.pubkey} value={n.value}>
                          {n.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!dataLoading && nationalites.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">Aucune nationalité disponible pour le moment.</p>
                  ) : null}
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
                <section>
                  <Label>Licences obtenues</Label>
                  <p className="mt-1 text-sm text-muted-foreground">Sélectionnez une ou plusieurs licences.</p>
                  {dataLoading ? (
                    <p className="mt-3 text-sm text-muted-foreground">Chargement des licences...</p>
                  ) : typesLicence.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Aucune licence disponible pour le moment.</p>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {typesLicence.map((t) => (
                        <Label key={t.pubkey} className="flex items-center gap-2 rounded-md border border-border/70 p-3 font-normal">
                          <Checkbox
                            checked={form.licences.some((licence) => licence.typeLicencePubkey === t.pubkey)}
                            onCheckedChange={(checked) => toggleLicence(t, checked === true)}
                          />
                          Licence en {t.intitule}
                        </Label>
                      ))}
                    </div>
                  )}
                </section>
                {form.licences.map((licence, index) => (
                  <section key={licence.typeLicencePubkey} className="space-y-4 rounded-lg border border-border/70 p-4">
                    <h2 className="font-display text-lg">Licence en {licence.nom}</h2>
                    <div>
                      <Label>Université associée</Label>
                      <Select value={licence.universite} onValueChange={(v) => setLicence(index, { universite: v })} disabled={dataLoading}>
                        <SelectTrigger className="mt-1.5 w-full">
                          <SelectValue placeholder={dataLoading ? "Chargement..." : "Sélectionner une université"} />
                        </SelectTrigger>
                        <SelectContent>
                          {universites.map((u) => (
                            <SelectItem key={u.pubkey} value={u.value}>
                              {u.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(["a1", "a2", "a3"] as const).map((cle, yearIndex) => (
                      <div key={cle} className="rounded-md bg-muted/30 p-3">
                        <h3 className="font-medium">Licence A{yearIndex + 1}</h3>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label>Année universitaire</Label>
                            <Select
                              value={licence[cle].anneeUniversitaire}
                              onValueChange={(v) => setLicenceAnnee(index, cle, { anneeUniversitaire: v })}
                            >
                              <SelectTrigger className="mt-1.5 w-full">
                                <SelectValue placeholder="Choisir l'année" />
                              </SelectTrigger>
                              <SelectContent>
                                {ANNEES_UNIVERSITAIRES.map((annee) => (
                                  <SelectItem key={annee} value={annee}>
                                    {annee}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Champ
                            label="Moyenne"
                            value={licence[cle].moyenne}
                            onChange={(v) => setLicenceAnnee(index, cle, { moyenne: v })}
                            placeholder="12.50"
                            type="number"
                          />
                        </div>
                        <div className="mt-3">
                          <FileUpload
                            label={`Joindre le relevé de notes — Licence A${yearIndex + 1} (PDF)`}
                            value={licence[cle].releve}
                            onChange={(file: File | null) =>
                              setLicenceAnnee(index, cle, {
                                releve: file ? nommerFichier(form.nom, form.prenom, file, "licence", `A${yearIndex + 1}`, "Releve") : null,
                              })
                            }
                          />
                        </div>
                      </div>
                    ))}
                    <Champ
                      label="Moyenne générale de la licence"
                      value={licence.moyenneGenerale}
                      onChange={(v) => setLicence(index, { moyenneGenerale: v })}
                      placeholder="12.50"
                      type="number"
                    />
                    <FileUpload
                      label={`Joindre le diplôme de la licence ${licence.nom} (PDF)`}
                      value={licence.diplome}
                      onChange={(file: File | null) =>
                        setLicence(index, {
                          diplome: file
                            ? nommerFichier(form.nom, form.prenom, file, `licence${licence.nom.replace(/[^a-zA-Z0-9]/g, "")}`, "Diplome")
                            : null,
                        })
                      }
                    />
                  </section>
                ))}
              </div>
            ) : null}

            {etape === 2 ? (
              <div className="space-y-6">
                <section className="rounded-lg border border-border/70 p-4">
                  <h2 className="font-display text-lg">Redoublement</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Avez-vous redoublé une année ?</p>
                  <RadioGroup className="mt-3 flex gap-6" value={form.aRedouble} onValueChange={(v) => set("aRedouble", v)}>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="oui" /> Oui
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="non" /> Non
                    </Label>
                  </RadioGroup>

                  {form.aRedouble === "oui" ? (
                    <div className="mt-5 space-y-5">
                      <p className="text-sm font-medium">Quelle(s) année(s) avez-vous redoublée(s) ?</p>
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
                              onChange={(vals: File[]) =>
                                setForm((f) => ({
                                  ...f,
                                  redoublements: f.redoublements.map((x) =>
                                    x.annee === r.annee
                                      ? {
                                          ...x,
                                          justificatifs: vals.map((file, idx) =>
                                            nommerFichier(f.nom, f.prenom, file, "licence", codeAnneeRedoublement(x.annee), "Redoublement", String(idx + 1)),
                                          ),
                                        }
                                      : x,
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
                <section className="rounded-lg border border-border/70 p-4">
                  <h2 className="font-display text-lg">Première année de master</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Avez-vous déjà effectué une première année de master ?</p>
                  <RadioGroup
                    className="mt-3 flex gap-6"
                    value={form.aFaitPremiereAnneeMaster}
                    onValueChange={(v) => set("aFaitPremiereAnneeMaster", v)}
                  >
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="oui" /> Oui
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="non" /> Non
                    </Label>
                  </RadioGroup>
                  {form.aFaitPremiereAnneeMaster === "oui" ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label>Master suivi</Label>
                        <Select
                          value={form.premiereAnneeMaster.master}
                          onValueChange={(v) => setForm((f) => ({ ...f, premiereAnneeMaster: { ...f.premiereAnneeMaster, master: v } }))}
                          disabled={dataLoading}
                        >
                          <SelectTrigger className="mt-1.5 w-full">
                            <SelectValue placeholder={dataLoading ? "Chargement..." : "Sélectionner un master"} />
                          </SelectTrigger>
                          <SelectContent>
                            {mastersList.map((master) => (
                              <SelectItem key={master.pubkey} value={master.nom}>
                                {master.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!dataLoading && mastersList.length === 0 ? (
                          <p className="mt-1 text-xs text-muted-foreground">Aucun master disponible pour le moment.</p>
                        ) : null}
                      </div>
                      <div>
                        <Label>Institut de réalisation</Label>
                        <Select
                          value={form.premiereAnneeMaster.institut}
                          onValueChange={(v) => setForm((f) => ({ ...f, premiereAnneeMaster: { ...f.premiereAnneeMaster, institut: v } }))}
                          disabled={dataLoading}
                        >
                          <SelectTrigger className="mt-1.5 w-full">
                            <SelectValue placeholder={dataLoading ? "Chargement..." : "Sélectionner un institut"} />
                          </SelectTrigger>
                          <SelectContent>
                            {instituts.map((institut) => (
                              <SelectItem key={institut} value={institut}>
                                {institut}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label>Année universitaire</Label>
                          <Select
                            value={form.premiereAnneeMaster.anneeUniversitaire}
                            onValueChange={(v) =>
                              setForm((f) => ({ ...f, premiereAnneeMaster: { ...f.premiereAnneeMaster, anneeUniversitaire: v } }))
                            }
                          >
                            <SelectTrigger className="mt-1.5 w-full">
                              <SelectValue placeholder="Choisir l'année" />
                            </SelectTrigger>
                            <SelectContent>
                              {ANNEES_UNIVERSITAIRES.map((annee) => (
                                <SelectItem key={annee} value={annee}>
                                  {annee}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Champ
                          label="Moyenne"
                          value={form.premiereAnneeMaster.moyenne}
                          onChange={(v) => setForm((f) => ({ ...f, premiereAnneeMaster: { ...f.premiereAnneeMaster, moyenne: v } }))}
                          placeholder="12.50"
                          type="number"
                        />
                      </div>
                      <FileUpload
                        label="Joindre le relevé de notes de master 1 (PDF)"
                        value={form.premiereAnneeMaster.releve}
                        onChange={(file: File | null) =>
                          setForm((f) => ({
                            ...f,
                            premiereAnneeMaster: {
                              ...f.premiereAnneeMaster,
                              releve: file ? nommerFichier(f.nom, f.prenom, file, "masterM1", "Releve") : null,
                            },
                          }))
                        }
                      />
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
                    {form.email || "—"} · {form.telephone || "—"} · {form.ville || "—"} · {form.nationalite || "—"} ·{" "}
                    {form.anneeNaissance || "—"}
                  </p>
                </Recap>
                <Separator />
                <Recap titre="Informations académiques">
                  {form.licences.map((licence) => (
                    <div key={licence.typeLicencePubkey} className="space-y-1">
                      <p className="font-medium">
                        Licence en {licence.nom} — {licence.universite || "—"}
                      </p>
                      {(["a1", "a2", "a3"] as const).map((cle, i) => (
                        <p key={cle}>
                          Licence A{i + 1} — {licence[cle].anneeUniversitaire || "—"} · moyenne {licence[cle].moyenne || "—"}
                        </p>
                      ))}
                      <p>Moyenne générale : {licence.moyenneGenerale || "—"}</p>
                    </div>
                  ))}
                </Recap>
                <Separator />
                <Recap titre="Documents">
                  {form.licences
                    .flatMap((licence) => [licence.a1.releve, licence.a2.releve, licence.a3.releve, licence.diplome])
                    .filter((f): f is File => Boolean(f))
                    .map((f, i) => (
                      <p key={`${f.name}-${i}`} className="text-success">
                        ✓ {f.name}
                      </p>
                    ))}
                  {form.aFaitPremiereAnneeMaster === "oui" && form.premiereAnneeMaster.releve ? (
                    <p className="text-success">✓ {form.premiereAnneeMaster.releve.name}</p>
                  ) : null}
                </Recap>
                {form.aFaitPremiereAnneeMaster === "oui" ? (
                  <>
                    <Separator />
                    <Recap titre="Première année de master">
                      <p>
                        {form.premiereAnneeMaster.master || "—"} — {form.premiereAnneeMaster.institut || "—"} ·{" "}
                        {form.premiereAnneeMaster.anneeUniversitaire || "—"} · moyenne {form.premiereAnneeMaster.moyenne || "—"}
                      </p>
                    </Recap>
                  </>
                ) : null}
                <Separator />
                <Recap titre="Redoublements">
                  {form.aRedouble === "oui" && form.redoublements.length > 0 ? (
                    form.redoublements.map((r) => (
                      <div key={r.annee}>
                        <p className="font-medium">{r.annee}</p>
                        {r.justificatifs.map((j, i) => (
                          <p key={`${r.annee}-${j.name}-${i}`} className="text-success">
                            ✓ {j.name}
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
          <Button variant="outline" disabled={etape === 0 || soumissionEnCours} onClick={() => setEtape((s) => Math.max(0, s - 1))}>
            <ChevronLeft className="size-4" /> Précédent
          </Button>
          {etape < ETAPES.length - 1 ? (
            <Button onClick={() => setEtape((s) => s + 1)}>
              Suivant <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={soumettre} disabled={soumissionEnCours}>
              {soumissionEnCours ? "Envoi en cours..." : "Créer mon profil candidat"}
            </Button>
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
      <Input className="mt-1.5" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Recap({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{titre}</p>
      <div className="mt-1.5 space-y-1">{children}</div>
    </section>
  );
}