// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return NextResponse.json(
        { message: json.message || 'Email atau password salah' },
        { status: 401 }
      );
    }

    const { token, username, fullName, email: userEmail } = json.data;

    const response = NextResponse.json({
      user: { username, fullName, email: userEmail },
    });

    response.cookies.set('token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
