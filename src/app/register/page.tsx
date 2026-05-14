'use client';

import { useState } from 'react';
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

  if (isSuccess) {
    return (
      <>
        <title>Daftar — Admin</title>
        <meta name="robots" content="noindex" />
        <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="font-serif italic text-2xl text-ink">Pendaftaran Berhasil</h1>
          <p className="text-xs uppercase tracking-[0.2em] text-gold font-black">
            Menunggu persetujuan admin
          </p>
          <p className="font-serif italic text-sm text-ink/60">
            Akun Anda akan diaktifkan setelah disetujui oleh admin. Anda akan dihubungi melalui email.
          </p>
          <a
            href="/login"
            className="inline-block mt-4 px-8 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Ke Halaman Masuk
          </a>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <title>Daftar — Admin</title>
      <meta name="robots" content="noindex" />
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-serif italic text-2xl text-ink mb-1">Daftar</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-black">Buat Akun Admin</p>
        </div>

        <form onSubmit={handleEmailRegister} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="sr-only">Nama Lengkap</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
              required
              maxLength={50}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="sr-only">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="sr-only">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 karakter)"
              required
              minLength={6}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 disabled:opacity-50"
            />
          </div>
          {error && <p role="alert" className="text-xs text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50"
          >
            {isLoading ? 'Memuat...' : 'Daftar'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gold/10" />
          <span className="text-[10px] uppercase tracking-widest text-ink/30 font-bold">atau</span>
          <div className="flex-1 h-px bg-gold/10" />
        </div>

        <button
          onClick={handleGoogleRegister}
          disabled={isLoading}
          className="w-full py-3 border border-gold/20 rounded-full text-xs tracking-[0.2em] font-black uppercase text-ink/70 hover:border-gold/40 transition-colors disabled:opacity-50"
        >
          Daftar dengan Google
        </button>

        <p className="text-center text-xs text-ink/40">
          Sudah punya akun?{' '}
          <a href="/login" className="text-gold underline underline-offset-4">Masuk</a>
        </p>
        </div>
      </div>
    </>
  );
}
