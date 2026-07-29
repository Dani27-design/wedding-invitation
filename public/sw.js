const CACHE_VERSION = 'v4';
const PAGE_CACHE = `marinikah-pages-${CACHE_VERSION}`;
const STATIC_CACHE = `marinikah-static-${CACHE_VERSION}`;
const MEDIA_CACHE = `marinikah-media-${CACHE_VERSION}`;
const PAGE_CACHE_PREFIX = 'marinikah-pages-';

const MAX_CACHE_ENTRIES = {
  [PAGE_CACHE]: 30,
  [STATIC_CACHE]: 120,
  [MEDIA_CACHE]: 240,
};

const BYPASS_PATH_PREFIXES = [
  '/admin',
  '/login',
  '/register',
  '/api',
  '/server-sitemap-index.xml',
  '/robots.txt',
  '/favicon.ico',
];

const STATIC_PATH_PREFIXES = [
  '/_next/static/',
  '/_next/image',
  '/images/',
  '/fonts/',
  '/textures/',
  '/icon',
  '/apple-icon',
  '/manifest.webmanifest',
];

const MEDIA_PATH_PREFIXES = [
  '/musics/',
];

const FIREBASE_NETWORK_ONLY_HOSTS = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'firebaseappcheck.googleapis.com',
];

const FIREBASE_MEDIA_HOSTS = [
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
];

function hasPathPrefix(pathname, prefixes) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function hostnameMatches(hostname, hosts) {
  return hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

function normalizeInvitationCacheUrl(rawUrl) {
  const url = new URL(rawUrl);
  url.search = '';
  url.hash = '';
  return url.toString();
}

function getNextImageSourceUrl(url) {
  if (url.origin !== self.location.origin || url.pathname !== '/_next/image') return null;

  const source = url.searchParams.get('url');
  if (!source) return null;

  try {
    return new URL(source, self.location.origin).toString();
  } catch {
    return null;
  }
}

function isFirebaseMediaUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return hostnameMatches(url.hostname, FIREBASE_MEDIA_HOSTS);
  } catch {
    return false;
  }
}

function isSameOriginMediaUrl(url) {
  return url.origin === self.location.origin && hasPathPrefix(url.pathname, MEDIA_PATH_PREFIXES);
}

function normalizeMediaCacheUrl(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = '';
  url.searchParams.delete('v');
  url.searchParams.delete('_');
  url.searchParams.delete('cacheBust');
  url.searchParams.delete('cachebust');
  url.searchParams.delete('t');
  url.searchParams.delete('ts');
  return url.toString();
}

function isPublicInvitationNavigation(request, url) {
  if (request.method !== 'GET') return false;
  if (request.mode !== 'navigate') return false;
  if (url.origin !== self.location.origin) return false;
  if (hasPathPrefix(url.pathname, BYPASS_PATH_PREFIXES)) return false;
  if (hasPathPrefix(url.pathname, STATIC_PATH_PREFIXES)) return false;

  const segments = url.pathname.split('/').filter(Boolean);
  return segments.length === 1;
}

function classifyRequest(request) {
  const url = new URL(request.url);

  if (request.method !== 'GET') return 'network-only';
  if (hostnameMatches(url.hostname, FIREBASE_NETWORK_ONLY_HOSTS)) return 'network-only';
  if (url.hostname.endsWith('cloudfunctions.net')) return 'network-only';
  if (url.hostname === 'www.googleapis.com' || url.hostname === 'apis.google.com') return 'network-only';
  if (isPublicInvitationNavigation(request, url)) return 'network-first-page';

  if (url.origin === self.location.origin && hasPathPrefix(url.pathname, BYPASS_PATH_PREFIXES)) return 'network-only';
  const nextImageSourceUrl = getNextImageSourceUrl(url);
  if (nextImageSourceUrl && isFirebaseMediaUrl(nextImageSourceUrl)) return 'cache-first-media';
  if (isSameOriginMediaUrl(url)) return 'cache-first-media';
  if (url.origin === self.location.origin && hasPathPrefix(url.pathname, STATIC_PATH_PREFIXES)) return 'cache-first-static';
  if (hostnameMatches(url.hostname, FIREBASE_MEDIA_HOSTS)) return 'cache-first-media';

  return 'network-only';
}

async function trimCache(cacheName) {
  const maxEntries = MAX_CACHE_ENTRIES[cacheName];
  if (!maxEntries) return;

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;

  await Promise.all(keys.slice(0, keys.length - maxEntries).map((request) => cache.delete(request)));
}

