import { describe, expect, it } from 'vitest';
import { buildGuestMessageVariableOptions, validateGuestMessageTemplate } from './guestMessageVariables';

function createOptions() {
  return buildGuestMessageVariableOptions({
    guestName: 'Tamu Spesial Kami',
    invitationUrl: 'https://example.com/dani-marini?to=Tamu%20Spesial%20Kami',
    wedding: {
      greetingTemplate: '',
      groomNickname: 'Dani',
      brideNickname: 'Marini',
      groomName: 'Daniansyah C.',
      brideName: 'Siti Nur Marini',
      groomParents: 'Putra Bapak Ahmad dan Ibu Aminah',
      brideParents: 'Putri Bapak Budi dan Ibu Sari',
      eventDate: '2026-09-18',
      eventCity: 'Surabaya',
      ceremonies: [{
        name: 'Akad Nikah',
        date: '2026-09-18',
        start: '08:00',
        end: '09:00',
        venueName: 'Masjid Agung',
        venueAddress: 'Jl. Bahagia No. 1',
        venueMapsUrl: 'https://maps.example/akad',
      }],
    },
  });
}

describe('guestMessageVariables', () => {
  it('requires only guest name and invitation link in message templates', () => {
    const validation = validateGuestMessageTemplate(
      ['Halo {nama tamu}', 'Buka undangan: {link undangan}'].join('\n'),
      createOptions(),
    );

    expect(validation.isValid).toBe(true);
    expect(validation.missingRequired).toEqual([]);
  });

  it('reports only missing guest name and invitation link as required variables', () => {
    const validation = validateGuestMessageTemplate('Halo tamu undangan', createOptions());

    expect(validation.isValid).toBe(false);
    expect(validation.missingRequired).toEqual(['nama tamu', 'link undangan']);
  });
});
