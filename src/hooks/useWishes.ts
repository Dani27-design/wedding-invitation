'use client';
import { useState, useEffect } from 'react';
import { GuestWishes } from '../types';

const WISHES_LIMIT = 50;

export function useWishes(weddingId: string, enabled: boolean = true) {
  const [wishes, setWishes] = useState<GuestWishes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const { collection, query, where, orderBy, limit, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');

      if (cancelled) return;

      const q = query(
        collection(db, 'wishes'),
        where('weddingId', '==', weddingId),
        orderBy('createdAt', 'desc'),
        limit(WISHES_LIMIT)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (cancelled) return;
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as GuestWishes[];
          setWishes(data);
          setIsLoading(false);
        },
        (error) => {
          if (cancelled) return;
          console.error('[useWishes] Firestore error:', error.message);
          setIsLoading(false);
        }
      );
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [weddingId, enabled]);

  return { wishes, isLoading };
}
