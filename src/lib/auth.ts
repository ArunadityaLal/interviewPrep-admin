import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export type UserRole = 'ADMIN';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'change-me';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean);

export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<JWTPayload> {
  const token = await getAuthCookie();
  if (!token) throw new Error('Unauthorized');

  const payload = verifyToken(token);
  if (!payload) throw new Error('Unauthorized');

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    throw new Error('Forbidden');
  }

  return payload;
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

export function authErrorStatus(message: string): number {
  if (message === 'Unauthorized') return 401;
  if (message === 'Forbidden') return 403;
  return 500;
}
