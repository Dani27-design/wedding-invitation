'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase-auth';
import { uploadFile, deleteFile } from '@/lib/storage';
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
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

const STEPS = [
  'Pasangan',
  'Acara',
  'Cerita',
  'Media',
  'Amplop',
  'Galeri',
  'Kredit',
  'Kustom',
  'Interaksi',
  'Ucapan',
] as const;


interface SaveStatusModalProps {
  status: 'saving' | 'success' | 'error';
  onClose: () => void;
}

function SaveStatusModal({ status, onClose }: SaveStatusModalProps) {
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

            <div className="space-y-1">
              <h3 className="font-serif italic text-xl text-ink">
                {status === 'saving' && 'Sedang Menyimpan...'}
                {status === 'success' && 'Berhasil Disimpan'}
                {status === 'error' && 'Gagal Menyimpan'}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-black">
                {status === 'saving' && 'Harap tunggu sebentar'}
                {status === 'success' && 'Semua perubahan telah diperbarui'}
                {status === 'error' && 'Terjadi kesalahan, silakan coba lagi'}
              </p>
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

  const { wedding, isLoading: isWeddingLoading } = useWedding(slug ?? '');

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch { /* ignore */ }
    router.push('/login');
  };

  const [isToggling, setIsToggling] = useState(false);

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
          const url = await uploadFile(path, file);

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
      await updateDoc(doc(db, 'weddings', slug), updates as Record<string, any>);
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
    }
  }, [slug, wedding]);

  if (isAuthLoading) {
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
      case 0: return <CoupleForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 1: return <EventForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 2: return <StoryForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 3: return <MediaForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 4: return <GiftForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 5: return <GalleryForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 6: return <CreditForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 7: return <CustomizeForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 8: return <StoryInteractionsForm data={wedding} slug={slug ?? ''} />;
      case 9: return <WishesForm slug={slug ?? ''} />;
      default: return null;
    }

  };

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-gold/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="font-serif italic text-lg text-ink">
            {slug ?? 'Admin'}
          </h1>
          <div className="flex items-center gap-3">
            {userDoc?.role === 'super' ? (
              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`text-xs uppercase tracking-widest font-bold px-2 py-1 rounded-full border transition-colors ${isToggling ? 'opacity-50' : ''} ${wedding?.status === 'published' ? 'text-green-600 border-green-600/30 bg-green-50' : 'text-ink/40 border-ink/10 bg-ink/5'}`}
              >
                {wedding?.status === 'published' ? 'Aktif' : 'Diarsipkan'}
              </button>
            ) : (
              <span className={`text-xs uppercase tracking-widest font-bold px-2 py-1 rounded-full border ${wedding?.status === 'published' ? 'text-green-600 border-green-600/30 bg-green-50' : 'text-ink/40 border-ink/10 bg-ink/5'}`}>
                {wedding?.status === 'published' ? 'Aktif' : 'Diarsipkan'}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <nav className="sticky top-[53px] z-40 bg-ivory/90 backdrop-blur-md border-b border-gold/10 overflow-x-auto no-scrollbar">
        <div role="tablist" className="flex min-w-max px-4 py-2 gap-1 max-w-lg mx-auto">
          {STEPS.map((step, i) => (
            <button
              key={step}
              role="tab"
              id={`tab-${i}`}
              aria-selected={i === currentStep}
              aria-controls="admin-tabpanel"
              tabIndex={i === currentStep ? 0 : -1}
              onClick={() => {
                if (i !== currentStep && !hasSaved) {
                  setPendingTab(i);
                  return;
                }
                setCurrentStep(i);
                setHasSaved(false);
              }}
              onKeyDown={(e) => {
                let target: number | null = null;
                if (e.key === 'ArrowRight') target = (i + 1) % STEPS.length;
                else if (e.key === 'ArrowLeft') target = (i - 1 + STEPS.length) % STEPS.length;
                else if (e.key === 'Home') target = 0;
                else if (e.key === 'End') target = STEPS.length - 1;
                if (target === null) return;
                e.preventDefault();
                document.getElementById(`tab-${target}`)?.focus();
                if (target !== currentStep && !hasSaved) {
                  setPendingTab(target);
                  return;
                }
                setCurrentStep(target);
                setHasSaved(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                i === currentStep
                  ? 'bg-gold text-ivory'
                  : 'text-ink/40 hover:text-ink/70'
              }`}
            >
              {step}
            </button>
          ))}
        </div>
      </nav>

      <main role="tabpanel" id="admin-tabpanel" aria-labelledby={`tab-${currentStep}`} className="max-w-lg mx-auto px-4 py-6">
        {renderForm()}
      </main>

      <AnimatePresence>
        {saveStatus !== 'idle' && (
          <SaveStatusModal
            status={saveStatus}
            onClose={() => setSaveStatus('idle')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingTab !== null && (
          <ConfirmModal
            onConfirm={() => {
              setCurrentStep(pendingTab);
              setHasSaved(false);
              setPendingTab(null);
            }}
            onCancel={() => setPendingTab(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
