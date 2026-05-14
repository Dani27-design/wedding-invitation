'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth } from '../lib/firebase-auth';
import { db } from '../lib/firebase';
import { UserDocument } from '../types/firestore';

interface UseUserReturn {
  authUser: User | null;
  userDoc: UserDocument | null;
  isLoading: boolean;
}

export function useUser(): UseUserReturn {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (!user) {
        setUserDoc(null);
        setIsLoading(false);
      }
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const unsubDoc = onSnapshot(
      doc(db, 'users', authUser.uid),
      (snap) => {
        if (snap.exists()) {
          setUserDoc(snap.data() as UserDocument);
        } else {
          setUserDoc(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('[useUser] Firestore error:', error.message);
        setIsLoading(false);
      }
    );

    return unsubDoc;
  }, [authUser]);

  return { authUser, userDoc, isLoading };
}
