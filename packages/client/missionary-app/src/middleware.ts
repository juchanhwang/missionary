import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup'];

async function refreshTokens(refreshToken: string): Promise<Response | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    return await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refresh_token=${refreshToken}`,
      },
    });
  } catch {
    return null;
  }
}

function setCookiesFromResponse(
  response: NextResponse,
  apiResponse: Response,
): void {
  const setCookieHeaders = apiResponse.headers.getSetCookie();

  for (const cookie of setCookieHeaders) {
    response.headers.append('Set-Cookie', cookie);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublicPath) {
    if (accessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  if (accessToken) {
    return NextResponse.next();
  }

  if (refreshToken) {
    const apiResponse = await refreshTokens(refreshToken);

    if (apiResponse?.ok) {
      const response = NextResponse.next();
      setCookiesFromResponse(response, apiResponse);

      return response;
    }
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)',
  ],
};
