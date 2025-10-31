import { NextRequest, NextResponse } from 'next/server';
import { ContentfulApiService } from '@src/services/contentfulApi';
import { client } from '@src/lib/client';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let q = searchParams.get('q') || '';
  const localeParam = searchParams.get('locale') || 'en-US';
  const limitParam = searchParams.get('limit');
  const limit = Number.isNaN(Number(limitParam)) ? undefined : Number(limitParam || undefined);

  // Convert hyphens and underscores to spaces
  q = q.replace(/-/g, ' ').replace(/_/g, ' ');

  // Additionally, extract the last segment of the pathname, only.
  const lastSegment = q.split('/').pop();
  if (lastSegment) {
    q = lastSegment;
  }

  if (!q.trim()) {
    return NextResponse.json({ ok: false, error: 'Missing query parameter "q"' }, { status: 400 });
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID || '';
  const environmentId = process.env.CONTENTFUL_SPACE_ENVIRONMENT || 'master';
  const cmaToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN || '';

  if (!spaceId || !cmaToken) {
    return NextResponse.json(
      { ok: false, error: 'Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN env vars' },
      { status: 500 },
    );
  }

  try {
    const svc = new ContentfulApiService(spaceId, cmaToken, environmentId);

    // Always filter to only 'pageBlogPost' content type for simplicity.
    const results = await svc.semanticSearch(q, { contentTypeIds: ['pageBlogPost'] });

    if (!results || !Array.isArray(results.items) || results.items.length === 0) {
      return NextResponse.json({ ok: true, query: q, count: 0, items: [] });
    }

    // Filter unique pageBlogPost entries only
    const uniqueItems = results.items
      .filter(
        (item: any, index: number, self: any[]) =>
          index === self.findIndex(t => t.sys.id === item.sys.id),
      )
      .filter((item: any) => item.sys.contentType.sys.id === 'pageBlogPost');

    const limitedItems = uniqueItems.slice(0, limit ?? 10);
    const entryIds = limitedItems.map((item: any) => item.sys.id).filter(Boolean);

    if (entryIds.length === 0) {
      return NextResponse.json({ ok: true, query: q, count: 0, items: [] });
    }

    // Fetch full PageBlogPost entries using GraphQL
    const { pageBlogPostCollection } = await client.pageBlogPostCollection({
      locale: localeParam,
      where: {
        sys: {
          id_in: entryIds,
        },
      },
      limit: limit ?? 2,
    });

    const posts =
      pageBlogPostCollection?.items.filter(
        (post): post is PageBlogPostFieldsFragment => post !== null,
      ) || [];

    return NextResponse.json({
      ok: true,
      query: q,
      count: posts.length,
      items: posts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Semantic search failed',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
