import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestoreMock = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getCountFromServer: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
  startAfter: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
  limit: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  Timestamp: class Timestamp {},
  addDoc: (...args: unknown[]) => firestoreMock.addDoc(...args),
  collection: (...args: unknown[]) => firestoreMock.collection(...args),
  deleteDoc: (...args: unknown[]) => firestoreMock.deleteDoc(...args),
  doc: (...args: unknown[]) => firestoreMock.doc(...args),
  getCountFromServer: (...args: unknown[]) => firestoreMock.getCountFromServer(...args),
  getDocs: (...args: unknown[]) => firestoreMock.getDocs(...args),
  limit: (...args: unknown[]) => firestoreMock.limit(...args),
  orderBy: (...args: unknown[]) => firestoreMock.orderBy(...args),
  query: (...args: unknown[]) => firestoreMock.query(...args),
  serverTimestamp: () => firestoreMock.serverTimestamp(),
  startAfter: (...args: unknown[]) => firestoreMock.startAfter(...args),
  updateDoc: (...args: unknown[]) => firestoreMock.updateDoc(...args),
  where: (...args: unknown[]) => firestoreMock.where(...args),
  writeBatch: (...args: unknown[]) => firestoreMock.writeBatch(...args),
}));

vi.mock('./firebase', () => ({
  db: { _type: 'mock-db' },
}));

import { addGuest, addGuestsBatch, markInvitationSent, markInvitationUnsent, normalizePhone } from './guests';

describe('lib/guests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMock.collection.mockReturnValue('guests-collection-ref');
    firestoreMock.doc.mockReturnValue('guest-doc-ref');
    firestoreMock.addDoc.mockResolvedValue({ id: 'guest-id' });
    firestoreMock.updateDoc.mockResolvedValue(undefined);
    firestoreMock.writeBatch.mockReturnValue({
      commit: vi.fn().mockResolvedValue(undefined),
      set: vi.fn(),
    });
  });

  it('normalizes Indonesian phone numbers for WhatsApp links', () => {
    expect(normalizePhone('0812 345 678')).toBe('62812345678');
    expect(normalizePhone('+62-812-345')).toBe('62812345');
    expect(normalizePhone('00812 345 678')).toBe('62812345678');
    expect(normalizePhone('620812345678')).toBe('62812345678');
    expect(normalizePhone('812345678')).toBe('62812345678');
  });

  it('initializes invitation sent fields when adding one guest', async () => {
    await addGuest('dani-marini', {
      name: ' Budi ',
      phone: '081234567890',
      address: '',
      category: 'pria',
      attendance: false,
    });

    const data = firestoreMock.addDoc.mock.calls[0][1];
    expect(data.phone).toBe('6281234567890');
    expect(data.invitationSentAt).toBeNull();
    expect(data.invitationSentVia).toBeNull();
  });

  it('marks an invitation as sent with a server timestamp', async () => {
    await markInvitationSent('dani-marini', 'guest-1', 'whatsapp');

    expect(firestoreMock.doc).toHaveBeenCalledWith(
      { _type: 'mock-db' },
      'weddings',
      'dani-marini',
      'guests',
      'guest-1',
    );
    expect(firestoreMock.updateDoc).toHaveBeenCalledWith('guest-doc-ref', {
      invitationSentAt: { _type: 'serverTimestamp' },
      invitationSentVia: 'whatsapp',
    });
  });

  it('clears invitation sent fields when marking unsent', async () => {
    await markInvitationUnsent('dani-marini', 'guest-1');

    expect(firestoreMock.updateDoc).toHaveBeenCalledWith('guest-doc-ref', {
      invitationSentAt: null,
      invitationSentVia: null,
    });
  });

  it('initializes invitation sent fields and normalizes phone numbers during batch import', async () => {
    const batch = {
      commit: vi.fn().mockResolvedValue(undefined),
      set: vi.fn(),
    };
    firestoreMock.writeBatch.mockReturnValue(batch);

    await addGuestsBatch('dani-marini', [{
      name: 'Budi',
      phone: '081234567890',
      address: '',
      category: 'pria',
      attendance: false,
    }]);

    expect(batch.set).toHaveBeenCalledWith('guest-doc-ref', expect.objectContaining({
      phone: '6281234567890',
      invitationSentAt: null,
      invitationSentVia: null,
    }));
  });
});
