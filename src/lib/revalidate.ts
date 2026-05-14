/**
 * Trigger on-demand ISR revalidation for a wedding page.
 * Calls the /api/revalidate route handler.
 * Fails silently — the 5-minute ISR timer is the fallback.
 */
export async function revalidateWedding(slug: string): Promise<void> {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET,
      }),
    });
  } catch {
    // Silent — ISR timer handles it within 5 minutes
  }
}