function isCacheableResponse(response) {
  return response && (response.status === 200 || response.type === 'opaque');
}

async function cacheResponse(cacheName, requestOrUrl, response) {
  if (!isCacheableResponse(response)) return;

  const cache = await caches.open(cacheName);
  await cache.put(requestOrUrl, response.clone());
  if (cacheName === MEDIA_CACHE) {
    for (const key of getMediaWriteCacheKeys(requestOrUrl)) {
      await cache.put(key, response.clone());
    }
  }
  await trimCache(cacheName);
}

function getMediaWriteCacheKeys(requestOrUrl) {
  const rawUrl = typeof requestOrUrl === 'string' ? requestOrUrl : requestOrUrl.url;
  const keys = [];

  try {
    const url = new URL(rawUrl);
    if (isFirebaseMediaUrl(url.toString()) || isSameOriginMediaUrl(url)) {
      keys.push(normalizeMediaCacheUrl(url.toString()));
    }
  } catch {
    return keys;
  }

  return [...new Set(keys)];
}

function getMediaFallbackCacheKeys(requestOrUrl) {
  const rawUrl = typeof requestOrUrl === 'string' ? requestOrUrl : requestOrUrl.url;
  const keys = [];

  try {
    const url = new URL(rawUrl);
    const nextImageSourceUrl = getNextImageSourceUrl(url);
    if (nextImageSourceUrl && isFirebaseMediaUrl(nextImageSourceUrl)) {
      keys.push(nextImageSourceUrl);
      keys.push(normalizeMediaCacheUrl(nextImageSourceUrl));
    }
    if (isFirebaseMediaUrl(url.toString()) || isSameOriginMediaUrl(url)) {
      keys.push(url.toString());
      keys.push(normalizeMediaCacheUrl(url.toString()));
    }
  } catch {
    return keys;
  }

  return [...new Set(keys)];
}

async function matchMediaCacheFallback(cache, request) {
  const exact = await cache.match(request, { ignoreVary: true });
  if (exact) return exact;

  for (const key of getMediaFallbackCacheKeys(request)) {
    const cached = await cache.match(key, { ignoreVary: true });
    if (cached) return cached;
  }

  return undefined;
}

