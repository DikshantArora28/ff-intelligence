import { NextRequest, NextResponse } from 'next/server';
import { fetchNews, getAvailableCountries } from '@/lib/newsApi';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const from = searchParams.get('from') || undefined;
  const country = searchParams.get('country') || undefined;

  // Return available countries list
  if (searchParams.get('list') === 'countries') {
    return NextResponse.json({ countries: getAvailableCountries() });
  }

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const news = await fetchNews(query, from, country);
    return NextResponse.json({ articles: news });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
