// lib/auth.ts
import { cookies } from 'next/headers';

export interface User {
  username: string;
  fullName: string;
  email: string;
}

export async function getSession(): Promise<User | null> {
  const cook = await cookies();
  const token = cook.get('token')?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.BASE_API_URI}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    const json = await res.json();
    if (!res.ok || !json.success) return null;

    return json.data as User;
  } catch {
    return null;
  }
}