function parseRangeHeader(rangeHeader, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return null;

  let start;
  let end;

  if (!rawStart) {
    const suffixLength = Number(rawEnd);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd ? Number(rawEnd) : size - 1;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

async function createRangeResponse(request, response) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader || response.type === 'opaque') return response;

  try {
    const body = await response.arrayBuffer();
    const range = parseRangeHeader(rangeHeader, body.byteLength);
    if (!range) {
      return new Response(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${body.byteLength}`,
        },
      });
    }

    const { start, end } = range;
    const sliced = body.slice(start, end + 1);
    const headers = new Headers(response.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', String(sliced.byteLength));
    headers.set('Content-Range', `bytes ${start}-${end}/${body.byteLength}`);

    return new Response(sliced, {
      status: 206,
      statusText: 'Partial Content',
      headers,
    });
  } catch {
    return response;
  }
}

async function networkFirstPage(request, event) {
  const cache = await caches.open(PAGE_CACHE);
  const normalizedUrl = normalizeInvitationCacheUrl(request.url);

  try {
    const preload = await event.preloadResponse;
    const response = preload || await fetch(request);

    if (isCacheableResponse(response)) {
      await cache.put(request, response.clone());
      await cache.put(normalizedUrl, response.clone());
      await trimCache(PAGE_CACHE);
    }

    return response;
  } catch {
    const exactCached = await cache.match(request);
    if (exactCached) return exactCached;

    const normalizedCached = await cache.match(normalizedUrl);
    if (normalizedCached) return normalizedCached;

    const previousCached = await matchPreviousInvitationPageCache(request, normalizedUrl);
    if (previousCached) return previousCached;

    return createOfflineInvitationFallbackResponse(request.url);
  }
}

async function matchPreviousInvitationPageCache(request, normalizedUrl) {
  const cacheNames = await caches.keys();
  const previousPageCacheNames = cacheNames.filter((cacheName) => (
    cacheName.startsWith(PAGE_CACHE_PREFIX) && cacheName !== PAGE_CACHE
  ));

  for (const cacheName of previousPageCacheNames) {
    const cache = await caches.open(cacheName);
    const exactCached = await cache.match(request);
    if (exactCached) return exactCached;

    const normalizedCached = await cache.match(normalizedUrl);
    if (normalizedCached) return normalizedCached;
  }

  return undefined;
}

function createOfflineInvitationFallbackResponse(rawUrl) {
  const url = new URL(rawUrl);
  const title = 'Undangan belum tersedia offline';
  const escapedPath = url.pathname.replace(/[<>&"]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
  })[char]);

  return new Response(`<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #fdfcf8;
        color: #1a1a1a;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(100% - 32px, 420px);
        text-align: center;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 1.25rem;
      }
      p {
        margin: 0;
        color: rgba(26, 26, 26, 0.72);
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>Halaman ${escapedPath} belum tersimpan di perangkat ini. Buka undangan sekali saat online, tunggu sampai halaman selesai dimuat, lalu coba lagi saat offline.</p>
    </main>
  </body>
</html>`, {
    status: 503,
    statusText: 'Offline',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function cacheInvitationPage(rawUrl) {
  const url = new URL(rawUrl);
  if (url.origin !== self.location.origin) return;

  const request = new Request(url.toString(), {
    credentials: 'include',
  });
  const response = await fetch(request);
  if (!isCacheableResponse(response)) return;

  const cache = await caches.open(PAGE_CACHE);
  await cache.put(url.toString(), response.clone());
  await cache.put(normalizeInvitationCacheUrl(url.toString()), response.clone());
  await trimCache(PAGE_CACHE);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = cacheName === MEDIA_CACHE
    ? await matchMediaCacheFallback(cache, request)
    : await cache.match(request, { ignoreVary: true });
  if (cached) return cacheName === MEDIA_CACHE ? createRangeResponse(request, cached) : cached;

  try {
    if (cacheName === MEDIA_CACHE && request.headers.has('range')) {
      const headers = new Headers(request.headers);
      headers.delete('range');
      const fullRequest = new Request(request, { headers });
      const fullResponse = await fetch(fullRequest);
      await cacheResponse(cacheName, fullRequest, fullResponse);
      return createRangeResponse(request, fullResponse.clone());
    }

    const response = await fetch(request);
    await cacheResponse(cacheName, request, response);
    return response;
  } catch {
    const fallback = cacheName === MEDIA_CACHE
      ? await matchMediaCacheFallback(cache, request)
      : await cache.match(request, { ignoreVary: true });
    if (fallback) return cacheName === MEDIA_CACHE ? createRangeResponse(request, fallback) : fallback;
    return Response.error();
  }
}

async function fetchMediaForCache(url) {
  if (!isFirebaseMediaUrl(url)) return fetch(new Request(url, { credentials: 'same-origin' }));

  try {
    return await fetch(new Request(url, { mode: 'cors', credentials: 'omit' }));
  } catch {
    return fetch(new Request(url, { mode: 'no-cors', credentials: 'omit' }));
  }
}

async function cacheInvitationMedia(rawUrls) {
  if (!Array.isArray(rawUrls)) return;

  const urls = [...new Set(rawUrls)]
    .filter((rawUrl) => typeof rawUrl === 'string')
    .map((rawUrl) => {
      try {
        return new URL(rawUrl, self.location.origin).toString();
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((url) => isFirebaseMediaUrl(url) || new URL(url).origin === self.location.origin);

  for (let i = 0; i < urls.length; i += 4) {
    const batch = urls.slice(i, i + 4);
    await Promise.all(batch.map(async (url) => {
      try {
        const response = await fetchMediaForCache(url);
        const strategy = classifyRequest(new Request(url));
        const cacheName = strategy === 'cache-first-static' ? STATIC_CACHE : MEDIA_CACHE;
        await cacheResponse(cacheName, url, response);
      } catch {
        /* Best-effort offline preparation. */
      }
    }));
  }
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const strategy = classifyRequest(event.request);

  if (strategy === 'network-first-page') {
    event.respondWith(networkFirstPage(event.request, event));
    return;
  }

  if (strategy === 'cache-first-static') {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  if (strategy === 'cache-first-media') {
    event.respondWith(cacheFirst(event.request, MEDIA_CACHE));
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_INVITATION_PAGE' && typeof event.data.url === 'string') {
    event.waitUntil(cacheInvitationPage(event.data.url).catch(() => undefined));
    return;
  }

  if (event.data?.type === 'CACHE_INVITATION_MEDIA') {
    event.waitUntil(cacheInvitationMedia(event.data.urls).catch(() => undefined));
  }
});
