import type { ChatMessage } from "./types";
import { askKnowledge } from "@/services/knowledge-service";

/**
 * Service d'assistant conversationnel.
 *
 * `envoyerMessage` appelle le backend RAG (POST /api/v1/knowledge/ask) via
 * `askKnowledge` et transforme la réponse en `ChatMessage` (contenu + citations
 * + statut). L'ancien mock `reponseMockee` a été supprimé.
 */
export const SUGGESTIONS = [
  "Quels Masters sont disponibles ?",
  "Quels documents dois-je préparer ?",
  "Quelle est la date limite ?",
  "Comment est calculé le score ?",
  "Suis-je éligible à un Master en Informatique ?",
];

export async function envoyerMessage(question: string): Promise<ChatMessage> {
  const reponse = await askKnowledge(question);
  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    content: reponse.answer,
    status: reponse.status,
    grounded: reponse.grounded,
    citations: reponse.citations,
  };
}
