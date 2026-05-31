'use client';
import { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, orderBy, limit as firestoreLimit, startAfter, QueryDocumentSnapshot, QueryConstraint } from 'firebase/firestore';
import { Trash2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface StoryInteractionsFormProps {
  data: any;
  slug: string;
}

const PAGE_SIZE = 15;

export function StoryInteractionsForm({ data, slug }: StoryInteractionsFormProps) {
  const slides: { year: string }[] = data?.story ?? [];
  const [innerTab, setInnerTab] = useState<'likes' | 'comments'>('likes');
  const [comments, setComments] = useState<any[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<(QueryDocumentSnapshot | null)[]>([null]);
  const [hasNext, setHasNext] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [allComments, setAllComments] = useState<any[] | null>(null);
  const [searchPage, setSearchPage] = useState(0);

  const isSearching = searchQuery.trim() !== '';

  const fetchLikes = async () => {
    const likesSnap = await getDoc(doc(db, 'story-likes', slug));
    if (likesSnap.exists()) setLikes(likesSnap.data().likes);
  };

  const fetchComments = async (pageIdx: number) => {
    setLoading(true);
    const constraints: QueryConstraint[] = [
      where('weddingId', '==', slug),
      orderBy('createdAt', 'desc'),
      firestoreLimit(PAGE_SIZE + 1),
    ];
    const cursor = cursors[pageIdx];
    if (cursor) constraints.push(startAfter(cursor));

    const snap = await getDocs(query(collection(db, 'story-comments'), ...constraints));
    const hasMore = snap.docs.length > PAGE_SIZE;
    const docs = snap.docs.slice(0, PAGE_SIZE);

    setComments(docs.map(d => ({ id: d.id, ...d.data() })));
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

  // Lazy-load all comments when searching
  useEffect(() => {
    if (isSearching && !allComments) {
      getDocs(query(collection(db, 'story-comments'), where('weddingId', '==', slug), orderBy('createdAt', 'desc')))
        .then(snap => setAllComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
        .catch(() => {});
    }
  }, [isSearching, allComments, slug]);

  useEffect(() => { setSearchPage(0); }, [searchQuery]);

  useEffect(() => {
    fetchLikes();
    fetchComments(0);
  }, [slug]);

  const deleteComment = async (id: string) => {
    await deleteDoc(doc(db, 'story-comments', id));
    setAllComments(null);
    setCursors([null]);
    fetchComments(0);
  };

  // Filtered search results
  const filteredComments = useMemo(() => {
    if (!isSearching || !allComments) return [];
    const q = searchQuery.toLowerCase();
    return allComments.filter(c => c.name?.toLowerCase().includes(q) || c.text?.toLowerCase().includes(q));
  }, [isSearching, allComments, searchQuery]);

  const displayComments = isSearching
    ? filteredComments.slice(searchPage * PAGE_SIZE, (searchPage + 1) * PAGE_SIZE)
    : comments;

  const totalSearchPages = Math.ceil(filteredComments.length / PAGE_SIZE);
  const activePage = isSearching ? searchPage : page;
  const canPrev = activePage > 0;
  const canNext = isSearching ? searchPage < totalSearchPages - 1 : hasNext;

  const goPrev = () => { if (isSearching) setSearchPage(p => p - 1); else fetchComments(page - 1); };
  const goNext = () => { if (isSearching) setSearchPage(p => p + 1); else fetchComments(page + 1); };

  if (loading && !isSearching) return <p className="text-xs text-ink/80 tracking-widest uppercase text-center py-10">Memuat...</p>;

  const totalLikes = likes.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {/* Inner tabs */}
      <div className="flex gap-1">
        <button
          onClick={() => setInnerTab('likes')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${innerTab === 'likes' ? 'bg-gold text-ivory' : 'text-ink/80 hover:text-ink/80'}`}
        >
          Suka {totalLikes > 0 && <span className="ml-1 text-[9px]">({totalLikes})</span>}
        </button>
        <button
          onClick={() => setInnerTab('comments')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${innerTab === 'comments' ? 'bg-gold text-ivory' : 'text-ink/80 hover:text-ink/80'}`}
        >
          Komentar
        </button>
      </div>

      {innerTab === 'likes' ? (
        /* ── Likes ── */
        <div className="space-y-1.5">
          {likes.length > 0 ? (
            <div className="border border-gold/10 rounded-2xl overflow-hidden divide-y divide-gold/5">
              {likes.map((count, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-white/40">
                  <span className="text-[10px] text-ink/80">{slides[i]?.year || `Slide ${i + 1}`}</span>
                  <span className="text-[10px] font-bold text-gold">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-ink/80">Belum ada suka</p>
          )}
        </div>
      ) : (
        /* ── Comments ── */
        <div className="space-y-1.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau komentar..."
              aria-label="Cari komentar"
              className="w-full pl-9 pr-8 py-2 border border-gold/20 rounded-full text-xs bg-white focus:outline-none focus:border-gold/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/80 hover:text-ink/80" aria-label="Hapus pencarian">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Count */}
          <div className="flex justify-end">
            <span className="text-[10px] text-ink/80 font-mono">{isSearching ? `${filteredComments.length} hasil` : comments.length}</span>
          </div>

          {displayComments.length > 0 ? (
            <div className="border border-gold/10 rounded-2xl overflow-hidden divide-y divide-gold/5">
              {displayComments.map((c) => (
                <div key={c.id} className="flex items-start gap-2 px-3 py-2 bg-white/40">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black truncate">{c.name}</span>
                      <span className="text-[8px] bg-gold/8 text-gold/70 px-1.5 py-0.5 rounded font-bold flex-shrink-0">{slides[c.slideIndex]?.year || `Slide ${c.slideIndex + 1}`}</span>
                    </div>
                    <p className="text-[11px] text-ink/80 mt-0.5 leading-snug break-words">{c.text}</p>
                  </div>
                  <button onClick={() => setDeleteTarget(c.id)} className="w-6 h-6 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 mt-0.5" aria-label="Hapus komentar">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-ink/80">{isSearching ? 'Tidak ditemukan' : 'Belum ada komentar'}</p>
          )}

          {/* Pagination */}
          {(canPrev || canNext) && (
            <div className="flex items-center justify-center gap-4 pt-1">
              <button onClick={goPrev} disabled={!canPrev} className="w-7 h-7 flex items-center justify-center rounded-full border border-gold/20 text-ink/80 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20" aria-label="Halaman sebelumnya">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-ink/80 font-bold uppercase tracking-widest">Hal. {activePage + 1}</span>
              <button onClick={goNext} disabled={!canNext} className="w-7 h-7 flex items-center justify-center rounded-full border border-gold/20 text-ink/80 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20" aria-label="Halaman berikutnya">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Hapus komentar ini?"
        onConfirm={() => { if (deleteTarget) deleteComment(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
