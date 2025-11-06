'use client';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export async function apiGet(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || `GET ${path} failed (${res.status})`);
  }
  return res.json();
}

export async function apiPost(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body || {})
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || `POST ${path} failed (${res.status})`);
  }
  return res.json();
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}
