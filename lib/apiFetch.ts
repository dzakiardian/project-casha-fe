// lib/apiFetch.ts
'use client'; // tambah ini

import Cookies from 'js-cookie';

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

// ✅ Server Component & API Route
export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { cookies } = await import('next/headers');
  const cook = await cookies();
  const token = cook.get('token')?.value;

  const res = await fetch(`${process.env.BASE_API_URI}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Terjadi kesalahan');

  return json;
}

// ✅ Client Component — baca token pakai js-cookie
export async function clientFetch(endpoint: string, options: FetchOptions = {}) {
  const token = Cookies.get('token');
  const isFormData = options.body instanceof FormData; // ← cek disini

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}${endpoint}`, {
    ...options,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }), // ← skip kalau FormData
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const json = await res.json();
  return json;
}