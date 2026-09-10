import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'obscure_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h — the admin logs back in rather than staying signed in forever.

/**
 * Read lazily (not at module scope) so a missing env var only breaks the
 * admin surface when it's actually used, not every build/import of this
 * module — the public templates page never touches this file's contents.
 */
function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return new TextEncoder().encode(secret);
}

/**
 * Hashing both sides first means the buffers `timingSafeEqual` compares are
 * always the same length, regardless of the input lengths — avoids both the
 * RangeError a naive length mismatch would throw and the timing leak a
 * length check up front would introduce.
 */
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string): Buffer => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME ?? '';
  const expectedPassword = process.env.ADMIN_PASSWORD ?? '';
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function hasValidSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

/**
 * Used at the top of the admin page and every mutating Server Action —
 * redirects rather than erroring since a bare cookie expiry shouldn't look
 * like a crash. Takes `lang` so the redirect lands on the same locale's
 * login page instead of always falling back to a default.
 */
export async function requireAdmin(lang: string): Promise<void> {
  if (!(await hasValidSession())) {
    redirect(`/${lang}/admin/login`);
  }
}
