'use client';
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StoryLikesDocument } from '../types/firestore';

export function useStoryLikes(slug: string, enabled: boolean = true) {
  const [likes, setLikes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    getDoc(doc(db, 'story-likes', slug))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as StoryLikesDocument;
          setLikes(data.likes);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('[useStoryLikes] Firestore error:', error.message);
        setIsLoading(false);
      });
  }, [slug, enabled]);

  const incrementLike = useCallback(
    async (slideIndex: number) => {
      setLikes((prev) => prev.map((v, i) => (i === slideIndex ? v + 1 : v)));

      const ref = doc(db, 'story-likes', slug);
      try {
        await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(ref);
          if (!snap.exists()) return;
          const data = snap.data() as StoryLikesDocument;
          const updated = [...data.likes];
          updated[slideIndex] = (updated[slideIndex] ?? 0) + 1;
          transaction.update(ref, { likes: updated });
        });
      } catch (error) {
        setLikes((prev) => prev.map((v, i) => (i === slideIndex ? v - 1 : v)));
        console.error('[useStoryLikes] Transaction error:', (error as Error).message);
      }
    },
    [slug]
  );

  return { likes, incrementLike, isLoading };
}
