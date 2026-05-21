'use client';
import { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, limit as firestoreLimit, startAfter, QueryDocumentSnapshot, QueryConstraint } from 'firebase/firestore';
import { Trash2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface WishesFormProps {
  slug: string;
}

const PAGE_SIZE = 15;

export function WishesForm({ slug }: WishesFormProps) {
  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<(QueryDocumentSnapshot | null)[]>([null]);
  const [hasNext, setHasNext] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [allWishes, setAllWishes] = useState<any[] | null>(null);
  const [searchPage, setSearchPage] = useState(0);

  const isSearching = searchQuery.trim() !== '';

  const fetchWishes = async (pageIdx: number) => {
    setLoading(true);
    const constraints: QueryConstraint[] = [
      where('weddingId', '==', slug),
      orderBy('createdAt', 'desc'),
      firestoreLimit(PAGE_SIZE + 1),
    ];
    const cursor = cursors[pageIdx];
    if (cursor) constraints.push(startAfter(cursor));

    const snap = await getDocs(query(collection(db, 'wishes'), ...constraints));
    const hasMore = snap.docs.length > PAGE_SIZE;
    const docs = snap.docs.slice(0, PAGE_SIZE);

    setWishes(docs.map(d => ({ id: d.id, ...d.data() })));
    setHasNext(hasMore);
    setPage(pageIdx);

    if (docs.length > 0 && !cursors[pageIdx + 1]) {
      setCursors(prev => {
        const next = [...prev];
        next[pageIdx + 1] = docs[docs.length - 1];
        return next;
      });
    }
    setLoading(false);
  };

  // Lazy-load all wishes when searching
  useEffect(() => {
    if (isSearching && !allWishes) {
      getDocs(query(collection(db, 'wishes'), where('weddingId', '==', slug), orderBy('createdAt', 'desc')))
        .then(snap => setAllWishes(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
        .catch(() => {});
    }
  }, [isSearching, allWishes, slug]);

  useEffect(() => { setSearchPage(0); }, [searchQuery]);

  useEffect(() => { fetchWishes(0); }, [slug]);

  const deleteWish = async (id: string) => {
    await deleteDoc(doc(db, 'wishes', id));
    setAllWishes(null);
    setCursors([null]);
    fetchWishes(0);
  };

  // Filtered search results
  const filteredWishes = useMemo(() => {
    if (!isSearching || !allWishes) return [];
    const q = searchQuery.toLowerCase();
    return allWishes.filter(w => w.name?.toLowerCase().includes(q) || w.message?.toLowerCase().includes(q));
  }, [isSearching, allWishes, searchQuery]);

  const displayWishes = isSearching
    ? filteredWishes.slice(searchPage * PAGE_SIZE, (searchPage + 1) * PAGE_SIZE)
    : wishes;

  const totalSearchPages = Math.ceil(filteredWishes.length / PAGE_SIZE);
  const activePage = isSearching ? searchPage : page;
  const canPrev = activePage > 0;
  const canNext = isSearching ? searchPage < totalSearchPages - 1 : hasNext;

  const goPrev = () => { if (isSearching) setSearchPage(p => p - 1); else fetchWishes(page - 1); };
  const goNext = () => { if (isSearching) setSearchPage(p => p + 1); else fetchWishes(page + 1); };

  if (loading && wishes.length === 0 && !isSearching) return <p className="text-xs text-ink/40 tracking-widest uppercase text-center py-10">Memuat...</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black">Ucapan</h2>
        <span className="text-[10px] text-ink/30 font-mono">{isSearching ? `${filteredWishes.length} hasil` : `Hal. ${page + 1}`}</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama atau ucapan..."
          aria-label="Cari ucapan"
          className="w-full pl-9 pr-8 py-2 border border-gold/20 rounded-full text-xs bg-white focus:outline-none focus:border-gold/50"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60" aria-label="Hapus pencarian">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {displayWishes.length > 0 ? (
        <div className="border border-gold/10 rounded-2xl overflow-hidden divide-y divide-gold/5">
          {displayWishes.map((w) => (
            <div key={w.id} className="flex items-start gap-2 px-3 py-2 bg-white/40">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black truncate">{w.name}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${w.attendance === 'yes' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {w.attendance === 'yes' ? 'Hadir' : 'Tidak'}
                  </span>
                </div>
                <p className="text-[11px] text-ink/50 mt-0.5 leading-snug">{w.message}</p>
              </div>
              <button onClick={() => setDeleteTarget(w.id)} className="w-6 h-6 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 mt-0.5" aria-label="Hapus ucapan">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-ink/25">{isSearching ? 'Tidak ditemukan' : 'Belum ada ucapan'}</p>
      )}

      {/* Pagination */}
      {(canPrev || canNext) && (
        <div className="flex items-center justify-center gap-4 pt-1">
          <button onClick={goPrev} disabled={!canPrev} className="w-7 h-7 flex items-center justify-center rounded-full border border-gold/20 text-ink/40 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20" aria-label="Halaman sebelumnya">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Hal. {activePage + 1}</span>
          <button onClick={goNext} disabled={!canNext} className="w-7 h-7 flex items-center justify-center rounded-full border border-gold/20 text-ink/40 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20" aria-label="Halaman berikutnya">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Hapus ucapan ini?"
        onConfirm={() => { if (deleteTarget) deleteWish(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
