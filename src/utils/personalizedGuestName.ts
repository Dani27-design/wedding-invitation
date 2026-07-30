export function parsePersonalizedGuestName(rawName: string | null) {
  if (!rawName) return null;

  try {
    return decodeURIComponent(rawName).replace(/-/g, ' ').slice(0, 100);
  } catch {
    return null;
  }
}
