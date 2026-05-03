import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr';

// next-intl middleware (eskiden middleware.ts içindeydi, artık proxy.ts)
const handleI18nRouting = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // 1. next-intl ile dili ve rotayı çöz
  const response = handleI18nRouting(request);

  // Statik dosyalar veya api istekleri ise hemen çık
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return response;
  }

  // 2. Supabase Server Client oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 3. Kullanıcı oturumunu kontrol et
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAccessingAdmin = pathname.includes('/admin');
  const isAccessingLogin = pathname.includes('/admin/login');

  const locale = request.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale;

  if (isAccessingAdmin && !isAccessingLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/admin/login`;
    return NextResponse.redirect(url);
  }

  if (isAccessingAdmin && isAccessingLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/admin`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
