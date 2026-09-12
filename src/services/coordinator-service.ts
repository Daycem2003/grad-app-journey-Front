import { API_BASE_URL, getHeaders, handleApiError } from "./api";
import { authService } from "./auth-service";

export interface TypeLicenceDTO {
  pubkey: string;
  intitule: string;
  domaine: string;
  est_eligible: boolean;
}

export interface LicenceYearDTO {
  pubkey: string;
  annee: number;
  annee_universitaire: string;
  moyenne: number;
}

export interface DiplomeDTO {
  pubkey: string;
  type_licence?: TypeLicenceDTO | null | undefined;
  annee_obtention: string;
  universite: string;
}

export interface Master1YearDTO {
  pubkey: string;
  annee_universitaire: string;
  moyenne: number;
  etablissement: string;
  master_pubkey?: string | null | undefined;
}

export interface RedoublementYearDTO {
  pubkey: string;
  annee: string;
}

export interface RedoublementDTO {
  pubkey: string;
  a_redouble: boolean;
  redoublement_years?: RedoublementYearDTO[] | undefined;
}

export interface CandidateDetailDTO {
  pubkey: string;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone: string;
  ville: string;
  annee_naissance: number;
  nationalite: string;
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE" | "A_REVISER" | string;
  created_at: string;
  diplomes?: DiplomeDTO[] | undefined;
  licence_years?: LicenceYearDTO[] | undefined;
  master1_year?: Master1YearDTO | null | undefined;
  redoublement?: RedoublementDTO | null | undefined;
}

export interface DocumentVersionDTO {
  pubkey: string;
  version_number: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  is_active: boolean;
  mime_type: string;
  file_size: number;
  checksum: string;
  rejection_reason?: string | null | undefined;
  reviewed_at?: string | null | undefined;
  created_at: string;
  slot_pubkey: string;
  slot_type: string;
  domaine?: string | undefined;
  annee_licence?: string | undefined;
  redoublement_annee?: string | undefined;
  justificatif_index?: number | undefined;
  display_name?: string | undefined;
  a_redeposer?: boolean | undefined;
  candidate_profile_pubkey: string;
  reviewer_email?: string | null | undefined;
  download_url?: string | null | undefined;
}

export interface CandidateDecisionResponse {
  message: string;
  profile: CandidateDetailDTO;
}

export const coordinatorService = {
  async listCandidates(
    params?: { statut?: string | undefined; q?: string | undefined } | undefined,
    token?: string | undefined
  ): Promise<CandidateDetailDTO[]> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const query = new URLSearchParams();
    if (params?.statut && params.statut !== "Tous" && params.statut !== "TOUS") {
      query.set("statut", params.statut);
    }
    if (params?.q?.trim()) {
      query.set("q", params.q.trim());
    }

    const qs = query.toString();
    const url = `${API_BASE_URL}/candidates/${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, {
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async getCandidateProfile(
    pubkey: string,
    token?: string | undefined
  ): Promise<CandidateDetailDTO> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${API_BASE_URL}/candidates/${pubkey}`, {
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async getCandidateDocuments(
    candidatePubkey: string,
    token?: string | undefined
  ): Promise<DocumentVersionDTO[]> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${API_BASE_URL}/documents/candidates/${candidatePubkey}/`, {
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async approveCandidature(
    pubkey: string,
    token?: string | undefined
  ): Promise<CandidateDecisionResponse> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${API_BASE_URL}/coordinator/candidatures/${pubkey}/approve`, {
      method: "POST",
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async rejectCandidature(
    pubkey: string,
    motif?: string | undefined,
    token?: string | undefined
  ): Promise<CandidateDecisionResponse> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${API_BASE_URL}/coordinator/candidatures/${pubkey}/reject`, {
      method: "POST",
      headers: getHeaders(effectiveToken),
      credentials: "include",
      body: JSON.stringify({ motif: motif || null }),
    });
    await handleApiError(res);
    return res.json();
  },

  async requestRevision(
    pubkey: string,
    payload:
      | { message?: string | undefined; documents_a_redeposer?: string[] | undefined }
      | string,
    token?: string | undefined
  ): Promise<CandidateDecisionResponse> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const bodyObj =
      typeof payload === "string"
        ? { message: payload, documents_a_redeposer: [] }
        : {
            message: payload.message || "",
            documents_a_redeposer: payload.documents_a_redeposer || [],
          };
    const res = await fetch(`${API_BASE_URL}/coordinator/candidatures/${pubkey}/request-revision`, {
      method: "POST",
      headers: getHeaders(effectiveToken),
      credentials: "include",
      body: JSON.stringify(bodyObj),
    });
    await handleApiError(res);
    return res.json();
  },
};
