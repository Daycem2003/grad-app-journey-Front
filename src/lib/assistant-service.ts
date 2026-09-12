import type { ChatMessage } from "./types";

/**
 * Service d'assistant conversationnel (mocké).
 * Remplacer `envoyerMessage` par un appel API (ex. POST /api/assistant) plus tard.
 */
export const SUGGESTIONS = [
  "Quels Masters sont disponibles ?",
  "Quels documents dois-je préparer ?",
  "Quelle est la date limite ?",
  "Comment est calculé le score ?",
  "Suis-je éligible à un Master en Informatique ?",
];

function reponseMockee(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("disponible") || q.includes("quels masters")) {
    return "Consultez la page « Masters » pour découvrir l'ensemble des formations actuellement ouvertes aux candidatures ainsi que leurs conditions d'accès.";
  }
  if (q.includes("document")) {
    return [
      "Les documents généralement demandés sont :",
      "• Les relevés de notes de Licence 1, 2 et 3",
      "• Le diplôme de Licence au format PDF",
      "• Les justificatifs de redoublement, si vous avez redoublé une année",
      "Chaque Master peut exiger des pièces complémentaires (CV, lettre de motivation…).",
    ].join("\n");
  }
  if (q.includes("date") || q.includes("limite") || q.includes("délai")) {
    return "La session 2026 est ouverte du 1er juillet au 31 août 2026. Certaines formations ont des dates spécifiques : la date limite exacte est affichée sur la fiche de chaque Master.";
  }
  if (q.includes("score") || q.includes("calcul") || q.includes("formule")) {
    return "Le score est déterministe : il est calculé à partir de vos moyennes de Licence pondérées par le coordinateur du Master. Exemple : Score = L1 × 30% + L2 × 30% + L3 × 40%. Aucune IA n'intervient dans ce calcul.";
  }
  if (q.includes("éligib") || q.includes("eligib")) {
    return "L'éligibilité dépend de critères fixés par le coordinateur : diplôme requis, année d'obtention, moyenne minimale et nombre maximum de redoublements. Ouvrez la fiche du Master souhaité, section « Conditions d'éligibilité », pour vérifier point par point.";
  }
  if (q.includes("profil") || q.includes("postuler") || q.includes("candidat")) {
    return "Pour postuler, créez d'abord votre profil candidat (informations personnelles, moyennes de Licence, diplôme et justificatifs). Le bouton « Postuler » apparaît ensuite sur chaque Master ouvert.";
  }
  return "Je peux vous renseigner sur les Masters disponibles, les conditions d'éligibilité, les documents à fournir, les dates de candidature et le calcul du score. Posez-moi votre question ou choisissez une suggestion.";
}

export async function envoyerMessage(question: string): Promise<ChatMessage> {
  await new Promise((r) => setTimeout(r, 550));
  return {
    id: `m-${Date.now()}`,
    role: "assistant",
    content: reponseMockee(question),
  };
}
