'use client';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Trash2, MessageSquare } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface WishesFormProps {
  slug: string;
}

export function WishesForm({ slug }: WishesFormProps) {
  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const q = query(collection(db, 'wishes'), where('weddingId', '==', slug));
    const snap = await getDocs(q);
    setWishes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [slug]);

  const deleteWish = async (id: string) => {
    await deleteDoc(doc(db, 'wishes', id));
    fetchData();
  };

  if (loading) return <p className="text-xs text-ink/40 tracking-widest uppercase text-center py-10">Memuat ucapan...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-6">Data Interaksi di Ucapan</h2>
      {wishes.map((w) => (
        <div key={w.id} className="p-3 bg-white rounded-xl border border-gold/5 flex justify-between items-start gap-3 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-black truncate">{w.name}</p>
              <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black ${w.attendance === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {w.attendance === 'yes' ? 'Hadir' : 'Tidak'}
              </span>
            </div>
            <p className="text-[11px] text-ink/70 leading-relaxed">{w.message}</p>
          </div>
          <button onClick={() => setDeleteTarget(w.id)} className="text-red-400 p-1 hover:bg-red-50 rounded-lg shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      {wishes.length === 0 && <p className="text-xs text-ink/40 text-center py-10">Belum ada ucapan.</p>}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Hapus ucapan ini?"
        onConfirm={() => { if (deleteTarget) deleteWish(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
