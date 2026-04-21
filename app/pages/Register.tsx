import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Lock, Mail, User } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      toast.success('Registrasi berhasil!');
      navigate('/');
    } catch (error) {
      toast.error('Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Buat Akun Baru</h1>
          <p className="text-zinc-400">Bergabung dengan Mahen Store</p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

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
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
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
              {isLoading ? 'Loading...' : 'Daftar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-white hover:underline">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
