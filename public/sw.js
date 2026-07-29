const CACHE_VERSION = 'v1';
const PAGE_CACHE = `marinikah-pages-${CACHE_VERSION}`;
const STATIC_CACHE = `marinikah-static-${CACHE_VERSION}`;
const MEDIA_CACHE = `marinikah-media-${CACHE_VERSION}`;
const ACTIVE_CACHES = new Set([PAGE_CACHE, STATIC_CACHE, MEDIA_CACHE]);

const MAX_CACHE_ENTRIES = {
  [PAGE_CACHE]: 30,
  [STATIC_CACHE]: 120,
  [MEDIA_CACHE]: 80,
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
  await trimCache(cacheName);
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

    throw new Error('No cached invitation page is available.');
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  await cacheResponse(cacheName, request, response);
  return response;
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith('marinikah-') && !ACTIVE_CACHES.has(cacheName))
        .map((cacheName) => caches.delete(cacheName)),
    );

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
