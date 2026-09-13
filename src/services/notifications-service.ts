import { API_BASE_URL, getHeaders, handleApiError } from "./api";
import { authService } from "./auth-service";

export interface InAppNotification {
  pubkey: string;
  motif: string;
  document_concerne?: string | null | undefined;
  objet: string;
  corps: string;
  application_pubkey?: string | null | undefined;
  envoyee_le: string;
  is_read: boolean;
}

export interface BroadcastNotificationDTO {
  pubkey: string;
  cible: "COORDINATEURS" | "CANDIDATS" | "TOUS" | string;
  objet: string;
  message: string;
  envoyee_le: string;
  created_at: string;
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
    payload: { cible: "COORDINATEURS" | "CANDIDATS" | "TOUS"; objet: string; message: string },
    token?: string | undefined
  ): Promise<BroadcastNotificationDTO> {
    const effectiveToken = token ?? authService.getStoredToken() ?? undefined;
    const res = await fetch(`${API_BASE_URL}/notifications/broadcast/`, {
      method: "POST",
      headers: getHeaders(effectiveToken),
      credentials: "include",
      body: JSON.stringify(payload),
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

