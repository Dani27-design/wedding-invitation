'use client';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { Trash2, MessageCircle, Heart } from 'lucide-react';

interface StoryInteractionsFormProps {
  data: any; // WeddingDocument
  slug: string;
}

export function StoryInteractionsForm({ slug }: StoryInteractionsFormProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    // Fetch comments
    const commentsQuery = query(collection(db, 'story-comments'), where('weddingId', '==', slug));
    const commentsSnap = await getDocs(commentsQuery);
    setComments(commentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // Fetch likes
    const likesSnap = await getDoc(doc(db, 'story-likes', slug));
    if (likesSnap.exists()) {
      setLikes(likesSnap.data().likes);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [slug]);

  const deleteComment = async (id: string) => {
    if (confirm('Hapus komentar ini?')) {
      await deleteDoc(doc(db, 'story-comments', id));
      fetchData();
    }
  };

  if (loading) return <p className="text-xs text-ink/40 tracking-widest uppercase text-center py-10">Memuat data...</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-6">Data Interaksi di Kisah Cinta</h2>
      <div className="p-4 border border-gold/10 rounded-2xl bg-white/50">
        <h3 className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-4">Suka</h3>
        <div className="flex flex-wrap gap-2">
          {likes.map((count, i) => (
            <div key={i} className="px-3 py-1 bg-gold/10 rounded-full text-[10px] font-bold text-gold">Slide {i + 1}: {count}</div>
          ))}
        </div>
      </div>

      <div className="p-4 border border-gold/10 rounded-2xl bg-white/50 space-y-4">
        <h3 className="text-xs uppercase tracking-[0.3em] text-gold font-black">Komentar</h3>
        {comments.map((c) => (
          <div key={c.id} className="p-3 bg-white rounded-xl border border-gold/5 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black truncate">{c.name}</p>
                <span className="text-[8px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Slide {c.slideIndex + 1}</span>
              </div>
              <p className="text-[11px] text-ink/70 mt-0.5 leading-relaxed">{c.text}</p>
            </div>
            <button onClick={() => deleteComment(c.id)} className="text-red-400 p-1 hover:bg-red-50 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
