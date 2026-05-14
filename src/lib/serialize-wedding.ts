import type { WeddingDocument } from '@/types/firestore';

/**
 * Strips Firestore Timestamp fields (createdAt, updatedAt) from WeddingDocument
 * so it can be safely passed across the Next.js server→client boundary.
 * These fields are class instances that cannot be serialized to JSON.
 */
export type SerializedWedding = Omit<WeddingDocument, 'createdAt' | 'updatedAt'>;

export function serializeWedding(raw: WeddingDocument): SerializedWedding {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdAt, updatedAt, ...rest } = raw;
  return rest;
}
