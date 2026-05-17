import type { Guest } from '@/types/firestore';

export interface ImportedGuest {
  name: string;
  phone: string;
  address: string;
  category: 'pria' | 'wanita';
}

// Candidates ordered longest-first to prevent false positives (e.g., "nama tamu" matches before "nama")
const NAME_COLUMNS = ['nama lengkap', 'nama tamu', 'guest name', 'nama', 'name'];
const PHONE_COLUMNS = ['nomor hp', 'no telepon', 'no hp', 'telepon', 'whatsapp', 'phone', 'hp', 'wa'];
const ADDRESS_COLUMNS = ['alamat lengkap', 'alamat', 'address'];
const CATEGORY_COLUMNS = ['kategori', 'category', 'kelompok', 'pihak', 'group'];

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[_./\-()]/g, ' ')   // Replace common separators with space
    .replace(/[^a-z0-9\s]/g, '')  // Remove remaining special chars
    .replace(/\s+/g, ' ')         // Collapse multiple spaces
    .trim();
}

function detectColumn(headers: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = headers.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseCategory(value: string): 'pria' | 'wanita' {
  const v = value.toLowerCase().trim();
  if (v.includes('wanita') || v.includes('bride') || v.includes('perempuan') || v.includes('istri')) return 'wanita';
  return 'pria';
}

export function parseGuestData(rows: string[][]): { guests: ImportedGuest[]; errors: string[] } {
  if (rows.length < 2) return { guests: [], errors: ['File kosong atau hanya berisi header'] };

  const headers = rows[0].map(normalizeHeader);
  const nameCol = detectColumn(headers, NAME_COLUMNS);
  const phoneCol = detectColumn(headers, PHONE_COLUMNS);
  const addressCol = detectColumn(headers, ADDRESS_COLUMNS);
  const categoryCol = detectColumn(headers, CATEGORY_COLUMNS);

  if (nameCol === -1) {
    return { guests: [], errors: ['Kolom "Nama" tidak ditemukan. Pastikan ada kolom: nama, name, atau nama tamu'] };
  }

  const guests: ImportedGuest[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[nameCol] ?? '').trim();
    if (!name) continue; // Skip empty rows

    guests.push({
      name,
      phone: phoneCol !== -1 ? (row[phoneCol] ?? '').trim() : '',
      address: addressCol !== -1 ? (row[addressCol] ?? '').trim() : '',
      category: categoryCol !== -1 ? parseCategory(row[categoryCol] ?? '') : 'pria',
    });
  }

  if (guests.length === 0) {
    errors.push('Tidak ada data tamu yang valid ditemukan');
  }

  return { guests, errors };
}

export async function parseFile(file: File): Promise<string[][]> {
  const { read, utils } = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return utils.sheet_to_json<string[]>(firstSheet, { header: 1, defval: '', raw: false });
}
