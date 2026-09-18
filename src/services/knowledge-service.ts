// knowledge-service.ts -- Appelle l'assistant IA (RAG) côté backend.
//
// Réutilise le client partagé de ./api (API_BASE_URL, getHeaders,
// handleApiError), exactement comme documents-service.ts. Le token Bearer est
// joint automatiquement au localStorage par getHeaders() ; le serveur exige
// IsAuthenticated (aucun changement backend : on ne modifie pas IsAuthenticated).
//
// Le statut de la réponse n'est JAMAIS une erreur HTTP : un résultat vide
// (« no_relevant_context ») est renvoyé en 200 avec un `answer` honnête,
// et le caller l'affiche naturellement dans la conversation, pas comme erreur.

import type { Citation } from "@/lib/types";
import { API_BASE_URL, getHeaders, handleApiError } from "./api";

const RESOURCE_BASE = `${API_BASE_URL}/knowledge`;

export type KnowledgeAskStatus = "answered" | "answered_ungrounded" | "no_relevant_context";

/** Un passage source renvoyé par le backend (pour le volet « Sources »). */
export interface KnowledgeContextChunk {
  rank: number;
  score: number;
  source_file: string;
  page: number;
  extraction_method: string;
  chunk_pubkey: string;
  preview: string;
}

/** Réponse complète de POST /knowledge/ask (voir la doc backend). */
export interface KnowledgeAskResponse {
  status: KnowledgeAskStatus;
  question: string;
  grounded: boolean;
  answer: string;
  citations: Citation[];
  context: KnowledgeContextChunk[];
  context_count: number;
  model: string;
  deterministic: boolean;
}

/** Paramètres optionnels (valeurs omises = défauts côté serveur). */
export interface KnowledgeAskOptions {
  top_n?: number;
  min_score?: number | null;
  filename?: string;
}

/**
 * Appelle POST /knowledge/ask. Le token est joint par getHeaders() (localStorage).
 * `credentials: "include"` suit la convention des autres services authentifiés.
 */
export async function askKnowledge(
  question: string,
  options: KnowledgeAskOptions = {},
): Promise<KnowledgeAskResponse> {
  const body: Record<string, unknown> = { query: question };
  if (options.top_n !== undefined) body["top_n"] = options.top_n;
  if (options.min_score !== undefined) body["min_score"] = options.min_score;
  if (options.filename) body["filename"] = options.filename;

  const res = await fetch(`${RESOURCE_BASE}/ask/`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  await handleApiError(res);
  return res.json() as Promise<KnowledgeAskResponse>;
}
