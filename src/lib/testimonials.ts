import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function addTestimonial(weddingSlug: string, data: { rating: number; message: string }) {
  return addDoc(collection(db, 'testimonials'), {
    weddingSlug,
    rating: Math.min(5, Math.max(1, Math.round(data.rating))),
    message: data.message.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function getTestimonials(maxResults = 20) {
  const q = query(
    collection(db, 'testimonials'),
    orderBy('createdAt', 'desc'),
    limit(maxResults),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getTestimonialBySlug(weddingSlug: string) {
  const q = query(
    collection(db, 'testimonials'),
    where('weddingSlug', '==', weddingSlug),
    limit(1),
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function deleteTestimonial(id: string) {
  return deleteDoc(doc(db, 'testimonials', id));
}
