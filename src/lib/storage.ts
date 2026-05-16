import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase-storage';

export type UploadProgressCallback = (percent: number) => void;

export async function uploadFile(
  path: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const fileRef = ref(storage, path);
  const task = uploadBytesResumable(fileRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(percent);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
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
