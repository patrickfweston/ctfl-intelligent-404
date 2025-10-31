import { headers } from 'next/headers';
import Link from 'next/link';
import { Trans } from 'react-i18next/TransWithoutContext';

import { ArticleTileGrid } from '@src/components/features/article';
import { Container } from '@src/components/shared/container';
import initTranslations from '@src/i18n';
import { defaultLocale } from '@src/i18n/config';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

interface NotFoundContentProps {
  pathname?: string;
}

export default async function NotFoundContent({
  pathname: providedPathname = '',
}: NotFoundContentProps) {
  const headersList = headers();
  const locale = headersList.get('x-next-i18n-router-locale') || defaultLocale;
  const { t } = await initTranslations({ locale });

  // Get pathname from provided prop (from catch-all route),
  // or from x-pathname header (set by middleware),
  // or fall back to referer header
  const pathnameFromHeader = headersList.get('x-pathname');
  const pathname = providedPathname || pathnameFromHeader || '';

  // Extract slug from pathname (remove locale prefix if present)
  const slugMatch = pathname.match(/\/(?:[a-z]{2}-[A-Z]{2}\/)?([^/]+)$/);
  const searchQuery = slugMatch?.[1] || pathname.split('/').filter(Boolean).pop() || '';

  // Fetch related articles using semantic search
  let relatedArticles: PageBlogPostFieldsFragment[] | null = null;
  if (searchQuery) {
    try {
      // Call the intelligent-404 API which returns PageBlogPostFieldsFragment objects
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const searchResponse = await fetch(
        `${baseUrl}/api/intelligent-404?q=${encodeURIComponent(searchQuery)}&contentTypeIds=pageBlogPost&locale=${locale}&limit=2`,
        { next: { revalidate: 60 } },
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        relatedArticles = searchData.items || [];
      }
    } catch (error) {
      // Silently fail - don't break the 404 page if semantic search fails
      console.error('Failed to fetch related articles:', error);
    }
  }

  return (
    <Container className="mx-auto my-8 w-full max-w-4xl md:my-10 lg:my-16">
      <title>{t('notFound.title')}</title>

      {relatedArticles && relatedArticles.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 md:mb-6">
            {t(
              'notFound.mayBeInterested',
              "We couldn't find that page. However, you may be interested in the following articles:",
            )}
          </h2>
          <ArticleTileGrid className="md:grid-cols-2" articles={relatedArticles} />
        </div>
      )}
    </Container>
  );
}
