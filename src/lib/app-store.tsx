import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  CANDIDATS,
  CANDIDATURES,
  MASTERS,
  NOTIFICATIONS,
  calculerScore,
} from "./mock-data";
import type {
  Candidat,
  Candidature,
  CandidatureStatut,
  Master,
  Notification,
  Role,
} from "./types";

/**
 * Couche d'état applicative (mockée).
 * Toutes les lectures/écritures passent par ce store : il suffira de remplacer
 * son implémentation par des appels REST (Django / FastAPI) plus tard.
 */
type AppStore = {
  role: Role;
  setRole: (role: Role) => void;
  masters: Master[];
  candidats: Candidat[];
  candidatures: Candidature[];
  notifications: Notification[];
  profil: Candidat | null;
  creerProfil: (candidat: Candidat) => void;
  ajouterMaster: (master: Master) => void;
  postuler: (masterId: string) => void;
  changerStatut: (candidatureId: string, statut: CandidatureStatut) => void;
  envoyerNotification: (n: Omit<Notification, "id" | "date" | "lu">) => void;
  periode: { debut: string; fin: string };
  setPeriode: (p: { debut: string; fin: string }) => void;
  getMaster: (id: string) => Master | undefined;
  getCandidat: (id: string) => Candidat | undefined;
};

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("guest");
  const [masters, setMasters] = useState<Master[]>(MASTERS);
  const [candidats, setCandidats] = useState<Candidat[]>(CANDIDATS);
  const [candidatures, setCandidatures] = useState<Candidature[]>(CANDIDATURES);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [profil, setProfil] = useState<Candidat | null>(null);
  const [periode, setPeriode] = useState({ debut: "2026-07-01", fin: "2026-08-31" });

  const value = useMemo<AppStore>(() => {
    const getMaster = (id: string) => masters.find((m) => m.id === id);
    const getCandidat = (id: string) =>
      profil && profil.id === id ? profil : candidats.find((c) => c.id === id);

    return {
      role,
      setRole,
      masters,
      candidats,
      candidatures,
      notifications,
      profil,
      periode,
      setPeriode,
      getMaster,
      getCandidat,
      creerProfil: (candidat) => {
        setProfil(candidat);
        setCandidats((prev) => [candidat, ...prev]);
        setRole("candidat");
      },
      ajouterMaster: (master) => setMasters((prev) => [master, ...prev]),
      postuler: (masterId) => {
        const master = masters.find((m) => m.id === masterId);
        if (!master || !profil) return;
        const today = new Date().toISOString().slice(0, 10);
        setCandidatures((prev) => [
          {
            id: `a-${Date.now()}`,
            candidatId: profil.id,
            masterId,
            date: today,
            score: calculerScore(profil, master),
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
  }, [role, masters, candidats, candidatures, notifications, profil, periode]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans AppStoreProvider");
  return ctx;
}
