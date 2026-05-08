import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

let cachedIndexHtml: string | null = null;

function getIndexHtml(): string | null {
  if (cachedIndexHtml) return cachedIndexHtml;
  try {
    cachedIndexHtml = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
  } catch { /* file not bundled — will fall back to fetch */ }
  return cachedIndexHtml;
}

const CRAWLER_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Discordbot|Pinterest|Googlebot|Baiduspider/i;

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateHex(value: string | undefined, fallback: string): string {
  return value && HEX_COLOR.test(value) ? value : fallback;
}

interface WeddingData {
  groomNickname?: string;
  brideNickname?: string;
  eventDate?: string;
  eventCity?: string;
  heroImage?: string;
  venueName?: string;
  theme?: {
    colors?: { background?: string; text?: string; accent?: string };
    fonts?: { heading?: string; body?: string; decorative?: string };
  };
}

function formatDate(eventDate: string): string {
  const d = new Date(eventDate + 'T00:00:00');
  if (isNaN(d.getTime())) return eventDate;
  return d.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function buildFontsUrl(fonts: WeddingData['theme']): string {
  if (!fonts?.fonts) return '';
  const { heading, body, decorative } = fonts.fonts;
  const weights = 'ital,wght@0,400;0,500;0,700;0,900;1,400';
  const families = [heading, body, decorative]
    .filter(Boolean)
    .map(f => `family=${f!.replace(/ /g, '+')}:${weights}`)
    .join('&');
  if (!families) return '';
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function extractFields(doc: Record<string, unknown>): WeddingData {
  const f = doc.fields as Record<string, Record<string, unknown>> | undefined;
  if (!f) return {};
  const str = (key: string) => (f[key]?.stringValue as string) ?? '';
  const theme = f.theme?.mapValue as { fields?: Record<string, Record<string, unknown>> } | undefined;
  const colors = theme?.fields?.colors?.mapValue as { fields?: Record<string, Record<string, unknown>> } | undefined;
  const fonts = theme?.fields?.fonts?.mapValue as { fields?: Record<string, Record<string, unknown>> } | undefined;
  return {
    groomNickname: str('groomNickname'),
    brideNickname: str('brideNickname'),
    eventDate: str('eventDate'),
    eventCity: str('eventCity'),
    heroImage: str('heroImage'),
    venueName: str('venueName'),
    theme: {
      colors: {
        background: (colors?.fields?.background?.stringValue as string) ?? '',
        text: (colors?.fields?.text?.stringValue as string) ?? '',
        accent: (colors?.fields?.accent?.stringValue as string) ?? '',
      },
      fonts: {
        heading: (fonts?.fields?.heading?.stringValue as string) ?? '',
        body: (fonts?.fields?.body?.stringValue as string) ?? '',
        decorative: (fonts?.fields?.decorative?.stringValue as string) ?? '',
      },
    },
  };
}

async function fetchWeddingData(slug: string): Promise<WeddingData | null> {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) return null;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/weddings/${slug}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const doc = await res.json();
  return extractFields(doc);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = (req.query.slug as string || '').trim();
  if (!slug) { res.redirect(301, '/'); return; }

  const ua = req.headers['user-agent'] ?? '';
  const isCrawler = CRAWLER_PATTERN.test(ua);

  // For crawlers: proxy to Cloud Function (minimal HTML)
  if (isCrawler) {
    const ssrMetaUrl = process.env.SSR_META_URL;
    if (ssrMetaUrl) {
      try {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || '';
        const origin = `${protocol}://${host}`;
        const cfRes = await fetch(`${ssrMetaUrl}?slug=${encodeURIComponent(slug)}&origin=${encodeURIComponent(origin)}`);
        if (cfRes.ok) {
          const html = await cfRes.text();
          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.status(200).send(html);
          return;
        }
      } catch { /* fall through to index.html */ }
    }
  }

  // For normal users: read index.html (bundled or fetch fallback) + wedding data, do replacements
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    const origin = `${protocol}://${host}`;

    const localHtml = getIndexHtml();
    const [fetchedHtml, wedding] = await Promise.all([
      localHtml ? Promise.resolve(null) : fetch(`${origin}/index.html`).then(r => r.ok ? r.text() : null),
      fetchWeddingData(slug),
    ]);

    let html = localHtml ?? fetchedHtml;
    if (!html) { res.redirect(301, '/'); return; }

    if (!wedding || !wedding.groomNickname) {
      html = html
        .replace(/<title>[^<]*<\/title>/, '<title>Undangan Pernikahan</title>')
        .replace(/<h1 class="loading-names">[^<]*<\/h1>/, '<h1 class="loading-names">Undangan Pernikahan</h1>');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
      return;
    }

    const groom = escapeHtml(wedding.groomNickname ?? '');
    const bride = escapeHtml(wedding.brideNickname ?? '');
    const dateDisplay = escapeHtml(formatDate(wedding.eventDate ?? ''));
    const eventCity = escapeHtml(wedding.eventCity ?? '');
    const venueName = escapeHtml(wedding.venueName ?? '');
    const heroImage = wedding.heroImage ?? '';
    const escapedSlug = escapeHtml(slug);
    const title = `Wedding ${groom} &amp; ${bride} - ${dateDisplay}`;
    const description = `Turut mengundang Anda di hari bahagia kami — ${dateDisplay}, ${eventCity}`;
    const imageUrl = escapeHtml(heroImage.startsWith('http') ? heroImage : `${origin}${heroImage}`);
    const pageUrl = escapeHtml(`${origin}/${escapedSlug}`);

    const bg = validateHex(wedding.theme?.colors?.background, '#FDFCF8');
    const ink = validateHex(wedding.theme?.colors?.text, '#1A1A1A');
    const accent = validateHex(wedding.theme?.colors?.accent, '#B48D3E');

    const fontsUrl = escapeHtml(buildFontsUrl(wedding.theme));
    const accentEncoded = encodeURIComponent(accent);

    html = html
      // Meta tags
      .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
      .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${description}"`)
      .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`)
      .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${description}"`)
      .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${imageUrl}"`)
      .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${pageUrl}"`)
      .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${pageUrl}"`)
      .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`)
      .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${description}"`)
      .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${imageUrl}"`)
      // Theme color + favicon
      .replace(/<meta name="theme-color" content="[^"]*"/, `<meta name="theme-color" content="${ink}"`)
      .replace(/fill='%23[0-9A-Fa-f]{6}'/, `fill='${accentEncoded}'`)
      // Loading screen CSS colors
      .replace(/background:#FDFCF8/g, `background:${bg}`)
      .replace(/color:#1A1A1A/g, `color:${ink}`)
      .replace(/background:#B48D3E/g, `background:${accent}`)
      .replace(/color:#B48D3E/g, `color:${accent}`)
      // Loading screen names
      .replace(/<h1 class="loading-names">[^<]*<\/h1>/, `<h1 class="loading-names">${groom} & ${bride}</h1>`)
      // Noscript
      .replace(/<h1 style="font-size:2\.5rem;margin-bottom:0\.5rem">[^<]*<\/h1>/, `<h1 style="font-size:2.5rem;margin-bottom:0.5rem">${groom} & ${bride}</h1>`)
      .replace(/<p style="font-style:italic;opacity:0\.6;margin-bottom:0\.25rem">[^<]*<\/p>/, `<p style="font-style:italic;opacity:0.6;margin-bottom:0.25rem">${dateDisplay}</p>`)
      .replace(/<p style="font-size:0\.85rem;opacity:0\.4;margin-bottom:2rem">[^<]*<\/p>/, `<p style="font-size:0.85rem;opacity:0.4;margin-bottom:2rem">${venueName}, ${eventCity}</p>`);

    // Replace Google Fonts URL if different fonts
    if (fontsUrl) {
      html = html.replace(
        /https:\/\/fonts\.googleapis\.com\/css2\?family=Cormorant[^"']*/g,
        fontsUrl,
      );
    }

    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `Wedding ${wedding.groomNickname ?? ''} & ${wedding.brideNickname ?? ''}`,
      startDate: wedding.eventDate ?? '',
      location: {
        '@type': 'Place',
        name: wedding.venueName ?? '',
        address: { '@type': 'PostalAddress', addressLocality: wedding.eventCity ?? '' },
      },
      image: heroImage.startsWith('http') ? heroImage : `${origin}${heroImage}`,
      url: `${origin}/${slug}`,
    });
    html = html.replace('</head>', `<script type="application/ld+json">${jsonLd}</script>\n</head>`);

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch {
    res.redirect(301, `/${encodeURIComponent(slug)}`);
  }
}
