import { describe, expect, it } from 'vitest';
import { buildGuestInvitationMessage, buildGuestInvitationUrl, buildGuestWhatsAppUrl } from './guestInvitation';

const wedding = {
  greetingTemplate: 'Halo {nama}\nUndangan {pengantin}: {link}',
  groomNickname: 'Dani',
  brideNickname: 'Marini',
};

describe('guestInvitation', () => {
  it('builds a guest invitation URL with encoded guest name', () => {
    expect(buildGuestInvitationUrl('https://example.com/', 'dani-marini', 'Budi Santoso')).toBe(
      'https://example.com/dani-marini?to=Budi%20Santoso',
    );
  });

  it('replaces all supported greeting template variables', () => {
    const message = buildGuestInvitationMessage({
      guest: { name: 'Budi Santoso' },
      wedding,
      invitationUrl: 'https://example.com/dani-marini?to=Budi%20Santoso',
    });

    expect(message).toBe('Halo Budi Santoso\nUndangan Dani & Marini: https://example.com/dani-marini?to=Budi%20Santoso');
  });

  it('builds a wa.me URL with encoded prefilled text', () => {
    const url = buildGuestWhatsAppUrl({
      guest: { name: 'Budi Santoso', phone: '6281234567890' },
      wedding,
      slug: 'dani-marini',
      baseUrl: 'https://example.com',
    });

    expect(url).toContain('https://wa.me/6281234567890?text=');
    expect(decodeURIComponent(url!.split('text=')[1])).toBe(
      'Halo Budi Santoso\nUndangan Dani & Marini: https://example.com/dani-marini?to=Budi%20Santoso',
    );
  });

  it('normalizes national phone format when building a wa.me URL', () => {
    const url = buildGuestWhatsAppUrl({
      guest: { name: 'Budi Santoso', phone: '0812-3456-7890' },
      wedding,
      slug: 'dani-marini',
      baseUrl: 'https://example.com',
    });

    expect(url).toContain('https://wa.me/6281234567890?text=');
  });

  it('collapses leading zero prefixes to 62 when building a wa.me URL', () => {
    const url = buildGuestWhatsAppUrl({
      guest: { name: 'Budi Santoso', phone: '00812-3456-7890' },
      wedding,
      slug: 'dani-marini',
      baseUrl: 'https://example.com',
    });

    expect(url).toContain('https://wa.me/6281234567890?text=');
  });

  it('returns null when guest phone is empty', () => {
    expect(buildGuestWhatsAppUrl({
      guest: { name: 'Budi Santoso', phone: '' },
      wedding,
      slug: 'dani-marini',
      baseUrl: 'https://example.com',
    })).toBeNull();
  });

  it('returns null when wedding data is not available', () => {
    expect(buildGuestWhatsAppUrl({
      guest: { name: 'Budi Santoso', phone: '6281234567890' },
      wedding: null,
      slug: 'dani-marini',
      baseUrl: 'https://example.com',
    })).toBeNull();
  });
});
