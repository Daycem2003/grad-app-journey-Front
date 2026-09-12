import { API_BASE_URL, getHeaders, handleApiError } from "./api";

const RESOURCE_BASE = `${API_BASE_URL}/documents`;

export type SlotType =
  | "RELEVE_LICENCE"
  | "DIPLOME_LICENCE"
  | "RELEVE_M1"
  | "JUSTIFICATIF_REDOUBLEMENT"
  | "AUTRE";

export interface DocumentSlotIdentity {
  slotType: SlotType;
  domaine?: string | undefined;
  anneeLicence?: "A1" | "A2" | "A3" | "" | undefined;
  redoublementAnnee?: string | undefined;
  justificatifIndex?: number | undefined;
}

export async function uploadDocument(
  file: File,
  slot: DocumentSlotIdentity,
  onboardingToken?: string,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("slot_type", slot.slotType);
  formData.append("domaine", slot.domaine ?? "");
  formData.append("annee_licence", slot.anneeLicence ?? "");
  formData.append("redoublement_annee", slot.redoublementAnnee ?? "");
  formData.append("justificatif_index", String(slot.justificatifIndex ?? 0));

  const headers: Record<string, string> = {};
  if (onboardingToken) {
    headers["X-Onboarding-Token"] = onboardingToken;
  }

  const res = await fetch(`${RESOURCE_BASE}/upload/`, {
    method: "POST",
    headers,
    credentials: "include",
    body: formData,
  });
  await handleApiError(res);
  return res.json();
}