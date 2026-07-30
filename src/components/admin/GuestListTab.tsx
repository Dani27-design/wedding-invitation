'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getGuests, getGuestPage, getGuestCounts, addGuest, updateGuest, deleteGuest, addGuestsBatch, markInvitationSent, markInvitationUnsent } from '@/lib/guests';
import type { GuestPageCursor } from '@/lib/guests';
import { Guest, WeddingDocument } from '@/types/firestore';
import { Plus, Search, Trash2, Edit3, MessageCircle, Download, Upload, QrCode, Printer, ChevronLeft, ChevronRight, ChevronDown, X, CheckCircle2, Loader2, MoreHorizontal, Settings } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { GuestImportModal } from './GuestImportModal';
import { GuestQRModal } from './GuestQRModal';
import { GuestQRPrintView } from './GuestQRPrintView';
import { BASE_URL } from '@/constants/baseUrl';
import type { ImportedGuest } from '@/utils/guestImport';
import { buildGuestInvitationUrl, buildGuestWhatsAppUrl } from '@/utils/guestInvitation';

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 30, 50, 75, 100] as const;
const DEFAULT_PAGE_SIZE = 10;

interface GuestFormData {
  name: string;
  phone: string;
  address: string;
  category: 'pria' | 'wanita';
  attendance: boolean;
}

const EMPTY_FORM: GuestFormData = { name: '', phone: '', address: '', category: 'pria', attendance: false };

interface GuestListTabProps {
  slug: string;
  wedding: WeddingDocument | null;
}

