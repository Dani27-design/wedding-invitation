'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateWeddingAction(slug: string): Promise<void> {
  if (!slug || typeof slug !== 'string') return;
  revalidatePath(`/${slug}`);
}
