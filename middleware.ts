import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Block any requests to external image services that might cause 404s
  if (request.nextUrl.pathname.startsWith('/_next/image')) {
    const url = request.nextUrl.searchParams.get('url');
    
    // Block problematic external image URLs
    if (url) {
      try {
        const parsedUrl = new URL(url);
        // Block if host is exactly 'images.unsplash.com'
        if (
          parsedUrl.hostname === 'images.unsplash.com' ||
          parsedUrl.pathname.includes('photo-1494790108755-2616b612b786')
        ) {
        const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        return NextResponse.redirect(transparentPixel);
      }
      } catch (e) {
        // If URL is invalid, optionally block or ignore. We'll block:
        const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        return NextResponse.redirect(transparentPixel);
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/_next/image/:path*',
  ],
};