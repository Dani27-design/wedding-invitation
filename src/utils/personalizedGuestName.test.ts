import { describe, expect, it } from 'vitest';
import { parsePersonalizedGuestName } from './personalizedGuestName';

describe('parsePersonalizedGuestName', () => {
  it('decodes and normalizes the guest name from the to parameter', () => {
    expect(parsePersonalizedGuestName('Mbak%20Dianti%20dan%20Mas%20Raju')).toBe('Mbak Dianti dan Mas Raju');
    expect(parsePersonalizedGuestName('Mbak-Dianti-dan-Mas-Raju')).toBe('Mbak Dianti dan Mas Raju');
  });

  it('limits the personalized guest name length', () => {
    expect(parsePersonalizedGuestName('a'.repeat(120))).toHaveLength(100);
  });

  it('returns null for empty or malformed names', () => {
    expect(parsePersonalizedGuestName(null)).toBeNull();
    expect(parsePersonalizedGuestName('')).toBeNull();
    expect(parsePersonalizedGuestName('%E0%A4%A')).toBeNull();
  });
});
