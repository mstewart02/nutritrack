import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchPageText } from '@/lib/scrapers/fetchPageContent';
import { parseRecipeFromText } from '@/lib/llm/client';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { url } = await request.json();
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const pageText = await fetchPageText(url);
    const { parsed, raw } = await parseRecipeFromText(pageText);
    return NextResponse.json({ parsed, raw, sourceUrl: url });
  } catch (err) {
    console.error('parse-url failed', err);
    return NextResponse.json({ error: 'Could not parse a recipe from that link' }, { status: 422 });
  }
}