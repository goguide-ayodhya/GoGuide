importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyDYDigwWDyC_v3NsBgA72nn2gnZ_N3iSos",
  authDomain: "goguideayodhya.firebaseapp.com",
  projectId: "goguideayodhya",
  storageBucket: "goguideayodhya.firebasestorage.app",
  messagingSenderId: "563614061104",
  appId: "1:563614061104:web:b455808458dc0b9e2e93f5",
  measurementId: "G-983F9C8HX3",
};

// Initialize Firebase
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error("Firebase initialization failed in service worker:", error);
}

const messaging = firebase.messaging(); // comes from firebase-messaging-compat.js

//  This is triggered when app is closed or in background
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationBody =
    payload.notification?.body || "You have a new message";

  const notificationOptions = {
    body: notificationBody,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: payload.data?.type || "notification",
    requireInteraction: false,
    data: payload.data || {},
    ...(payload.data?.clickAction && {
      data: {
        ...payload.data,
        click_action: payload.data.clickAction,
      },
    }),
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen =
    event.notification.data?.clickAction ||
    event.notification.data?.click_action ||
    "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no window found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification.tag);
});

self.addEventListener("push", (event) => {
  try {
    if (event.data) {
      const payload = event.data.json();
      console.log("Push event received:", payload);
    }
  } catch (error) {
    console.error("Error handling push event:", error);
  }
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
});

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});
