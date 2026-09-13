import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/services/api";

export interface WebSocketNotificationPayload {
  pubkey?: string;
  motif?: string;
  document_concerne?: string | null;
  objet: string;
  corps?: string;
  message?: string;
  cible?: string;
  application_pubkey?: string | null;
  envoyee_le?: string;
}

export interface WebSocketEvent {
  event: "notification:new" | "notification:broadcast" | string;
  payload: WebSocketNotificationPayload;
}

export function useWebSocketNotifications(
  onNotification?: (event: WebSocketEvent) => void
) {
  const { accessToken, isAuthenticated } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    // Calcul de l'URL WebSocket à partir de API_BASE_URL
    let wsBase: string;
    try {
      const url = new URL(API_BASE_URL);
      const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
      wsBase = `${wsProtocol}//${url.host}/ws/notifications/`;
    } catch {
      wsBase = "ws://127.0.0.1:8000/ws/notifications/";
    }

    const wsUrl = `${wsBase}?token=${encodeURIComponent(accessToken)}`;
    let isCancelled = false;
    let pingInterval: number | null = null;
    let reconnectTimeout: number | null = null;

    function connect() {
      if (isCancelled) return;

      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          // Keepalive ping toutes les 25 secondes
          pingInterval = window.setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "ping" }));
            }
          }, 25000);
        };

        socket.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === "pong") return;

            if (data.event === "notification:new" || data.event === "notification:broadcast") {
              const payload: WebSocketNotificationPayload = data.payload || {};
              const title = payload.objet || "Nouvelle notification";
              const desc = payload.corps || payload.message || "";

              // Toast temps réel
              toast.info(title, {
                description: desc,
                duration: 6000,
              });

              // Callback de mise à jour locale
              if (onNotificationRef.current) {
                onNotificationRef.current(data as WebSocketEvent);
              }
            }
          } catch {
            // Message format non supporté, ignoré
          }
        };

        socket.onclose = (e) => {
          if (pingInterval) clearInterval(pingInterval);
          if (!isCancelled && e.code !== 4401 && e.code !== 1000) {
            // Tentative de reconnexion après 5 secondes
            reconnectTimeout = window.setTimeout(connect, 5000);
          }
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch {
        if (!isCancelled) {
          reconnectTimeout = window.setTimeout(connect, 5000);
        }
      }
    }

    connect();

    return () => {
      isCancelled = true;
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken]);
}
