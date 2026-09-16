/**
 * Edge guard in front of the admin panel (Next.js proxy, runs before every request).
 *
 *  - Rate-limits login and password-reset endpoints per IP (in-memory, per instance).
 *  - Blocks obvious bots / scanners from the admin area.
 *  - Optionally restricts /admin to an IP allow-list (ADMIN_ALLOWED_IPS="1.2.3.4,5.6.7.8").
 *
 * Payload itself also locks an account after 5 failed logins (see collections/Users.ts).
 */
import { NextResponse, type NextRequest } from 'next/server';

const LOGIN_LIMIT = Number(process.env.LOGIN_RATE_LIMIT ?? 30); // attempts per IP (a whole café may share one)
const LOGIN_WINDOW_MS = Number(process.env.LOGIN_RATE_WINDOW_MS ?? 15 * 60 * 1000); // per 15 min
const hits = new Map<string, number[]>();

const BOT_UA = /(curl|wget|python-requests|scrapy|httpclient|go-http-client|nikto|sqlmap|masscan|zgrab|nmap)/i;

function ip(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

function limited(key: string): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < LOGIN_WINDOW_MS);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear(); // keep the map bounded
  return list.length > LOGIN_LIMIT;
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

  // Throttle credential endpoints.
  // Only the REST credential endpoints count. (The admin login *page* also receives POSTs for
  // React server functions on every field validation, which must not count as attempts.)
  const isAuthAttempt = req.method === 'POST' && /^\/api\/users\/(login|forgot-password|reset-password|unlock)$/.test(pathname);
  if (isAuthAttempt && limited(`${client}:${pathname}`)) {
    return NextResponse.json({ errors: [{ message: 'Too many attempts. Please wait a few minutes and try again.' }] }, { status: 429, headers: { 'Retry-After': '900' } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/users/:path*'],
};
