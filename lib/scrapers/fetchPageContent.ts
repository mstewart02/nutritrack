export async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NutriTrackBot/1.0)' },
  });
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  const html = await res.text();

  // Crude tag-strip, not full readability extraction — the LLM is robust to noisy
  // surrounding text (nav links, ads, etc). Upgrade to a proper extraction library
  // later only if parsing quality on real-world sites turns out to need it.
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}