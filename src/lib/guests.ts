import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp, Timestamp, writeBatch, limit as firestoreLimit, startAfter, where, getCountFromServer, QueryDocumentSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import type { Guest } from '@/types/firestore';

const BATCH_LIMIT = 500;

function guestsCollection(slug: string) {
  return collection(db, 'weddings', slug, 'guests');
}

/**
 * Normalize Indonesian phone number to digits-only format starting with 62.
 * Examples: "0812 345 6789" → "6281234567890", "+62-812-345" → "62812345", "" → ""
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('620')) return '62' + digits.slice(3);
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('62')) return digits;
  // Bare Indonesian mobile (leading 0 lost in Excel): 8xx with 9-12 digits
  if (digits.startsWith('8') && digits.length >= 9 && digits.length <= 12) return '62' + digits;
  return digits; // foreign number or short code — keep as-is
}

function sanitizeGuestFields(data: { name?: string; phone?: string; address?: string; category?: string }) {
  return {
    ...(data.name !== undefined && { name: data.name.trim().slice(0, 100) }),
    ...(data.phone !== undefined && { phone: normalizePhone(data.phone).slice(0, 20) }),
    ...(data.address !== undefined && { address: data.address.trim().slice(0, 200) }),
    ...(data.category !== undefined && { category: data.category === 'wanita' ? 'wanita' as const : 'pria' as const }),
  };
}

export async function getGuests(slug: string): Promise<Guest[]> {
  const q = query(guestsCollection(slug), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Guest));
}

export type GuestPageCursor = QueryDocumentSnapshot | null;

export async function getGuestPage(
  slug: string,
  pageSize: number,
  cursor?: GuestPageCursor,
): Promise<{ guests: Guest[]; lastDoc: GuestPageCursor; hasMore: boolean }> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), firestoreLimit(pageSize + 1)];
  if (cursor) constraints.push(startAfter(cursor));
  const q = query(guestsCollection(slug), ...constraints);
  const snap = await getDocs(q);
  const hasMore = snap.docs.length > pageSize;
  const docs = snap.docs.slice(0, pageSize);
  return {
    guests: docs.map(d => ({ id: d.id, ...d.data() } as Guest)),
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore,
  };
}

export async function getGuestCounts(slug: string): Promise<{ pria: number; wanita: number }> {
  const col = guestsCollection(slug);
  const [priaSnap, wanitaSnap] = await Promise.all([
    getCountFromServer(query(col, where('category', '==', 'pria'))),
    getCountFromServer(query(col, where('category', '==', 'wanita'))),
  ]);
  return { pria: priaSnap.data().count, wanita: wanitaSnap.data().count };
}

export async function addGuest(slug: string, data: Omit<Guest, 'id' | 'createdAt' | 'attendanceAt'>) {
  const sanitized = sanitizeGuestFields(data);
  if (!sanitized.name) throw new Error('Nama tamu wajib diisi');
  return addDoc(guestsCollection(slug), {
    ...data,
    ...sanitized,
    attendance: data.attendance ?? false,
    attendanceAt: null,
    createdAt: serverTimestamp(),
  });
}

export async function updateGuest(slug: string, guestId: string, data: Partial<Omit<Guest, 'id' | 'createdAt'>>) {
  const ref = doc(db, 'weddings', slug, 'guests', guestId);
  const sanitized = sanitizeGuestFields(data);
  const updates: Record<string, unknown> = { ...data, ...sanitized };
  if (data.attendance === true && !data.attendanceAt) {
    updates.attendanceAt = serverTimestamp();
  }
  if (data.attendance === false) {
    updates.attendanceAt = null;
  }
  return updateDoc(ref, updates as Record<string, any>);
}

export async function deleteGuest(slug: string, guestId: string) {
  return deleteDoc(doc(db, 'weddings', slug, 'guests', guestId));
}

export async function addGuestsBatch(
  slug: string,
  guests: Omit<Guest, 'id' | 'createdAt' | 'attendanceAt'>[],
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  // Split into chunks of 500 (Firestore batch limit)
  for (let i = 0; i < guests.length; i += BATCH_LIMIT) {
    const chunk = guests.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);

    for (const g of chunk) {
      const ref = doc(guestsCollection(slug));
      batch.set(ref, {
        name: (g.name ?? '').trim().slice(0, 100),
        phone: (g.phone ?? '').trim().slice(0, 20),
        address: (g.address ?? '').trim().slice(0, 200),
        category: g.category === 'wanita' ? 'wanita' : 'pria',
        attendance: g.attendance ?? false,
        attendanceAt: null,
        createdAt: serverTimestamp(),
      });
    }

    try {
      await batch.commit();
      success += chunk.length;
    } catch (error) {
      console.error('[Guests] Batch write error:', (error as Error).message);
      failed += chunk.length;
    }
  }

  return { success, failed };
}
