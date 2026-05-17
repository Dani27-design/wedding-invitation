'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase-auth';
import { uploadFile, deleteFile, UploadProgressCallback } from '@/lib/storage';
import { useWedding } from '@/hooks/useWedding';
import { useUser } from '@/hooks/useUser';
import { WeddingDocument, StorySlide } from '@/types/firestore';
import { revalidateWedding } from '@/lib/revalidate';
import { CoupleForm } from '@/components/admin/CoupleForm';
import { EventForm } from '@/components/admin/EventForm';
import { StoryForm } from '@/components/admin/StoryForm';
import { GalleryForm } from '@/components/admin/GalleryForm';
import { GiftForm } from '@/components/admin/GiftForm';
import { MediaForm } from '@/components/admin/MediaForm';
import { CustomizeForm } from '@/components/admin/CustomizeForm';
import { CreditForm } from '@/components/admin/CreditForm';
import { StoryInteractionsForm } from '@/components/admin/StoryInteractionsForm';
import { WishesForm } from '@/components/admin/WishesForm';
import { GuestTab } from '@/components/admin/GuestTab';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, X, ExternalLink, LogOut, Users, Calendar, BookHeart, Image, UserRound, Gift, Images, Award, Palette, MessageCircle, Heart } from 'lucide-react';

const TABS = [
  { label: 'Pasangan', icon: UserRound },
  { label: 'Acara', icon: Calendar },
  { label: 'Cerita', icon: BookHeart },
  { label: 'Media', icon: Image },
  { label: 'Tamu', icon: Users },
  { label: 'Hadiah', icon: Gift },
  { label: 'Galeri', icon: Images },
  { label: 'Kredit', icon: Award },
  { label: 'Tema', icon: Palette },
  { label: 'Komentar', icon: MessageCircle },
  { label: 'Ucapan', icon: Heart },
] as const;


interface SaveStatusModalProps {
  status: 'saving' | 'success' | 'error';
  onClose: () => void;
  uploadProgress?: { fileName: string; percent: number } | null;
}

function SaveStatusModal({ status, onClose, uploadProgress }: SaveStatusModalProps) {
  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={status !== 'saving' ? onClose : undefined}
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-[2rem] p-8 shadow-2xl border border-gold/10 w-full max-w-xs text-center"
        >
          {status !== 'saving' && (
            <button
              aria-label="Tutup"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-ink/20 hover:text-ink/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-col items-center gap-4 py-4">
            {status === 'saving' && (
              <Loader2 className="w-12 h-12 text-gold animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-12 h-12 text-red-500" />
            )}

            <div className="space-y-1 w-full">
              <h3 className="font-serif italic text-xl text-ink">
                {status === 'saving' && 'Sedang Menyimpan...'}
                {status === 'success' && 'Berhasil Disimpan'}
                {status === 'error' && 'Gagal Menyimpan'}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-black">
                {status === 'saving' && !uploadProgress && 'Harap tunggu sebentar'}
                {status === 'saving' && uploadProgress && `Mengunggah: ${uploadProgress.fileName}`}
                {status === 'success' && 'Semua perubahan telah diperbarui'}
                {status === 'error' && 'Terjadi kesalahan, silakan coba lagi'}
              </p>
              {status === 'saving' && uploadProgress && (
                <div className="mt-3 w-full">
                  <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.percent}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-ink/30 mt-1 font-sans">{uploadProgress.percent}%</p>
                </div>
              )}
            </div>

            {status !== 'saving' && (
              <button
                onClick={onClose}
                className="mt-4 px-8 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
              >
                Oke
              </button>
            )}
          </div>
        </motion.div>
      </div>
  );
}

