import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type AuthUserProvider = 'email' | 'google';

export interface EnsurePendingUserDocumentResult {
  created: boolean;
  exists: boolean;
}

export function getAuthUserProvider(user: User): AuthUserProvider {
  return user.providerData.some((provider) => provider.providerId === 'google.com') ? 'google' : 'email';
}

export async function ensurePendingUserDocument(
  user: User,
  displayName = user.displayName ?? user.email ?? 'User',
): Promise<EnsurePendingUserDocumentResult> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { created: false, exists: true };
  }

  await setDoc(ref, {
    uid: user.uid,
    email: user.email ?? '',
    displayName,
    role: 'pending',
    provider: getAuthUserProvider(user),
    assignedWeddingSlug: null,
    createdAt: serverTimestamp(),
  });

  return { created: true, exists: false };
}
