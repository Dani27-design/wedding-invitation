import type { Guest } from '@/types/firestore';

export async function exportGuests(guests: Guest[], slug: string, format: 'csv' | 'xlsx') {
  const { utils, writeFile } = await import('xlsx');

  const data = guests.map((g) => ({
    'Nama': g.name,
    'No HP': g.phone,
    'Alamat': g.address,
    'Kategori': g.category === 'pria' ? 'Pihak Pria' : 'Pihak Wanita',
    'Hadir': g.attendance ? 'Ya' : 'Belum',
  }));

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Tamu');

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((r) => String((r as Record<string, string>)[key] ?? '').length)) + 2,
  }));
  worksheet['!cols'] = colWidths;

  const date = new Date().toISOString().split('T')[0];
  const filename = `tamu-${slug}-${date}.${format}`;

  if (format === 'csv') {
    writeFile(workbook, filename, { bookType: 'csv' });
  } else {
    writeFile(workbook, filename, { bookType: 'xlsx' });
  }
}
