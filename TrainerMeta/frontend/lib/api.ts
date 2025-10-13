// frontend/lib/api.ts
const isServer = typeof window === 'undefined';
// Prefer explicit NEXT_PUBLIC_API_BASE; otherwise default to localhost:8000 for dev
const DEFAULT_BASE = 'http://localhost:8000';
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || DEFAULT_BASE;

async function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

export async function apiGet(path: string) {
  const key = process.env.API_SHARED_KEY || '';
  const headers = key ? { 'x-trainermeta-key': key } : {} as Record<string,string>;

  // Retry a few times to smooth over dev race between frontend and backend startups
  const attempts = 3;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, { headers });
      if (!res.ok) {
        const text = await res.text().catch(()=> '');
        throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
      }
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await sleep(400 * (i + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('API fetch failed');
}
