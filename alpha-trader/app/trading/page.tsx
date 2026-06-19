import { redirect } from 'next/navigation';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function TradingRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawTab = params.tab;
  const tab = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const suffix = tab ? `?tab=${encodeURIComponent(tab)}` : '';

  redirect(`/dashboard/trading${suffix}`);
}
