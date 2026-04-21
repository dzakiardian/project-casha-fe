// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log(process.env.NEXT_PUBLIC_BASE_API_URI, 'aaa')
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }


  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    const json = await res.json();

    return NextResponse.json({ user: json.data });
  } catch {
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}