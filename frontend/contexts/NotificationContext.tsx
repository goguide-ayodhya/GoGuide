"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type NotificationType = "success" | "error" | "info";

interface NotificationContextType {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  requestBrowserNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const [permissionRequested, setPermissionRequested] = useState(false);

  const showNotification = (
    type: NotificationType,
    message: string,
    title?: string,
  ) => {
    toast({
      title: title || getDefaultTitle(type),
      description: message,
      variant: type === "error" ? "destructive" : type,
      duration: 5000, // Auto-dismiss after 5 seconds
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
    // Only request in browser environment
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    // Don't request if already requested or if permission is granted/denied
    if (permissionRequested || Notification.permission !== "default") {
      return Notification.permission === "granted";
    }

    try {
      setPermissionRequested(true);
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.warn("Error requesting notification permission:", error);
      return false;
    }
  };

  // Auto-request browser notification permission on mount (optional)
  useEffect(() => {
    // Only request once and silently
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default" &&
      !permissionRequested
    ) {
      // Delay the request to avoid blocking UI
      const timer = setTimeout(() => {
        Notification.requestPermission().catch(() => {
          // Silently handle errors
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [permissionRequested]);

  const value: NotificationContextType = {
    showSuccess,
    showError,
    showInfo,
    requestBrowserNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}