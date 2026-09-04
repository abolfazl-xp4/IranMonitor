// Simple in-memory cache for API routes (avoids hammering upstreams)
type Entry<T> = { data: T; expires: number };

const cache = new Map<string, Entry<unknown>>();

export function getCached<T>(key: string): T | null {
  const e = cache.get(key) as Entry<T> | undefined;
  if (!e) return null;
  if (Date.now() > e.expires) {
    cache.delete(key);
    return null;
  }
  return e.data;
}

export function setCached<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<{ data: T; cached: boolean }> {
  const hit = getCached<T>(key);
  if (hit) return { data: hit, cached: true };
  const data = await fetcher();
  setCached(key, data, ttlMs);
  return { data, cached: false };
}
