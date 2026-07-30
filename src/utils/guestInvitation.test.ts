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

  it('replaces descriptive guest message variables', () => {
    const message = buildGuestInvitationMessage({
      guest: { name: 'Budi Santoso' },
      wedding: {
        greetingTemplate: [
          'Kepada {nama tamu}',
          '{nama pengantin pria} dan {nama pengantin wanita}',
          '{orang tua pengantin pria}',
          '{orang tua pengantin wanita}',
          '{link undangan}',
        ].join('\n'),
        groomNickname: 'Dani',
        brideNickname: 'Marini',
        groomName: 'Daniansyah C.',
        brideName: 'Siti Nur Marini',
        groomParents: 'Putra Bapak Ahmad dan Ibu Aminah',
        brideParents: 'Putri Bapak Budi dan Ibu Sari',
      },
      invitationUrl: 'https://example.com/dani-marini?to=Budi%20Santoso',
    });

    expect(message).toBe([
      'Kepada Budi Santoso',
      'Daniansyah C. dan Siti Nur Marini',
      'Putra Bapak Ahmad dan Ibu Aminah',
      'Putri Bapak Budi dan Ibu Sari',
      'https://example.com/dani-marini?to=Budi%20Santoso',
    ].join('\n'));
  });

  it('replaces dynamic ceremony variables by ceremony order', () => {
    const message = buildGuestInvitationMessage({
      guest: { name: 'Budi Santoso' },
      wedding: {
        greetingTemplate: '{nama acara 2}: {tanggal acara 2}, {jam acara 2}, {lokasi acara 2}, {alamat acara 2}, {maps acara 2}',
        groomNickname: 'Dani',
        brideNickname: 'Marini',
        ceremonies: [
          {
            name: 'Akad Nikah',
            date: '2026-09-18',
            start: '08:00',
            end: '09:00',
            venueName: 'Masjid Agung',
            venueAddress: 'Jl. Akad No. 1',
            venueMapsUrl: 'https://maps.example/akad',
          },
          {
            name: 'Resepsi',
            date: '2026-09-19',
            start: '11:00',
            end: '13:00',
            venueName: 'Gedung Bahagia',
            venueAddress: 'Jl. Resepsi No. 2',
            venueMapsUrl: 'https://maps.example/resepsi',
          },
        ],
      },
      invitationUrl: 'https://example.com/dani-marini?to=Budi%20Santoso',
    });

    expect(message).toBe('Resepsi: 19 September 2026, 11:00 - 13:00, Gedung Bahagia, Jl. Resepsi No. 2, https://maps.example/resepsi');
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
