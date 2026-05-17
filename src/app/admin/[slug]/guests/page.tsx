'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-auth';
import { useUser } from '@/hooks/useUser';
import { useWedding } from '@/hooks/useWedding';
import { getGuests, addGuest, updateGuest, deleteGuest, addGuestsBatch } from '@/lib/guests';
import { Guest } from '@/types/firestore';
import { Plus, Search, Trash2, Edit3, ArrowLeft, MessageCircle, Download, Upload, QrCode, Printer } from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { GuestImportModal } from '@/components/admin/GuestImportModal';
import { GuestQRModal } from '@/components/admin/GuestQRModal';
import { GuestQRPrintView } from '@/components/admin/GuestQRPrintView';
import { BASE_URL } from '@/constants/baseUrl';
import type { ImportedGuest } from '@/utils/guestImport';

const ITEMS_PER_PAGE = 20;

interface GuestFormData {
  name: string;
  phone: string;
  address: string;
  category: 'pria' | 'wanita';
  attendance: boolean;
}

const EMPTY_FORM: GuestFormData = { name: '', phone: '', address: '', category: 'pria', attendance: false };

export default function GuestsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { authUser, userDoc, isLoading: isAuthLoading } = useUser();
  const { wedding, isLoading: isWeddingLoading } = useWedding(slug ?? '');

  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'pria' | 'wanita'>('all');
  const [filterAttendance, setFilterAttendance] = useState<'all' | 'hadir' | 'belum'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [qrGuest, setQrGuest] = useState<Guest | null>(null);
  const [showBulkPrint, setShowBulkPrint] = useState(false);

  // Load guests
  const loadGuests = async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const data = await getGuests(slug);
      setGuests(data);
    } catch (error) {
      console.error('[Guests] Load error:', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && authUser && slug) loadGuests();
  }, [isAuthLoading, authUser, slug]);

  // Filtered + searched guests
  const filteredGuests = useMemo(() => {
    let result = guests;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(q) || g.phone.includes(q));
    }
    if (filterCategory !== 'all') {
      result = result.filter((g) => g.category === filterCategory);
    }
    if (filterAttendance === 'hadir') {
      result = result.filter((g) => g.attendance);
    } else if (filterAttendance === 'belum') {
      result = result.filter((g) => !g.attendance);
    }
    return result;
  }, [guests, searchQuery, filterCategory, filterAttendance]);

  // Pagination
  const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE);
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterCategory, filterAttendance]);

  // Form handlers
  const openAddForm = () => {
    setEditingGuest(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setDuplicateWarning(false);
    setShowForm(true);
  };

  const openEditForm = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      phone: guest.phone,
      address: guest.address,
      category: guest.category,
      attendance: guest.attendance,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setFormError('Nama tamu wajib diisi'); return; }
    if (!slug) return;

    // Duplicate check (only on add, not edit)
    if (!editingGuest && !duplicateWarning) {
      const isDuplicate = guests.some(
        (g) => g.name.toLowerCase().trim() === formData.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        setDuplicateWarning(true);
        setFormError(`Tamu "${formData.name.trim()}" sudah ada. Klik Simpan lagi untuk tetap menambahkan.`);
        return;
      }
    }

    setIsSaving(true);
    setFormError('');
    setDuplicateWarning(false);
    try {
      if (editingGuest) {
        await updateGuest(slug, editingGuest.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          category: formData.category,
          attendance: formData.attendance,
        });
      } else {
        await addGuest(slug, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          category: formData.category,
          attendance: formData.attendance,
        });
      }
      setShowForm(false);
      await loadGuests();
    } catch (error) {
      setFormError((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (guest: Guest) => {
    if (!slug) return;
    try {
      await deleteGuest(slug, guest.id);
      await loadGuests();
    } catch (error) {
      console.error('[Guests] Delete error:', (error as Error).message);
    }
  };

  const handleImport = async (importedGuests: ImportedGuest[]) => {
    if (!slug) return;
    const result = await addGuestsBatch(slug, importedGuests.map((g) => ({
      ...g,
      attendance: false,
    })));
    await loadGuests();
    if (result.failed > 0) {
      throw new Error(`${result.success} tamu berhasil diimport, ${result.failed} gagal.`);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      const { exportGuests } = await import('@/utils/guestExport');
      await exportGuests(guests, slug ?? 'guests', format);
    } catch (error) {
      console.error('[Guests] Export error:', (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const getWhatsAppUrl = (guest: Guest) => {
    if (!guest.phone || !wedding) return null;
    const link = `${BASE_URL}/${slug}?to=${encodeURIComponent(guest.name)}`;
    const template = wedding.greetingTemplate || 'Buka undangan: {link}';
    const text = template
      .replace(/\{nama\}/g, guest.name)
      .replace(/\{pengantin\}/g, `${wedding.groomNickname} & ${wedding.brideNickname}`)
      .replace(/\{link\}/g, link);
    return `https://wa.me/${guest.phone}?text=${encodeURIComponent(text)}`;
  };

  // Auth guards
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-sm text-ink/40 tracking-widest uppercase">Memuat...</p>
      </div>
    );
  }

  if (!authUser) { router.push('/login'); return null; }

  const isAuthorized = userDoc?.role === 'super' || (wedding?.adminIds ?? []).includes(authUser.uid);
  if (!isAuthorized && !isWeddingLoading) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
        <h1 className="font-serif italic text-2xl text-ink mb-2">Akses Ditolak</h1>
        <p className="text-xs text-ink/40">Anda tidak memiliki akses ke undangan ini.</p>
      </div>
    );
  }

  // Stats
  const totalGuests = guests.length;
  const totalHadir = guests.filter((g) => g.attendance).length;
  const totalPria = guests.filter((g) => g.category === 'pria').length;
  const totalWanita = guests.filter((g) => g.category === 'wanita').length;

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-gold/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/admin/${slug}`} className="text-ink/40 hover:text-ink transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-serif italic text-lg text-ink">Daftar Tamu</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="w-8 h-8 flex items-center justify-center text-ink/40 hover:text-gold border border-gold/20 rounded-full transition-colors"
              aria-label="Import tamu"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={isExporting || guests.length === 0}
              className="w-8 h-8 flex items-center justify-center text-ink/40 hover:text-gold border border-gold/20 rounded-full transition-colors disabled:opacity-30"
              aria-label="Export tamu"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowBulkPrint(true)}
              disabled={guests.length === 0}
              className="w-8 h-8 flex items-center justify-center text-ink/40 hover:text-gold border border-gold/20 rounded-full transition-colors disabled:opacity-30"
              aria-label="Print semua QR"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold text-ivory rounded-full text-[10px] uppercase tracking-[0.2em] font-black shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white/60 border border-gold/10 rounded-2xl text-center">
            <p className="text-2xl font-serif text-ink">{totalGuests}</p>
            <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Total</p>
          </div>
          <div className="p-3 bg-white/60 border border-gold/10 rounded-2xl text-center">
            <p className="text-2xl font-serif text-green-600">{totalHadir}</p>
            <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Hadir</p>
          </div>
          <div className="p-3 bg-white/60 border border-gold/10 rounded-2xl text-center">
            <p className="text-2xl font-serif text-ink">{totalPria}</p>
            <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Pihak Pria</p>
          </div>
          <div className="p-3 bg-white/60 border border-gold/10 rounded-2xl text-center">
            <p className="text-2xl font-serif text-ink">{totalWanita}</p>
            <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Pihak Wanita</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau nomor HP..."
              className="w-full pl-10 pr-4 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
            className="px-3 py-2.5 border border-gold/20 rounded-xl text-xs bg-white focus:outline-none focus:border-gold/50"
          >
            <option value="all">Semua Pihak</option>
            <option value="pria">Pihak Pria</option>
            <option value="wanita">Pihak Wanita</option>
          </select>
          <select
            value={filterAttendance}
            onChange={(e) => setFilterAttendance(e.target.value as typeof filterAttendance)}
            className="px-3 py-2.5 border border-gold/20 rounded-xl text-xs bg-white focus:outline-none focus:border-gold/50"
          >
            <option value="all">Semua Status</option>
            <option value="hadir">Hadir</option>
            <option value="belum">Belum Hadir</option>
          </select>
        </div>

        {/* Guest List */}
        {isLoading ? (
          <p className="text-center text-xs text-ink/30 tracking-widest uppercase py-10">Memuat data tamu...</p>
        ) : filteredGuests.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gold/10 rounded-3xl">
            <p className="text-xs text-ink/40 tracking-wider mb-4">
              {guests.length === 0 ? 'Belum ada tamu. Tambahkan tamu pertama.' : 'Tidak ada tamu yang cocok dengan filter.'}
            </p>
            {guests.length === 0 && (
              <button onClick={openAddForm} className="px-6 py-2 bg-gold text-ivory rounded-full text-[10px] uppercase tracking-[0.2em] font-black">
                Tambah Tamu
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedGuests.map((guest) => (
              <div key={guest.id} className="p-4 bg-white/60 border border-gold/10 rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-serif text-sm text-ink truncate">{guest.name}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider ${
                      guest.category === 'pria' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                    }`}>
                      {guest.category === 'pria' ? 'Pria' : 'Wanita'}
                    </span>
                    {guest.attendance && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider bg-green-50 text-green-600">
                        Hadir
                      </span>
                    )}
                  </div>
                  {guest.phone && <p className="text-[10px] text-ink/40">{guest.phone}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {getWhatsAppUrl(guest) && (
                    <a
                      href={getWhatsAppUrl(guest)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      aria-label="Kirim WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setQrGuest(guest)}
                    className="w-8 h-8 flex items-center justify-center text-ink/40 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
                    aria-label="QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditForm(guest)}
                    className="w-8 h-8 flex items-center justify-center text-ink/40 hover:text-ink hover:bg-ink/5 rounded-lg transition-colors"
                    aria-label="Edit tamu"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(guest)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Hapus tamu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                  currentPage === i + 1
                    ? 'bg-gold text-ivory'
                    : 'text-ink/40 hover:text-ink/70 hover:bg-ink/5'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        <p className="text-[9px] text-ink/30 text-center pt-2">
          Menampilkan {filteredGuests.length} dari {guests.length} tamu
        </p>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-[2rem] p-6 shadow-2xl border border-gold/10 w-full max-w-sm">
            <h3 className="font-serif italic text-lg text-ink mb-4">
              {editingGuest ? 'Edit Tamu' : 'Tambah Tamu'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama Tamu"
                required
                maxLength={100}
                className={inputClass}
                aria-label="Nama Tamu"
              />
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Nomor HP (cth: 081234567890)"
                type="tel"
                maxLength={20}
                className={inputClass}
                aria-label="Nomor HP"
              />
              <input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat (opsional)"
                maxLength={200}
                className={inputClass}
                aria-label="Alamat"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'pria' | 'wanita' })}
                className={inputClass}
                aria-label="Kategori"
              >
                <option value="pria">Pihak Pria</option>
                <option value="wanita">Pihak Wanita</option>
              </select>
              <label className="flex items-center gap-3 px-4 py-3 border border-gold/20 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: e.target.checked })}
                  className="w-4 h-4 rounded border-gold/30 text-gold focus:ring-gold/50"
                />
                <span className="text-sm text-ink/70">Sudah konfirmasi hadir</span>
              </label>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gold/20 text-ink/60 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message={`Hapus tamu "${deleteTarget?.name}" dari daftar?`}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Import Modal */}
      <GuestImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />

      {/* QR Modal */}
      <GuestQRModal
        isOpen={qrGuest !== null}
        guestName={qrGuest?.name ?? ''}
        coupleName={wedding ? `${wedding.groomNickname} & ${wedding.brideNickname}` : ''}
        invitationUrl={qrGuest ? `${BASE_URL}/${slug}?to=${encodeURIComponent(qrGuest.name)}` : ''}
        whatsappUrl={qrGuest ? getWhatsAppUrl(qrGuest) : null}
        onClose={() => setQrGuest(null)}
      />

      {/* Bulk Print View */}
      <GuestQRPrintView
        isOpen={showBulkPrint}
        guests={guests}
        slug={slug ?? ''}
        coupleName={wedding ? `${wedding.groomNickname} & ${wedding.brideNickname}` : ''}
        onClose={() => setShowBulkPrint(false)}
      />
    </div>
  );
}
