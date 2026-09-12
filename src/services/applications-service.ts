import { API_BASE_URL, getHeaders, handleApiError } from "./api";
import { authService } from "./auth-service";

const RESOURCE_BASE = `${API_BASE_URL}/applications`;

export interface ApplicationMasterDTO {
  pubkey: string;
  nom: string;
  universite: string;
  domaine?: string | undefined;
  nombre_places?: number | undefined;
}

export interface ApplicationCandidateSummaryDTO {
  pubkey: string;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone?: string | undefined;
  ville?: string | undefined;
}

export interface ApplicationDTO {
  pubkey: string;
  master: ApplicationMasterDTO;
  candidate_profile?: ApplicationCandidateSummaryDTO | undefined;
  niveau: string;
  date_soumission: string;
  score?: number | null | undefined;
  rang?: number | null | undefined;
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

  async listAllApplications(
    params?: { master_pubkey?: string | undefined; statut?: string | undefined; q?: string | undefined } | undefined,
    token?: string | undefined
  ): Promise<ApplicationDTO[]> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const query = new URLSearchParams();
    if (params?.master_pubkey && params.master_pubkey !== "TOUS" && params.master_pubkey !== "Tous") {
      query.set("master_pubkey", params.master_pubkey);
    }
    if (params?.statut && params.statut !== "TOUS" && params.statut !== "Tous") {
      query.set("statut", params.statut);
    }
    if (params?.q?.trim()) {
      query.set("q", params.q.trim());
    }
    const qs = query.toString();
    const res = await fetch(`${RESOURCE_BASE}/all${qs ? `?${qs}` : ""}`, {
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async listByMaster(
    masterPubkey: string,
    statut?: string | undefined,
    token?: string | undefined
  ): Promise<ApplicationDTO[]> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const query = new URLSearchParams();
    if (statut && statut !== "TOUS" && statut !== "Tous") {
      query.set("statut", statut);
    }
    const qs = query.toString();
    const res = await fetch(`${RESOURCE_BASE}/by-master/${masterPubkey}${qs ? `?${qs}` : ""}`, {
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
