import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function addWish(weddingId: string, data: { name: string; message: string; attendance: 'yes' | 'no' }) {
  return addDoc(collection(db, 'wishes'), {
    weddingId,
    name: data.name.trim(),
    message: data.message.trim(),
    attendance: data.attendance,
    createdAt: serverTimestamp(),
  });
}
