import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  deleteToken,
  isSupported,
} from "firebase/messaging";

// Firebase configuration (use environment variables in production)
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDYDigwWDyC_v3NsBgA72nn2gnZ_N3iSos",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "goguideayodhya.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "goguideayodhya",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "goguideayodhya.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "563614061104",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:563614061104:web:b455808458dc0b9e2e93f5",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-983F9C8HX3",
};

// VAPID Key for push notifications (from environment variables)
const VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  "BKagOny0KF_2pCJQ3m_xmWeO0OV6yLj3WmozYzMzcKCKQsgKVFDKjJDhRoV2e2W6moL0ewzQ8rZu";

interface FirebaseState {
  app: FirebaseApp | null;
  analytics: Analytics | null;
  messaging: Messaging | null;
  initialized: boolean;
}

const firebaseState: FirebaseState = {
  app: null,
  analytics: null,
  messaging: null,
  initialized: false,
};

/**
 * Check if running on client side
 */
function isClientSide(): boolean {
  return typeof window !== "undefined";
}

/**
 * Check if notifications are supported in browser
 */
async function isNotificationsSupported(): Promise<boolean> {
  if (!isClientSide()) return false;
  if (!("Notification" in window)) return false;
  if (!("serviceWorker" in navigator)) return false;

  try {
    return await isSupported();
  } catch (error) {
    console.warn("Notification support check failed:", error);
    return false;
  }
}

/**
 * Initialize Firebase app with lazy loading (only once, on demand)
 */
export const initializeFirebase = (): FirebaseApp | null => {
  if (!isClientSide()) {
    return null;
  }

  if (firebaseState.app) {
    return firebaseState.app;
  }

  try {
    firebaseState.app = initializeApp(firebaseConfig);

    if (process.env.NODE_ENV === "production") {
      try {
        firebaseState.analytics = getAnalytics(firebaseState.app);
      } catch (error) {
        console.warn("Analytics initialization failed:", error);
      }
    }

    firebaseState.initialized = true;
    return firebaseState.app;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return null;
  }
};

/**
 * Get Firebase Messaging instance (lazy loaded)
 */
export const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (!isClientSide()) {
    return null;
  }

  // Return cached instance if already initialized
  if (firebaseState.messaging) {
    return firebaseState.messaging;
  }

  try {
    // Check if notifications are supported
    const supported = await isNotificationsSupported();
    if (!supported) {
      console.warn("Notifications not supported in this browser");
      return null;
    }

    // Initialize Firebase if not already done
    const app = initializeFirebase();
    if (!app) {
      return null;
    }

    firebaseState.messaging = getMessaging(app);
    return firebaseState.messaging;
  } catch (error) {
    console.warn("Messaging initialization failed:", error);
    return null;
  }
};

/**
 * Get FCM token for push notifications
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!isClientSide()) {
      return null;
    }

    const msg = await getMessagingInstance();
    if (!msg) {
      console.warn("Messaging instance not available");
      return null;
    }

    // Check permission
    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
    });

    if (!token) {
      console.warn("Could not retrieve FCM token");
      return null;
    }

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

/**
 * Setup listener for foreground notifications
 */
export const setupForegroundNotifications = async (
  callback: (message: any) => void,
): Promise<(() => void) | void> => {
  try {
    const msg = await getMessagingInstance();
    if (!msg) {
      console.warn(
        "Cannot setup foreground notifications: messaging instance not available",
      );
      return;
    }

    if (typeof callback === "function") {
      return onMessage(msg, callback);
    }
  } catch (error) {
    console.error("Error setting up foreground notifications:", error);
  }
};

/**
 * Delete FCM token (used on logout)
 */
export const deleteFCMToken = async (): Promise<boolean> => {
  try {
    const msg = await getMessagingInstance();
    if (!msg) {
      return true; // Already no token
    }

    await deleteToken(msg);
    return true;
  } catch (error) {
    console.warn("Error deleting FCM token:", error);
    return false;
  }
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!isClientSide() || !("Notification" in window)) {
      return false;
    }

    // Already granted
    if (Notification.permission === "granted") {
      return true;
    }

    // User denied previously - don't ask again
    if (Notification.permission === "denied") {
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

//  Register service worker for background notifications
export const registerServiceWorker =
  async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      if (!isClientSide() || !("serviceWorker" in navigator)) {
        return null;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" },
      );

      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.warn("Service Worker registration failed:", error);
      return null;
    }
  };