export function GuestListTab({ slug, wedding }: GuestListTabProps) {
  const [counts, setCounts] = useState({ pria: 0, wanita: 0 });
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const pageSizeRef = useRef(DEFAULT_PAGE_SIZE);
  const [pageGuests, setPageGuests] = useState<Guest[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const cursorsRef = useRef<GuestPageCursor[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'pria' | 'wanita'>('all');
  const [filterDelivery, setFilterDelivery] = useState<'all' | 'sent' | 'unsent'>('all');
  const [allGuests, setAllGuests] = useState<Guest[] | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [filterPage, setFilterPage] = useState(0);

  const [showPageSizeMenu, setShowPageSizeMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showDeliveryMenu, setShowDeliveryMenu] = useState(false);
  const [openGuestMenuId, setOpenGuestMenuId] = useState<string | null>(null);
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
  const [statusUpdatingGuestId, setStatusUpdatingGuestId] = useState<string | null>(null);

  const isFiltering = searchQuery.trim() !== '' || filterCategory !== 'all' || filterDelivery !== 'all';
  const wasFilteringRef = useRef(false);

  const loadPage = useCallback(async (pageIdx: number, size = pageSizeRef.current) => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const { guests, lastDoc, hasMore } = await getGuestPage(slug, size, cursorsRef.current[pageIdx]);
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

  const refreshCounts = useCallback(async () => {
    if (!slug) return;
    getGuestCounts(slug).then(setCounts).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (slug) {
      setAllGuests(null);
      setSearchQuery('');
      setFilterCategory('all');
      setFilterDelivery('all');
      cursorsRef.current = [null];
      loadPage(0);
      refreshCounts();
    }
  }, [slug, loadPage, refreshCounts]);

  useEffect(() => {
    if (isFiltering && !allGuests && slug) {
      setIsSearchLoading(true);
      getGuests(slug)
        .then(setAllGuests)
        .catch((error) => { console.error('[GuestListTab] Search load error:', (error as Error).message); })
        .finally(() => setIsSearchLoading(false));
    }
  }, [isFiltering, allGuests, slug]);

  useEffect(() => {
    if (wasFilteringRef.current && !isFiltering && slug) {
      cursorsRef.current = [null];
      loadPage(0);
    }
    wasFilteringRef.current = isFiltering;
  }, [isFiltering, loadPage, slug]);

  useEffect(() => { setFilterPage(0); }, [searchQuery, filterCategory, filterDelivery]);

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
    if (filterDelivery === 'sent') {
      result = result.filter((g) => Boolean(g.invitationSentAt));
    }
    if (filterDelivery === 'unsent') {
      result = result.filter((g) => !g.invitationSentAt);
    }
    return result;
  }, [isFiltering, allGuests, searchQuery, filterCategory, filterDelivery]);

  const visibleGuests = isFiltering
    ? filteredGuests.slice(filterPage * pageSize, (filterPage + 1) * pageSize)
    : pageGuests;

  const totalFilterPages = Math.ceil(filteredGuests.length / pageSize);
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

  const handlePageSizeChange = (newSize: number) => {
    pageSizeRef.current = newSize;
    setPageSize(newSize);
    setFilterPage(0);
    cursorsRef.current = [null];
    if (!isFiltering) {
      loadPage(0, newSize);
    }
  };

  const refreshAfterMutation = async () => {
    setAllGuests(null);
    cursorsRef.current = [null];
    await Promise.all([loadPage(0), refreshCounts()]);
  };

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
    return buildGuestWhatsAppUrl({ guest, wedding, slug, baseUrl: BASE_URL });
  };

  const refreshGuestsAfterStatusMutation = async () => {
    if (isFiltering) {
      const all = await getGuests(slug);
      setAllGuests(all);
      return;
    }

    await loadPage(currentPage);
  };

  const handleToggleInvitationSent = async (guest: Guest) => {
    if (!slug || statusUpdatingGuestId) return;

    setStatusUpdatingGuestId(guest.id);
    try {
      if (guest.invitationSentAt) {
        await markInvitationUnsent(slug, guest.id);
      } else {
        await markInvitationSent(slug, guest.id, 'manual');
      }
      await refreshGuestsAfterStatusMutation();
    } catch (error) {
      console.error('[Guests] Invitation sent status error:', (error as Error).message);
    } finally {
      setStatusUpdatingGuestId(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterDelivery('all');
  };

  const inputClass = 'w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors';
  const totalCount = counts.pria + counts.wanita;
  const deliveryFilterLabels = {
    all: 'Semua Status',
    unsent: 'Belum Dikirim',
    sent: 'Terkirim',
  } as const;

  return (
    <div className="space-y-3">
      {/* Header actions */}
      <div className="bg-white rounded-xl border border-gold/10 shadow-sm">
        <div className="px-2.5 py-2 bg-gold/[0.03] flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama / HP..."
              aria-label="Cari tamu"
              className="h-9 w-full rounded-full border border-gold/20 bg-white pl-9 pr-8 text-xs text-ink focus:outline-none focus:border-gold/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/70 hover:text-ink"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-white text-ink/80 transition-colors hover:text-gold"
                aria-label="Tools tamu"
                aria-expanded={showToolsMenu}
                title="Tools tamu"
              >
                <Settings className={`w-4 h-4 transition-transform ${showToolsMenu ? 'rotate-45' : ''}`} />
              </button>
              {showToolsMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowToolsMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 z-20 min-w-[150px] overflow-hidden rounded-xl border border-gold/15 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => { setShowToolsMenu(false); setShowImport(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs text-ink/80 hover:bg-ivory transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Import
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowToolsMenu(false); handleExport('xlsx'); }}
                      disabled={isExporting || totalCount === 0}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs text-ink/80 hover:bg-ivory transition-colors disabled:opacity-30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowToolsMenu(false); handleBulkPrint(); }}
                      disabled={totalCount === 0}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs text-ink/80 hover:bg-ivory transition-colors disabled:opacity-30"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print QR
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={openAddForm}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ivory shadow-sm transition-transform hover:scale-105"
              aria-label="Tambah tamu"
              title="Tambah tamu"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-2.5 py-2 space-y-2">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
              {(['all', 'pria', 'wanita'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-normal sm:tracking-wider transition-colors whitespace-nowrap flex-shrink-0 ${
                    filterCategory === cat
                      ? 'bg-gold text-ivory'
                      : 'text-ink/80 border border-gold/15 hover:text-ink'
                  }`}
                >
                  {cat === 'all' ? `Semua(${totalCount})` : cat === 'pria' ? `Pria(${counts.pria})` : `Wanita(${counts.wanita})`}
                </button>
              ))}
            </div>

            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowDeliveryMenu(!showDeliveryMenu)}
                className="flex h-8 items-center gap-1.5 rounded-full border border-gold/15 bg-white px-2.5 text-[10px] font-black uppercase tracking-normal text-ink/80 transition-colors hover:text-ink sm:tracking-wider"
                aria-label="Filter status kirim"
                aria-expanded={showDeliveryMenu}
              >
                {filterDelivery === 'all' ? 'Status' : deliveryFilterLabels[filterDelivery]}
                <ChevronDown className={`w-3 h-3 transition-transform ${showDeliveryMenu ? 'rotate-180' : ''}`} />
              </button>
              {showDeliveryMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDeliveryMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 min-w-[150px] overflow-hidden rounded-xl border border-gold/15 bg-white shadow-lg">
                    {([
                      ['all', 'Semua Status'],
                      ['unsent', 'Belum Dikirim'],
                      ['sent', 'Terkirim'],
                    ] as const).map(([status, label]) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => { setFilterDelivery(status); setShowDeliveryMenu(false); }}
                        className={`w-full px-3 py-2.5 text-left text-xs transition-colors ${
                          filterDelivery === status ? 'bg-ink text-ivory font-bold' : 'text-ink/80 hover:bg-ivory'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Guest list */}
          {(isLoading && !isFiltering) || isSearchLoading ? (
            <p className="text-center text-xs text-ink/80 tracking-widest uppercase py-10">{isSearchLoading ? 'Mencari...' : 'Memuat...'}</p>
          ) : visibleGuests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gold/10 rounded-xl">
              <p className="text-xs text-ink/80 tracking-wider mb-3">
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
            <div className="rounded-xl border border-gold/10 bg-white/70">
              {visibleGuests.map((guest) => {
                const whatsappUrl = getWhatsAppUrl(guest);
                const isInvitationSent = Boolean(guest.invitationSentAt);
                const isStatusUpdating = statusUpdatingGuestId === guest.id;
                const isGuestMenuOpen = openGuestMenuId === guest.id;

                return (
                  <div key={guest.id} className="relative flex items-start gap-2 border-b border-gold/10 px-3 py-2.5 last:border-b-0 transition-colors hover:bg-gold/[0.03]">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm leading-tight text-ink break-words">{guest.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider ${
                          guest.category === 'pria' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                        }`}>
                          {guest.category === 'pria' ? 'Pria' : 'Wanita'}
                        </span>
                        <span className="text-[10px] leading-tight text-ink/60 break-words">
                          {guest.phone || 'No HP kosong'}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider ${
                          isInvitationSent ? 'bg-emerald-50 text-emerald-600' : 'bg-ink/5 text-ink/50'
                        }`}>
                          {isInvitationSent ? 'Terkirim' : 'Belum'}
                        </span>
                        {guest.attendance && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider bg-green-50 text-green-500">
                            Hadir
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-1 pt-0.5">
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors hover:bg-green-100"
                          aria-label="Kirim WhatsApp"
                          title="Kirim WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/25 cursor-not-allowed"
                          aria-label="Nomor HP belum diisi"
                          title="Nomor HP belum diisi"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleInvitationSent(guest)}
                        disabled={isStatusUpdating}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
                          isInvitationSent
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'border border-gold/15 text-ink/60 hover:text-gold hover:bg-gold/5'
                        }`}
                        aria-label={isInvitationSent ? 'Batalkan tanda terkirim' : 'Tandai undangan terkirim'}
                        title={isInvitationSent ? 'Batalkan tanda terkirim' : 'Tandai undangan terkirim'}
                      >
                        {isStatusUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenGuestMenuId(isGuestMenuOpen ? null : guest.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/15 text-ink/70 transition-colors hover:bg-gold/5 hover:text-gold"
                          aria-label={`Aksi tamu ${guest.name}`}
                          aria-expanded={isGuestMenuOpen}
                          title="Aksi tamu"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {isGuestMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenGuestMenuId(null)} />
                            <div className="absolute right-0 top-full z-20 mt-1 min-w-[136px] overflow-hidden rounded-xl border border-gold/15 bg-white shadow-lg">
                              <button
                                type="button"
                                onClick={() => { setOpenGuestMenuId(null); setQrGuest(guest); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-ink/80 hover:bg-ivory transition-colors"
                                aria-label="QR Code"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                QR
                              </button>
                              <button
                                type="button"
                                onClick={() => { setOpenGuestMenuId(null); openEditForm(guest); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-ink/80 hover:bg-ivory transition-colors"
                                aria-label="Edit tamu"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => { setOpenGuestMenuId(null); setDeleteTarget(guest); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-50 transition-colors"
                                aria-label="Hapus tamu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Hapus
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {visibleGuests.length > 0 && (
            <div className="flex items-center justify-between pt-1">
              {/* Page size selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPageSizeMenu(!showPageSizeMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-gold/20 rounded-lg text-xs text-ink/80 bg-white hover:border-gold/40 transition-colors"
                  aria-label="Jumlah per halaman"
                >
                  {pageSize} / hal
                  <ChevronDown className={`w-3 h-3 transition-transform ${showPageSizeMenu ? 'rotate-180' : ''}`} />
                </button>
                {showPageSizeMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowPageSizeMenu(false)} />
                    <div className="absolute bottom-full left-0 mb-1 bg-white border border-gold/15 rounded-xl shadow-lg z-20 py-1 min-w-[80px] max-h-48 overflow-y-auto">
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => { handlePageSizeChange(size); setShowPageSizeMenu(false); }}
                          className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                            pageSize === size ? 'text-gold bg-gold/10 font-bold' : 'text-ink/80 hover:bg-ivory'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevPage}
                  disabled={!canGoPrev}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-gold/20 text-ink/80 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-ink/80">
                  Hal. {activePage + 1}{isFiltering && totalFilterPages > 0 ? ` / ${totalFilterPages}` : ''}
                </span>
                <button
                  onClick={goNextPage}
                  disabled={!canGoNext}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-gold/20 text-ink/80 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {isFiltering && filteredGuests.length > 0 && (
            <p className="text-[9px] text-ink/80 text-center">
              {filteredGuests.length} tamu ditemukan
            </p>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-[2rem] p-6 shadow-2xl border border-gold/10 w-full max-w-sm">
            <h3 className="text-lg text-ink mb-4">
              {editingGuest ? 'Edit Tamu' : 'Tambah Tamu'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Tamu" required maxLength={100} className={inputClass} aria-label="Nama Tamu" />
              <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Nomor HP (cth: 081234567890)" type="tel" maxLength={20} className={inputClass} aria-label="Nomor HP" />
              <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Alamat (opsional)" maxLength={200} className={inputClass} aria-label="Alamat" />
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as 'pria' | 'wanita' })} className={inputClass} aria-label="Kategori">
                <option value="pria">Pihak Pria</option>
                <option value="wanita">Pihak Wanita</option>
              </select>
              <label className="flex items-center gap-3 px-4 py-3 border border-gold/20 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.attendance} onChange={(e) => setFormData({ ...formData, attendance: e.target.checked })} className="w-4 h-4 rounded border-gold/30 text-gold focus:ring-gold/50" />
                <span className="text-sm text-ink/80">Sudah konfirmasi hadir</span>
              </label>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gold/20 text-ink/80 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  Batal
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50">
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message={`Hapus tamu "${deleteTarget?.name}" dari daftar?`}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />

      <GuestImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />

      <GuestQRModal
        isOpen={qrGuest !== null}
        guestName={qrGuest?.name ?? ''}
        coupleName={wedding ? `${wedding.groomNickname} & ${wedding.brideNickname}` : ''}
        invitationUrl={qrGuest ? buildGuestInvitationUrl(BASE_URL, slug, qrGuest.name) : ''}
        whatsappUrl={qrGuest ? getWhatsAppUrl(qrGuest) : null}
        onClose={() => setQrGuest(null)}
      />

      <GuestQRPrintView
        isOpen={showBulkPrint}
        guests={allGuests ?? []}
        slug={slug}
        coupleName={wedding ? `${wedding.groomNickname} & ${wedding.brideNickname}` : ''}
        onClose={() => setShowBulkPrint(false)}
      />
    </div>
  );
}
