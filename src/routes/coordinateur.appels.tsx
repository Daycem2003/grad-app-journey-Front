import { useState } from "react";
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
import type { Critere } from "@/lib/types";

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

function AppelPage() {
  const { masters, ajouterMaster } = useStore();
  const premier = masters[0];
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [places, setPlaces] = useState("30");
  const [debut, setDebut] = useState("2026-07-01");
  const [fin, setFin] = useState("2026-08-31");
  const [criteres, setCriteres] = useState<Critere[]>([
    { id: "c1", libelle: "Moyenne minimale", valeur: "11.00 / 20" },
  ]);
  const [p, setP] = useState({ l1: 30, l2: 30, l3: 40 });
  const total = p.l1 + p.l2 + p.l3;

  const publier = () => {
    if (!nom) { toast.error("Le nom du Master est obligatoire."); return; }
    if (total !== 100) { toast.error("La somme des pondérations doit être égale à 100%."); return; }
    ajouterMaster({
      id: `m-${Date.now()}`,
      nom,
      universite: premier?.universite ?? "Université de Tunis El Manar",
      etablissement: premier?.etablissement ?? "Faculté des Sciences de Tunis",
      ville: premier?.ville ?? "Tunis",
      domaine: "Informatique",
      descriptionCourte: description.slice(0, 110) || "Nouvel appel à candidature.",
      description: description || "Appel à candidature créé par le coordinateur.",
      places: Number(places) || 0,
      dateDebut: debut,
      dateFin: fin,
      statut: "Ouvert",
      criteres,
      ponderation: p,
      documents: ["Relevés de notes L1, L2, L3", "Diplôme de Licence (PDF)"],
    });
    toast.success("Appel à candidature publié.");
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
          <CardContent className="space-y-3">
            {criteres.map((c, i) => (
              <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
                <Input
                  value={c.libelle}
                  placeholder="Libellé"
                  onChange={(e) =>
                    setCriteres((prev) => prev.map((x, j) => (j === i ? { ...x, libelle: e.target.value } : x)))
                  }
                />
                <Input
                  value={c.valeur}
                  placeholder="Valeur"
                  onChange={(e) =>
                    setCriteres((prev) => prev.map((x, j) => (j === i ? { ...x, valeur: e.target.value } : x)))
                  }
                />
                <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => setCriteres((prev) => prev.filter((_, j) => j !== i))}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCriteres((prev) => [...prev, { id: `c-${Date.now()}`, libelle: "", valeur: "" }])}
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

        <Button onClick={publier}>Publier l'appel à candidature</Button>
      </div>
    </div>
  );
}
