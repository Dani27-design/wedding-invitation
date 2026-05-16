import { revalidateWeddingAction } from '@/app/actions/revalidate';

/**
 * Trigger on-demand ISR revalidation for a wedding page.
 * Uses a Server Action — no secret needed, runs server-side.
 * Fails silently — the 5-minute ISR timer is the fallback.
 */
export async function revalidateWedding(slug: string): Promise<void> {
  try {
    await revalidateWeddingAction(slug);
  } catch {
    // Silent — ISR timer handles it within 5 minutes
  }
}
