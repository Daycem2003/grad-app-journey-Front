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
  onboarding_token?: string; // présent uniquement sur la réponse de POST /me (création)
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

  async getMyProfile(): Promise<CandidateProfileResponse> {
    const res = await fetch(`${RESOURCE_BASE}/me`, {
      headers: getHeaders(),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },
};