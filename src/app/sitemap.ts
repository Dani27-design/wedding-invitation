import type { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { BASE_URL } from '@/constants/baseUrl';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const snapshot = await adminDb
      .collection('weddings')
      .where('status', '==', 'published')
      .select('updatedAt')
      .get();

    return snapshot.docs.map((doc) => ({
      url: `${BASE_URL}/${doc.id}`,
      lastModified: doc.data().updatedAt?.toDate() ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('[sitemap] Firestore error:', (error as Error).message);
    throw error;
  }
}
