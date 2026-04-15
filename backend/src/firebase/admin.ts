import admin from "firebase-admin";
import serviceAccount from "../config/firebase-admin.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail:
        process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:
        process.env.FIREBASE_PRIVATE_KEY,
    }),
  });
  console.log("[FIREBASE] Admin SDK initialized successfully");
} else {
  console.log("[FIREBASE] Firebase Admin already initialized");
}

export default admin;
