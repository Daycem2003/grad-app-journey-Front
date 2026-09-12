import { createFileRoute } from "@tanstack/react-router";
import { AccueilView } from "@/components/views/AccueilView";

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
  component: AccueilView,
});
