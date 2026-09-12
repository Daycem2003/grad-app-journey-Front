import { API_BASE_URL, getHeaders, handleApiError } from "./api";

const RESOURCE_BASE = `${API_BASE_URL}/candidates`;

export interface CreateCandidateProfilePayload {
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone: string;
  ville: string;
  annee_naissance: number;
  nationalite: string;
}

export interface CandidateDocumentSlotDTO {
  slot_pubkey: string;
  version_pubkey?: string | null | undefined;
  slot_type: string;
  domaine?: string | undefined;
  annee_licence?: string | undefined;
  redoublement_annee?: string | undefined;
  justificatif_index?: number | undefined;
  display_name: string;
  a_redeposer: boolean;
  status?: string | null | undefined;
  rejection_reason?: string | null | undefined;
}

export interface CandidateProfileResponse {
  pubkey: string;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone: string;
  ville: string;
  annee_naissance: number;
  nationalite: string;
  statut: string;
  onboarding_token?: string | undefined; // présent uniquement sur la réponse de POST /me (création) ou GET avec token
  revision_message?: string | null | undefined;
  documents?: CandidateDocumentSlotDTO[] | undefined;
  diplomes?: any[] | undefined;
  licence_years?: any[] | undefined;
  master1_year?: any | null | undefined;
  redoublement?: any | null | undefined;
}

export const candidateProfileService = {
  async createProfile(payload: CreateCandidateProfilePayload): Promise<CandidateProfileResponse> {
    const res = await fetch(`${RESOURCE_BASE}/me`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    await handleApiError(res);
    return res.json();
  },

  async getMyProfile(token?: string | undefined): Promise<CandidateProfileResponse> {
    const headers = getHeaders();
    if (token) {
      headers["X-Onboarding-Token"] = token;
    }
    const res = await fetch(`${RESOURCE_BASE}/me`, {
      headers,
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async getProfileByOnboardingToken(onboardingToken: string): Promise<CandidateProfileResponse> {
    const headers = getHeaders();
    headers["X-Onboarding-Token"] = onboardingToken;
    const res = await fetch(`${RESOURCE_BASE}/me`, {
      headers,
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async updateProfile(
    payload: Partial<CreateCandidateProfilePayload>,
    onboardingToken?: string | undefined
  ): Promise<CandidateProfileResponse> {
    const headers = getHeaders();
    if (onboardingToken) {
      headers["X-Onboarding-Token"] = onboardingToken;
    }
    const res = await fetch(`${RESOURCE_BASE}/me`, {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
    await handleApiError(res);
    return res.json();
  },
};