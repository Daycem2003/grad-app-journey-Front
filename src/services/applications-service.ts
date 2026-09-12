import { API_BASE_URL, getHeaders, handleApiError } from "./api";
import { authService } from "./auth-service";

const RESOURCE_BASE = `${API_BASE_URL}/applications`;

export interface ApplicationMasterDTO {
  pubkey: string;
  nom: string;
  universite: string;
}

export interface ApplicationCandidateSummaryDTO {
  pubkey: string;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
}

export interface ApplicationDTO {
  pubkey: string;
  master: ApplicationMasterDTO;
  candidate_profile?: ApplicationCandidateSummaryDTO | undefined;
  niveau: string;
  date_soumission: string;
  score?: number | null | undefined;
  statut: "SOUMISE" | "EN_COURS" | "ACCEPTEE" | "REJETEE" | string;
}

export const applicationsService = {
  async submitApplication(masterPubkey: string, token?: string | undefined): Promise<ApplicationDTO> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${RESOURCE_BASE}/submit/`, {
      method: "POST",
      headers: getHeaders(effectiveToken),
      credentials: "include",
      body: JSON.stringify({ master_pubkey: masterPubkey }),
    });
    await handleApiError(res);
    return res.json();
  },

  async getMyApplications(token?: string | undefined): Promise<ApplicationDTO[]> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${RESOURCE_BASE}/me/`, {
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async getApplication(pubkey: string, token?: string | undefined): Promise<ApplicationDTO> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${RESOURCE_BASE}/${pubkey}/`, {
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async withdrawApplication(pubkey: string, token?: string | undefined): Promise<void> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${RESOURCE_BASE}/${pubkey}/withdraw/`, {
      method: "POST",
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
  },
};
