import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Firestore mocks
// ---------------------------------------------------------------------------

const mockAddDoc = vi.fn();
const mockCollection = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ _type: 'serverTimestamp' }));

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

vi.mock('./firebase', () => ({
  db: { _type: 'mock-db' },
}));

import { addWish } from './wishes';

const WEDDING_ID = 'dani-marini';

describe('lib/wishes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: 'new-wish-id' });
    mockCollection.mockReturnValue('wishes-collection-ref');
  });

  // ---------------------------------------------------------------------------
  // Basic functionality
  // ---------------------------------------------------------------------------
  describe('basic functionality', () => {
    it('calls addDoc with the wishes collection', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hello', attendance: 'yes' });
      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      expect(mockAddDoc.mock.calls[0][0]).toBe('wishes-collection-ref');
    });

    it('passes the correct collection path', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hello', attendance: 'yes' });
      expect(mockCollection).toHaveBeenCalledWith({ _type: 'mock-db' }, 'wishes');
    });

    it('includes weddingId in the document', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hello', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.weddingId).toBe(WEDDING_ID);
    });

    it('includes name in the document', async () => {
      await addWish(WEDDING_ID, { name: 'Ahmad', message: 'Hello', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.name).toBe('Ahmad');
    });

    it('includes message in the document', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Selamat!', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.message).toBe('Selamat!');
    });

    it('includes attendance in the document', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'no' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.attendance).toBe('no');
    });

    it('includes createdAt server timestamp', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.createdAt).toEqual({ _type: 'serverTimestamp' });
    });

    it('returns the addDoc result', async () => {
      const result = await addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' });
      expect(result).toEqual({ id: 'new-wish-id' });
    });

    it('returns a promise', () => {
      const result = addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' });
      expect(result).toBeInstanceOf(Promise);
    });
  });

  // ---------------------------------------------------------------------------
  // Input trimming
  // ---------------------------------------------------------------------------
  describe('input trimming', () => {
    it('trims leading spaces from name', async () => {
      await addWish(WEDDING_ID, { name: '  Ahmad', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.name).toBe('Ahmad');
    });

    it('trims trailing spaces from name', async () => {
      await addWish(WEDDING_ID, { name: 'Ahmad  ', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.name).toBe('Ahmad');
    });

    it('trims leading spaces from message', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: '  Hello', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.message).toBe('Hello');
    });

    it('trims trailing spaces from message', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hello  ', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.message).toBe('Hello');
    });

    it('trims both name and message', async () => {
      await addWish(WEDDING_ID, { name: '  Test  ', message: '  Hi  ', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.name).toBe('Test');
      expect(docData.message).toBe('Hi');
    });

    it('handles name with only spaces', async () => {
      await addWish(WEDDING_ID, { name: '   ', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.name).toBe('');
    });

    it('handles message with only spaces', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: '   ', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.message).toBe('');
    });

    it('trims tabs and newlines from name', async () => {
      await addWish(WEDDING_ID, { name: '\tAhmad\n', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.name).toBe('Ahmad');
    });

    it('trims tabs and newlines from message', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: '\n Hello \t', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.message).toBe('Hello');
    });

    it('does not trim attendance value', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.attendance).toBe('yes');
    });
  });

  // ---------------------------------------------------------------------------
  // Attendance values
  // ---------------------------------------------------------------------------
  describe('attendance values', () => {
    it('accepts attendance yes', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.attendance).toBe('yes');
    });

    it('accepts attendance no', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'no' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.attendance).toBe('no');
    });
  });

  // ---------------------------------------------------------------------------
  // Different wedding IDs
  // ---------------------------------------------------------------------------
  describe('different wedding IDs', () => {
    it('passes custom weddingId', async () => {
      await addWish('other-wedding', { name: 'Test', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.weddingId).toBe('other-wedding');
    });

    it('handles empty weddingId', async () => {
      await addWish('', { name: 'Test', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.weddingId).toBe('');
    });

    it('handles weddingId with special characters', async () => {
      await addWish('test-wedding/2026', { name: 'Test', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.weddingId).toBe('test-wedding/2026');
    });
  });

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------
  describe('error handling', () => {
    it('rejects when addDoc fails', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Firestore error'));
      await expect(
        addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' })
      ).rejects.toThrow('Firestore error');
    });

    it('rejects with network error', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('network error'));
      await expect(
        addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' })
      ).rejects.toThrow('network error');
    });

    it('rejects with permission denied', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('permission-denied'));
      await expect(
        addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' })
      ).rejects.toThrow('permission-denied');
    });

    it('does not call serverTimestamp if addDoc is not reached', async () => {
      mockCollection.mockImplementation(() => { throw new Error('collection error'); });
      await expect(
        addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' })
      ).rejects.toThrow('collection error');
    });
  });

  // ---------------------------------------------------------------------------
  // Document shape
  // ---------------------------------------------------------------------------
  describe('document shape', () => {
    it('document has exactly 5 fields', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(Object.keys(docData)).toHaveLength(5);
    });

    it('document fields are weddingId, name, message, attendance, createdAt', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(Object.keys(docData).sort()).toEqual(
        ['attendance', 'createdAt', 'message', 'name', 'weddingId']
      );
    });

    it('does not include extra fields', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData).not.toHaveProperty('id');
      expect(docData).not.toHaveProperty('updatedAt');
    });
  });

  // ---------------------------------------------------------------------------
  // Unicode and special content
  // ---------------------------------------------------------------------------
  describe('unicode and special content', () => {
    it('handles Indonesian text', async () => {
      await addWish(WEDDING_ID, { name: 'Budi', message: 'Selamat menempuh hidup baru!', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.message).toBe('Selamat menempuh hidup baru!');
    });

    it('handles Arabic text', async () => {
      await addWish(WEDDING_ID, { name: 'Ahmad', message: "Baarakallahu laka wa baaraka 'alaika", attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.message).toContain('Baarakallahu');
    });

    it('handles emoji in message', async () => {
      await addWish(WEDDING_ID, { name: 'Test', message: 'Happy wedding! 🎉', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.message).toContain('🎉');
    });

    it('handles long name', async () => {
      const longName = 'A'.repeat(200);
      await addWish(WEDDING_ID, { name: longName, message: 'Hi', attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.name).toBe(longName);
    });

    it('handles long message', async () => {
      const longMessage = 'Selamat '.repeat(100);
      await addWish(WEDDING_ID, { name: 'Test', message: longMessage, attendance: 'yes' });
      const docData = mockAddDoc.mock.calls[0][1];
      expect(docData.message).toBe(longMessage.trim());
    });
  });

  // ---------------------------------------------------------------------------
  // Consistency
  // ---------------------------------------------------------------------------
  describe('consistency', () => {
    it('always calls serverTimestamp for createdAt', async () => {
      await addWish(WEDDING_ID, { name: 'A', message: 'a', attendance: 'yes' });
      await addWish(WEDDING_ID, { name: 'B', message: 'b', attendance: 'no' });
      expect(mockServerTimestamp).toHaveBeenCalledTimes(2);
    });

    it('always calls collection with wishes', async () => {
      await addWish(WEDDING_ID, { name: 'A', message: 'a', attendance: 'yes' });
      await addWish('other', { name: 'B', message: 'b', attendance: 'no' });
      expect(mockCollection).toHaveBeenCalledTimes(2);
      expect(mockCollection.mock.calls[0][1]).toBe('wishes');
      expect(mockCollection.mock.calls[1][1]).toBe('wishes');
    });

    it('multiple calls produce independent documents', async () => {
      await addWish(WEDDING_ID, { name: 'A', message: 'msg-a', attendance: 'yes' });
      await addWish(WEDDING_ID, { name: 'B', message: 'msg-b', attendance: 'no' });
      const doc1 = mockAddDoc.mock.calls[0][1];
      const doc2 = mockAddDoc.mock.calls[1][1];
      expect(doc1.name).toBe('A');
      expect(doc2.name).toBe('B');
      expect(doc1.message).not.toBe(doc2.message);
    });
  });
});
