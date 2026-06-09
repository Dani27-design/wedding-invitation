import { getServerSideSitemap } from 'next-sitemap';
import { adminDb } from '@/lib/firebase-admin';
import { BASE_URL } from '@/constants/baseUrl';

export async function GET() {
  const fields = [
    {
      loc: BASE_URL,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly' as const,
      priority: 1.0,
    },
  ];

  try {
    const snapshot = await adminDb
      .collection('weddings')
      .where('status', '==', 'published')
      .select('updatedAt')
      .get();

    const weddingFields = snapshot.docs.map((doc) => ({
      loc: `${BASE_URL}/${doc.id}`,
      lastmod: doc.data().updatedAt?.toDate()?.toISOString() ?? new Date().toISOString(),
      changefreq: 'weekly' as const,
      priority: 0.8,
    }));

    fields.push(...weddingFields);
  } catch (error) {
    console.error('[server-sitemap] Firestore error:', (error as Error).message);
  }

  const sitemap = await getServerSideSitemap(fields);
  sitemap.headers.set('Cache-Control', 'no-store, max-age=0');
  return sitemap;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
