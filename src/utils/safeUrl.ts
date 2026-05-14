/**
 * Validates a URL has a safe protocol (https or http only).
 * Rejects javascript:, data:, vbscript:, and malformed URLs.
 * Returns '#' for invalid URLs to prevent XSS via href injection.
 */
export function safeUrl(url: string): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return url;
    return '#';
  } catch {
    return '#';
  }
}
