import { i18nRouter } from 'next-i18n-router';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import i18nConfig from '@src/i18n/config';

export function middleware(request: NextRequest) {
  // Get the pathname from the request URL
  const pathname = request.nextUrl.pathname;

  // Call the i18n router
  const response = i18nRouter(request, i18nConfig);

  // Add the pathname as a custom header for server components to access
  // If i18nRouter returned a NextResponse, clone it and add headers
  // Otherwise, create a new response
  if (response instanceof NextResponse) {
    response.headers.set('x-pathname', pathname);
    return response;
  } else {
    // If i18nRouter returned something else (like a redirect), wrap it
    const newResponse = NextResponse.next();
    newResponse.headers.set('x-pathname', pathname);
    return newResponse;
  }
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
