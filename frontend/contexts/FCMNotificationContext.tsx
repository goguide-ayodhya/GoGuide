"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getFCMToken,
  setupForegroundNotifications,
  initializeFirebase,
  registerServiceWorker,
  requestNotificationPermission,
  deleteFCMToken,
} from "@/lib/firebase";
import { saveFCMTokenToBackend } from "@/lib/api/notification";

type NotificationType = "success" | "error" | "info";

interface FCMNotificationContextType {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  requestBrowserNotificationPermission: () => Promise<boolean>;
  fcmToken: string | null;
}

const FCMNotificationContext = createContext<
  FCMNotificationContextType | undefined
>(undefined);

const PERMISSION_REQUEST_KEY = "notification_permission_requested";
const FCM_TOKEN_KEY = "fcm_token";

export function FCMNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const showNotification = (
    type: NotificationType,
    message: string,
    title?: string,
  ) => {
    toast({
      title: title || getDefaultTitle(type),
      description: message,
      variant: type === "error" ? "destructive" : type,
      duration: 5000,
    });
  };

  const getDefaultTitle = (type: NotificationType): string => {
    switch (type) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      case "info":
        return "Information";
      default:
        return "Notification";
    }
  };

  const showSuccess = (message: string, title?: string) => {
    showNotification("success", message, title);
  };

  const showError = (message: string, title?: string) => {
    showNotification("error", message, title);
  };

  const showInfo = (message: string, title?: string) => {
    showNotification("info", message, title);
  };

  const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    try {
      const permission = await requestNotificationPermission();
      if (permission) {
        localStorage.setItem(PERMISSION_REQUEST_KEY, "true");
      }
      return permission;
    } catch (error) {
      console.warn("Error requesting notification permission:", error);
      return false;
    }
  };

  const handleForegroundNotification = (message: any) => {
    console.log("📩 Foreground message received", message);
    // const { notification } = message;
    const notification = message.notification || {
      title: message.data?.title,
      body: message.data?.body,
    };
    if (notification) {
      showNotification(
        "info",
        notification.body || "New notification",
        notification.title,
      );
    }
  };

  // Initialize Firebase and setup notifications on mount
  useEffect(() => {
    if (typeof window === "undefined" || initialized) return;

    const initialize = async () => {
      let unsubscribe: (() => void) | void;

      try {
        initializeFirebase();
        await registerServiceWorker();

        // ✅ ALWAYS ensure permission
        if (Notification.permission !== "granted") {
          await requestBrowserNotificationPermission();
        }

        // ✅ ALWAYS get token if permission granted
        if (Notification.permission === "granted") {
          const token = await getFCMToken();
          console.log("🔥 FCM TOKEN:", token);

          if (token) {
            setFcmToken(token);
            localStorage.setItem("fcm_token", token);

            console.log("🚀 Saving token to backend...");
            await saveFCMTokenToBackend(token);
          } else {
            console.warn("❌ Token not generated");
          }
        } else {
          console.warn("❌ Notification permission not granted");
        }

        // ✅ foreground listener
        unsubscribe = await setupForegroundNotifications(
          handleForegroundNotification,
        );

        setInitialized(true);
      } catch (error) {
        console.warn("Error initializing notifications:", error);
        setInitialized(true);
      }

      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    };

    const cleanupPromise = initialize();
    return () => {
      cleanupPromise.then((cleanup) => {
        if (typeof cleanup === "function") cleanup();
      });
    };
  }, []);

  // Handle token update when user authenticates
  useEffect(() => {
    if (!initialized || typeof window === "undefined") return;

    const handleAuthChange = async () => {
      const authToken = localStorage.getItem("token");

      if (authToken && Notification.permission === "granted") {
        // User logged in - ensure token is saved
        const cachedToken = localStorage.getItem(FCM_TOKEN_KEY);
        if (cachedToken) {
          await saveFCMTokenToBackend(cachedToken);
        } else {
          const newToken = await getFCMToken();
          if (newToken) {
            setFcmToken(newToken);
            localStorage.setItem(FCM_TOKEN_KEY, newToken);
            await saveFCMTokenToBackend(newToken);
          }
        }
      } else if (!authToken) {
        // User logged out - clear token
        await deleteFCMToken();
        localStorage.removeItem(FCM_TOKEN_KEY);
        setFcmToken(null);
      }
    };

    // Check on storage change (login/logout in another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        handleAuthChange();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [initialized]);

  const value: FCMNotificationContextType = {
    showSuccess,
    showError,
    showInfo,
    requestBrowserNotificationPermission,
    fcmToken,
  };

  return (
    <FCMNotificationContext.Provider value={value}>
      {children}
    </FCMNotificationContext.Provider>
  );
}

export function useFCMNotification() {
  const context = useContext(FCMNotificationContext);
  if (context === undefined) {
    throw new Error(
      "useFCMNotification must be used within a FCMNotificationProvider",
    );
  }
  return context;
}
