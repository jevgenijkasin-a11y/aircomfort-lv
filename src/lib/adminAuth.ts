import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
import { supabaseServer } from './supabase';

export const AUTH_COOKIE = 'admin_token';

const HMAC_SECRET = process.env.ADMIN_SECRET || 'aircomfort-admin-secret-2026';

async function getPassword(): Promise<string> {
  // 1. Env var wins (Vercel production)
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  // 2. Supabase settings table (persisted across restarts)
  try {
    const { data } = await supabaseServer
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();
    if (data?.value) return data.value;
  } catch { /* ignore */ }
  // 3. Local fallback file (read-only is fine)
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'auth.json'), 'utf-8');
    const json = JSON.parse(raw);
    if (json.password) return json.password;
  } catch { /* ignore */ }
  return 'admin1234';
}

function makeToken(password: string): string {
  return createHmac('sha256', HMAC_SECRET).update(password).digest('hex');
}

export async function verifySession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token || token.length < 10) return false;
  const password = await getPassword();
  return token === makeToken(password);
}

// Stateless login — no file writes
export async function login(password: string): Promise<string | null> {
  const correctPassword = await getPassword();
  if (password !== correctPassword) return null;
  return makeToken(password);
}

export async function logout(): Promise<void> {
  // Stateless — cookie cleared by the route handler
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  const correctPassword = await getPassword();
  if (currentPassword !== correctPassword) return false;
  // Store new password in Supabase (works locally and on Vercel)
  const { error } = await supabaseServer
    .from('settings')
    .upsert({ key: 'admin_password', value: newPassword }, { onConflict: 'key' });
  return !error;
}
