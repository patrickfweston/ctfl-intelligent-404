import NotFoundContent from '@src/app/[locale]/not-found-content';

interface NotFoundCatchAllProps {
  params: {
    locale: string;
    notFound: string[];
  };
}

export default function NotFoundCatchAll({ params }: NotFoundCatchAllProps) {
  const pathSegments = params.notFound || [];
  // Reconstruct the path from the catch-all segments
  const pathname = `/${params.locale}/${pathSegments.join('/')}`;
  return <NotFoundContent pathname={pathname} />;
}
