export type Role = "guest" | "candidat" | "coordinateur" | "admin";

export type MasterStatut = "Ouvert" | "Fermé" | "À venir";

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
  diplome: {
    annee: string;
    universite: string;
    fichier: string | null;
  };
  aRedouble: boolean;
  redoublements: Redoublement[];
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

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
