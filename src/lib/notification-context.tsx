import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "./auth-context";
import { API_BASE_URL } from "@/services/api";
import {
  notificationsService,
  type InAppNotification,
} from "@/services/notifications-service";

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

type NotificationListener = (event: WebSocketEvent) => void;

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  isConnected: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (pubkey: string) => Promise<void>;
  subscribe: (listener: NotificationListener) => () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<NotificationListener>>(new Set());
  const seenPubkeysRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  const subscribe = useCallback((listener: NotificationListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      seenPubkeysRef.current.clear();
      isInitialLoadRef.current = true;
      return;
    }
    try {
      const list = await notificationsService.getMyNotifications();
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
      list.forEach((n) => seenPubkeysRef.current.add(n.pubkey));
    } catch {
      // Ignoré si échec
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(
    async (pubkey: string) => {
      try {
        await notificationsService.markAsRead(pubkey);
        setNotifications((prev) =>
          prev.map((n) => (n.pubkey === pubkey ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error("Erreur marquage lecture:", err);
      }
    },
    []
  );

  // 1. Synchronisation périodique automatique (polling réactif toutes les 3s)
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      seenPubkeysRef.current.clear();
      isInitialLoadRef.current = true;
      return;
    }

    let isSubscribed = true;

    const fetchSync = async () => {
      try {
        const list = await notificationsService.getMyNotifications();
        if (!isSubscribed) return;

        // Détection des nouvelles notifications non vues
        if (!isInitialLoadRef.current) {
          const brandNew = list.filter((n) => !seenPubkeysRef.current.has(n.pubkey));
          if (brandNew.length > 0) {
            brandNew.forEach((n) => {
              seenPubkeysRef.current.add(n.pubkey);
              toast.info(n.objet, {
                description: n.corps,
                duration: 6000,
              });
            });
          }
        } else {
          list.forEach((n) => seenPubkeysRef.current.add(n.pubkey));
          isInitialLoadRef.current = false;
        }

        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.is_read).length);
      } catch {
        // Silencieux
      }
    };

    void fetchSync();
    const interval = window.setInterval(fetchSync, 3000);

    return () => {
      isSubscribed = false;
      window.clearInterval(interval);
    };
  }, [isAuthenticated, user]);

  // 2. Connexion WebSocket globale persistante (0ms temps réel natif)
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

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
          setIsConnected(true);

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
              const pubkey = payload.pubkey || `notif_${Date.now()}`;

              if (!seenPubkeysRef.current.has(pubkey)) {
                seenPubkeysRef.current.add(pubkey);

                // Toast interactif en temps réel
                toast.info(title, {
                  description: desc,
                  duration: 6000,
                });
              }

              const newNotif: InAppNotification = {
                pubkey,
                motif: payload.motif || "AUTRE",
                document_concerne: payload.document_concerne || null,
                objet: payload.objet,
                corps: payload.corps || payload.message || "",
                piece_jointe_nom: payload.piece_jointe_nom || null,
                piece_jointe_url: payload.piece_jointe_url || null,
                application_pubkey: payload.application_pubkey || null,
                envoyee_le: payload.envoyee_le || new Date().toISOString(),
                is_read: false,
              };

              // Mise à jour instantanée de l'état
              setNotifications((prev) => {
                if (prev.some((n) => n.pubkey === newNotif.pubkey)) return prev;
                return [newNotif, ...prev];
              });
              setUnreadCount((c) => c + 1);

              // Notification de tous les listeners actifs
              listenersRef.current.forEach((listener) => {
                try {
                  listener(data as WebSocketEvent);
                } catch (listenerErr) {
                  console.error("Erreur listener notification:", listenerErr);
                }
              });
            }
          } catch {
            // Ignorer les messages mal formés
          }
        };

        socket.onclose = (e) => {
          setIsConnected(false);
          if (pingInterval) clearInterval(pingInterval);
          if (!isCancelled && e.code !== 4401 && e.code !== 1000) {
            reconnectTimeout = window.setTimeout(connect, 3000);
          }
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch {
        if (!isCancelled) {
          reconnectTimeout = window.setTimeout(connect, 3000);
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
      setIsConnected(false);
    };
  }, [isAuthenticated, accessToken]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        refreshNotifications,
        markAsRead,
        subscribe,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
