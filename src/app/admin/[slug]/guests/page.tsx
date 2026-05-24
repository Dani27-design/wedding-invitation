'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useWedding } from '@/hooks/useWedding';
import { ArrowLeft } from 'lucide-react';
import { GuestListTab } from '@/components/admin/GuestListTab';

export default function GuestsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { authUser, userDoc, isLoading: isAuthLoading } = useUser();
  const { wedding, isLoading: isWeddingLoading } = useWedding(slug ?? '');

  useEffect(() => {
    if (!isAuthLoading && !authUser) router.push('/login');
  }, [isAuthLoading, authUser, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-sm text-ink/80 tracking-widest uppercase">Memuat...</p>
      </div>
    );
  }

  if (!authUser) return null;

  const isAuthorized = userDoc?.role === 'super' || (wedding?.adminIds ?? []).includes(authUser.uid);

  if (!isAuthorized && !isWeddingLoading) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
        <h1 className="text-2xl text-ink mb-2">Akses Ditolak</h1>
        <p className="text-xs text-ink/80">Anda tidak memiliki akses ke undangan ini.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-gold/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href={`/admin/${slug}`} className="text-ink/80 hover:text-ink transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg text-ink">Daftar Tamu</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <GuestListTab slug={slug ?? ''} wedding={wedding} />
      </main>
    </div>
  );
}
