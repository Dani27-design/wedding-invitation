'use client';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, orderBy, limit as firestoreLimit, startAfter, QueryDocumentSnapshot, QueryConstraint } from 'firebase/firestore';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface StoryInteractionsFormProps {
  data: any;
  slug: string;
}

const PAGE_SIZE = 15;

export function StoryInteractionsForm({ data, slug }: StoryInteractionsFormProps) {
  const slides: { year: string }[] = data?.story ?? [];
  const [comments, setComments] = useState<any[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<(QueryDocumentSnapshot | null)[]>([null]);
  const [hasNext, setHasNext] = useState(false);

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

  useEffect(() => {
    fetchLikes();
    fetchComments(0);
  }, [slug]);

  const deleteComment = async (id: string) => {
    await deleteDoc(doc(db, 'story-comments', id));
    // Reset cursors and reload current page from start
    setCursors([null]);
    fetchComments(0);
  };

  if (loading) return <p className="text-xs text-ink/40 tracking-widest uppercase text-center py-10">Memuat...</p>;

  const totalLikes = likes.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black">Interaksi Kisah Cinta</h2>

      {/* Likes — compact inline */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-ink/50 font-bold uppercase tracking-wider">Suka</span>
          <span className="text-[10px] text-ink/30 font-mono">{totalLikes} total</span>
        </div>
        {likes.length > 0 ? (
          <div className="border border-gold/10 rounded-2xl overflow-hidden divide-y divide-gold/5">
            {likes.map((count, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-white/40">
                <span className="text-[10px] text-ink/60">{slides[i]?.year || `Slide ${i + 1}`}</span>
                <span className="text-[10px] font-bold text-gold">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-ink/25">Belum ada suka</p>
        )}
      </div>

      {/* Comments — compact list */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-ink/50 font-bold uppercase tracking-wider">Komentar</span>
          <span className="text-[10px] text-ink/30 font-mono">{comments.length}</span>
        </div>
        {comments.length > 0 ? (
          <div className="border border-gold/10 rounded-2xl overflow-hidden divide-y divide-gold/5">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 px-3 py-2 bg-white/40">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black truncate">{c.name}</span>
                    <span className="text-[8px] bg-gold/8 text-gold/70 px-1.5 py-0.5 rounded font-bold flex-shrink-0">{slides[c.slideIndex]?.year || `Slide ${c.slideIndex + 1}`}</span>
                  </div>
                  <p className="text-[11px] text-ink/50 mt-0.5 leading-snug">{c.text}</p>
                </div>
                <button onClick={() => setDeleteTarget(c.id)} className="w-6 h-6 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 mt-0.5" aria-label="Hapus komentar">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-ink/25">Belum ada komentar</p>
        )}

        {/* Pagination */}
        {(page > 0 || hasNext) && (
          <div className="flex items-center justify-center gap-4 pt-1">
            <button
              onClick={() => fetchComments(page - 1)}
              disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gold/20 text-ink/40 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Hal. {page + 1}</span>
            <button
              onClick={() => fetchComments(page + 1)}
              disabled={!hasNext}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gold/20 text-ink/40 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-20"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Hapus komentar ini?"
        onConfirm={() => { if (deleteTarget) deleteComment(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
