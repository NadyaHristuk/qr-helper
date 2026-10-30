import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { SOLUTIONS, findSolution } from '@/lib/products/solutions';
import { SolutionBuilder } from '@/components/product/SolutionBuilder';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SOLUTIONS.map((solution) => ({ locale, goal: solution.key })));
}

export default async function SolutionPage({ params }: { params: Promise<{ locale: string; goal: string }> }) {
  const { locale, goal } = await params;
  setRequestLocale(locale);
  const solution = findSolution(goal);
  if (!solution) notFound();
  return <SolutionBuilder solution={solution} locale={locale} />;
}
