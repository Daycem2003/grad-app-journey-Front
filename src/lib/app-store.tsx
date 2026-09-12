import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  mastersService,
  type Master,
  type CreateMasterPayload,
  type ScoreCriterionPayload,
  type CreateEligibilityRulePayload,
} from "@/services/masters-service";
import type { Role } from "./types";

/**
 * Couche d'état applicative globale.
 * Les Masters viennent exclusivement de l'API backend réelle (GET /api/v1/masters/).
 * La création d'un Master (coordinateur) est également orchestrée via le backend réel.
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
  periode: { debut: string; fin: string };
  setPeriode: (p: { debut: string; fin: string }) => void;
  getMaster: (pubkey: string) => Master | undefined;
};

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("guest");
  const [masters, setMasters] = useState<Master[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [mastersError, setMastersError] = useState<string | null>(null);
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

    return {
      role,
      setRole,
      masters,
      mastersLoading,
      mastersError,
      refetchMasters: fetchMasters,
      periode,
      setPeriode,
      getMaster,

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
    };
  }, [role, masters, mastersLoading, mastersError, periode]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans AppStoreProvider");
  return ctx;
}
 