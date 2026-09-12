import { API_BASE_URL, getHeaders, handleApiError } from "./api";
import { authService } from "./auth-service";
export interface CreateMasterPayload {
  nom: string;
  domaine: string;
  discipline: string;
  specialite: string;
  nombre_places: number;
  date_debut: string;
  date_fin: string;
  universite?: string | undefined;
  ville?: string | undefined;
  type_licence_pubkeys?: string[];
}

export interface ScoreCriterionPayload {
  critere: string;
  poids: number;
}

export type ValueType =
  | "NUMERIC"
  | "DATE"
  | "DATE_RANGE"
  | "NUMERIC_RANGE"
  | "STRING"
  | "ENUM"
  | "BOOLEAN";

export type RuleOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "IN" | "NOT_IN";

export interface RuleValueData {
  value_type: ValueType;
  operator?: RuleOperator | null;
  value?: string | number | boolean | null;
  values?: string[] | null;
  min_value?: string | number | null;
  max_value?: string | number | null;
  min_inclusive?: boolean;
  max_inclusive?: boolean;
}

export interface CreateEligibilityRulePayload {
  criterion: string;
  obligatoire?: boolean;
  rule_value: RuleValueData;
}

export interface EligibilityRule {
  pubkey: string;
  criterion: string;
  obligatoire: boolean;
  rule_value: RuleValueData;
}
export interface TypeLicenceSummary {
  pubkey: string;
  intitule: string;
  domaine?: string | undefined;
}

export interface RequiredDocumentItem {
  pubkey: string;
  type: string;
}

export interface Master {
  id?: number | undefined;
  pubkey: string;
  nom: string;
  universite: string;
  ville: string;
  domaine: string;
  discipline: string;
  specialite: string;
  nombre_places?: number | undefined;
  nombrePlaces?: number | undefined;
  date_debut?: string | undefined;
  dateDebut?: string | undefined;
  date_fin?: string | undefined;
  dateFin?: string | undefined;
  statut: "OUVERT" | "FERME" | "BROUILLON" | string;
  coordinateur_pubkey?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export interface MasterDetail extends Master {
  type_licences_acceptees?: TypeLicenceSummary[] | undefined;
  typeLicencesAcceptees?: TypeLicence[] | undefined;
  passerelles_vers?: string[] | undefined;
  passerelles_depuis?: string[] | undefined;
  required_documents?: RequiredDocumentItem[] | undefined;
  requiredDocuments?: RequiredDocument[] | undefined;
  eligibilityCriteria?: EligibilityCriterion[] | undefined;
  scoreFormula?: ScoreFormula | undefined;
}

export interface TypeLicence {
  id: number;
  pubkey: string;
  intitule: string;
  domaine: string;
  estEligible: boolean;
}

export interface EligibilityCriterion {
  id: number;
  pubkey: string;
  masterId: number;
  type: string; // DATE, NUMBER, THRESHOLD, DATE_RANGE, NATIONALITY, UNIVERSITY
  valeur: string;
  obligatoire: boolean;
}

export interface ScoreFormula {
  id: number;
  pubkey: string;
  masterId: number;
  criteria: ScoreCriterion[];
}

export interface ScoreCriterion {
  id: number;
  pubkey: string;
  scoreFormulaId: number;
  critere: string;
  poids: number;
}

export interface RequiredDocument {
  id: number;
  pubkey: string;
  masterId: number;
  type: string;
}

export interface Application {
  id: number;
  pubkey: string;
  candidateProfileId: number;
  masterId: number;
  niveau: string;
  dateSoumission: string;
  score?: number;
  statut: "SOUMISE" | "EN_COURS" | "ACCEPTEE" | "REJETEE";
}

class MastersService {
  async listMasters(token?: string): Promise<Master[]> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const response = await fetch(`${API_BASE_URL}/masters/`, {
      method: "GET",
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });

    await handleApiError(response);
    return response.json();
  }

async createMaster(token: string, payload: CreateMasterPayload): Promise<Master> {
    const response = await fetch(`${API_BASE_URL}/masters/`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    await handleApiError(response);
    return response.json();
  }

  async addRequiredDocument(
    token: string,
    masterPubkey: string,
    type: string
  ): Promise<{ pubkey: string; type: string }> {
    const response = await fetch(
      `${API_BASE_URL}/masters/${masterPubkey}/required-documents`,
      {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ type }),
      }
    );
    await handleApiError(response);
    return response.json();
  }

  async setScoreFormula(
    token: string,
    masterPubkey: string,
    criteria: ScoreCriterionPayload[]
  ): Promise<ScoreFormula> {
    const response = await fetch(`${API_BASE_URL}/masters/${masterPubkey}/score-formula`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify({ criteria }),
    });
    await handleApiError(response);
    return response.json();
  }

  async publishMaster(token: string, masterPubkey: string): Promise<Master> {
    const response = await fetch(`${API_BASE_URL}/masters/${masterPubkey}/publish`, {
      method: "POST",
      headers: getHeaders(token),
    });
    await handleApiError(response);
    return response.json();
  }

  async createEligibilityRule(
    token: string,
    masterPubkey: string,
    payload: CreateEligibilityRulePayload
  ): Promise<EligibilityRule> {
    const response = await fetch(`${API_BASE_URL}/eligibility/masters/${masterPubkey}/rules`, {
      method: "POST",
      headers: getHeaders(token),
      // master_pubkey is required by CreateEligibilityRuleDTO even though it's also in the URL
      body: JSON.stringify({ master_pubkey: masterPubkey, ...payload }),
    });
    await handleApiError(response);
    return response.json();
  }

  async getMasterDetail(masterId: string, token?: string): Promise<MasterDetail> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const response = await fetch(`${API_BASE_URL}/masters/${masterId}`, {
      method: "GET",
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });

    await handleApiError(response);
    return response.json();
  }

  async getMasterEligibilityCriteria(
    masterId: string
  ): Promise<EligibilityCriterion[]> {
    const response = await fetch(
      `${API_BASE_URL}/eligibility/masters/${masterId}/rules`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    await handleApiError(response);
    return response.json();
  }

  async checkCandidateEligibility(
    token: string,
    masterId: string
  ): Promise<{ eligible: boolean; failedCriteria?: EligibilityCriterion[] }> {
    const response = await fetch(
      `${API_BASE_URL}/eligibility/masters/${masterId}/check`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );

    await handleApiError(response);
    return response.json();
  }

  async getTypeLicences(): Promise<TypeLicence[]> {
    const response = await fetch(`${API_BASE_URL}/candidates/type-licences`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    return response.json();
  }

  /** GET /candidates/nationalities — liste de référence des nationalités,
   * exposée par NationalityListView (candidate_profile.views). */
  async getNationalities(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/candidates/nationalities`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleApiError(response);
    return response.json();
  }

  async submitApplication(
    token: string,
    masterId: string
  ): Promise<Application> {
    const response = await fetch(`${API_BASE_URL}/applications/`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ masterId }),
    });

    await handleApiError(response);
    return response.json();
  }

  async getMyApplications(token: string): Promise<Application[]> {
    const response = await fetch(`${API_BASE_URL}/applications/me`, {
      method: "GET",
      headers: getHeaders(token),
    });

    await handleApiError(response);
    return response.json();
  }
}

export const mastersService = new MastersService();