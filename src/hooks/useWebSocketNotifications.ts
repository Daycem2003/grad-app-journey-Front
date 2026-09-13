import { useEffect, useRef } from "react";
import {
  useNotifications,
  type WebSocketEvent,
  type WebSocketNotificationPayload,
} from "@/lib/notification-context";

export type { WebSocketEvent, WebSocketNotificationPayload };

/**
 * Hook pour s'abonner aux événements WebSocket temps réel depuis n'importe quel composant.
 * Utilise la connexion globale fournie par NotificationProvider.
 */
export function useWebSocketNotifications(
  onNotification?: (event: WebSocketEvent) => void
) {
  let notifContext: ReturnType<typeof useNotifications> | null = null;
  try {
    notifContext = useNotifications();
  } catch {
    notifContext = null;
  }

  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    if (!notifContext || !callbackRef.current) return;
    const unsubscribe = notifContext.subscribe((event) => {
      if (callbackRef.current) {
        callbackRef.current(event);
      }
    });
    return unsubscribe;
  }, [notifContext]);
}
