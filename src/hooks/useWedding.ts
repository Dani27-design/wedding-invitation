'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WeddingDocument } from '../types/firestore';

export function useWedding(slug: string) {
  const [wedding, setWedding] = useState<WeddingDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'weddings', slug),
      (snap) => {
        if (snap.exists()) {
          setWedding(snap.data() as WeddingDocument);
        } else {
          setWedding(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('[useWedding] Firestore error:', error.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [slug]);

  return { wedding, isLoading };
}
