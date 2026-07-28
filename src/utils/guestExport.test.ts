import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Guest } from '@/types/firestore';
import { exportGuests } from './guestExport';

const xlsxMock = vi.hoisted(() => ({
  bookAppendSheet: vi.fn(),
  bookNew: vi.fn(() => ({ sheets: [] })),
  jsonToSheet: vi.fn((data) => ({ data })),
  writeFile: vi.fn(),
}));

vi.mock('xlsx', () => ({
  utils: {
    book_append_sheet: (...args: unknown[]) => xlsxMock.bookAppendSheet(...args),
    book_new: () => xlsxMock.bookNew(),
    json_to_sheet: (...args: unknown[]) => xlsxMock.jsonToSheet(...args),
  },
  writeFile: (...args: unknown[]) => xlsxMock.writeFile(...args),
}));

function createGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: 'guest-1',
    name: 'Budi Santoso',
    phone: '6281234567890',
    address: '',
    category: 'pria',
    attendance: false,
    attendanceAt: null,
    invitationSentAt: null,
    invitationSentVia: null,
    createdAt: { toDate: () => new Date('2026-08-01T10:00:00Z') } as Guest['createdAt'],
    ...overrides,
  };
}

describe('guestExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes invitation delivery status fields in exported guest data', async () => {
    await exportGuests([
      createGuest({
        invitationSentAt: { toDate: () => new Date('2026-08-01T10:00:00Z') } as Guest['invitationSentAt'],
        invitationSentVia: 'manual',
      }),
      createGuest({
        id: 'guest-2',
        name: 'Siti Aminah',
        category: 'wanita',
      }),
    ], 'dani-marini', 'xlsx');

    const data = xlsxMock.jsonToSheet.mock.calls[0][0];
    expect(data[0]['Status Kirim']).toBe('Terkirim');
    expect(data[0]['Waktu Kirim']).not.toBe('');
    expect(data[1]['Status Kirim']).toBe('Belum Dikirim');
    expect(data[1]['Waktu Kirim']).toBe('');
  });
});
