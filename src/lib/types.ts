export type Role = "guest" | "candidat" | "coordinateur" | "admin";

export type MasterStatut = "Ouvert" | "Fermé" | "À venir";

export type MasterSummary = {
  pubkey: string;
  nom: string;
  universite: string;
  ville: string;
  domaine: string;
  statut: string;
};

export type Critere = {
  id: string;
  libelle: string;
  valeur: string;
};

export type Ponderation = {
  l1: number;
  l2: number;
  l3: number;
};

/**
 * @deprecated pour l'affichage du dashboard : ce type ne correspond à AUCUN serializer backend
 * actuel (ni MasterSummarySerializer, ni MasterSerializer). Conservé pour ne pas casser
 * d'éventuels autres écrans (fiche détail, formulaire de création) qui restent à vérifier.
 * Utilisez MasterSummary pour tout ce qui vient de GET /api/v1/masters/.
 */
export type Master = {
  id: string;
  nom: string;
  universite: string;
  etablissement: string;
  ville: string;
  domaine: string;
  descriptionCourte: string;
  description: string;
  places: number;
  dateDebut: string;
  dateFin: string;
  statut: MasterStatut;
  criteres: Critere[];
  ponderation: Ponderation;
  documents: string[];
};

export type AnneeLicence = {
  anneeUniversitaire: string;
  moyenne: string;
  releve: string | null;
};

export type LicenceObtenue = {
  nom: string;
  universite: string;
  a1: AnneeLicence;
  a2: AnneeLicence;
  a3: AnneeLicence;
  moyenneGenerale: string;
  diplome: string | null;
};

export type Redoublement = {
  annee: "Licence 1" | "Licence 2" | "Licence 3";
  justificatifs: string[];
};

export type Candidat = {
  id: string;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone: string;
  ville: string;
  anneeNaissance: string;
  l1: AnneeLicence;
  l2: AnneeLicence;
  l3: AnneeLicence;
  licences?: LicenceObtenue[];
  diplome: {
    annee: string;
    universite: string;
    fichier: string | null;
  };
  aRedouble: boolean;
  redoublements: Redoublement[];
  aFaitPremiereAnneeMaster?: boolean;
  premiereAnneeMaster?: {
    master: string;
    institut: string;
    releve: string | null;
  } | null;
};

export type CandidatureStatut = "Soumise" | "À réviser" | "Approuvée" | "Rejetée";

export type Candidature = {
  id: string;
  candidatId: string;
  masterId: string;
  date: string;
  score: number;
  statut: CandidatureStatut;
  majLe: string;
};

export type Notification = {
  id: string;
  destinataire: string;
  objet: string;
  message: string;
  date: string;
  lu: boolean;
};

/** Référence d'une source utilisée pour une affirmation (renvoyée par /knowledge/ask). */
export type Citation = {
  n: number;
  source_file: string;
  page: number;
  extraction_method: string;
  score: number;
  excerpt: string;
};

/** Statut d'une réponse de l'assistant (jamais une erreur HTTP). */
export type KnowledgeStatus = "answered" | "answered_ungrounded" | "no_relevant_context";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  // Champs optionnels, remplis uniquement pour les messages de l'assistant RAG.
  status?: KnowledgeStatus;
  grounded?: boolean;
  citations?: Citation[];
  // Réponse de service en échec (échec réseau, 4xx/5xx) → bulle d'erreur,
  // jamais une bulle « vide » ni un chargement qui ne se résout pas.
  error?: boolean;
};

export const typeLicenceService = {
  async list(): Promise<TypeLicenceRef[]> {
    const res = await fetch(`${API_BASE}/type-licences`, { credentials: "include" });
    if (!res.ok) throw new Error("Impossible de charger la liste des licences.");
    return res.json();
  },
};
