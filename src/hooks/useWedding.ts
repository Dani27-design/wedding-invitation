import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WeddingDocument } from '../types/firestore';

export function useWedding(slug: string) {
  const [wedding, setWedding] = useState<WeddingDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'weddings', slug))
      .then((snap) => {
        if (snap.exists()) {
          setWedding(snap.data() as WeddingDocument);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('[useWedding] Firestore error:', error.message);
        setIsLoading(false);
      });
  }, [slug]);

  return { wedding, isLoading };
}
