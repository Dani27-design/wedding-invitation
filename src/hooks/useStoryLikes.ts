'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StoryLikesDocument } from '../types/firestore';
import { useNetworkStatus } from './useNetworkStatus';

export function useStoryLikes(slug: string, enabled: boolean = true) {
  const [likes, setLikes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pendingRef = useRef<Set<number>>(new Set());
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (!enabled) return;
    if (!isOnline) {
      setIsLoading(false);
      return;
    }

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
  }, [slug, enabled, isOnline]);

  const incrementLike = useCallback(
    async (slideIndex: number) => {
      if (!isOnline) return;
      // Ignore rapid clicks while a transaction is in flight for this slide
      if (pendingRef.current.has(slideIndex)) return;
      pendingRef.current.add(slideIndex);

      setLikes((prev) => prev.map((v, i) => (i === slideIndex ? v + 1 : v)));

      const ref = doc(db, 'story-likes', slug);
      try {
        await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(ref);
          if (!snap.exists()) {
            const fresh = new Array(slideIndex + 1).fill(0);
            fresh[slideIndex] = 1;
            transaction.set(ref, { likes: fresh });
            return;
          }
          const data = snap.data() as StoryLikesDocument;
          const updated = [...data.likes];
          while (updated.length <= slideIndex) updated.push(0);
          updated[slideIndex] = (updated[slideIndex] ?? 0) + 1;
          transaction.update(ref, { likes: updated });
        });
      } catch (error) {
        setLikes((prev) => prev.map((v, i) => (i === slideIndex ? v - 1 : v)));
        console.error('[useStoryLikes] Transaction error:', (error as Error).message);
      } finally {
        pendingRef.current.delete(slideIndex);
      }
    },
    [isOnline, slug]
  );

  return { likes, incrementLike, isLoading };
}
