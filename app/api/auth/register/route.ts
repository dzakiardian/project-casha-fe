// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, userName, numberPhone, email, password } = await req.json();
  console.log(name, userName, numberPhone, email, password);
  try {
    const res = await fetch(`${process.env.BASE_API_URI}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: name, username: userName, phoneNumber: numberPhone, email: email, password: password, role: 'user' }),
    });

    const json = await res.json();

    console.log(json.message)

    if (!res.ok || !json.success) {
      return NextResponse.json(
        { message: json.message || 'Register gagal' },
        { status: 400 }
      );
    }

    const { token, username, fullName, email: userEmail } = json.data;

    const response = NextResponse.json({
      user: { username, fullName, email: userEmail },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}