'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login berhasil!');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Selamat Datang Kembali</h1>
          <p className="text-zinc-400">Login ke akun Mahen Store Anda</p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-3 rounded-lg hover:bg-zinc-200 transition-colors font-semibold disabled:bg-zinc-700 disabled:text-zinc-500"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Belum punya akun?{' '}
              <Link href="/register" className="text-white hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-zinc-500 text-sm">
            Demo: gunakan email dan password apa saja untuk login
          </p>
        </div>
      </div>
    </div>
  );
};
