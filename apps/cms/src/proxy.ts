/**
 * Edge guard in front of the admin panel (Next.js proxy, runs before every request).
 *
 *  - Blocks obvious bots / scanners from the admin area.
 *  - Optionally restricts /admin to an IP allow-list (ADMIN_ALLOWED_IPS="1.2.3.4,5.6.7.8").
 *
 * Payload itself also locks an account after 5 failed logins (see collections/Users.ts).
 */
import { NextResponse, type NextRequest } from 'next/server';


const BOT_UA = /(curl|wget|python-requests|scrapy|httpclient|go-http-client|nikto|sqlmap|masscan|zgrab|nmap)/i;

function ip(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const client = ip(req);

  // Optional IP allow-list for the whole admin area.
  const allowed = (process.env.ADMIN_ALLOWED_IPS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.length && pathname.startsWith('/admin') && !allowed.includes(client)) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Scanners and scripted clients have no business in the admin.
  if (pathname.startsWith('/admin') && BOT_UA.test(req.headers.get('user-agent') ?? '')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // No session cookie → straight to the login page. (Payload also redirects, but it does so while
  // streaming the dashboard, which some hosts deliver as a blank page instead of following it.)
  const publicAdmin = /^\/admin\/(login|logout|forgot-password|reset-password|create-first-user|verify|unlock)(\/|$)/;
  if (pathname.startsWith('/admin') && !publicAdmin.test(pathname) && !req.cookies.get('payload-token')) {
    const login = new URL('/admin/login', req.url);
    if (pathname !== '/admin') login.searchParams.set('redirect', pathname);
    return NextResponse.redirect(login);
  }

  // Brute force is handled per account by Payload (5 failed logins → 15 min lock, see
  // collections/Users.ts). A per-IP counter was removed: cafés and offices share one IP and
  // legitimate staff kept locking each other out.
  // Admin language: English unless the person picked another language in their account
  // (Payload stores that choice in the `payload-lng` cookie). Without this, Payload follows the
  // browser's Accept-Language and Spanish browsers got a Spanish login page.
  if (pathname.startsWith('/admin') && !req.cookies.get('payload-lng')) {
    const headers = new Headers(req.headers);
    headers.set('cookie', [req.headers.get('cookie'), 'payload-lng=en'].filter(Boolean).join('; '));
    const res = NextResponse.next({ request: { headers } });
    res.cookies.set('payload-lng', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/users/:path*'],
};
