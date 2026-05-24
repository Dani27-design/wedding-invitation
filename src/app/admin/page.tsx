'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, runTransaction, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-auth';
import { UserDocument, WeddingDocument } from '@/types/firestore';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { THEME_DEFAULTS } from '@/constants/themeDefaults';
import { LogOut, Users, FileText, Search, ExternalLink, Trash2, Check, X, UserRound, Globe, Archive, UserPlus, Star } from 'lucide-react';

const TABS = ['Pendaftar', 'Undangan', 'Pengguna', 'Testimoni'] as const;

function createPlaceholderWedding(adminUid: string): Omit<WeddingDocument, 'createdAt' | 'updatedAt'> {
  const defaults = THEME_DEFAULTS.cinematic;
  return {
    adminIds: [adminUid],
    status: 'draft',
    groomNickname: 'Pria',
    groomName: 'Nama Lengkap Pria',
    groomParents: 'Putra Bapak ... & Ibu ...',
    groomPhoto: '',
    groomSocialLinks: [],
    brideNickname: 'Wanita',
    brideName: 'Nama Lengkap Wanita',
    brideParents: 'Putri Bapak ... & Ibu ...',
    bridePhoto: '',
    brideSocialLinks: [],
    defaultGuest: 'Tamu Undangan',
    eventDate: '',
    eventCity: '',
    venueName: '',
    venueAddress: '',
    venueMapsUrl: '',
    ceremonies: [],
    story: [],
    gallery: [],
    giftAccounts: [],
    musicUrl: '',
    twibbonOverlay: '',
    heroImage: '',
    openingImage: '',
    quranArabic: '',
    quranTranslation: '',
    quranReference: '',
    theme: defaults,
    credits: [],
    greetingTemplate: 'Assalamualaikum Wr. Wb.\n\nKepada Yth.\n{nama}\n\nDengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:\n\n{pengantin}\n\nBuka undangan:\n{link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.\n\nWassalamualaikum Wr. Wb.',
  };
}

