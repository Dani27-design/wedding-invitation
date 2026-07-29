export type ReliableCacheStrategy =
  | 'network-first-page'
  | 'cache-first-static'
  | 'cache-first-media'
  | 'network-only';

export interface ReliableCacheRequest {
  url: string;
  method?: string;
  mode?: string;
}

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

function hasPathPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function normalizeInvitationCacheUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function isFirebaseNetworkOnlyHost(hostname: string) {
  return FIREBASE_NETWORK_ONLY_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

export function isFirebaseMediaHost(hostname: string) {
  return FIREBASE_MEDIA_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

export function isPublicInvitationNavigation(request: ReliableCacheRequest, origin: string) {
  const url = new URL(request.url);
  if ((request.method ?? 'GET').toUpperCase() !== 'GET') return false;
  if (request.mode !== 'navigate') return false;
  if (url.origin !== origin) return false;
  if (hasPathPrefix(url.pathname, BYPASS_PATH_PREFIXES)) return false;
  if (hasPathPrefix(url.pathname, STATIC_PATH_PREFIXES)) return false;

  const segments = url.pathname.split('/').filter(Boolean);
  return segments.length === 1;
}

export function classifyReliableCacheRequest(
  request: ReliableCacheRequest,
  origin = new URL(request.url).origin,
): ReliableCacheStrategy {
  const method = (request.method ?? 'GET').toUpperCase();
  const url = new URL(request.url);

  if (method !== 'GET') return 'network-only';

  if (isFirebaseNetworkOnlyHost(url.hostname)) return 'network-only';
  if (url.hostname.endsWith('cloudfunctions.net')) return 'network-only';
  if (url.hostname === 'www.googleapis.com' || url.hostname === 'apis.google.com') return 'network-only';

  if (isPublicInvitationNavigation(request, origin)) return 'network-first-page';

  if (url.origin === origin && hasPathPrefix(url.pathname, BYPASS_PATH_PREFIXES)) return 'network-only';
  if (url.origin === origin && hasPathPrefix(url.pathname, STATIC_PATH_PREFIXES)) return 'cache-first-static';
  if (isFirebaseMediaHost(url.hostname)) return 'cache-first-media';

  return 'network-only';
}
