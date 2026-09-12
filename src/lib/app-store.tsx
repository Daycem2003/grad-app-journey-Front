import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CANDIDATS,
  CANDIDATURES,
  NOTIFICATIONS,
} from "./mock-data";
import {
  mastersService,
  type Master,
  type CreateMasterPayload,
  type ScoreCriterionPayload,
  type CreateEligibilityRulePayload,
} from "@/services/masters-service";
import type {
  Candidat,
  Candidature,
  CandidatureStatut,
  Notification,
  Role,
} from "./types";

/**
 * Couche d'état applicative.
 * Les Masters viennent de l'API backend réelle (GET /api/v1/masters/).
 * La création d'un Master (coordinateur) est également branchée sur le
 * backend réel : POST /masters/ puis, en séquence, l'ajout des documents
 * requis, de la formule de score, des critères d'éligibilité, et enfin la
 * publication (POST /masters/{pubkey}/publish).
 *
 * Candidats / candidatures / notifications restent mockés pour l'instant
 * (hors périmètre de cette tâche) — ils seront branchés séparément sur leurs
 * propres endpoints.
 */

export interface CreateMasterFormPayload {
  master: CreateMasterPayload;
  requiredDocuments: string[];
  scoreCriteria: ScoreCriterionPayload[];
  eligibilityRules: CreateEligibilityRulePayload[];
}

type AppStore = {
  role: Role;
  setRole: (role: Role) => void;
  masters: Master[];
  mastersLoading: boolean;
  mastersError: string | null;
  refetchMasters: () => void;
  creerMaster: (payload: CreateMasterFormPayload, token: string) => Promise<Master>;
  candidats: Candidat[];
  candidatures: Candidature[];
  notifications: Notification[];
  profil: Candidat | null;
  creerProfil: (candidat: Candidat) => void;
  postuler: (masterId: string) => void;
  changerStatut: (candidatureId: string, statut: CandidatureStatut) => void;
  envoyerNotification: (n: Omit<Notification, "id" | "date" | "lu">) => void;
  periode: { debut: string; fin: string };
  setPeriode: (p: { debut: string; fin: string }) => void;
  getMaster: (pubkey: string) => Master | undefined;
  getCandidat: (id: string) => Candidat | undefined;
};

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("guest");

  const [masters, setMasters] = useState<Master[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [mastersError, setMastersError] = useState<string | null>(null);

  const [candidats, setCandidats] = useState<Candidat[]>(CANDIDATS);
  const [candidatures, setCandidatures] = useState<Candidature[]>(CANDIDATURES);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [profil, setProfil] = useState<Candidat | null>(null);
  const [periode, setPeriode] = useState({ debut: "2026-07-01", fin: "2026-08-31" });

  const fetchMasters = () => {
    setMastersLoading(true);
    setMastersError(null);
    mastersService
      .listMasters()
      .then(setMasters)
      .catch((err) =>
        setMastersError(err instanceof Error ? err.message : "Erreur de chargement des Masters"),
      )
      .finally(() => setMastersLoading(false));
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  const value = useMemo<AppStore>(() => {
    const getMaster = (pubkey: string) => masters.find((m) => m.pubkey === pubkey);
    const getCandidat = (id: string) =>
      profil && profil.id === id ? profil : candidats.find((c) => c.id === id);

    return {
      role,
      setRole,
      masters,
      mastersLoading,
      mastersError,
      refetchMasters: fetchMasters,
      candidats,
      candidatures,
      notifications,
      profil,
      periode,
      setPeriode,
      getMaster,
      getCandidat,

      /**
       * Orchestration complète de la création d'un appel à candidature :
       * 1. POST /masters/                                    -> crée le Master
       * 2. POST /masters/{pubkey}/required-documents (x N)    -> documents requis
       * 3. PUT  /masters/{pubkey}/score-formula                -> formule de score
       * 4. POST /eligibility/masters/{pubkey}/rules (x N)      -> critères d'éligibilité
       * 5. POST /masters/{pubkey}/publish                      -> publication
       * Rafraîchit la liste des masters depuis le backend à la fin.
       */
      creerMaster: async (payload, token) => {
        const master = await mastersService.createMaster(token, payload.master);

        for (const type of payload.requiredDocuments) {
          await mastersService.addRequiredDocument(token, master.pubkey, type);
        }

        if (payload.scoreCriteria.length > 0) {
          await mastersService.setScoreFormula(token, master.pubkey, payload.scoreCriteria);
        }

        for (const rule of payload.eligibilityRules) {
          await mastersService.createEligibilityRule(token, master.pubkey, rule);
        }

        const published = await mastersService.publishMaster(token, master.pubkey);
        fetchMasters();
        return published;
      },

      creerProfil: (candidat) => {
        setProfil(candidat);
        setCandidats((prev) => [candidat, ...prev]);
        setRole("candidat");
      },
      postuler: (masterId) => {
        const master = masters.find((m) => m.pubkey === masterId);
        if (!master || !profil) return;
        const today = new Date().toISOString().slice(0, 10);
        setCandidatures((prev) => [
          {
            id: `a-${Date.now()}`,
            candidatId: profil.id,
            masterId,
            // Le score dépend de la formule de pondération (ScoreFormula) définie
            // côté backend par master — non encore exposée par l'API consommée ici.
            // À brancher sur un vrai endpoint de calcul/soumission de candidature.
            score: 0,
            statut: "Soumise",
            majLe: today,
          },
          ...prev,
        ]);
      },
      changerStatut: (candidatureId, statut) =>
        setCandidatures((prev) =>
          prev.map((c) =>
            c.id === candidatureId
              ? { ...c, statut, majLe: new Date().toISOString().slice(0, 10) }
              : c,
          ),
        ),
      envoyerNotification: (n) =>
        setNotifications((prev) => [
          { ...n, id: `n-${Date.now()}`, date: new Date().toISOString().slice(0, 10), lu: false },
          ...prev,
        ]),
    };
  }, [role, masters, mastersLoading, mastersError, candidats, candidatures, notifications, profil, periode]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans AppStoreProvider");
  return ctx;
} 