function formatDate(ts: any): string {
  if (!ts?.toDate) return '';
  const d = ts.toDate();
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { authUser, userDoc, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingUsers, setPendingUsers] = useState<UserDocument[]>([]);
  const [weddings, setWeddings] = useState<{ slug: string; data: WeddingDocument }[]>([]);
  const [customerUsers, setCustomerUsers] = useState<UserDocument[]>([]);
  const [superAdmins, setSuperAdmins] = useState<UserDocument[]>([]);
  const [allUsers, setAllUsers] = useState<UserDocument[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Accept modal state
  const [acceptingUser, setAcceptingUser] = useState<UserDocument | null>(null);
  const [acceptMode, setAcceptMode] = useState<'new' | 'existing'>('new');
  const [newSlug, setNewSlug] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [acceptError, setAcceptError] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<UserDocument | null>(null);
  const [removeAdminTarget, setRemoveAdminTarget] = useState<{ slug: string; uid: string } | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<UserDocument | null>(null);
  const [deleteWeddingTarget, setDeleteWeddingTarget] = useState<string | null>(null);
  const [toggleStatusTarget, setToggleStatusTarget] = useState<{ slug: string; current: string } | null>(null);
  const [addAdminTarget, setAddAdminTarget] = useState<string | null>(null);
  const [addAdminSelectedUid, setAddAdminSelectedUid] = useState('');
  const [addAdminSearch, setAddAdminSearch] = useState('');
  const [addAdminError, setAddAdminError] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [assignUserTarget, setAssignUserTarget] = useState<UserDocument | null>(null);
  const [assignSelectedSlug, setAssignSelectedSlug] = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [assignError, setAssignError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [testimonials, setTestimonials] = useState<{ id: string; weddingSlug: string; rating: number; message: string; coupleName: string }[]>([]);
  const [deleteTestimonialTarget, setDeleteTestimonialTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !authUser || userDoc?.role !== 'super') return;
    loadData();
  }, [isLoading, authUser, userDoc]);

  async function loadData() {
    setIsDataLoading(true);
    try {
      const [pendingSnap, customerSnap, weddingsSnap, allUsersSnap, testimonialSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'pending'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'customer'))),
        getDocs(collection(db, 'weddings')),
        getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))),
      ]);

      const weddingList = weddingsSnap.docs.map((d) => ({ slug: d.id, data: d.data() as WeddingDocument }));
      setPendingUsers(pendingSnap.docs.map((d) => d.data() as UserDocument));
      setCustomerUsers(customerSnap.docs.map((d) => d.data() as UserDocument));
      setWeddings(weddingList);
      setAllUsers(allUsersSnap.docs.map((d) => d.data() as UserDocument));
      setSuperAdmins(allUsersSnap.docs.filter((d) => d.data().role === 'super').map((d) => d.data() as UserDocument));
      setTestimonials(testimonialSnap.docs.map(d => {
        const data = d.data();
        const w = weddingList.find(w => w.slug === data.weddingSlug);
        return {
          id: d.id,
          weddingSlug: data.weddingSlug,
          rating: data.rating,
          message: data.message,
          coupleName: w ? `${w.data.groomNickname} & ${w.data.brideNickname}` : data.weddingSlug,
        };
      }));
    } catch (error) {
      console.error('[SuperAdmin] Load error:', (error as Error).message);
    } finally {
      setIsDataLoading(false);
    }
  }

  const filteredWeddings = useMemo(() => {
    if (!searchQuery.trim()) return weddings;
    const q = searchQuery.toLowerCase();
    return weddings.filter((w) =>
      w.slug.includes(q) ||
      w.data.groomNickname.toLowerCase().includes(q) ||
      w.data.brideNickname.toLowerCase().includes(q) ||
      w.data.eventCity.toLowerCase().includes(q)
    );
  }, [weddings, searchQuery]);

  async function handleAccept() {
    if (!acceptingUser) return;
    setAcceptError('');
    setIsAccepting(true);

    try {
      let targetSlug: string;

      if (acceptMode === 'new') {
        if (!newSlug.trim()) {
          setAcceptError('Slug undangan wajib diisi');
          setIsAccepting(false);
          return;
        }
        targetSlug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
        const placeholder = createPlaceholderWedding(acceptingUser.uid);

        await runTransaction(db, async (transaction) => {
          const weddingSnap = await transaction.get(doc(db, 'weddings', targetSlug));
          if (weddingSnap.exists()) throw new Error('Slug sudah digunakan');
          const userSnap = await transaction.get(doc(db, 'users', acceptingUser.uid));
          if (userSnap.data()?.role !== 'pending') throw new Error('User sudah diproses');

          transaction.set(doc(db, 'weddings', targetSlug), {
            ...placeholder,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          transaction.update(doc(db, 'users', acceptingUser.uid), {
            role: 'customer',
            assignedWeddingSlug: targetSlug,
          });
        });
      } else {
        if (!selectedSlug) {
          setAcceptError('Pilih undangan yang ada');
          setIsAccepting(false);
          return;
        }
        targetSlug = selectedSlug;

        await runTransaction(db, async (transaction) => {
          const weddingSnap = await transaction.get(doc(db, 'weddings', targetSlug));
          if (!weddingSnap.exists()) throw new Error('Undangan tidak ditemukan');
          const adminIds = weddingSnap.data().adminIds ?? [];
          if (adminIds.length >= 2) throw new Error('Undangan sudah memiliki 2 admin (maksimal)');
          const userSnap = await transaction.get(doc(db, 'users', acceptingUser.uid));
          if (userSnap.data()?.role !== 'pending') throw new Error('User sudah diproses');

          transaction.update(doc(db, 'weddings', targetSlug), {
            adminIds: [...adminIds, acceptingUser.uid],
            updatedAt: serverTimestamp(),
          });
          transaction.update(doc(db, 'users', acceptingUser.uid), {
            role: 'customer',
            assignedWeddingSlug: targetSlug,
          });
        });
      }

      setAcceptingUser(null);
      setNewSlug('');
      setSelectedSlug('');
      await loadData();
    } catch (error) {
      setAcceptError((error as Error).message);
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleReject(user: UserDocument) {
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await loadData();
    } catch (error) {
      console.error('[SuperAdmin] Reject error:', (error as Error).message);
    }
  }

  async function handleRemoveAdmin(slug: string, uid: string) {
    try {
      const wedding = weddings.find((w) => w.slug === slug);
      if (!wedding) return;
      const newIds = (wedding.data.adminIds ?? []).filter((id) => id !== uid);
      await updateDoc(doc(db, 'weddings', slug), { adminIds: newIds, updatedAt: serverTimestamp() });
      await updateDoc(doc(db, 'users', uid), { assignedWeddingSlug: null });
      await loadData();
    } catch (error) {
      console.error('[SuperAdmin] Remove admin error:', (error as Error).message);
    }
  }

  async function handleDeleteUser(user: UserDocument) {
    try {
      // Clear assigned wedding admin if exists
      if (user.assignedWeddingSlug) {
        const wedding = weddings.find((w) => w.slug === user.assignedWeddingSlug);
        if (wedding) {
          const newIds = (wedding.data.adminIds ?? []).filter((id) => id !== user.uid);
          await updateDoc(doc(db, 'weddings', user.assignedWeddingSlug), { adminIds: newIds, updatedAt: serverTimestamp() });
        }
      }
      await deleteDoc(doc(db, 'users', user.uid));
      await loadData();
    } catch (error) {
      console.error('[SuperAdmin] Delete user error:', (error as Error).message);
    }
  }

  async function handleToggleStatus(slug: string, current: string) {
    try {
      const newStatus = current === 'published' ? 'archived' : 'published';
      await updateDoc(doc(db, 'weddings', slug), { status: newStatus, updatedAt: serverTimestamp() });
      await loadData();
    } catch (error) {
      console.error('[SuperAdmin] Toggle status error:', (error as Error).message);
    }
  }

  async function handleDeleteTestimonial(id: string) {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('[SuperAdmin] Delete testimonial error:', (error as Error).message);
    }
  }

  async function handleDeleteWedding(slug: string) {
    try {
      const wedding = weddings.find((w) => w.slug === slug);
      if (wedding) {
        for (const uid of wedding.data.adminIds ?? []) {
          await updateDoc(doc(db, 'users', uid), { assignedWeddingSlug: null });
        }
      }
      await deleteDoc(doc(db, 'weddings', slug));
      await loadData();
    } catch (error) {
      console.error('[SuperAdmin] Delete wedding error:', (error as Error).message);
    }
  }

  async function handleAddAdmin() {
    if (!addAdminTarget || !addAdminSelectedUid) {
      setAddAdminError('Pilih pengguna');
      return;
    }
    setAddAdminError('');
    setIsAddingAdmin(true);
    try {
      const wedding = weddings.find((w) => w.slug === addAdminTarget);
      if (!wedding) throw new Error('Undangan tidak ditemukan');
      const currentIds = wedding.data.adminIds ?? [];
      if (currentIds.includes(addAdminSelectedUid)) throw new Error('Pengguna sudah menjadi admin undangan ini');
      if (currentIds.length >= 2) throw new Error('Undangan sudah memiliki 2 admin (maksimal)');

      // Remove from old wedding first (1 user = 1 invitation)
      const selectedUser = allUsers.find((u) => u.uid === addAdminSelectedUid);
      if (selectedUser?.assignedWeddingSlug && selectedUser.assignedWeddingSlug !== addAdminTarget) {
        const oldWedding = weddings.find((w) => w.slug === selectedUser.assignedWeddingSlug);
        if (oldWedding) {
          const oldIds = (oldWedding.data.adminIds ?? []).filter((id) => id !== addAdminSelectedUid);
          await updateDoc(doc(db, 'weddings', selectedUser.assignedWeddingSlug), { adminIds: oldIds, updatedAt: serverTimestamp() });
        }
      }

      await updateDoc(doc(db, 'weddings', addAdminTarget), {
        adminIds: [...currentIds, addAdminSelectedUid],
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', addAdminSelectedUid), {
        assignedWeddingSlug: addAdminTarget,
      });

      setAddAdminTarget(null);
      setAddAdminSelectedUid('');
      await loadData();
    } catch (error) {
      setAddAdminError((error as Error).message);
    } finally {
      setIsAddingAdmin(false);
    }
  }

  async function handleAssignUser() {
    if (!assignUserTarget || !assignSelectedSlug) {
      setAssignError('Pilih undangan');
      return;
    }
    setAssignError('');
    setIsAssigning(true);
    try {
      const wedding = weddings.find((w) => w.slug === assignSelectedSlug);
      if (!wedding) throw new Error('Undangan tidak ditemukan');
      const currentIds = wedding.data.adminIds ?? [];
      if (currentIds.includes(assignUserTarget.uid)) throw new Error('Pengguna sudah menjadi admin undangan ini');
      if (currentIds.length >= 2) throw new Error('Undangan sudah memiliki 2 admin (maksimal)');

      // Remove from old wedding if reassigning
      if (assignUserTarget.assignedWeddingSlug && assignUserTarget.assignedWeddingSlug !== assignSelectedSlug) {
        const oldWedding = weddings.find((w) => w.slug === assignUserTarget.assignedWeddingSlug);
        if (oldWedding) {
          const oldIds = (oldWedding.data.adminIds ?? []).filter((id) => id !== assignUserTarget.uid);
          await updateDoc(doc(db, 'weddings', assignUserTarget.assignedWeddingSlug), { adminIds: oldIds, updatedAt: serverTimestamp() });
        }
      }

      await updateDoc(doc(db, 'weddings', assignSelectedSlug), {
        adminIds: [...currentIds, assignUserTarget.uid],
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', assignUserTarget.uid), {
        assignedWeddingSlug: assignSelectedSlug,
      });

      setAssignUserTarget(null);
      setAssignSelectedSlug('');
      await loadData();
    } catch (error) {
      setAssignError((error as Error).message);
    } finally {
      setIsAssigning(false);
    }
  }

  useEffect(() => {
    if (!isLoading && !authUser) router.push('/login');
  }, [isLoading, authUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-sm text-ink/80 tracking-widest uppercase">Memuat...</p>
      </div>
    );
  }

  if (!authUser) return null;

  if (userDoc?.role !== 'super') {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
        <h1 className="text-2xl text-ink mb-2">Akses Ditolak</h1>
        <p className="text-xs text-ink/80 mb-4">Halaman ini hanya untuk super admin.</p>
        <button onClick={() => { signOut(auth); router.push('/login'); }} className="text-xs text-gold underline underline-offset-4">Keluar</button>
      </div>
    );
  }

  const getAdminEmails = (adminIds: string[]) => {
    return adminIds.map((id) => {
      const u = customerUsers.find((cu) => cu.uid === id);
      return u?.email ?? id;
    });
  };

  const publishedCount = weddings.filter((w) => w.data.status === 'published').length;

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-gold/10 px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-ink">Marinikah Invitation</p>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stats row */}
          {!isDataLoading && (
            <div className="flex items-center gap-4 mb-2 text-[10px] text-ink/80 font-bold uppercase tracking-wider">
              <span className={pendingUsers.length > 0 ? 'text-red-500' : ''}>{pendingUsers.length} pendaftar</span>
              <span className="text-ink/80">|</span>
              <span>{weddings.length} undangan</span>
              <span className="text-ink/80">|</span>
              <span className="text-green-600">{publishedCount} aktif</span>
            </div>
          )}

          {/* Tabs */}
          <div role="tablist" className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                role="tab"
                id={`super-tab-${i}`}
                aria-selected={i === activeTab}
                aria-controls="super-admin-tabpanel"
                tabIndex={i === activeTab ? 0 : -1}
                onClick={() => setActiveTab(i)}
                onKeyDown={(e) => {
                  let target: number | null = null;
                  if (e.key === 'ArrowRight') target = (i + 1) % TABS.length;
                  else if (e.key === 'ArrowLeft') target = (i - 1 + TABS.length) % TABS.length;
                  else if (e.key === 'Home') target = 0;
                  else if (e.key === 'End') target = TABS.length - 1;
                  if (target === null) return;
                  e.preventDefault();
                  document.getElementById(`super-tab-${target}`)?.focus();
                  setActiveTab(target);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all flex-shrink-0 ${
                  i === activeTab ? 'bg-gold text-ivory' : 'text-ink/80 hover:text-ink/80'
                }`}
              >
                {i === 0 ? <Users className="w-3 h-3" /> : i === 1 ? <FileText className="w-3 h-3" /> : <UserRound className="w-3 h-3" />}
                {tab}
                {i === 0 && pendingUsers.length > 0 && (
                  <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full leading-none">{pendingUsers.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main role="tabpanel" id="super-admin-tabpanel" aria-labelledby={`super-tab-${activeTab}`} className="max-w-2xl mx-auto px-4 py-4">
        {isDataLoading ? (
          <p className="text-center text-xs text-ink/80 tracking-widest uppercase py-10">Memuat data...</p>
        ) : activeTab === 0 ? (
          /* ─── Pending Users Tab ─── */
          <div className="space-y-2">
            {pendingUsers.length === 0 ? (
              <p className="text-center text-xs text-ink/80 tracking-widest uppercase py-10">Tidak ada pendaftar baru</p>
            ) : (
              pendingUsers.map((u) => (
                <div key={u.uid} className="flex items-center gap-3 px-3 py-2.5 bg-white/50 border border-gold/10 rounded-2xl">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-ink truncate font-medium">{u.displayName}</p>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider bg-ink/5 text-ink/80 flex-shrink-0">{u.provider}</span>
                    </div>
                    <p className="text-[10px] text-ink/80 truncate">{u.email}</p>
                    {u.createdAt && <p className="text-[9px] text-ink/80">{formatDate(u.createdAt)}</p>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setAcceptingUser(u)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      aria-label={`Terima ${u.displayName}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRejectTarget(u)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label={`Tolak ${u.displayName}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 1 ? (
          /* ─── Weddings Tab ─── */
          <div className="space-y-3">
            {/* Search */}
            {weddings.length > 3 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/80" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari slug, nama, atau kota..."
                  aria-label="Cari undangan"
                  className="w-full pl-9 pr-4 py-2 border border-gold/20 rounded-full text-xs bg-white focus:outline-none focus:border-gold/50"
                />
              </div>
            )}

            {filteredWeddings.length === 0 ? (
              <p className="text-center text-xs text-ink/80 tracking-widest uppercase py-10">
                {weddings.length === 0 ? 'Belum ada undangan' : 'Tidak ada hasil'}
              </p>
            ) : (
              <div className="border border-gold/10 rounded-2xl overflow-hidden divide-y divide-gold/5">
                {filteredWeddings.map((w) => (
                  <div key={w.slug} className="px-3 py-3 bg-white/40">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/${w.slug}`} className="text-sm text-ink hover:text-gold transition-colors font-medium truncate">
                            {w.data.groomNickname} & {w.data.brideNickname}
                          </Link>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider flex-shrink-0 ${
                            w.data.status === 'published' ? 'text-green-600 bg-green-50' : w.data.status === 'archived' ? 'text-ink/80 bg-ink/5' : 'text-gold bg-gold/10'
                          }`}>
                            {w.data.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-ink/80 truncate">/{w.slug}{w.data.eventDate && ` · ${w.data.eventDate}`}{w.data.eventCity && ` · ${w.data.eventCity}`}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => setToggleStatusTarget({ slug: w.slug, current: w.data.status })}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${w.data.status === 'published' ? 'text-green-500 hover:bg-green-50' : 'text-ink/80 hover:text-gold hover:bg-gold/5'}`}
                          aria-label={w.data.status === 'published' ? `Arsipkan ${w.slug}` : `Publikasikan ${w.slug}`}
                        >
                          {w.data.status === 'published' ? <Globe className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>
                        <Link
                          href={`/admin/${w.slug}`}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-ink/80 hover:text-gold hover:bg-gold/5 transition-colors"
                          aria-label={`Kelola ${w.slug}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteWeddingTarget(w.slug)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label={`Hapus ${w.slug}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Admin list */}
                    <div className="flex flex-wrap gap-1.5">
                      {(w.data.adminIds ?? []).map((uid) => {
                        const email = customerUsers.find((cu) => cu?.uid === uid)?.email ?? superAdmins.find((sa) => sa?.uid === uid)?.email ?? uid;
                        return (
                          <span key={uid} className="inline-flex items-center gap-1 text-[9px] text-ink/80 bg-ink/5 px-2 py-0.5 rounded-full">
                            {email}
                            <button
                              onClick={() => setRemoveAdminTarget({ slug: w.slug, uid })}
                              className="text-red-300 hover:text-red-500 transition-colors"
                              aria-label={`Hapus admin ${email}`}
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        );
                      })}
                      {(w.data.adminIds ?? []).length === 0 && (
                        <span className="text-[9px] text-ink/80">Belum ada admin</span>
                      )}
                      {(w.data.adminIds ?? []).length < 2 && (
                        <button
                          onClick={() => { setAddAdminTarget(w.slug); setAddAdminSelectedUid(''); setAddAdminError(''); }}
                          className="inline-flex items-center gap-1 text-[9px] text-gold bg-gold/10 px-2 py-0.5 rounded-full hover:bg-gold/20 transition-colors"
                          aria-label={`Tambah admin ke ${w.slug}`}
                        >
                          <UserPlus className="w-2.5 h-2.5" />
                          Tambah
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 2 ? (
          /* ─── Users Tab ─── */
          <div className="space-y-2">
            {allUsers.length === 0 ? (
              <p className="text-center text-xs text-ink/80 tracking-widest uppercase py-10">Belum ada pengguna</p>
            ) : (
              <div className="border border-gold/10 rounded-2xl overflow-hidden divide-y divide-gold/5">
                {allUsers.map((u) => (
                  <div key={u.uid} className="flex items-center gap-3 px-3 py-2.5 bg-white/40">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-ink truncate">{u.displayName}</p>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider flex-shrink-0 ${
                          u.role === 'super' ? 'text-gold bg-gold/10' : u.role === 'customer' ? 'text-green-600 bg-green-50' : 'text-ink/80 bg-ink/5'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink/80 truncate">{u.email}</p>
                      <div className="flex items-center gap-2 text-[9px] text-ink/80">
                        {u.createdAt && <span>{formatDate(u.createdAt)}</span>}
                        {u.assignedWeddingSlug && (
                          <>
                            <span>·</span>
                            <Link href={`/admin/${u.assignedWeddingSlug}`} className="text-gold/60 hover:text-gold">/{u.assignedWeddingSlug}</Link>
                          </>
                        )}
                      </div>
                    </div>
                    {u.role !== 'super' && (
                      <div className="flex gap-1 flex-shrink-0">
                        {!u.assignedWeddingSlug && (
                          <button
                            onClick={() => { setAssignUserTarget(u); setAssignSelectedSlug(''); setAssignError(''); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gold/50 hover:text-gold hover:bg-gold/5 transition-colors"
                            aria-label={`Hubungkan ${u.displayName} ke undangan`}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteUserTarget(u)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label={`Hapus ${u.displayName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ─── Testimoni Tab ─── */
          <div className="space-y-2">
            {testimonials.length === 0 ? (
              <p className="text-center text-xs text-ink/80 tracking-widest uppercase py-10">Belum ada testimoni</p>
            ) : (
              <div className="space-y-2">
                {testimonials.map(t => (
                  <div key={t.id} className="bg-white/60 px-4 py-3 rounded-xl border border-gold/10 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-ink truncate">{t.coupleName}</p>
                        <div className="flex gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-2.5 h-2.5 ${s <= t.rating ? 'text-gold fill-gold' : 'text-gold/20'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="font-bold text-xs text-ink/80 line-clamp-2">"{t.message}"</p>
                      <p className="text-[10px] text-ink/80 mt-1">/{t.weddingSlug}</p>
                    </div>
                    <button onClick={() => setDeleteTestimonialTarget(t.id)} className="text-red-300 hover:text-red-500 transition-colors shrink-0" aria-label={`Hapus testimoni ${t.coupleName}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Accept Modal ─── */}
      {acceptingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setAcceptingUser(null)} />
          <div className="relative bg-white rounded-[2rem] p-6 shadow-2xl border border-gold/10 w-full max-w-sm">
            <h3 className="text-lg text-ink mb-1">Terima Pendaftaran</h3>
            <p className="text-xs text-ink/80 mb-4">{acceptingUser.displayName} ({acceptingUser.email})</p>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAcceptMode('new')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  acceptMode === 'new' ? 'bg-gold text-ivory border-gold' : 'border-gold/20 text-ink/80'
                }`}
              >
                Undangan Baru
              </button>
              <button
                onClick={() => setAcceptMode('existing')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  acceptMode === 'existing' ? 'bg-gold text-ivory border-gold' : 'border-gold/20 text-ink/80'
                }`}
              >
                Tambah ke Undangan
              </button>
            </div>

            {acceptMode === 'new' ? (
              <div>
                <label htmlFor="new-slug" className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-1 block">
                  Slug Undangan
                </label>
                <input
                  id="new-slug"
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="contoh: dani-marini"
                  className="w-full px-3 py-2 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50"
                />
                <p className="text-[10px] text-ink/80 mt-1">Hanya huruf kecil, angka, dan tanda hubung</p>
              </div>
            ) : (
              <div>
                <label htmlFor="existing-slug" className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-1 block">
                  Pilih Undangan
                </label>
                <select
                  id="existing-slug"
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50"
                >
                  <option value="">Pilih undangan</option>
                  {weddings
                    .filter((w) => (w.data.adminIds ?? []).length < 2)
                    .map((w) => (
                      <option key={w.slug} value={w.slug}>
                        /{w.slug} — {w.data.groomNickname} & {w.data.brideNickname}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {acceptError && <p className="text-xs text-red-500 mt-2">{acceptError}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setAcceptingUser(null); setAcceptError(''); }}
                className="flex-1 py-2.5 border border-gold/20 text-ink/80 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
              >
                Batal
              </button>
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex-1 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {isAccepting ? 'Memproses...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={rejectTarget !== null}
        message={`Tolak pendaftaran ${rejectTarget?.email ?? ''}?`}
        onConfirm={() => { if (rejectTarget) handleReject(rejectTarget); setRejectTarget(null); }}
        onCancel={() => setRejectTarget(null)}
      />
      <ConfirmDeleteModal
        isOpen={removeAdminTarget !== null}
        message="Hapus admin dari undangan ini?"
        onConfirm={() => { if (removeAdminTarget) handleRemoveAdmin(removeAdminTarget.slug, removeAdminTarget.uid); setRemoveAdminTarget(null); }}
        onCancel={() => setRemoveAdminTarget(null)}
      />
      <ConfirmDeleteModal
        isOpen={deleteUserTarget !== null}
        message={`Hapus pengguna ${deleteUserTarget?.email ?? ''}? Akun akan dihapus permanen.`}
        onConfirm={() => { if (deleteUserTarget) handleDeleteUser(deleteUserTarget); setDeleteUserTarget(null); }}
        onCancel={() => setDeleteUserTarget(null)}
      />
      <ConfirmDeleteModal
        isOpen={deleteWeddingTarget !== null}
        message={`Hapus undangan /${deleteWeddingTarget ?? ''}? Data undangan akan dihapus permanen.`}
        onConfirm={() => { if (deleteWeddingTarget) handleDeleteWedding(deleteWeddingTarget); setDeleteWeddingTarget(null); }}
        onCancel={() => setDeleteWeddingTarget(null)}
      />
      <ConfirmDeleteModal
        isOpen={toggleStatusTarget !== null}
        title={toggleStatusTarget?.current === 'published' ? 'Arsipkan Undangan' : 'Publikasikan Undangan'}
        message={toggleStatusTarget?.current === 'published' ? `Arsipkan undangan /${toggleStatusTarget?.slug ?? ''}? Undangan tidak akan terlihat oleh tamu.` : `Publikasikan undangan /${toggleStatusTarget?.slug ?? ''}? Undangan akan terlihat oleh semua tamu.`}
        confirmLabel={toggleStatusTarget?.current === 'published' ? 'Arsipkan' : 'Publikasikan'}
        variant="warning"
        onConfirm={() => { if (toggleStatusTarget) handleToggleStatus(toggleStatusTarget.slug, toggleStatusTarget.current); setToggleStatusTarget(null); }}
        onCancel={() => setToggleStatusTarget(null)}
      />

      <ConfirmDeleteModal
        isOpen={deleteTestimonialTarget !== null}
        message="Hapus testimoni ini?"
        onConfirm={() => { if (deleteTestimonialTarget) handleDeleteTestimonial(deleteTestimonialTarget); setDeleteTestimonialTarget(null); }}
        onCancel={() => setDeleteTestimonialTarget(null)}
      />

      {/* Add Admin Modal */}
      {addAdminTarget && (() => {
        const availableUsers = allUsers.filter((u) =>
          u.role !== 'pending' && u.role !== 'super' && !u.assignedWeddingSlug &&
          !(weddings.find((w) => w.slug === addAdminTarget)?.data.adminIds ?? []).includes(u.uid)
        );
        const q = addAdminSearch.toLowerCase();
        const filtered = q ? availableUsers.filter((u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : availableUsers;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setAddAdminTarget(null)} />
            <div className="relative bg-white rounded-[2rem] p-6 shadow-2xl border border-gold/10 w-full max-w-sm">
              <h3 className="text-lg text-ink mb-1">Tambah Admin</h3>
              <p className="text-xs text-ink/80 mb-3">Undangan: /{addAdminTarget}</p>

              <input
                type="text"
                value={addAdminSearch}
                onChange={(e) => setAddAdminSearch(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full px-3 py-2 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 mb-2"
              />

              <div className="max-h-40 overflow-y-auto border border-gold/10 rounded-xl divide-y divide-gold/5">
                {filtered.length === 0 ? (
                  <p className="text-xs text-ink/80 text-center py-4">{q ? 'Tidak ditemukan' : 'Tidak ada pengguna tersedia'}</p>
                ) : filtered.map((u) => (
                  <button
                    key={u.uid}
                    onClick={() => setAddAdminSelectedUid(u.uid)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${addAdminSelectedUid === u.uid ? 'bg-gold/10 text-gold' : 'hover:bg-ivory text-ink/80'}`}
                  >
                    <p className="font-medium truncate">{u.displayName}</p>
                    <p className="text-[10px] text-ink/80 truncate">{u.email}</p>
                  </button>
                ))}
              </div>

              {addAdminError && <p className="text-xs text-red-500 mt-2">{addAdminError}</p>}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setAddAdminTarget(null); setAddAdminError(''); setAddAdminSearch(''); }}
                  className="flex-1 py-2.5 border border-gold/20 text-ink/80 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddAdmin}
                  disabled={isAddingAdmin || !addAdminSelectedUid}
                  className="flex-1 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
                >
                  {isAddingAdmin ? 'Memproses...' : 'Tambahkan'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Assign User to Wedding Modal */}
      {assignUserTarget && (() => {
        const availableWeddings = weddings.filter((w) => (w.data.adminIds ?? []).length < 2);
        const q = assignSearch.toLowerCase();
        const filtered = q ? availableWeddings.filter((w) => w.slug.includes(q) || w.data.groomNickname.toLowerCase().includes(q) || w.data.brideNickname.toLowerCase().includes(q) || w.data.eventCity.toLowerCase().includes(q)) : availableWeddings;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setAssignUserTarget(null)} />
            <div className="relative bg-white rounded-[2rem] p-6 shadow-2xl border border-gold/10 w-full max-w-sm">
              <h3 className="text-lg text-ink mb-1">Hubungkan ke Undangan</h3>
              <p className="text-xs text-ink/80 mb-3">{assignUserTarget.displayName} ({assignUserTarget.email})</p>

              <input
                type="text"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                placeholder="Cari slug, nama pasangan, atau kota..."
                className="w-full px-3 py-2 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 mb-2"
              />

              <div className="max-h-40 overflow-y-auto border border-gold/10 rounded-xl divide-y divide-gold/5">
                {filtered.length === 0 ? (
                  <p className="text-xs text-ink/80 text-center py-4">{q ? 'Tidak ditemukan' : 'Tidak ada undangan tersedia'}</p>
                ) : filtered.map((w) => (
                  <button
                    key={w.slug}
                    onClick={() => setAssignSelectedSlug(w.slug)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${assignSelectedSlug === w.slug ? 'bg-gold/10 text-gold' : 'hover:bg-ivory text-ink/80'}`}
                  >
                    <p className="font-medium truncate">{w.data.groomNickname} & {w.data.brideNickname}</p>
                    <p className="text-[10px] text-ink/80 truncate">/{w.slug}{w.data.eventCity && ` · ${w.data.eventCity}`}</p>
                  </button>
                ))}
              </div>

              {assignError && <p className="text-xs text-red-500 mt-2">{assignError}</p>}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setAssignUserTarget(null); setAssignError(''); setAssignSearch(''); }}
                  className="flex-1 py-2.5 border border-gold/20 text-ink/80 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  Batal
                </button>
                <button
                  onClick={handleAssignUser}
                  disabled={isAssigning || !assignSelectedSlug}
                  className="flex-1 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
                >
                  {isAssigning ? 'Memproses...' : 'Hubungkan'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <ConfirmDeleteModal
        isOpen={showLogoutConfirm}
        title="Keluar dari Akun"
        message="Apakah Anda yakin ingin keluar?"
        confirmLabel="Keluar"
        variant="warning"
        onConfirm={() => { setShowLogoutConfirm(false); signOut(auth); router.push('/login'); }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
