import { createFileRoute } from "@tanstack/react-router";
import { AccueilView } from "@/components/views/AccueilView";

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
  component: AccueilView,
});