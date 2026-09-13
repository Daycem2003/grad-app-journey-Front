import { API_BASE_URL, getHeaders, handleApiError } from "./api";
import { authService } from "./auth-service";

export interface InAppNotification {
  pubkey: string;
  motif: string;
  document_concerne?: string | null | undefined;
  objet: string;
  corps: string;
  piece_jointe_nom?: string | null | undefined;
  piece_jointe_url?: string | null | undefined;
  application_pubkey?: string | null | undefined;
  envoyee_le: string;
  is_read: boolean;
}

export interface BroadcastNotificationDTO {
  pubkey: string;
  cible: "COORDINATEURS" | "CANDIDATS" | "TOUS" | "MASTER_RANG" | string;
  master_pubkey?: string | null | undefined;
  master_nom?: string | null | undefined;
  rang_max?: number | null | undefined;
  objet: string;
  message: string;
  piece_jointe_nom?: string | null | undefined;
  piece_jointe_url?: string | null | undefined;
  envoyee_le: string;
  created_at: string;
}

export interface NotifyTopRankedResult {
  broadcast: BroadcastNotificationDTO;
  notified_count: number;
  master_nom: string;
  candidates: Array<{
    nom: string;
    prenom: string;
    cin: string;
    rang: number;
    score: number | null;
  }>;
}

export const notificationsService = {
  async getMyNotifications(token?: string | undefined): Promise<InAppNotification[]> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${API_BASE_URL}/notifications/me`, {
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async markAsRead(pubkey: string, token?: string | undefined): Promise<InAppNotification> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${API_BASE_URL}/notifications/${pubkey}/read`, {
      method: "POST",
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async broadcastNotification(
    payload:
      | {
          cible: "COORDINATEURS" | "CANDIDATS" | "TOUS" | "MASTER_RANG";
          objet: string;
          message: string;
          master_pubkey?: string;
          rang_max?: number;
          piece_jointe?: File | null;
        }
      | FormData,
    token?: string | undefined
  ): Promise<BroadcastNotificationDTO> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const headers = getHeaders(effectiveToken);

    let body: BodyInit;
    if (payload instanceof FormData) {
      delete (headers as Record<string, string>)["Content-Type"];
      body = payload;
    } else if (payload.piece_jointe) {
      const fd = new FormData();
      fd.append("cible", payload.cible);
      fd.append("objet", payload.objet);
      fd.append("message", payload.message);
      if (payload.master_pubkey) fd.append("master_pubkey", payload.master_pubkey);
      if (payload.rang_max) fd.append("rang_max", payload.rang_max.toString());
      fd.append("piece_jointe", payload.piece_jointe);
      delete (headers as Record<string, string>)["Content-Type"];
      body = fd;
    } else {
      body = JSON.stringify(payload);
    }

    const res = await fetch(`${API_BASE_URL}/notifications/broadcast/`, {
      method: "POST",
      headers,
      credentials: "include",
      body,
    });
    await handleApiError(res);
    return res.json();
  },

  async notifyTopRanked(
    payload:
      | {
          master_pubkey: string;
          n_premiers: number;
          objet?: string;
          piece_jointe?: File | null;
          joindre_classement_csv?: boolean;
        }
      | FormData,
    token?: string | undefined
  ): Promise<NotifyTopRankedResult> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const headers = getHeaders(effectiveToken);

    let body: BodyInit;
    if (payload instanceof FormData) {
      delete (headers as Record<string, string>)["Content-Type"];
      body = payload;
    } else {
      const fd = new FormData();
      fd.append("master_pubkey", payload.master_pubkey);
      fd.append("n_premiers", payload.n_premiers.toString());
      if (payload.objet) fd.append("objet", payload.objet);
      if (payload.joindre_classement_csv) {
        fd.append("joindre_classement_csv", "true");
      }
      if (payload.piece_jointe) {
        fd.append("piece_jointe", payload.piece_jointe);
      }
      delete (headers as Record<string, string>)["Content-Type"];
      body = fd;
    }

    const res = await fetch(`${API_BASE_URL}/notifications/notify-top-ranked/`, {
      method: "POST",
      headers,
      credentials: "include",
      body,
    });
    await handleApiError(res);
    return res.json();
  },

  async getAttachmentUrl(
    pubkey: string,
    token?: string | undefined
  ): Promise<{ url: string; filename: string }> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${API_BASE_URL}/notifications/${pubkey}/attachment-url/`, {
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },

  async listBroadcasts(token?: string | undefined): Promise<BroadcastNotificationDTO[]> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${API_BASE_URL}/notifications/broadcasts/`, {
      headers: getHeaders(effectiveToken),
      credentials: "include",
    });
    await handleApiError(res);
    return res.json();
  },
};
