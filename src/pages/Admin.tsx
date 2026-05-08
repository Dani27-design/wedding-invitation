import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { uploadFile } from '../lib/storage';
import { useWedding } from '../hooks/useWedding';
import { WeddingDocument, StorySlide } from '../types/firestore';
import { CoupleForm } from '../components/admin/CoupleForm';
import { EventForm } from '../components/admin/EventForm';
import { StoryForm } from '../components/admin/StoryForm';
import { GalleryForm } from '../components/admin/GalleryForm';
import { GiftForm } from '../components/admin/GiftForm';
import { MediaForm } from '../components/admin/MediaForm';
import { SocialForm } from '../components/admin/SocialForm';
import { CustomizeForm } from '../components/admin/CustomizeForm';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

const STEPS = [
  'Pasangan',
  'Acara',
  'Cerita',
  'Galeri',
  'Amplop',
  'Media',
  'Sosial',
  'Kustom',
] as const;

interface SaveStatusModalProps {
  status: 'saving' | 'success' | 'error';
  onClose: () => void;
}

function SaveStatusModal({ status, onClose }: SaveStatusModalProps) {
  return (
    <AnimatePresence>
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
    </AnimatePresence>
  );
}

export default function Admin() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const { wedding, isLoading: isWeddingLoading } = useWedding(slug ?? '');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setLoginError('Email atau password salah');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleToggleStatus = async () => {
    if (!slug || !wedding) return;
    const newStatus = wedding.status === 'published' ? 'archived' : 'published';
    try {
      await updateDoc(doc(db, 'weddings', slug), { status: newStatus, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error('[Admin] Status toggle error:', (error as Error).message);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async (
    fields: Partial<WeddingDocument>,
    files?: Record<string, File>,
  ) => {
    if (!slug) return;
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const updates: Record<string, unknown> = { ...fields, updatedAt: serverTimestamp() };

      if (!wedding?.ownerId && user) {
        updates.ownerId = user.uid;
      }

      if (files) {
        for (const [key, file] of Object.entries(files)) {
          const ext = file.name.split('.').pop() ?? 'bin';
          const path = `weddings/${slug}/${key}-${Date.now()}.${ext}`;
          const url = await uploadFile(path, file);

          if (key === 'groomPhoto' || key === 'bridePhoto' || key === 'musicUrl' || key === 'heroImage' || key === 'openingImage' || key === 'twibbonOverlay') {
            updates[key] = url;
          } else if (key.startsWith('storyBg-')) {
            const idx = parseInt(key.split('-')[1], 10);
            const story = (updates.story as StorySlide[] | undefined) ?? [];
            if (story[idx]) story[idx] = { ...story[idx], bgImage: url };
            updates.story = story;
          } else if (key.startsWith('gallery-')) {
            const idx = parseInt(key.split('-')[1], 10);
            const gallery = (updates.gallery as string[] | undefined) ?? [];
            if (idx < gallery.length) gallery[idx] = url;
            updates.gallery = gallery;
          }
        }
      }

      await updateDoc(doc(db, 'weddings', slug), updates);
      setSaveStatus('success');
      setHasSaved(true);
    } catch (error) {
      console.error('[Admin] Save error:', (error as Error).message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [slug, user, wedding]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-sm text-ink/40 tracking-widest uppercase">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="font-serif italic text-2xl text-ink text-center mb-6">Admin Panel</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50"
          />
          {loginError && <p className="text-xs text-red-500 text-center">{loginError}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase"
          >
            Masuk
          </button>
        </form>
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
      case 3: return <GalleryForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 4: return <GiftForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 5: return <MediaForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 6: return <SocialForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
      case 7: return <CustomizeForm data={wedding} onSave={handleSave} isSaving={isSaving} />;
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
            <button
              onClick={handleToggleStatus}
              className={`text-xs uppercase tracking-widest font-bold px-2 py-1 rounded-full border transition-colors ${wedding?.status === 'published' ? 'text-green-600 border-green-600/30 bg-green-50' : 'text-ink/40 border-ink/10 bg-ink/5'}`}
            >
              {wedding?.status === 'published' ? 'Published' : 'Archived'}
            </button>
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
              aria-selected={i === currentStep}
              onClick={() => {
                if (i !== currentStep && !hasSaved) {
                  if (!window.confirm('Perubahan belum disimpan. Lanjutkan?')) return;
                }
                setCurrentStep(i);
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

      <main role="tabpanel" className="max-w-lg mx-auto px-4 py-6">
        {renderForm()}
      </main>

      {saveStatus !== 'idle' && (
        <SaveStatusModal 
          status={saveStatus} 
          onClose={() => setSaveStatus('idle')} 
        />
      )}
    </div>
  );
}
