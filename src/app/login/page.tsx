'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
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
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resetError, setResetError] = useState('');

  async function redirectByRole(uid: string) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
      setError('Akun tidak terdaftar. Silakan daftar terlebih dahulu.');
      return;
    }
    const userData = snap.data() as UserDocument;
    if (userData.role === 'pending') {
      setError('Akun Anda masih menunggu persetujuan admin (biasanya 1x24 jam). Anda akan menerima email setelah akun diaktifkan. Jika sudah lebih dari 24 jam, silakan hubungi tim kami.');
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

  async function handleResetPassword() {
    if (!email.trim()) {
      setResetError('Masukkan email terlebih dahulu');
      setResetStatus('error');
      return;
    }
    setResetStatus('sending');
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetStatus('sent');
    } catch {
      setResetError('Gagal mengirim email reset. Pastikan email terdaftar.');
      setResetStatus('error');
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await redirectByRole(cred.user.uid);
    } catch {
      setError('Gagal masuk dengan Google, Silakan coba lagi atau gunakan login email.');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = 'w-full px-4 py-3 border border-ink/15 rounded-xl text-sm bg-white focus:outline-none focus:border-gold transition-colors disabled:opacity-50';

  return (
    <>
      <title>Masuk | Marinikah Invitation</title>
      <meta name="robots" content="noindex" />
      <div className="min-h-screen bg-ivory flex items-start sm:items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[5%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(248,187,208,0.05) 0%, transparent 70%)' }} />

        <div className="w-full max-w-sm relative z-10 space-y-5">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <NextImage src="/images/logo-1.png" alt="Marinikah Invitation" width={160} height={80} className="mx-auto w-[140px] h-auto" />
            </Link>
            {/* <h1 className="font-serif italic text-2xl text-ink mt-6 mb-1">Selamat Datang Kembali</h1> */}
            <h1 className="font-serif italic text-xl text-ink my-2">Selamat Datang, Masuk dan Bagikan Kebahagiaan Momen Istimewa Kalian bersama Marinikah</h1>
            {/* <p className="font-serif italic text-xl text-ink/80">Masuk untuk melanjutkan pengelolaan undangan Anda</p> */}
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label htmlFor="login-email" className="sr-only">Email</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isLoading} className={inputClass} />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">Password</label>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isLoading} className={inputClass} />
              <div className="mt-2 text-right">
                <button type="button" onClick={handleResetPassword} disabled={resetStatus === 'sending'} className="text-xs text-gold hover:text-gold-contrast underline underline-offset-4 disabled:opacity-50 transition-colors">
                  {resetStatus === 'sending' ? 'Mengirim...' : 'Lupa password?'}
                </button>
              </div>
              {resetStatus === 'sent' && (
                <p className="text-xs text-green-600 text-center mt-2">Email reset password telah dikirim.</p>
              )}
              {resetStatus === 'error' && resetError && (
                <p className="text-xs text-red-500 text-center mt-2">{resetError}</p>
              )}
            </div>
            {error && <p role="alert" className="text-sm text-red-500 text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20 hover:scale-105 transition-transform">
              {isLoading ? 'Memuat...' : 'Masuk'}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-ink/10" />
            <span className="text-xs uppercase tracking-widest text-ink/40 font-bold">atau</span>
            <div className="flex-1 h-px bg-ink/10" />
          </div>

          <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full py-3 border border-ink/15 rounded-full text-xs tracking-[0.2em] font-black uppercase text-ink/70 hover:border-gold hover:text-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Login dengan Google
          </button>

          <p className="text-center text-sm text-ink/60">
            Baru pertama kali?{' '}
            <Link href="/register" className="text-gold font-bold hover:underline underline-offset-4">Buat akun</Link>
          </p>
        </div>
      </div>
    </>
  );
}
