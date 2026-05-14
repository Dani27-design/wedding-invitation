'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider } from '@/lib/firebase-auth';
import { db } from '@/lib/firebase';
import { UserDocument } from '@/types/firestore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function redirectByRole(uid: string) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
      setError('Akun tidak terdaftar. Silakan daftar terlebih dahulu.');
      return;
    }
    const userData = snap.data() as UserDocument;
    if (userData.role === 'pending') {
      setError('Akun Anda menunggu persetujuan admin.');
      return;
    }
    if (userData.role === 'super') {
      router.push('/admin');
      return;
    }
    if (userData.role === 'customer' && userData.assignedWeddingSlug) {
      router.push(`/admin/${userData.assignedWeddingSlug}`);
      return;
    }
    setError('Akun belum ditugaskan ke undangan. Hubungi admin.');
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await redirectByRole(cred.user.uid);
    } catch {
      setError('Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await redirectByRole(cred.user.uid);
    } catch {
      setError('Gagal masuk dengan Google');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <title>Masuk — Admin</title>
      <meta name="robots" content="noindex" />
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
          <h1 className="font-serif italic text-2xl text-ink mb-1">Masuk</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-black">Admin Panel</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="sr-only">Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password" className="sr-only">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
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
            {isLoading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gold/10" />
          <span className="text-[10px] uppercase tracking-widest text-ink/30 font-bold">atau</span>
          <div className="flex-1 h-px bg-gold/10" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 border border-gold/20 rounded-full text-xs tracking-[0.2em] font-black uppercase text-ink/70 hover:border-gold/40 transition-colors disabled:opacity-50"
        >
          Masuk dengan Google
        </button>

        <p className="text-center text-xs text-ink/40">
          Belum punya akun?{' '}
          <a href="/register" className="text-gold underline underline-offset-4">Daftar</a>
        </p>
      </div>
      </div>
    </>
  );
}
