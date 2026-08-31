import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseRecipeFromImage } from '@/lib/llm/client';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('image') as File | null;
  if (!file) return NextResponse.json({ error: 'Missing image' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

  try {
    const { parsed, raw } = await parseRecipeFromImage(base64, mediaType);
    return NextResponse.json({ parsed, raw });
  } catch (err) {
    console.error('parse-image failed', err);
    return NextResponse.json({ error: 'Could not parse a recipe from that screenshot' }, { status: 422 });
  }
}