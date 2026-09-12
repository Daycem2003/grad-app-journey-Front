import { API_BASE_URL, getHeaders, handleApiError } from "./api";

export type ReferenceDataCategory = "CITY" | "UNIVERSITY" | "DOMAIN" | "NATIONALITY";

export interface ReferenceDataItem {
  pubkey: string;
  value: string;
}

interface ReferenceDataResponse {
  category: ReferenceDataCategory;
  results: ReferenceDataItem[];
}

class ReferenceDataService {
  private async getCategory(category: ReferenceDataCategory): Promise<ReferenceDataItem[]> {
    const response = await fetch(`${API_BASE_URL}/reference-data/${category}/`, {
      method: "GET",
      headers: getHeaders(),
    });
    await handleApiError(response);
    const data: ReferenceDataResponse = await response.json();
    return data.results;
  }

  getCities(): Promise<ReferenceDataItem[]> {
    return this.getCategory("CITY");
  }

  getUniversities(): Promise<ReferenceDataItem[]> {
    return this.getCategory("UNIVERSITY");
  }

  getDomains(): Promise<ReferenceDataItem[]> {
    return this.getCategory("DOMAIN");
  }

  getNationalities(): Promise<ReferenceDataItem[]> {
    return this.getCategory("NATIONALITY");
  }
}

export const referenceDataService = new ReferenceDataService();