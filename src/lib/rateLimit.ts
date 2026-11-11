// Small in-memory rate limiting for the public form and the admin login.
// One Node process serves the site, so a Map is enough; counters are lost on
// restart, which only means a fresh allowance.

type Hits = number[];
const hits = new Map<string, Hits>();
const blocks = new Map<string, number>();

/** Visitor address behind the Plesk proxy (first X-Forwarded-For entry). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  const ip = (fwd ? fwd.split(',')[0] : req.headers.get('x-real-ip') || '').trim();
  return ip || 'unknown';
}

function prune(now: number) {
  if (hits.size < 2000 && blocks.size < 2000) return;
  hits.forEach((list, k) => { if (!list.some((t) => t > now - 3_600_000)) hits.delete(k); });
  blocks.forEach((until, k) => { if (until <= now) blocks.delete(k); });
}

/**
 * Counts one event for `key` and tells whether `limit` events within
 * `windowMs` are now exceeded (the event over the limit is still recorded).
 */
export function tooMany(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);
  const list = (hits.get(key) ?? []).filter((t) => t > now - windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > limit;
}

/** Seconds left of a block set by `block()`, 0 when not blocked. */
export function blockedFor(key: string): number {
  const until = blocks.get(key) ?? 0;
  return until > Date.now() ? Math.ceil((until - Date.now()) / 1000) : 0;
}

export function block(key: string, ms: number): void {
  blocks.set(key, Date.now() + ms);
}

export function unblock(key: string): void {
  blocks.delete(key);
  hits.delete(key);
}
