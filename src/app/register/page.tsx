'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider } from '@/lib/firebase-auth';
import { db } from '@/lib/firebase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function createUserDoc(uid: string, userEmail: string, displayName: string, provider: 'email' | 'google') {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setError('Akun sudah terdaftar. Silakan masuk.');
      return false;
    }
    await setDoc(ref, {
      uid,
      email: userEmail,
      displayName,
      role: 'pending',
      provider,
      assignedWeddingSlug: null,
      createdAt: serverTimestamp(),
    });
    return true;
  }

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama wajib diisi');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const success = await createUserDoc(cred.user.uid, email, name.trim(), 'email');
      if (success) setIsSuccess(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-in-use') {
        setError('Email sudah digunakan. Silakan masuk.');
      } else if (code === 'auth/weak-password') {
        setError('Password minimal 6 karakter');
      } else {
        setError('Gagal mendaftar. Coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError('');
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const success = await createUserDoc(
        cred.user.uid,
        cred.user.email ?? '',
        cred.user.displayName ?? 'User',
        'google'
      );
      if (success) setIsSuccess(true);
    } catch {
      setError('Gagal mendaftar dengan Google');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = 'w-full px-4 py-3 bg-ivory/10 border border-ivory/10 rounded-xl text-sm text-ivory placeholder:text-ivory/25 focus:outline-none focus:border-gold/40 transition-colors disabled:opacity-50';

  if (isSuccess) {
    return (
      <>
        <title>Pendaftaran Berhasil | Marinikah Invitation</title>
        <meta name="robots" content="noindex" />
        <div className="min-h-screen bg-ink flex items-start sm:items-center justify-center px-6 py-12 relative overflow-hidden">
          <div className="absolute top-[15%] left-[10%] w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[10%] right-[5%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(248,187,208,0.06) 0%, transparent 70%)' }} />

          <div className="w-full max-w-sm relative z-10 text-center space-y-5">
            <Link href="/" className="font-display italic text-xl text-ivory font-bold hover:text-gold transition-colors">Marinikah Invitation</Link>
            <h1 className="font-serif italic text-2xl text-ivory">Terima kasih telah mendaftar</h1>
            <p className="font-serif italic text-sm text-ivory/40 leading-relaxed max-w-xs mx-auto">
              Akun Anda sedang dalam proses verifikasi dan akan diaktifkan dalam waktu 1x24 jam. Kami akan mengirimkan notifikasi melalui email setelah semuanya siap.
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <title>Daftar | Marinikah Invitation</title>
      <meta name="robots" content="noindex" />
      <div className="min-h-screen bg-ink flex items-start sm:items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[5%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(248,187,208,0.06) 0%, transparent 70%)' }} />

        <div className="w-full max-w-sm relative z-10 space-y-5">
          <div className="text-center">
            <Link href="/" className="font-display italic text-xl text-ivory font-bold hover:text-gold transition-colors">Marinikah Invitation</Link>
            <h1 className="font-serif italic text-2xl text-ivory mt-6 mb-1">Mulai Perjalanan Anda</h1>
            <p className="font-serif italic text-[13px] text-ivory/30">Daftarkan diri untuk mulai membuat undangan pernikahan digital</p>
          </div>

          <form onSubmit={handleEmailRegister} className="space-y-3">
            <div>
              <label htmlFor="reg-name" className="sr-only">Nama Lengkap</label>
              <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Lengkap" required maxLength={50} disabled={isLoading} className={inputClass} />
            </div>
            <div>
              <label htmlFor="reg-email" className="sr-only">Email</label>
              <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isLoading} className={inputClass} />
            </div>
            <div>
              <label htmlFor="reg-password" className="sr-only">Password</label>
              <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 karakter)" required minLength={6} disabled={isLoading} className={inputClass} />
            </div>
            {error && <p role="alert" className="text-xs text-red-400 text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20 hover:scale-105 transition-transform">
              {isLoading ? 'Memuat...' : 'Daftar'}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-ivory/10" />
            <span className="text-[10px] uppercase tracking-widest text-ivory/20 font-bold">atau</span>
            <div className="flex-1 h-px bg-ivory/10" />
          </div>

          <button onClick={handleGoogleRegister} disabled={isLoading} className="w-full py-3 border border-ivory/15 rounded-full text-xs tracking-[0.2em] font-black uppercase text-ivory/60 hover:border-gold hover:text-gold transition-colors disabled:opacity-50">
            Lanjutkan dengan Google
          </button>

          <p className="text-center text-xs text-ivory/30">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-gold hover:underline underline-offset-4">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </>
  );
}
