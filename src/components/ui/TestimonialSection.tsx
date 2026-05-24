'use client';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Testimonial {
  id: string;
  weddingSlug: string;
  rating: number;
  message: string;
  coupleName: string;
  groomPhoto: string;
  bridePhoto: string;
}

export function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(12));
        const snapshot = await getDocs(q);
        const results: Testimonial[] = [];
        for (const d of snapshot.docs) {
          const data = d.data();
          const weddingDoc = await getDoc(doc(db, 'weddings', data.weddingSlug));
          if (weddingDoc.exists()) {
            const w = weddingDoc.data();
            results.push({
              id: d.id,
              weddingSlug: data.weddingSlug,
              rating: data.rating,
              message: data.message,
              coupleName: `${w.groomNickname} & ${w.brideNickname}`,
              groomPhoto: w.groomPhoto || '',
              bridePhoto: w.bridePhoto || '',
            });
          }
        }
        if (!cancelled) setTestimonials(results);
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (isLoading || testimonials.length === 0) return null;

  return (
    <section className="p-6">
      <div className="max-w-2xl lg:max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">
            Testimoni
          </p>
          <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
            Cerita dari pasangan kami
          </h2>
        </div>

        <div className={`flex gap-4 items-stretch justify-center overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 lg:mx-0 lg:px-0 lg:overflow-visible ${testimonials.length >= 3 ? 'lg:grid lg:grid-cols-3' : ''}`}>
          {testimonials.map(t => (
            <div
              key={t.id}
              className="w-[280px] sm:w-[320px] lg:w-auto flex-shrink-0 lg:flex-shrink bg-white/70 rounded-2xl border border-gold/10 p-5 shadow-sm hover:shadow-md hover:shadow-gold/5 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Couple info — photos inline with name */}
              <div className="flex items-center gap-3">
                <div className="flex items-center flex-shrink-0">
                  {t.groomPhoto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={t.groomPhoto}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm relative z-10"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gold/10 border-2 border-white shadow-sm relative z-10" />
                  )}
                  {t.bridePhoto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={t.bridePhoto}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm -ml-3 relative z-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-rose-pastel/20 border-2 border-white shadow-sm -ml-3 relative z-0" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-sm text-ink font-medium truncate">{t.coupleName}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`w-2.5 h-2.5 ${s <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400/20'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* Divider */}
              <div className="border-t border-gold/10 my-3" />
              {/* Quote */}
              <p className="font-serif italic text-lg text-ink/70 leading-relaxed line-clamp-4">
                <span className="text-xl text-gold/30 leading-none mr-1">&ldquo;</span>
                {t.message}
                <span className="text-xl text-gold/30 leading-none mr-1">&ldquo;</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
