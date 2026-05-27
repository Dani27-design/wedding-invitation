import { cache, Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { WeddingDocument } from '@/types/firestore';
import { serializeWedding } from '@/lib/serialize-wedding';
import { validateHex, sanitizeFontName } from '@/lib/sanitize-theme';
import { deriveDateShort, deriveDateDisplay, deriveMetaTitle } from '@/utils/weddingDerived';
import { THEME_DEFAULTS } from '@/constants/themeDefaults';
import { BASE_URL } from '@/constants/baseUrl';
import { WeddingClient } from './wedding-client';

export const revalidate = 300; // ISR: revalidate every 5 minutes

export async function generateStaticParams() {
  try {
    const snapshot = await adminDb
      .collection('weddings')
      .where('status', '==', 'published')
      .select()
      .get();
    return snapshot.docs.map((doc) => ({ slug: doc.id }));
  } catch (error) {
    console.error('[generateStaticParams] Firestore error — no pages pre-rendered:', (error as Error).message);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const FIRESTORE_TIMEOUT = 10_000;

const getWedding = cache(async (slug: string): Promise<WeddingDocument | null> => {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore read timeout (10s)')), FIRESTORE_TIMEOUT)
    );
    const doc = await Promise.race([adminDb.doc(`weddings/${slug}`).get(), timeout]);
    if (!doc.exists) return null;
    return doc.data() as WeddingDocument;
  } catch (error) {
    console.error(`[getWedding] Firestore error for slug "${slug}":`, (error as Error).message);
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding || wedding.status !== 'published') return { title: 'Undangan Tidak Ditemukan', robots: { index: false } };

  const dateShort = deriveDateShort(wedding.eventDate);
  const dateDisplay = deriveDateDisplay(wedding.eventDate);
  const title = deriveMetaTitle(wedding.groomNickname, wedding.brideNickname, dateShort);
  const description = `Turut mengundang Anda di hari bahagia kami — ${dateDisplay}, ${wedding.eventCity}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: wedding.heroImage ? [{ url: wedding.heroImage, alt: `${wedding.groomNickname} & ${wedding.brideNickname}` }] : [],
      type: 'website',
      locale: 'id_ID',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: wedding.heroImage ? [wedding.heroImage] : [],
    },
    alternates: { canonical: `${BASE_URL}/${slug}` },
    robots: { index: true, follow: true },
  };
}

function buildThemeCSS(wedding: WeddingDocument): string {
  const defaults = THEME_DEFAULTS.cinematic;
  const { colors, fonts } = wedding.theme ?? defaults;

  const gold = validateHex(colors?.accent, defaults.colors.accent);
  const ivory = validateHex(colors?.background, defaults.colors.background);
  const ink = validateHex(colors?.text, defaults.colors.text);
  const paper = validateHex(colors?.surface, defaults.colors.surface);
  const button = validateHex(colors?.button, defaults.colors.button);

  const heading = sanitizeFontName(fonts?.heading ?? defaults.fonts.heading);
  const body = sanitizeFontName(fonts?.body ?? defaults.fonts.body);
  const decorative = sanitizeFontName(fonts?.decorative ?? defaults.fonts.decorative);
  const script = sanitizeFontName(fonts?.script ?? defaults.fonts.script);

  return `:root {
  --color-gold: ${gold};
  --color-gold-contrast: color-mix(in srgb, ${gold} 70%, #000);
  --color-ivory: ${ivory};
  --color-ink: ${ink};
  --color-paper: ${paper};
  --color-sepia: ${paper};
  --color-rose-pastel: ${button};
  --font-serif: "${heading}", serif;
  --font-sans: "${body}", ui-sans-serif, system-ui, sans-serif;
  --font-display: "${decorative}", serif;
  --font-dayland: "${script}", cursive;
}`;
}

function buildCustomFontsUrl(wedding: WeddingDocument): string | null {
  const defaults = THEME_DEFAULTS.cinematic.fonts;
  const fonts = wedding.theme?.fonts;
  if (!fonts) return null;

  const { heading, body, decorative, script } = fonts;
  if (
    heading === defaults.heading &&
    body === defaults.body &&
    decorative === defaults.decorative &&
    script === defaults.script
  ) {
    return null;
  }

  const weights = 'ital,wght@0,400;0,500;0,700;0,900;1,400';
  const customFonts: string[] = [];
  if (heading !== defaults.heading) customFonts.push(heading);
  if (body !== defaults.body) customFonts.push(body);
  if (decorative !== defaults.decorative) customFonts.push(decorative);
  if (script !== defaults.script && script !== 'Dayland') customFonts.push(script);

  const families = customFonts
    .filter(Boolean)
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:${weights}`)
    .join('&');

  if (!families) return null;
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function buildIsoDateTime(date: string, time?: string): string {
  if (!date) return '';
  if (!time) return date;
  return `${date}T${time}:00+07:00`;
}

function buildJsonLd(wedding: WeddingDocument, slug: string) {
  const firstCeremony = wedding.ceremonies?.[0];
  const lastCeremony = wedding.ceremonies?.[wedding.ceremonies?.length - 1];
  const dateDisplay = deriveDateDisplay(wedding.eventDate);

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Pernikahan ${wedding.groomNickname} & ${wedding.brideNickname}`,
    description: dateDisplay ? `Turut mengundang Anda di hari bahagia kami — ${dateDisplay}, ${wedding.eventCity}` : undefined,
    startDate: buildIsoDateTime(wedding.eventDate, firstCeremony?.start),
    ...(lastCeremony?.end && { endDate: buildIsoDateTime(wedding.eventDate, lastCeremony.end) }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: wedding.venueName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: wedding.venueAddress,
        addressLocality: wedding.eventCity,
        addressCountry: 'ID',
      },
    },
    ...(wedding.heroImage && { image: wedding.heroImage }),
    organizer: {
      '@type': 'Person',
      name: `${wedding.groomName} & ${wedding.brideName}`,
    },
    url: `${BASE_URL}/${slug}`,
  };
}

export default async function WeddingPage({ params }: PageProps) {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding || wedding.status !== 'published') return notFound();

  const themeCSS = buildThemeCSS(wedding);
  const customFontsUrl = buildCustomFontsUrl(wedding);
  const jsonLd = buildJsonLd(wedding, slug);
  const serialized = serializeWedding(wedding);

  return (
    <>
      <style href="wedding-theme" precedence="high">{themeCSS}</style>
      {customFontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={customFontsUrl} precedence="default" />
        </>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Suspense fallback={null}>
        <WeddingClient wedding={serialized} slug={slug} />
      </Suspense>
    </>
  );
}
