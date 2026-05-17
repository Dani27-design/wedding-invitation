'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-auth';
import { useUser } from '@/hooks/useUser';
import { useWedding } from '@/hooks/useWedding';
import { getGuests, getGuestPage, getGuestCounts, addGuest, updateGuest, deleteGuest, addGuestsBatch } from '@/lib/guests';
import type { GuestPageCursor } from '@/lib/guests';
import { Guest } from '@/types/firestore';
import { Plus, Search, Trash2, Edit3, ArrowLeft, MessageCircle, Download, Upload, QrCode, Printer, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { GuestImportModal } from '@/components/admin/GuestImportModal';
import { GuestQRModal } from '@/components/admin/GuestQRModal';
import { GuestQRPrintView } from '@/components/admin/GuestQRPrintView';
import { BASE_URL } from '@/constants/baseUrl';
import type { ImportedGuest } from '@/utils/guestImport';

const PAGE_SIZE = 20;

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

  // Counts (server-side)
  const [counts, setCounts] = useState({ pria: 0, wanita: 0 });

  // Server-side pagination
  const [pageGuests, setPageGuests] = useState<Guest[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const cursorsRef = useRef<GuestPageCursor[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Client-side search/filter (lazy-loaded)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'pria' | 'wanita'>('all');
  const [allGuests, setAllGuests] = useState<Guest[] | null>(null);
  const [filterPage, setFilterPage] = useState(0);

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

  const isFiltering = searchQuery.trim() !== '' || filterCategory !== 'all';

  // Load server-side page
  const loadPage = useCallback(async (pageIdx: number) => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const { guests, lastDoc, hasMore } = await getGuestPage(slug, PAGE_SIZE, cursorsRef.current[pageIdx]);
      setPageGuests(guests);
      setHasNextPage(hasMore);
      setCurrentPage(pageIdx);
      if (lastDoc && !cursorsRef.current[pageIdx + 1]) {
        cursorsRef.current[pageIdx + 1] = lastDoc;
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // Load counts
  const refreshCounts = useCallback(async () => {
    if (!slug) return;
    getGuestCounts(slug).then(setCounts).catch(() => {});
  }, [slug]);

  // Initial load
  useEffect(() => {
    if (!isAuthLoading && authUser && slug) {
      loadPage(0);
      refreshCounts();
    }
  }, [isAuthLoading, authUser, slug, loadPage, refreshCounts]);

  // Lazy-load all guests when filtering
  useEffect(() => {
    if (isFiltering && !allGuests && slug) {
      getGuests(slug).then(setAllGuests).catch(() => {});
    }
  }, [isFiltering, allGuests, slug]);

  // Reset filter page on filter change
  useEffect(() => { setFilterPage(0); }, [searchQuery, filterCategory]);

  // Filtered guests (client-side)
  const filteredGuests = useMemo(() => {
    if (!isFiltering || !allGuests) return [];
    let result = allGuests;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(q) || g.phone.includes(q));
    }
    if (filterCategory !== 'all') {
      result = result.filter((g) => g.category === filterCategory);
    }
    return result;
  }, [isFiltering, allGuests, searchQuery, filterCategory]);

  // Display guests
  const visibleGuests = isFiltering
    ? filteredGuests.slice(filterPage * PAGE_SIZE, (filterPage + 1) * PAGE_SIZE)
    : pageGuests;

  const totalFilterPages = Math.ceil(filteredGuests.length / PAGE_SIZE);
  const activePage = isFiltering ? filterPage : currentPage;
  const canGoPrev = activePage > 0;
  const canGoNext = isFiltering ? filterPage < totalFilterPages - 1 : hasNextPage;

  const goNextPage = () => {
    if (isFiltering) setFilterPage((p) => p + 1);
    else loadPage(currentPage + 1);
  };
  const goPrevPage = () => {
    if (isFiltering) setFilterPage((p) => p - 1);
    else loadPage(currentPage - 1);
  };

  // Refresh after mutation
  const refreshAfterMutation = async () => {
    setAllGuests(null);
    cursorsRef.current = [null];
    await Promise.all([loadPage(0), refreshCounts()]);
  };

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

    // Duplicate check (only on add)
    if (!editingGuest && !duplicateWarning) {
      const all = allGuests ?? await getGuests(slug);
      if (!allGuests) setAllGuests(all);
      const isDuplicate = all.some(
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
      await refreshAfterMutation();
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
      await refreshAfterMutation();
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
    await refreshAfterMutation();
    if (result.failed > 0) {
      throw new Error(`${result.success} tamu berhasil diimport, ${result.failed} gagal.`);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (!slug) return;
    setIsExporting(true);
    try {
      const all = allGuests ?? await getGuests(slug);
      if (!allGuests) setAllGuests(all);
      const { exportGuests } = await import('@/utils/guestExport');
      await exportGuests(all, slug, format);
    } catch (error) {
      console.error('[Guests] Export error:', (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkPrint = async () => {
    if (!slug) return;
    if (!allGuests) {
      const all = await getGuests(slug);
      setAllGuests(all);
    }
    setShowBulkPrint(true);
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

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
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

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50';
  const totalCount = counts.pria + counts.wanita;

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
              disabled={isExporting || totalCount === 0}
              className="w-8 h-8 flex items-center justify-center text-ink/40 hover:text-gold border border-gold/20 rounded-full transition-colors disabled:opacity-30"
              aria-label="Export tamu"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleBulkPrint}
              disabled={totalCount === 0}
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

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Inline stats */}
        {totalCount > 0 && (
          <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest text-center">
            {counts.pria} tamu pihak pria <span className="text-ink/15 mx-1">|</span> {counts.wanita} tamu pihak wanita
          </p>
        )}

        {/* Search + category pills */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama / HP..."
              aria-label="Cari tamu"
              className="w-full pl-9 pr-8 py-2 border border-gold/20 rounded-full text-xs bg-white focus:outline-none focus:border-gold/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60" aria-label="Hapus pencarian">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {(['all', 'pria', 'wanita'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-gold text-ivory'
                  : 'text-ink/40 border border-gold/15 hover:text-ink/60'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat === 'pria' ? 'Pria' : 'Wanita'}
            </button>
          ))}
        </div>

        {/* Guest List */}
        {isLoading && !isFiltering ? (
          <p className="text-center text-xs text-ink/30 tracking-widest uppercase py-10">Memuat...</p>
        ) : visibleGuests.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gold/10 rounded-2xl">
            <p className="text-xs text-ink/40 tracking-wider mb-3">
              {isFiltering ? 'Tidak ada tamu yang cocok.' : 'Belum ada tamu.'}
            </p>
            {isFiltering ? (
              <button onClick={clearFilters} className="text-[10px] text-gold font-bold uppercase tracking-widest hover:underline">
                Reset Filter
              </button>
            ) : (
              <button onClick={openAddForm} className="px-5 py-2 bg-gold text-ivory rounded-full text-[10px] uppercase tracking-[0.2em] font-black">
                Tambah Tamu
              </button>
            )}
          </div>
        ) : (
          <div className="border border-gold/10 rounded-2xl overflow-hidden divide-y divide-gold/5">
            {visibleGuests.map((guest) => (
              <div key={guest.id} className="flex items-center gap-3 px-4 py-2.5 bg-white/40 hover:bg-white/70 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-ink truncate">{guest.name}</p>
                    <span className={`text-[7px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider flex-shrink-0 ${
                      guest.category === 'pria' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                    }`}>
                      {guest.category === 'pria' ? 'P' : 'W'}
                    </span>
                    {guest.attendance && (
                      <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider bg-green-50 text-green-500 flex-shrink-0">
                        Hadir
                      </span>
                    )}
                  </div>
                  {guest.phone && <p className="text-[10px] text-ink/30 mt-0.5">{guest.phone}</p>}
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {getWhatsAppUrl(guest) && (
                    <a
                      href={getWhatsAppUrl(guest)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      aria-label="Kirim WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setQrGuest(guest)}
                    className="w-7 h-7 flex items-center justify-center text-ink/30 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
                    aria-label="QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditForm(guest)}
                    className="w-7 h-7 flex items-center justify-center text-ink/30 hover:text-ink hover:bg-ink/5 rounded-lg transition-colors"
                    aria-label="Edit tamu"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(guest)}
                    className="w-7 h-7 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Hapus tamu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(canGoPrev || canGoNext) && (
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={goPrevPage}
              disabled={!canGoPrev}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gold/20 text-ink/40 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20 disabled:hover:text-ink/40 disabled:hover:border-gold/20"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">
              Hal. {activePage + 1}
            </span>
            <button
              onClick={goNextPage}
              disabled={!canGoNext}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gold/20 text-ink/40 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20 disabled:hover:text-ink/40 disabled:hover:border-gold/20"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {isFiltering && filteredGuests.length > 0 && (
          <p className="text-[9px] text-ink/30 text-center">
            {filteredGuests.length} tamu ditemukan
          </p>
        )}
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
        guests={allGuests ?? []}
        slug={slug ?? ''}
        coupleName={wedding ? `${wedding.groomNickname} & ${wedding.brideNickname}` : ''}
        onClose={() => setShowBulkPrint(false)}
      />
    </div>
  );
}
