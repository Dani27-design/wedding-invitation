/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://marinikah.vercel.app',
  generateRobotsTxt: false,
  generateIndexSitemap: true,
  exclude: ['/admin/*', '/login', '/register'],
  additionalPaths: async () => [
    {
      loc: '/',
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: new Date().toISOString(),
    },
    {
      loc: '/server-sitemap-index.xml',
      lastmod: new Date().toISOString(),
      priority: 0.7,
    },
  ],
  transform: async (config, path) => {
    let priority = config.priority;
    if (path === '/') {
      priority = 1.0;
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
