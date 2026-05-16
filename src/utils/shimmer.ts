/**
 * Generates a minimal base64-encoded SVG data URL for use as next/image blurDataURL.
 * Zero network cost — the SVG is inlined as a data URL.
 */
export function shimmer(color: string = '#F5F2ED'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="100%" height="100%" fill="${color}"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const SHIMMER_DARK = shimmer('#1A1A1A');
export const SHIMMER_IVORY = shimmer('#FDFCF8');
export const SHIMMER_PAPER = shimmer('#F5F2ED');
