import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { slug, secret } = await req.json();

    if (secret !== process.env.REVALIDATION_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!slug || typeof slug !== 'string') {
      return Response.json({ error: 'Missing slug' }, { status: 400 });
    }

    revalidatePath(`/${slug}`);
    return Response.json({ revalidated: true, slug });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
