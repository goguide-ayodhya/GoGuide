import admin from "firebase-admin";
import serviceAccount from "../config/firebase-admin.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
  console.log("[FIREBASE] Admin SDK initialized successfully");
} else {
  console.log("[FIREBASE] Firebase Admin already initialized");
}

export default admin;