/**
 * Create the super admin user document in Firestore.
 * Uses Firebase Admin SDK to bypass security rules.
 *
 * Pre-requisite:
 *   1. Create a Firebase Auth account (email/password or Google) via Firebase Console
 *   2. Copy the Auth UID
 *   3. Set SUPER_ADMIN_UID, SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME in .env
 *   4. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env
 *   5. Run: node scripts/seed-super-admin.mjs
 *
 * Idempotent: Checks if users/{uid} exists before writing.
 */

import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

const uid = process.env.SUPER_ADMIN_UID;
const email = process.env.SUPER_ADMIN_EMAIL;
const name = process.env.SUPER_ADMIN_NAME;

if (!uid || !email || !name) {
  console.error('Missing env vars: SUPER_ADMIN_UID, SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME');
  console.error('Create a Firebase Auth account first, then set these in .env');
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

async function seed() {
  const ref = db.doc(`users/${uid}`);
  const snap = await ref.get();

  if (snap.exists) {
    console.log(`✓ Super admin user already exists: ${snap.data().email}`);
    return;
  }

  await ref.set({
    uid,
    email,
    displayName: name,
    role: 'super',
    provider: 'email',
    assignedWeddingSlug: 'dani-marini',
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`✓ Super admin created: ${email} (${uid})`);
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
