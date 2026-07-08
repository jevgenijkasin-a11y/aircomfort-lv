import { NextRequest } from 'next/server';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { getAuthValue, setAuthValue } from './db';

export const AUTH_COOKIE = 'admin_token';

// Session secret lives in the DB (not web-accessible); generated on first use.
// ADMIN_SECRET env var overrides it if set.
function getSecret(): string {
  if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET;
  let secret = getAuthValue('session_secret');
  if (!secret) {
    secret = randomBytes(32).toString('hex');
    setAuthValue('session_secret', secret);
  }
  return secret;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// Only a scrypt hash is ever stored. If no hash exists yet, ADMIN_PASSWORD env
// bootstraps it once; otherwise login stays disabled until a hash is provisioned
// (the Supabase->SQLite import script creates one).
function getPasswordHash(): string | null {
  const stored = getAuthValue('password_hash');
  if (stored) return stored;
  if (process.env.ADMIN_PASSWORD) {
    const hash = hashPassword(process.env.ADMIN_PASSWORD);
    setAuthValue('password_hash', hash);
    return hash;
  }
  return null;
}

// Stateless session token: HMAC over the current password hash.
// Changing the password invalidates all existing cookies.
function makeToken(passwordHash: string): string {
  return createHmac('sha256', getSecret()).update(passwordHash).digest('hex');
}

export async function verifySession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token || token.length < 10) return false;
  const hash = getPasswordHash();
  if (!hash) return false;
  return token === makeToken(hash);
}

export async function login(password: string): Promise<string | null> {
  const hash = getPasswordHash();
  if (!hash || !password || !verifyPassword(password, hash)) return null;
  return makeToken(hash);
}

export async function logout(): Promise<void> {
  // Stateless — cookie cleared by the route handler
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  const hash = getPasswordHash();
  if (!hash || !verifyPassword(currentPassword, hash)) return false;
  setAuthValue('password_hash', hashPassword(newPassword));
  return true;
}
