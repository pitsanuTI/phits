import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      next: { revalidate: 300 }, // cache 5 minutes
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return NextResponse.json({ error: 'upstream error' }, { status: 502 });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    });
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
}
