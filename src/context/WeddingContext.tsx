'use client';
import { createContext, useContext } from 'react';
import type { SerializedWedding } from '../lib/serialize-wedding';

export const WeddingContext = createContext<SerializedWedding | null>(null);
export const useWeddingContext = () => useContext(WeddingContext);
