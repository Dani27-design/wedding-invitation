import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase-storage';

export async function uploadFile(path: string, file: File): Promise<string> {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function deleteFile(url: string) {
  if (!url) return;
  try { if (new URL(url).hostname !== 'firebasestorage.googleapis.com') return; } catch { return; }
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    // Ignore if file already deleted or not found
    console.error('[Storage] Delete error:', (error as Error).message);
  }
}
