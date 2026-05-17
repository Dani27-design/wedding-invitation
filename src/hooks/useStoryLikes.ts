'use client';
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
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
        } else {
          setLikes([]);
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
          if (!snap.exists()) {
            // Create document with likes array sized to include slideIndex
            const fresh = new Array(slideIndex + 1).fill(0);
            fresh[slideIndex] = 1;
            transaction.set(ref, { likes: fresh });
            return;
          }
          const data = snap.data() as StoryLikesDocument;
          // Pad array if new slides were added since document was created
          const updated = [...data.likes];
          while (updated.length <= slideIndex) updated.push(0);
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
