import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const COMMENTS_LIMIT = 50;

export function useStoryComments(weddingId: string, slideIndex: number) {
  const [comments, setComments] = useState<{ name: string; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'story-comments'),
      where('weddingId', '==', weddingId),
      where('slideIndex', '==', slideIndex),
      orderBy('createdAt', 'desc'),
      limit(COMMENTS_LIMIT)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return { name: d.name, text: d.text };
        });
        setComments(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('[useStoryComments] Firestore error:', error.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [weddingId, slideIndex]);

  const addComment = useCallback(
    async (data: { name: string; text: string }) => {
      await addDoc(collection(db, 'story-comments'), {
        weddingId,
        slideIndex,
        name: data.name.trim(),
        text: data.text.trim(),
        createdAt: serverTimestamp(),
      });
    },
    [weddingId, slideIndex]
  );

  return { comments, addComment, isLoading };
}
