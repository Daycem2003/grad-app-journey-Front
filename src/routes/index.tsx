import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Search, User, ClipboardList, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MasterTN — Candidatures aux Masters universitaires en Tunisie" },
      {
        name: "description",
        content:
          "Plateforme de gestion des candidatures aux Masters en Tunisie : consultation des formations, dépôt de dossier, suivi et résultats.",
      },
      { property: "og:title", content: "MasterTN — Candidatures aux Masters en Tunisie" },
      {
        property: "og:description",
        content:
          "Consultez les Masters, créez votre profil candidat et suivez vos candidatures en un seul endroit.",
      },
    ],
  }),
  component: SelectionProfil,
});

const PROFILS: {
  role: Role;
  titre: string;
  sousTitre: string;
  desc: string;
  to: string;
  icon: typeof User;
}[] = [
  {
    role: "guest",
    titre: "Guest",
    sousTitre: "Consulter les Masters",
    desc: "Explorez les formations, les critères et l'assistant IA sans créer de compte.",
    to: "/accueil",
    icon: Search,
  },
  {
    role: "candidat",
    titre: "Candidat",
    sousTitre: "Espace Candidat",
    desc: "Déposez vos candidatures et suivez l'avancement de vos dossiers.",
    to: "/candidat",
    icon: User,
  },
  {
    role: "coordinateur",
    titre: "Coordinateur",
    sousTitre: "Espace Coordinateur",
    desc: "Créez les appels, définissez les critères et instruisez les candidatures.",
    to: "/coordinateur",
    icon: ClipboardList,
  },
  {
    role: "admin",
    titre: "Administrateur",
    sousTitre: "Espace Administrateur",
    desc: "Pilotez le calendrier, la liste finale et les statistiques nationales.",
    to: "/admin",
    icon: ShieldCheck,
  },
];

function SelectionProfil() {
  const { setRole, profil, creerProfil, candidats } = useStore();
  const navigate = useNavigate();

  const choisir = (role: Role, to: string) => {
    if (role === "candidat" && !profil) {
      const demo = candidats[0];
      if (demo) creerProfil(demo);
    } else {
      setRole(role);
    }
    navigate({ to: to as never });
  };

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-16">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-md bg-accent text-accent-foreground">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <p className="font-display text-xl leading-tight">MasterTN</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/60">
              Ministère de l'Enseignement Supérieur — Démo
            </p>
          </div>
        </div>

        <h1 className="mt-10 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          Plateforme nationale de gestion des candidatures aux Masters
        </h1>
        <p className="mt-4 max-w-xl text-sm text-primary-foreground/70">
          Version de démonstration : choisissez un profil pour explorer l'interface. Aucune
          authentification n'est requise, les données affichées sont fictives.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PROFILS.map((p) => (
            <Card
              key={p.role}
              role="button"
              tabIndex={0}
              onClick={() => choisir(p.role, p.to)}
              onKeyDown={(e) => e.key === "Enter" && choisir(p.role, p.to)}
              className="cursor-pointer border-white/10 bg-white/5 p-5 text-primary-foreground shadow-none transition-colors hover:border-accent/60 hover:bg-white/10"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
                  <p.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-primary-foreground/60">
                    {p.titre}
                  </p>
                  <p className="mt-1 font-display text-lg">{p.sousTitre}</p>
                  <p className="mt-2 text-sm text-primary-foreground/70">{p.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
