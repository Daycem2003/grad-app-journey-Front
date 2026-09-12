import { API_BASE_URL, handleApiError } from "./api";

export interface TypeLicenceRef {
  pubkey: string;
  intitule: string;
  domaine: string;
  est_eligible: boolean;
}

interface TypeLicenceResponse {
  results: TypeLicenceRef[];
}

export const typeLicenceService = {
  async list(): Promise<TypeLicenceRef[]> {
    const response = await fetch(
      `${API_BASE_URL}/candidates/type-licences`,
      {
        method: "GET",
      },
    );

    await handleApiError(response);

    const data: TypeLicenceResponse = await response.json();

    return data.results;
  },
};