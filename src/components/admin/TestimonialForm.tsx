'use client';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { addTestimonial, getTestimonialBySlug, deleteTestimonial } from '../../lib/testimonials';

interface TestimonialFormProps {
  slug: string;
}

export function TestimonialForm({ slug }: TestimonialFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [existing, setExisting] = useState<{ id: string; rating: number; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getTestimonialBySlug(slug);
        if (!cancelled && result) {
          setExisting({ id: result.id, rating: (result as Record<string, unknown>).rating as number, message: (result as Record<string, unknown>).message as string });
          setRating((result as Record<string, unknown>).rating as number);
          setMessage((result as Record<string, unknown>).message as string);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSaving(true);
    try {
      if (existing) {
        await deleteTestimonial(existing.id);
      }
      await addTestimonial(slug, { rating, message: message.trim() });
      const result = await getTestimonialBySlug(slug);
      if (result) {
        setExisting({ id: result.id, rating: (result as Record<string, unknown>).rating as number, message: (result as Record<string, unknown>).message as string });
      }
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    setIsSaving(true);
    try {
      await deleteTestimonial(existing.id);
      setExisting(null);
      setRating(5);
      setMessage('');
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-xs text-ink/80 text-center py-8">Memuat...</p>;
  }

  const inputClass = 'w-full px-3 py-2 border border-gold/20 rounded-lg text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-1">Testimoni</p>
        <p className="text-xs text-ink/80">
          {existing ? 'Testimoni Anda sudah terkirim. Anda dapat memperbarui atau menghapusnya.' : 'Bagikan pengalaman Anda menggunakan Marinikah Invitation.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* <label className="text-xs text-ink/80 block mb-2">Rating</label> */}
          <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
                aria-label={`${star} bintang`}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-gold fill-gold'
                      : 'text-gold/20'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Ceritakan pengalaman Anda..."
          maxLength={300}
          required
          aria-label="Pesan testimoni"
          className={`${inputClass} min-h-[100px] resize-none`}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving || !message.trim()}
            className="flex-1 py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20"
          >
            {isSaving ? 'Menyimpan...' : existing ? 'Perbarui Testimoni' : 'Kirim Testimoni'}
          </button>
          {existing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="px-4 py-3 border border-red-200 text-red-400 rounded-full text-xs tracking-[0.2em] font-black uppercase hover:bg-red-50 disabled:opacity-50"
            >
              Hapus
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
