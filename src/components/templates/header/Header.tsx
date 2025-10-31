'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '@src/components/features/language-selector';
import { Container } from '@src/components/shared/container';

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="m-4 overflow-hidden rounded-xl border-b-4 border-blue600/30 bg-gradient-to-r from-blue500 via-blue400 to-blue600 shadow-lg">
      <Container>
        <nav className="flex items-center justify-between py-4 md:py-6">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <span className="text-2xl font-bold tracking-tight text-colorWhite drop-shadow-md transition-all group-hover:drop-shadow-lg md:text-3xl">
              WanderWorld
            </span>
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <p className="hidden text-sm font-light tracking-wide text-colorWhite/95 lg:block">
              Adventure awaits in every journey. Explore. Dream. Discover.
            </p>
            <LanguageSelector />
          </div>
        </nav>
      </Container>
    </header>
  );
};
