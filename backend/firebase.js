import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

// ─── Firebase Admin Initialization ──────────────────────────────────────────
try {
  if (admin.apps.length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = JSON.parse(
        readFileSync(join(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH), 'utf8')
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    } else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }
  }
} catch (error) {
  console.warn('❌ Firebase Initialization Error:', error.message);
}

export const db = admin.firestore();
export default admin;
