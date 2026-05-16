'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, serverTimestamp, deleteDoc, runTransaction, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-auth';
import { UserDocument, WeddingDocument } from '@/types/firestore';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { THEME_DEFAULTS } from '@/constants/themeDefaults';

const TABS = ['Pendaftar', 'Undangan'] as const;

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
  };
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { authUser, userDoc, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingUsers, setPendingUsers] = useState<UserDocument[]>([]);
  const [weddings, setWeddings] = useState<{ slug: string; data: WeddingDocument }[]>([]);
  const [customerUsers, setCustomerUsers] = useState<UserDocument[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Accept modal state
  const [acceptingUser, setAcceptingUser] = useState<UserDocument | null>(null);
  const [acceptMode, setAcceptMode] = useState<'new' | 'existing'>('new');
  const [newSlug, setNewSlug] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [acceptError, setAcceptError] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<UserDocument | null>(null);
  const [removeAdminTarget, setRemoveAdminTarget] = useState<{ slug: string; uid: string } | null>(null);

  useEffect(() => {
    if (isLoading || !authUser || userDoc?.role !== 'super') return;
    loadData();
  }, [isLoading, authUser, userDoc]);

  async function loadData() {
    setIsDataLoading(true);
    try {
      const [pendingSnap, customerSnap, weddingsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'pending'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'customer'))),
        getDocs(collection(db, 'weddings')),
      ]);

      setPendingUsers(pendingSnap.docs.map((d) => d.data() as UserDocument));
      setCustomerUsers(customerSnap.docs.map((d) => d.data() as UserDocument));
      setWeddings(weddingsSnap.docs.map((d) => ({ slug: d.id, data: d.data() as WeddingDocument })));
    } catch (error) {
      console.error('[SuperAdmin] Load error:', (error as Error).message);
    } finally {
      setIsDataLoading(false);
    }
  }

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
          // Fresh read: check slug doesn't already exist
          const weddingSnap = await transaction.get(doc(db, 'weddings', targetSlug));
          if (weddingSnap.exists()) throw new Error('Slug sudah digunakan');

          // Fresh read: check user is still pending
          const userSnap = await transaction.get(doc(db, 'users', acceptingUser.uid));
          if (userSnap.data()?.role !== 'pending') throw new Error('User sudah diproses');

          // Atomic writes
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
          // Fresh read: check wedding exists and has room
          const weddingSnap = await transaction.get(doc(db, 'weddings', targetSlug));
          if (!weddingSnap.exists()) throw new Error('Undangan tidak ditemukan');
          const adminIds = weddingSnap.data().adminIds ?? [];
          if (adminIds.length >= 2) throw new Error('Undangan sudah memiliki 2 admin (maksimal)');

          // Fresh read: check user is still pending
          const userSnap = await transaction.get(doc(db, 'users', acceptingUser.uid));
          if (userSnap.data()?.role !== 'pending') throw new Error('User sudah diproses');

          // Atomic writes
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
      // Clear the user's assigned slug
      await updateDoc(doc(db, 'users', uid), { assignedWeddingSlug: null });
      await loadData();
    } catch (error) {
      console.error('[SuperAdmin] Remove admin error:', (error as Error).message);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-sm text-ink/40 tracking-widest uppercase">Memuat...</p>
      </div>
    );
  }

  if (!authUser) {
    router.push('/login');
    return null;
  }

  if (userDoc?.role !== 'super') {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
        <h1 className="font-serif italic text-2xl text-ink mb-2">Akses Ditolak</h1>
        <p className="text-xs text-ink/40 mb-4">Halaman ini hanya untuk super admin.</p>
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

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-gold/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-serif italic text-lg text-ink">Super Admin</h1>
          <button
            onClick={() => { signOut(auth); router.push('/login'); }}
            className="text-xs uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      <nav className="sticky top-[53px] z-40 bg-ivory/90 backdrop-blur-md border-b border-gold/10">
        <div role="tablist" className="flex px-4 py-2 gap-1 max-w-2xl mx-auto">
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
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                i === activeTab ? 'bg-gold text-ivory' : 'text-ink/40 hover:text-ink/70'
              }`}
            >
              {tab}
              {i === 0 && pendingUsers.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingUsers.length}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main role="tabpanel" id="super-admin-tabpanel" aria-labelledby={`super-tab-${activeTab}`} className="max-w-2xl mx-auto px-4 py-6">
        {isDataLoading ? (
          <p className="text-center text-xs text-ink/30 tracking-widest uppercase py-10">Memuat data...</p>
        ) : activeTab === 0 ? (
          // ─── Pending Users Tab ───
          <div className="space-y-3">
            {pendingUsers.length === 0 ? (
              <p className="text-center text-xs text-ink/30 tracking-widest uppercase py-10">Tidak ada pendaftar baru</p>
            ) : (
              pendingUsers.map((u) => (
                <div key={u.uid} className="bg-white/60 border border-gold/10 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif italic text-sm text-ink truncate">{u.displayName}</p>
                    <p className="text-[10px] text-ink/40 truncate">{u.email}</p>
                    <p className="text-[10px] text-ink/20 uppercase tracking-wider">{u.provider}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setAcceptingUser(u)}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider"
                    >
                      Terima
                    </button>
                    <button
                      onClick={() => setRejectTarget(u)}
                      className="px-3 py-1.5 border border-red-300 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // ─── Weddings Tab ───
          <div className="space-y-3">
            {weddings.length === 0 ? (
              <p className="text-center text-xs text-ink/30 tracking-widest uppercase py-10">Belum ada undangan</p>
            ) : (
              weddings.map((w) => (
                <div key={w.slug} className="bg-white/60 border border-gold/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <a href={`/admin/${w.slug}`} className="font-serif italic text-sm text-ink hover:text-gold transition-colors">
                      /{w.slug}
                    </a>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      w.data.status === 'published' ? 'text-green-600 bg-green-50' : 'text-ink/40 bg-ink/5'
                    }`}>
                      {w.data.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink/60 mb-2">{w.data.groomNickname} & {w.data.brideNickname}</p>
                  <div className="text-[10px] text-ink/30 space-y-0.5">
                    <p>Admin: {(w.data.adminIds ?? []).length === 0 ? 'Belum ditugaskan' : getAdminEmails(w.data.adminIds ?? []).join(', ')}</p>
                    {(w.data.adminIds ?? []).map((uid) => (
                      <button
                        key={uid}
                        onClick={() => setRemoveAdminTarget({ slug: w.slug, uid })}
                        className="text-red-400 hover:text-red-600 underline underline-offset-2 mr-2"
                      >
                        Hapus {customerUsers.find((cu) => cu.uid === uid)?.email ?? uid}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ─── Accept Modal ─── */}
      {acceptingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setAcceptingUser(null)} />
          <div className="relative bg-white rounded-[2rem] p-6 shadow-2xl border border-gold/10 w-full max-w-sm">
            <h3 className="font-serif italic text-lg text-ink mb-1">Terima Pendaftaran</h3>
            <p className="text-xs text-ink/40 mb-4">{acceptingUser.displayName} ({acceptingUser.email})</p>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAcceptMode('new')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  acceptMode === 'new' ? 'bg-gold text-ivory border-gold' : 'border-gold/20 text-ink/60'
                }`}
              >
                Undangan Baru
              </button>
              <button
                onClick={() => setAcceptMode('existing')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  acceptMode === 'existing' ? 'bg-gold text-ivory border-gold' : 'border-gold/20 text-ink/60'
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
                <p className="text-[10px] text-ink/30 mt-1">Hanya huruf kecil, angka, dan tanda hubung</p>
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
                  <option value="">— Pilih —</option>
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
                className="flex-1 py-2.5 border border-gold/20 text-ink/60 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
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
    </div>
  );
}
