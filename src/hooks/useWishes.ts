import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GuestWishes } from '../types';

const WISHES_LIMIT = 50;

export function useWishes(weddingId: string) {
  const [wishes, setWishes] = useState<GuestWishes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'wishes'),
      where('weddingId', '==', weddingId),
      orderBy('createdAt', 'desc'),
      limit(WISHES_LIMIT)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GuestWishes[];
        setWishes(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('[useWishes] Firestore error:', error.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [weddingId]);

  return { wishes, isLoading };
}
