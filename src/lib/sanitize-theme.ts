const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function validateHex(value: string | undefined, fallback: string): string {
  return value && HEX_COLOR.test(value) ? value : fallback;
}

export function sanitizeFontName(name: string): string {
  // Allowlist: only permit letters, digits, spaces, and hyphens
  return name.replace(/[^a-zA-Z0-9 -]/g, '');
}