interface ConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-[2rem] p-8 shadow-2xl border border-gold/10 w-full max-w-xs text-center"
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <AlertCircle className="w-12 h-12 text-gold" />
          <div className="space-y-1">
            <h3 className="font-serif italic text-xl text-ink">Perubahan Belum Disimpan</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-black">
              Yakin ingin berpindah tab?
            </p>
          </div>
          <div className="flex gap-3 mt-4 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-gold/20 text-ink/60 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { authUser, userDoc, isLoading: isAuthLoading } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSaved, setHasSaved] = useState(true);
  const [pendingTab, setPendingTab] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<{ fileName: string; percent: number } | null>(null);

  const { wedding, isLoading: isWeddingLoading } = useWedding(slug ?? '');

  const handleDirty = useCallback(() => setHasSaved(false), []);

  // Tab completion indicators (true = has meaningful data)
  const tabComplete = wedding ? [
    !!(wedding.groomPhoto || wedding.bridePhoto || (wedding.groomNickname && wedding.groomNickname !== 'Pria')),
    !!(wedding.eventDate && wedding.eventCity && wedding.venueName),
    wedding.story.length > 0,
    !!(wedding.heroImage && wedding.openingImage),
    true, // Tamu — managed on separate page, always "ready"
    wedding.giftAccounts.length > 0,
    wedding.gallery.length > 0,
    wedding.credits.length > 0,
    true, // Tema always has defaults
  ] : [];
  const completedCount = tabComplete.filter(Boolean).length;
  const totalEditable = 9; // First 9 tabs are editable; last 2 are read-only

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    if (hasSaved) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasSaved]);

  // Auto-dismiss success modal after 1.5s
  useEffect(() => {
    if (saveStatus !== 'success') return;
    const timer = setTimeout(() => setSaveStatus('idle'), 1500);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch { /* ignore */ }
    router.push('/login');
  };

  const [isToggling, setIsToggling] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const handleToggleStatus = async () => {
    if (!slug || !wedding || isToggling) return;
    const newStatus = wedding.status === 'published' ? 'archived' : 'published';
    setIsToggling(true);
    try {
      await updateDoc(doc(db, 'weddings', slug), { status: newStatus, updatedAt: serverTimestamp() });
      revalidateWedding(slug);
    } catch (error) {
      console.error('[Admin] Status toggle error:', (error as Error).message);
    } finally {
      setIsToggling(false);
    }
  };

  const isSaving = saveStatus === 'saving';

  const handleSave = useCallback(async (
    fields: Partial<WeddingDocument>,
    files?: Record<string, File>,
    urlsToDelete?: string[],
  ) => {
    if (!slug) return;
    setSaveStatus('saving');
    setUploadProgress(null);
    try {
      const updates: Record<string, unknown> = { ...fields, updatedAt: serverTimestamp() };
      const oldUrlsToCleanup: string[] = [];

      // 1. Collect explicitly removed file URLs for post-save cleanup
      if (urlsToDelete) {
        oldUrlsToCleanup.push(...urlsToDelete);
      }

      // 2. Upload new files (collect old URLs for cleanup after save)
      if (files) {
        for (const [key, file] of Object.entries(files)) {
          // Collect old URL for top-level fields
          if (['groomPhoto', 'bridePhoto', 'musicUrl', 'heroImage', 'openingImage', 'twibbonOverlay'].includes(key)) {
            const oldUrl = wedding?.[key as keyof WeddingDocument] as string | undefined;
            if (oldUrl) oldUrlsToCleanup.push(oldUrl);
          }

          const ext = file.name.split('.').pop() ?? 'bin';
          const path = `weddings/${slug}/${key}-${Date.now()}.${ext}`;
          setUploadProgress({ fileName: file.name, percent: 0 });
          const url = await uploadFile(path, file, (percent) => {
            setUploadProgress({ fileName: file.name, percent });
          });

          if (key === 'groomPhoto' || key === 'bridePhoto' || key === 'musicUrl' || key === 'heroImage' || key === 'openingImage' || key === 'twibbonOverlay') {
            updates[key] = url;
          } else if (key.startsWith('storyBg-')) {
            const idx = parseInt(key.split('-')[1], 10);
            const story = (updates.story as StorySlide[] | undefined) ?? [...(wedding?.story ?? [])];

            // Collect old story slide URL
            const oldBg = wedding?.story?.[idx]?.bgImage;
            if (oldBg) oldUrlsToCleanup.push(oldBg);

            if (story[idx]) story[idx] = { ...story[idx], bgImage: url };
            updates.story = story;
          } else if (key.startsWith('storyVideo-')) {
            const idx = parseInt(key.split('-')[1], 10);
            const story = (updates.story as StorySlide[] | undefined) ?? [...(wedding?.story ?? [])];

            // Collect old story video URL
            const oldVideo = wedding?.story?.[idx]?.bgVideo;
            if (oldVideo) oldUrlsToCleanup.push(oldVideo);

            if (story[idx]) story[idx] = { ...story[idx], bgVideo: url };
            updates.story = story;
          } else if (key.startsWith('gallery-')) {
            const idx = parseInt(key.split('-')[1], 10);
            const gallery = (updates.gallery as string[] | undefined) ?? [...(wedding?.gallery ?? [])];

            // Collect old gallery URL
            const oldImg = wedding?.gallery?.[idx];
            if (oldImg) oldUrlsToCleanup.push(oldImg);

            gallery[idx] = url;
            updates.gallery = gallery;
          }
        }
      }

      // 3. Save document first — old files are still intact if this fails
      setUploadProgress(null);
      await updateDoc(doc(db, 'weddings', slug), updates as Record<string, any>);

      // 4. Sync story-likes array length when story slides change
      if (updates.story) {
        const storyLen = (updates.story as StorySlide[]).length;
        const likesRef = doc(db, 'story-likes', slug);
        try {
          const likesSnap = await getDoc(likesRef);
          if (likesSnap.exists()) {
            const current: number[] = likesSnap.data().likes ?? [];
            if (current.length !== storyLen) {
              const synced = current.slice(0, storyLen);
              while (synced.length < storyLen) synced.push(0);
              await updateDoc(likesRef, { likes: synced });
            }
          } else if (storyLen > 0) {
            await setDoc(likesRef, { likes: new Array(storyLen).fill(0) });
          }
        } catch (e) {
          console.error('[Admin] story-likes sync error:', (e as Error).message);
        }
      }

      setSaveStatus('success');
      setHasSaved(true);
      revalidateWedding(slug);

      // 4. Cleanup old files AFTER document update succeeds
      for (const oldUrl of oldUrlsToCleanup) {
        await deleteFile(oldUrl);
      }
    } catch (error) {
      console.error('[Admin] Save error:', (error as Error).message);
      setSaveStatus('error');
      setHasSaved(false);
    }
  }, [slug, wedding]);

  useEffect(() => {
    if (!isAuthLoading && !authUser) router.push('/login');
  }, [isAuthLoading, authUser, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-sm text-ink/40 tracking-widest uppercase">Memuat...</p>
      </div>
    );
  }

  if (!authUser) return null;

  const isAuthorized = userDoc?.role === 'super' || (wedding?.adminIds ?? []).includes(authUser.uid);

  if (!isAuthorized && !isWeddingLoading) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
        <h1 className="font-serif italic text-2xl text-ink mb-2">Akses Ditolak</h1>
        <p className="text-xs text-ink/40 mb-4">Anda tidak memiliki akses ke undangan ini.</p>
        <button onClick={handleLogout} className="text-xs text-gold underline underline-offset-4">Keluar</button>
      </div>
    );
  }

  const renderForm = () => {
    if (isWeddingLoading) {
      return (
        <div className="text-center py-20">
          <p className="text-xs text-ink/30 tracking-widest uppercase">Memuat data...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 0: return <CoupleForm data={wedding} onSave={handleSave} isSaving={isSaving} onDirty={handleDirty} />;
      case 1: return <EventForm data={wedding} onSave={handleSave} isSaving={isSaving} onDirty={handleDirty} />;
      case 2: return <StoryForm data={wedding} onSave={handleSave} isSaving={isSaving} onDirty={handleDirty} />;
      case 3: return <MediaForm data={wedding} onSave={handleSave} isSaving={isSaving} onDirty={handleDirty} />;
      case 4: return <GuestTab data={wedding} slug={slug ?? ''} onSave={handleSave} isSaving={isSaving} onDirty={handleDirty} />;
      case 5: return <GiftForm data={wedding} onSave={handleSave} isSaving={isSaving} onDirty={handleDirty} />;
      case 6: return <GalleryForm data={wedding} onSave={handleSave} isSaving={isSaving} onDirty={handleDirty} />;
      case 7: return <CreditForm data={wedding} onSave={handleSave} isSaving={isSaving} onDirty={handleDirty} />;
      case 8: return <CustomizeForm data={wedding} slug={slug ?? ''} onSave={handleSave} isSaving={isSaving} onDirty={handleDirty} />;
      case 9: return <StoryInteractionsForm data={wedding} slug={slug ?? ''} />;
      case 10: return <WishesForm slug={slug ?? ''} />;
      default: return null;
    }

  };

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-gold/10 px-4 py-2">
        <div className="max-w-lg mx-auto">
          {/* Top row: slug + actions */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-serif italic text-sm text-ink truncate">{slug ?? 'Admin'}</h1>
              {userDoc?.role === 'super' ? (
                <button
                  onClick={() => setShowStatusConfirm(true)}
                  disabled={isToggling}
                  className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full border transition-colors flex-shrink-0 ${isToggling ? 'opacity-50' : ''} ${wedding?.status === 'published' ? 'text-green-600 border-green-600/30 bg-green-50' : 'text-ink/40 border-ink/10 bg-ink/5'}`}
                >
                  {wedding?.status === 'published' ? 'Aktif' : 'Arsip'}
                </button>
              ) : (
                <span className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${wedding?.status === 'published' ? 'text-green-600 border-green-600/30 bg-green-50' : 'text-ink/40 border-ink/10 bg-ink/5'}`}>
                  {wedding?.status === 'published' ? 'Aktif' : 'Arsip'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-ink/30 hover:text-gold hover:bg-gold/5 transition-colors"
                aria-label="Preview undangan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleLogout}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-ink/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Icon tabs — horizontally scrollable */}
          <div role="tablist" className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map(({ label, icon: Icon }, i) => {
              const isActive = i === currentStep;
              return (
                <button
                  key={label}
                  role="tab"
                  id={`tab-${i}`}
                  aria-selected={isActive}
                  aria-controls="admin-tabpanel"
                  aria-label={label}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => {
                    if (i !== currentStep && !hasSaved) {
                      setPendingTab(i);
                      return;
                    }
                    setCurrentStep(i);
                  }}
                  onKeyDown={(e) => {
                    let target: number | null = null;
                    if (e.key === 'ArrowRight') target = (i + 1) % TABS.length;
                    else if (e.key === 'ArrowLeft') target = (i - 1 + TABS.length) % TABS.length;
                    else if (e.key === 'Home') target = 0;
                    else if (e.key === 'End') target = TABS.length - 1;
                    if (target === null) return;
                    e.preventDefault();
                    document.getElementById(`tab-${target}`)?.focus();
                    if (target !== currentStep && !hasSaved) {
                      setPendingTab(target);
                      return;
                    }
                    setCurrentStep(target);
                  }}
                  className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all flex-shrink-0 ${
                    isActive
                      ? 'text-gold bg-gold/10'
                      : 'text-ink/25 hover:text-ink/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[7px] font-bold uppercase tracking-wide">{label}</span>
                  {tabComplete[i] && i < totalEditable && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-green-400" aria-label="Terisi" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main role="tabpanel" id="admin-tabpanel" aria-labelledby={`tab-${currentStep}`} className="max-w-lg mx-auto px-4 py-3">
        {renderForm()}
      </main>

      <AnimatePresence>
        {saveStatus !== 'idle' && (
          <SaveStatusModal
            status={saveStatus}
            onClose={() => setSaveStatus('idle')}
            uploadProgress={uploadProgress}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingTab !== null && (
          <ConfirmModal
            onConfirm={() => {
              setCurrentStep(pendingTab);
              setHasSaved(true);
              setPendingTab(null);
            }}
            onCancel={() => setPendingTab(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStatusConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatusConfirm(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2rem] p-8 shadow-2xl border border-gold/10 w-full max-w-xs text-center"
            >
              <div className="flex flex-col items-center gap-4 py-4">
                <AlertCircle className="w-12 h-12 text-gold" />
                <div className="space-y-1">
                  <h3 className="font-serif italic text-xl text-ink">
                    {wedding?.status === 'published' ? 'Arsipkan Undangan?' : 'Publikasikan Undangan?'}
                  </h3>
                  <p className="text-xs text-ink/60 leading-relaxed">
                    {wedding?.status === 'published'
                      ? 'Mengarsipkan undangan ini akan menyembunyikannya dari tamu.'
                      : 'Undangan akan terlihat oleh semua tamu yang memiliki tautan.'}
                  </p>
                </div>
                <div className="flex gap-3 mt-4 w-full">
                  <button
                    onClick={() => setShowStatusConfirm(false)}
                    className="flex-1 py-2.5 border border-gold/20 text-ink/60 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => { setShowStatusConfirm(false); handleToggleStatus(); }}
                    className="flex-1 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
                  >
                    Lanjutkan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
