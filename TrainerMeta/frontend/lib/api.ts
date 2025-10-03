// frontend/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
export async function apiGet(path: string) {
  const key = process.env.API_SHARED_KEY || '';
  const res = await fetch(`${API_BASE}${path}`, { headers: key ? { 'x-trainermeta-key': key } : {} });
  return res.json();
}
