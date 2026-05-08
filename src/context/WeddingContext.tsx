import { createContext, useContext } from 'react';
import { WeddingDocument } from '../types/firestore';

export const WeddingContext = createContext<WeddingDocument | null>(null);
export const useWeddingContext = () => useContext(WeddingContext);
