import { API_BASE_URL, getHeaders, handleApiError } from "./api";

const RESOURCE_BASE = `${API_BASE_URL}/candidates`;

async function post<T>(path: string, body: unknown, onboardingToken?: string): Promise<T> {
  const res = await fetch(`${RESOURCE_BASE}${path}`, {
    method: "POST",
    headers: getHeaders(undefined, onboardingToken),
    credentials: "include",
    body: JSON.stringify(body),
  });
  await handleApiError(res);
  return res.json();
}

export interface AddLicenceYearPayload {
  type_licence_pubkey: string;
  annee: number;
  annee_universitaire: string;
  moyenne: number;
}

export interface SetDiplomePayload {
  type_licence_pubkey: string;
  annee_obtention: string;
  universite: string;
}

export interface SetMaster1YearPayload {
  annee_universitaire: string;
  moyenne: number;
  etablissement: string;
  master_pubkey: string | null;
}

export interface SetRedoublementPayload {
  a_redouble: boolean;
  annees: string[];
}

export const academicRecordService = {
  addLicenceYear: (payload: AddLicenceYearPayload, onboardingToken?: string) =>
    post("/me/licence-years", payload, onboardingToken),

  setDiplome: (payload: SetDiplomePayload, onboardingToken?: string) =>
    post("/me/diplome", payload, onboardingToken),

  setMaster1Year: (payload: SetMaster1YearPayload, onboardingToken?: string) =>
    post("/me/master1-year", payload, onboardingToken),

  setRedoublement: (payload: SetRedoublementPayload, onboardingToken?: string) =>
    post("/me/redoublement", payload, onboardingToken),
};