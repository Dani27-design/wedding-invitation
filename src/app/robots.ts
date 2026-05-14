import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/constants/baseUrl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/login', '/register'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
